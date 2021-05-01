<template>
  <teleport to="#app">
    <modal-dialog v-if="noClueShow" dialogId="noClue" @close="dlgClose">
      <template #content>
        Робот не смог дать подсказку
      </template>
    </modal-dialog>
  </teleport>
  <teleport to="#app">
    <modal-dialog v-if="letterBankEmptyShow" dialogId="letterBankEmpty" @close="dlgClose">
      <template #content>
        Буквы в банке закончились
      </template>
    </modal-dialog>
  </teleport>
  <teleport to="#app">
    <modal-dialog
      v-if="checkResultsShow"
      dialogId="checkResults"
      @close="dlgClose"
    >
      <template #content>
        <check-results-info :wordCheckResuls="wordCheckResults">
        </check-results-info>
      </template>
    </modal-dialog>
  </teleport>
  <teleport to="#app">
    <modal-dialog
      v-if="notFoundInDictionaryShow"
      dialogId="notFoundInDictionary"
      @close="dlgClose"
    >
      <template #content>
        <check-results-info :wordCheckResuls="wordCheckResults">
        </check-results-info>
      </template >
      <template #actions>
          <button @click="wordsConfirmed">
            Есть такие слова !
          </button>  
          <button @click="dlgClose('notFoundInDictionary')">Закрыть</button>
      </template>  
    </modal-dialog>
  </teleport>
  <teleport to="#app">
    <wait-dialog v-if="!modalActive && player1.active" dialogId="robotActive">
      <template #content>
        Робот думает...
      </template>  
    </wait-dialog>  
  </teleport>  
  <div class="game-container">
    <div class="p0-panel">
      <player-panel 
        :player="player0"
        @set-current-letter="setCurrentLetter"
      ></player-panel>
      <player-commmad-panel
        :player="player0"
        @select-exchange="setSelectForExchange"
        @exchange-letters="exchangeLetters"
        @go-complete="goComplete"
        @get-clue="getClue"
      ></player-commmad-panel>
    </div>
    <div class="playfield-part">
      <game-report v-if="gameOverShow" 
        :player0="player0" 
        :player1="player1"
        @close="closeGameReport"
        >
      </game-report>  
      <game-grid v-if="!gameOverShow" :class="{'grid-shadow' : gameOver}"
        :playField="playField"
        @playfield-remove-letter="returnLetter"
        @playfield-put-letter="putLetter"
      >
      </game-grid>
      <button id="startGame" v-if="gameOver && !gameOverShow"
        @click="startNewGame">
        Начать игру
      </button>  
    </div>
    <div class="p1-panel">
      <player-panel
        :player="player1"
        :numLettersInBank="letterBank.numLetters"
      ></player-panel>
      <game-commmad-panel
        :gridSize="playField.gridSize"
        :finishEnabled="!gameOver"
        :changeGridSizeEnabled="gameOver"
        @finish-the-game="finishTheGame"
        @set-grid-size="setGridSize"
      ></game-commmad-panel>
    </div>
  </div>
  <div class="developer-panel" v-if="developerMode">
    <dev-player-panel
      :player="developerPlayer"
      v-model:checkMode="developerPlayer.selectForChange"
      @set-current-letter="setCurrentLetter"
      @developer-player-active="toggleDeveloperPayerActive"
      @developer-checked-send-p0="sendCheckedLettesToP0"
      @save-game="saveGame"
      @load-game="loadGame"
    ></dev-player-panel>
  </div>  
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Letter } from "./model/Letter";
import { WordSite, Direction } from "./model/WordSite";
import { WordCheckResult } from "./data/WordCheckResult";
import { LetterBank } from "./model/LetterBank";
import { Player } from "./model/Player";
import { PlayField } from "./model/PlayField";
import { Dictionary } from "./model/Dictionary";
import { Robot } from "./model/Robot";
import { SaveRestoreObj } from "./model/SaveRestoreObj";
import PlayerPanel from "./components/PlayerPanel.vue";
import DevPlayerPanel from "./components/DevPlayerPanel.vue"
import PlayerCommmadPanel from "./components/PlayerCommmadPanel.vue"
import GameCommmadPanel from "./components/GameCommandPanel.vue"
import GameGrid from "./components/GameGrid.vue";
import ModalDialog from "./components/UI/ModalDialog.vue";
import WaitDialog from "./components/UI/WaitDialog.vue";
import CheckResultsInfo from "./components/UI/CheckResultsInfo.vue";
import GameReport from "./components/GameReport.vue"
import DevCommmadPanel from "./components/DevCommandPanel.vue"

function emptyWordCheckResultArray(): WordCheckResult[] {
  return [] as WordCheckResult[];
}

function emptyWordSiteArray() : WordSite[] {
  return [] as WordSite[];
}

export default defineComponent({
  name: "App",
  components: {
    PlayerPanel,
    DevPlayerPanel,
    PlayerCommmadPanel,
    GameCommmadPanel,
    GameGrid,
    ModalDialog,
    WaitDialog,
    CheckResultsInfo,
    GameReport
  },

  data() {
    return {
      developerMode:false,
      gameOver: true,
//#region модальные диалоги
      gameOverShow: false,
      letterBankEmptyShow: false,
      checkResultsShow: false,
      notFoundInDictionaryShow: false,
      noClueShow: false,
//#endregion модальные диалоги      
      wordCheckResults: emptyWordCheckResultArray(),
      // словарь проверки
      gameDictionary: new Dictionary(),
      // игрок интерактивный
      player0: new Player(0, true),
      // игрок-робот
      player1: new Player(1, false),
      // разработчик
      developerPlayer: new Player(2, true),
      // бонус за подсказку
      robotCluePortion: 0.5,
      clueWords : emptyWordSiteArray(),
      // банк доступных букв
      letterBank: new LetterBank(),
      // размерность сетки игровой поляны
      playFieldGridSize: 13,
      // игровая поляна
      playField: new PlayField(13, []),
      // режим выбора букв для обмена
      selectForChange: false
    };
  },
  computed: {
    // игрок (активный)
    player: {
      get(): Player | undefined {
        if (this.player1.active) return this.player1;
        else if (this.player0.active) return this.player0;
        else if (this.developerMode && this.developerPlayer.active)
          return this.developerPlayer;
        return undefined;
      },

      set(player: Player | undefined) {
        if (player === this.player0) {
          this.player0.active = true;
          this.player1.active = false;
        } else if (player === this.player1) {
          this.player0.active = false;
          this.player1.active = true;
        } else {
          this.player0.active = false;
          this.player1.active = false;
        }
        if(this.player){
          this.playField.wordsInTheGo = this.player.wordsInTheGo;
          if (this.player.active && !this.player.interactive) {
            // чтобы показался диалог ожидания
            setTimeout( () => {
              this.getClue();
              this.afterGoComplete();
            });
          }
        }
      }
    },

    playerLetters(): Letter[] {
      return this.player ? this.player.chars : [];
    },
    // слова текущего хода
    wordsInTheGo(): WordSite[] {
      return this.player ? this.player.wordsInTheGo : [];
    },

    modalActive(): boolean {
      return this.gameOverShow 
        || this.letterBankEmptyShow
        || this.checkResultsShow
        || this.notFoundInDictionaryShow
        || this.noClueShow;
    }
  },

  methods: {
    closeGameReport(){
      if(this.player0){
        this.player0.toInitialState();
      }
      if(this.player1){
        this.player1.toInitialState();
      }
      if(this.playField){
        this.playField.usedWords.length=0;
        this.playField.cellsInTheGo.length=0;
      }  
      this.gameOverShow = false;
    },

    dlgClose(dlgId: string) {
      if (dlgId === "noClue"){
         this.noClueShow = false;
      }
      else if (dlgId === "checkResults") {
        this.checkResultsShow = false;
        this.wordCheckResults.length = 0;
      }
      else if (dlgId  === "notFoundInDictionary"){
        this.notFoundInDictionaryShow= false;
        this.wordCheckResults.length = 0;
      }
      else if (dlgId === "letterBankEmpty"){
        this.letterBankEmptyShow=false;
        this.finishTheGame();
      }
    },

    dlgCheckResultError(wordCheckResuls: WordCheckResult[]) {
      this.checkResultsShow = true;
    },

//#region  события панели игрока

    setCurrentLetter(letter: Letter) {
      if(this.player)
        this.player.currentLetter = letter;
    },

    // режим выбора букв для обмена
    setSelectForExchange(exchangeMode: boolean){
      this.selectForChange=exchangeMode;
      if(this.player)
        this.player.selectForChange=this.selectForChange;
       // НЕОПР текущей буквы не даёт ставить на игровое поле
      if(this.player && this.selectForChange)
        this.player.currentLetter=undefined;
    }, 

    currentPlayerExchangeLetters(letters: Letter[])
    {
      if(this.player){
        // очистка флага и удаление из массива букв игрока
        letters.forEach(l => {
          l.flagged = false;
          const iLetter = this.playerLetters.indexOf(l);
          if (iLetter !== -1) {
            this.playerLetters.splice(iLetter, 1);
          }
        });
        this.player.currentLetter = undefined;
        // возврат в банк
        this.letterBank.putBack(...letters);
      }
    },

    exchangeLetters(letters: Letter[]) {
      if(this.player){
        this.currentPlayerExchangeLetters(letters);
        this.setSelectForExchange(false);
        this.afterGoComplete();
      }
    },

//#endregion события панели игрока

    checkGoCellsValid(): WordCheckResult[]
    {
      const checkResults: WordCheckResult[] = [];
      if(this.player){
        const activePlayer=this.player;
        const allCellsUsedInWords=this.playField.cellsInTheGo.every( (ltSite) => { 
          return activePlayer.letterSiteInGoWords(ltSite);
        });
        if(!allCellsUsedInWords){
          checkResults.push(
            new WordCheckResult(
              "",
              "есть висячие буквы"
            )
          );
        }
      }
      return checkResults;
    }, 

    checkGoWordsValid(): WordCheckResult[] {
      const checkResults: WordCheckResult[] = [];
      if(this.player){
        const activePlayer=this.player;
        if(!activePlayer.wordsInTheGoHaveValidIntersections()){
          this.player.wordsInTheGo.forEach(w => {
            if (!activePlayer.wordInTheGoHasProperIntersection(w)) {
              checkResults.push(
                new WordCheckResult(
                  w.str,
                  "нет пересечений с поставленными словами"
                )
              );
            }
          });
          if(checkResults.length === 0){
            const goWords=this.player.wordsInTheGo.map((w)=>{return w.str;}).join(",")
              checkResults.push(
                new WordCheckResult(
                  goWords,
                  "нет пересечений с ранее поставленными словами"
                )
              );

          }
        }
      }
      return checkResults;
    },

    wordExistsInDictionary(word: WordSite): boolean {
      const wordInDict = this.gameDictionary.gameWordExists(word);
      const logStr =
        word.str + (wordInDict ? ": ЕСТЬ в словаре" : ": НЕТ в словаре");
      console.log(logStr);
      return wordInDict;
    },

    checkGoWordsInDictionary(): WordCheckResult[] {
      const checkResults: WordCheckResult[] = [];
      if(this.player){
        this.player.wordsInTheGo.forEach(w => {
          if (!this.wordExistsInDictionary(w)) {
            checkResults.push(new WordCheckResult(w.str, "не найдено в словаре"));
          }
        });
      }
      return checkResults;
    },

    checkGoWordsAlreadyUsed(): WordCheckResult[] {
      const checkResults: WordCheckResult[] = [];
      if(this.player){
        this.player.wordsInTheGo.forEach(w => {
          if (this.playField.wordAlreadyUsed(w.str)) {
            checkResults.push(
              new WordCheckResult(w.str, "уже использовано в игре")
            );
          }
        });
      }
      return checkResults;
    },

    getClue() {
      this.clueWords.length=0;
      if(this.player){
        const activePlayer=this.player;
        console.time("getClue");
        const robot = new Robot(this.gameDictionary, this.playField);
        const wsClue = robot.getClue(this.player.chars, 
         activePlayer.interactive ? 2 : 3, 
         this.playFieldGridSize); // робот ставит слова не короче 3 букв
        console.timeEnd("getClue");
        if (wsClue) {
          const preClueWords: WordSite[]=[];
          preClueWords.push(...this.player.wordsInTheGo);
          wsClue.letters.forEach(lt => {
            const playerLetter = activePlayer.chars.find(ch => {
              return ch.character === lt.character;
            });
            if (playerLetter) {
              activePlayer.currentLetter = playerLetter;
              this.putLetter(lt.row, lt.col);
            }
          });
          // подсказка зачтётся роботу
          if(activePlayer.interactive){
            const postClueWords: WordSite[]=[];
            postClueWords.push(...this.player.wordsInTheGo);
            this.clueWords=[];
            for (let i = 0; i < postClueWords.length; i++) {
              if(!postClueWords[i].arrayHasSame(preClueWords)){
                this.clueWords.push(postClueWords[i]);
                break;  
              }
            }
          }
        }
        else{
          if(activePlayer.interactive)
            this.noClueShow=true;
        }
      }
    },

    afterGoComplete() {
      if(this.player){
        const numLettersPut=this.playField.cellsInTheGo.length;
        this.playField.afterGoComplete(this.player.id);
        if(this.player === this.player0){
          this.clueWords.forEach( (clueWord) =>{

            if(this.player0.wordSiteIsPresentInTheGo(clueWord)){
              console.log(`робот дал подсказку ${clueWord.str}`);
              this.player1.extraPoints+=Math.floor(clueWord.points*this.robotCluePortion);
            }
          });
        }
        this.clueWords.length=0;
        this.player.afterGoComplete();
        if (this.player.numSkippedGo >= 3) {
          this.finishTheGame();
          return;
        }
        if(this.player === this.player1){
        // после пропуска хода робот меняет все буквы
          if(numLettersPut === 0){
            const lettersArrCopy: Letter[]=[];
            lettersArrCopy.push(...this.player1.chars);
            this.currentPlayerExchangeLetters(lettersArrCopy);
            console.log(`робот вернул ${lettersArrCopy.length} букв`);
          }
        }
        const fromBank=this.letterBank.getRandom(this.player.needChars);
        if(fromBank.length < this.player.needChars){
          this.letterBankEmptyShow=true;
          return;
        }
        this.player.addChars(...fromBank);
        if (!this.player.currentLetter)
          this.player.currentLetter = this.player.chars[0];
        if (this.player === this.player0) this.player = this.player1;
        else this.player = this.player0;
      }
    },

    goComplete(forceDictionarySearch=true) {
      if(this.playField.cellsInTheGo.length !== 0){ // иначе пропуск хода
        this.wordCheckResults = this.checkGoCellsValid()
        if (this.wordCheckResults.length !== 0) {
          this.checkResultsShow = true;
          return;
        }
        this.wordCheckResults = this.checkGoWordsValid();
        if (this.wordCheckResults.length !== 0) {
          this.checkResultsShow = true;
          return;
        }
        this.wordCheckResults = this.checkGoWordsAlreadyUsed();
        if (this.wordCheckResults.length !== 0) {
          this.checkResultsShow = true;
          return;
        } 
        if(this.player?.interactive){
          if(forceDictionarySearch){
            this.wordCheckResults = this.checkGoWordsInDictionary();
            if (this.wordCheckResults.length !== 0) {
              this.notFoundInDictionaryShow = true;
              return;
            } 
          }
        }
      }
      this.afterGoComplete();
    },

    wordsConfirmed()
    {
      this.notFoundInDictionaryShow= false;
      this.wordCheckResults.length = 0;
      this.goComplete(false);
    },

    setIniWordDbg() {
      const dirHorz = true;
      const iniWord = "пол"; // this.gameDictionary.generateStartWord(iniWlen);
      const iniWlen = iniWord.length;
      if (iniWord) {
        const iniLettes = this.letterBank.getLettersForWord(iniWord, false);
        if (iniLettes) {
          let iRow = Math.floor(
            (this.playField.gridSize - (dirHorz ? 0 : iniWlen)) / 2
          );
          let jCol = Math.floor(
            (this.playField.gridSize - (!dirHorz ? 0 : iniWlen)) / 2
          );
          iniLettes.forEach(lt => {
            this.playField.putLetterInCell(
              !dirHorz ? iRow++ : iRow,
              dirHorz ? jCol++ : jCol,
              lt,
              -1
            );
          });
          this.playField.removeLetter(
            this.playField.wordsInTheGo[0].letters[1]
          );
        }
      }
    },

    setIniWord() {
      const dirHorz = Math.random() > 0.5;
      const iniWlen = 7;
      const iniWord = this.gameDictionary.generateStartWord(iniWlen);
      if (iniWord) {
        const iniLettes = this.letterBank.getLettersForWord(iniWord, false);
        if (iniLettes) {
          let iRow = Math.floor(
            (this.playField.gridSize - (dirHorz ? 0 : iniWlen)) / 2
          );
          let jCol = Math.floor(
            (this.playField.gridSize - (!dirHorz ? 0 : iniWlen)) / 2
          );
          iniLettes.forEach(lt => {
            this.playField.putLetterInCell(
              !dirHorz ? iRow++ : iRow,
              dirHorz ? jCol++ : jCol,
              lt,
              -1
            );
          });
        }
      }
    },

    startNewGame() {
      this.gameOver = false;
      this.gameDictionary = new Dictionary();
      // интерактивный игрок
      this.player0 = new Player(0, true);
      // игрок-робот
      this.player1 = new Player(1, false);
      // банк доступных букв
      this.letterBank = new LetterBank();
      // игровая поляна
      this.playField = new PlayField(this.playFieldGridSize, []);
      this.clueWords.length=0;
      this.setIniWord();
      // this.setIniWordDbg();
      
      // установка начального состояния поляны после постановки инициального слова
      this.playField.afterGoComplete(-1);
      // const iniLetters=this.letterBank.getLettersForWord("аоупзйх") as Letter[];
      // this.player0.addChars(...iniLetters);

      this.player0.addChars(
        ...this.letterBank.getRandom(this.player0.needChars)
      );
      this.player1.addChars(
        ...this.letterBank.getRandom(this.player1.needChars)
      );
      // активный игрок
      this.player = this.player0;
      this.setCurrentLetter(this.player.chars[0]);
    },

    setGridSize(gridSize: number){
      this.playFieldGridSize=gridSize;
      this.playField = new PlayField(this.playFieldGridSize, []);
    },

    finishTheGame(){
      this.gameOver = true;
      this.gameOverShow = true;
      this.player=undefined;
    },

//#region события игрового поля
    putLetter(iRow: number, jCol: number) {
      if(this.player){
        if (this.player.currentLetter) {
          let iLetter = this.playerLetters.indexOf(this.player.currentLetter);
          if (
            this.playField.putLetterInCell(
              iRow,
              jCol,
              this.player.currentLetter,
              this.player.id
            )
          ) {
            if(this.developerMode && this.player === this.developerPlayer)
              return;
            this.playerLetters.splice(iLetter, 1);
            if (this.playerLetters.length !== 0) {
              iLetter = iLetter % this.playerLetters.length;
              this.player.currentLetter = this.playerLetters[iLetter];
            } 
            else 
              this.player.currentLetter = undefined;
          }
        }
      }
    },

    // возврат буквы игроку, она становится текущей
    returnLetter(iRow: number, jCol: number) {
      if(this.player){
        const letterSite = this.playField.cellGrid[iRow][jCol];
        if (letterSite.letter) {
          this.playField.removeLetter(letterSite);
          if(this.developerMode && this.player === this.developerPlayer)
            return;
          this.player.addChars(letterSite.letter);
          this.player.currentLetter = letterSite.letter;
        }
      }
    },
//#endregion события игрового поля

//#region Developer Mode

    initDeveloperPlayer() {
      this.developerPlayer=new Player(2, true);
      // const iniLettes = this.letterBank.getLettersForWord("ъ", false) as Letter[];
      const iniLettes = this.letterBank.getLettersForWord("абвгдежзийклмнопрстуфхцчшщьыъэюя", false) as Letter[];
      this.developerPlayer.maxNumLetters=32;
      iniLettes.forEach( lt => this.developerPlayer.addChars(lt));
    },

    initDeveloperMode() {
      this.gameOver = false;
      this.gameDictionary = new Dictionary();
      // интерактивный игрок
      this.player0 = new Player(0, true);
      // игрок-робот
      this.player1 = new Player(1, false);
      // банк доступных букв
      this.letterBank = new LetterBank();
      // игровая поляна
      this.playField = new PlayField(this.playFieldGridSize, []);
      this.clueWords.length=0;
      
      this.playField.afterGoComplete(-1);

      this.initDeveloperPlayer();
    },

    finitDeveloperMode() {
      this.developerPlayer.active=false;
      this.developerPlayer.selectForChange=false;
      this.developerPlayer.numGo=0;
      this.developerPlayer.numSkippedGo=0;
      this.developerPlayer.extraPoints=0;
      this.developerPlayer.currentLetter=undefined;
      this.developerPlayer.wordsInTheGo.length=0;
      this.developerPlayer.allWords.length=0;
      this.developerPlayer.chars.forEach(
        lt=>lt.clean()
      );
      this.startNewGame();
    },

    saveGame() {
      const srObj=new SaveRestoreObj(this.playField, this.player0, this.player1);
      const gameBlob = srObj.save();
      const a = document.createElement("a");
      a.download = "eru_game.json";
      a.href = window.URL.createObjectURL(gameBlob);
      a.click();
    },

    loadGame(file?: File) {
      if(file){
        const srObj=new SaveRestoreObj(this.playField, this.player0, this.player1);
        file.text().then(text => {
          srObj.restore(text);
          this.player=this.player0;
        });
      }
    },
    
    toggleDeveloperPayerActive() {
      if(this.developerPlayer.active){
        this.developerPlayer.active=false;
        this.developerPlayer.selectForChange=false;
        this.playField.afterGoComplete(-1);
        this.player=this.player0;
      }
      else{
        this.player0.active=false;
        this.player1.active=false;
        this.developerPlayer.active=true;
        this.playField.wordsInTheGo = this.developerPlayer.wordsInTheGo;
      }
    },
    
    sendCheckedLettesToP0(){
      this.player0.chars.length=0;
      this.developerPlayer.chars.forEach(
        (lt) => {
          if(lt.flagged)
            this.player0.addChars(new Letter(lt.character, lt.points));
        }
      );
    },

    onKeyPressed(event: KeyboardEvent){
      if (event.key === 'd'){
        this.developerMode=!this.developerMode;
        if(this.developerMode)
          this.initDeveloperMode();
        else
          this.finitDeveloperMode();
        }
    },
//#endregion  Developer Mode
  },
  
  mounted() {
    if(document.location.hostname === "localhost"){
      window.addEventListener("keypress", this.onKeyPressed);
    }
  },

  unmounted() {
    if(document.location.hostname === "localhost"){
      window.removeEventListener("keypress", this.onKeyPressed);
    }
  }
});
</script>

<style>
html,
body {
  font-size: 16px;
  margin: 0;
  height: 100%;
}

.game-container {
  display: -webkit-flex;
  display: flex;
}

.p0-panel {
  display: -webkit-flex;
  display: flex;
}

.p1-panel {
  display: -webkit-flex;
  display: flex;
}

.playfield-part {
  position: relative;
}

/* глобально: нажатая кнопка */
.btn-highlight {
  background-color: rgb(128,92,92);
  color: antiquewhite;
}

.developer-panel {
  display: none;
}

/* панель разработчика только на большом экране */
@media only screen 
  and (min-width: 1280px)
  and (min-height: 1024px)
  and (-webkit-device-pixel-ratio: 1) 
{

.developer-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 6px 0;
}

}

@media (orientation: landscape){
  .game-container {
    flex-direction: row;
    justify-content: center;
  }

  .p0-panel {
    flex-direction: column;
    border-right-color: green;
    border-right-style:solid;
    border-right-width: 4px;
    min-width: 9rem;
  }

  .p1-panel {
    flex-direction: column;
    border-left-color: blue;
    border-left-style: solid;
    border-left-width: 4px;
    min-width: 9rem;
  }
}

@media (orientation: portrait){
  .game-container {
    flex-direction: column;
    justify-content: center;
  }

  .p0-panel {
    flex-direction: column;
    border-bottom-color: green;
    border-bottom-style:solid;
    border-bottom-width: 4px;
  }

  .p1-panel {
    flex-direction: column;
    border-top-color: blue;
    border-top-style: solid;
    border-top-width: 4px;
  }
}

/* @media (-webkit-device-pixel-ratio: 2) 
 {
  html,
  body {
    background-color: rgba(255, 255, 0, 0.4);
  }
} 
 */
/* iPhone 12 landscape */
@media only screen 
    and (device-width: 844px) 
    and (device-height: 390px) 
    and (-webkit-device-pixel-ratio: 3) 
{
  html,
  body {
    font-size: 10.2px;
  }
}    

/* iPhone 12 portrait */
@media only screen 
    and (device-width: 390px) 
    and (device-height: 844px) 
    and (-webkit-device-pixel-ratio: 3) 
{
  html,
  body {
    font-size: 10.2px;
  }
}    

/* 1792x828px at 326ppi (iPhone 11)  landscape*/
@media only screen 
    and (device-width: 896px) 
    and (device-height: 414px) 
    and (-webkit-device-pixel-ratio: 2) 
{ 
  html,
  body {
    font-size: 10.9px;
  }
}

/* 1792x828px at 326ppi (iPhone 11)  portrait */
@media only screen 
    and (device-width: 414px) 
    and (device-height: 896px) 
    and (-webkit-device-pixel-ratio: 2) 
{ 
  html,
  body {
    font-size: 10.2px;
  }

}

/* Samsung A70  landscape */
@media only screen 
    and (device-width: 712px) 
    and (device-height: 320px) 
    and (-webkit-device-pixel-ratio: 3)
{
  html,
  body {
    font-size: 7.75px;
  }
}

/* Samsung A70  portrait */
@media only screen 
  and (device-width: 320px)
  and (device-height: 712px)
      and (-webkit-min-device-pixel-ratio: 3){
  html,
  body {
    font-size: 7.75px;
  }
}


.grid-shadow {
  background-color: rgba(0, 0, 0, 0.25);
}

#startGame {
  margin: 0;
  padding: 10px 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  font-size: 48px;
  border-radius: 40px;
  border-width: 2px;
  border-style: solid;
  background-color: rgb(7, 188, 194);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: auto;
  overflow-y: auto;
  height: 100%;
}

#app:-webkit-full-screen {
  background-color: rgba(255, 255, 255, 1);
}

#app:-ms-fullscreen {
  background-color: rgba(255, 255, 255, 1);
}

#app:-moz-full-screen {
  background-color: rgba(255, 255, 255, 1);
}

#app:fullscreen {
  background-color: rgba(255, 255, 255, 1);
}

</style>
