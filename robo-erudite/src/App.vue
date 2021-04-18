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
        <div>
          <button @click="wordsConfirmed">
            Есть такие слова !
          </button>  
          <button @click="dlgClose('notFoundInDictionary')">Закрыть</button>
        </div>  
      </template>  
    </modal-dialog>
  </teleport>
  <div class="flex-container">
    <div class="container-padding">
    </div>  
    <div class="left-panel">
      <player-panel 
        :player="player0"
        @set-current-letter="setCurrentLetter"
        @select-exchange="setSelectForExchange"
        @exchange-letters="exchangeLetters"
        @go-complete="goComplete"
        @get-clue="getClue"
        @start-new-game="finishTheGame"
        @save-game="saveGame"
        @load-game="loadGame"
      ></player-panel>
    </div>
    <div class="middle-part">
      <game-report v-if="gameOverShow" 
        :player0="player0" 
        :player1="player1"
        @close="closeGameReport"
        >
      </game-report>  
      <game-grid v-if="!gameOverShow" :class="{'grid-shadow' : gameOver}"
        :playField="playField"
        :numLettersInBank="letterBank.numLetters"
        @playfield-remove-letter="returnLetter"
        @playfield-put-letter="putLetter"
      >
      </game-grid>
      <button id="startGame" v-if="gameOver && !gameOverShow"
        @click="startNewGame">
        Начать игру
      </button>  
    </div>
    <div class="right-panel">
      <player-panel
        :player="player1"
      ></player-panel>
    </div>
    <div class="container-padding">
    </div>  
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
import PlayerPanel from "./components/PlayerPanel.vue";
import GameGrid from "./components/GameGrid.vue";
import ModalDialog from "./components/UI/ModalDialog.vue";
import CheckResultsInfo from "./components/UI/CheckResultsInfo.vue";
import GameReport from "./components/GameReport.vue"

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
    GameGrid,
    ModalDialog,
    CheckResultsInfo,
    GameReport
  },

  data() {
    return {
      gameOver: true,
      gameOverShow: false,
      letterBankEmptyShow: false,
      checkResultsShow: false,
      notFoundInDictionaryShow: false,
      wordCheckResults: emptyWordCheckResultArray(),
      noClueShow: false,
      // словарь проверки
      gameDictionary: new Dictionary(),
      // игрок интерактивный
      player0: new Player(0, true),
      // игрок-робот
      player1: new Player(1, false),
      // бонус за подсказку
      robotCluePortion: 0.5,
      clueWords : emptyWordSiteArray(),
      // банк доступных букв
      letterBank: new LetterBank(),
      // игровая поляна
      playField: new PlayField([]),
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
        return undefined;
      },

      set(player: Player | undefined) {
        if (player === this.player0) {
          this.player1.active = false;
          this.player0.active = true;
        } else if (player === this.player1) {
          this.player0.active = false;
          this.player1.active = true;
        } else {
          this.player0.active = false;
          this.player1.active = false;
        }
        if(this.player){
          this.playField.wordsInTheGo = this.player.wordsInTheGo;
          if (this.player.active && !this.player.interartive) {
            this.getClue();
            setTimeout(() => {
              this.afterGoComplete();
            }, 2000);
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
    }
  },

  methods: {
    closeGameReport(){
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
       // НЕОПР текущеей буквы не даёт ставить на игровое поле
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
         activePlayer.interartive ? 2 : 3, 15); // робот ставит слова не короче 3 букв
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
          if(activePlayer.interartive){
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
          if(activePlayer.interartive)
            this.noClueShow=true;
        }
      }
    },

    afterGoComplete() {
      if(this.player){
        const numLettersPut=this.playField.cellsInTheGo.length;
        this.playField.afterGoComplete();
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
        if(this.player?.interartive){
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
      this.playField = new PlayField([]);
      this.clueWords.length=0;
      this.setIniWord();

      // this.setIniWordDbg();
      // const iniLetters=this.letterBank.getLettersForWord("палепол") as Letter[];
      // this.player0.addChars(...iniLetters);
      
      // установка начального состояния поляны после постановки инициального слова
      this.playField.afterGoComplete();
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

    finishTheGame(){
      this.gameOver = true;
      this.gameOverShow = true;
      this.player=undefined;
    },

    saveGame() {
      const cellGrigBlob = this.playField.saveCellGrid();
      const a = document.createElement("a");
      a.download = "test.json";
      a.href = window.URL.createObjectURL(cellGrigBlob);
      a.click();
    },

    loadGame(file: File) {
      file.text().then(text => {
        this.playField.loadCellGrid(text);
      });
    },

    // события игрового поля
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
            this.playerLetters.splice(iLetter, 1);
            if (this.playerLetters.length !== 0) {
              iLetter = iLetter % this.playerLetters.length;
              this.player.currentLetter = this.playerLetters[iLetter];
            } else this.player.currentLetter = undefined;
          }
        }
      }
    },

    returnLetter(iRow: number, jCol: number) {
      if(this.player){
        const letterSite = this.playField.cellGrid[iRow][jCol];
        if (letterSite.letter) {
          this.playField.removeLetter(letterSite);
          this.player.addChars(letterSite.letter);
          if (!this.player.currentLetter)
            this.player.currentLetter = letterSite.letter;
        }
      }
    }
  }

  // created() {
  //   this.startNewGame();
  // }
});
</script>

<style lang="scss">
html,
body {
  height: 100%;
  margin: 0;
}

.flex-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
}

.container-padding{
  flex: 1 1;
}

.left-panel {
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  border-right-color: green;
  border-right-style:solid;
  border-right-width: 4px;
}

.right-panel {
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  border-left-color: blue;
  border-left-style: solid;
  border-left-width: 4px;
}

.middle-part {
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  min-width: 640px;
  padding: 10px 6px;
  position: relative;
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
  // вертикальная центровка
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  
  height: 100%;
  color: #2c3e50;
}
</style>
