<template>
  <div class="player-container">
    <h2
      :class="{ 'human-header': isInteractive, 'robot-header': !isInteractive }"
    >
      <font-awesome-icon class="player-icon" icon="user" v-if="isInteractive" />
      <font-awesome-icon
        class="player-icon"
        icon="robot"
        v-if="!isInteractive"
      />
      <span>{{ player.totalPoints }}</span>
      <span class="extra-points"> ({{ player.extraPoints }})</span>
    </h2>
    <div class="letters-container">
      <div
        class="player-letter"
        :class="{ 'current-letter': isLetterCurrent(letter) }"
        v-for="letter in letters"
        :key="letter.id"
      >
        <BaseLetter :letterData="letter" @click="setCurrentLetter(letter)" />
        <div class="item-check" v-if="checkForExchange">
          <input
            class="item-cb"
            type="checkbox"
            v-model="letter.flagged"
            @change="letterCheckChange($event, letter)"
          />
        </div>
      </div>
    </div>
    <div class="skipped-go">
      <div class="skipped-mark" v-if="player.numSkippedGo > 0">
        <font-awesome-icon
         :class="{'i-warn' : player.numSkippedGo < 2, 'i-critical' : player.numSkippedGo >= 2}" 
         icon="times-circle"/>
      </div>
      <div class="skipped-mark" v-if="player.numSkippedGo > 1">
        <font-awesome-icon 
         :class="{'i-warn' : player.numSkippedGo < 2, 'i-critical' : player.numSkippedGo >= 2}" 
        icon="times-circle"/>
      </div>
      <div class="skipped-mark" v-if="player.numSkippedGo > 2">
        <font-awesome-icon 
         :class="{'i-warn' : player.numSkippedGo < 2, 'i-critical' : player.numSkippedGo >= 2}" 
        icon="times-circle"/>
      </div>
    </div>  
    <div v-if="isInteractive" class="buttons-container">
      <button
        class="btn-command"
        :class="{'btn-highlight' : checkForExchange}"
        @click="selectForExchange"
        :disabled="!isActive || lettersArrNotFull"
      >
        Менять
      </button>
      <button
        class="btn-command"
        @click="getClue"
        :disabled="!isActive || lettersArrNotFull || checkForExchange"
      >
        Подсказка
      </button>
      <button
        class="btn-command"
        :disabled="!isActive || !canCompleteGo()"
        @click="goComplete"
      >
        <span v-if="goMode === 2">Готово</span>
        <span v-if="goMode === 0">Пропустить</span>
        <span v-if="goMode === 1">Обменять</span>
      </button>
      <button class="btn-command" 
        :disabled="!isActive"
        @click="startNewGame">
        Завершить
      </button>
      <!-- <button class="btn-command" @click="saveGame">
        Save
      </button>
      <div class="btn-command">
        <input type="file" @change="onFileChange" />
        <button class="btn-command" @click="loadGame">
          Load
        </button>
      </div> -->
    </div>
    <div class="words-ingo-container">
      <div v-if="player.goPoints !== 0">
        <span class="go-points">
          + {{ player.goPoints }}</span
        >
        <span class="total-points"> = {{ player.goPoints + player.totalPoints }}</span>
      </div>
      <div class="go-word" v-for="word in wordsInGo" :key="word.str">
        {{ word.str }} {{ word.points }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Player } from "../model/Player";
import { Letter } from "../model/Letter";
import { WordSite } from "../model/WordSite";
import BaseLetter from "./UI/BaseLetter.vue";

enum GoCompleteMode {
  skip=0,
  exchange=1,
  ready=2
}

export default defineComponent({
  name: "PlayerPanel",
  components: {
    BaseLetter
  },

  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    }
  },
  emits: {
    "set-current-letter": function(letter: Letter) {
      return true;
    },
    "select-exchange": function(exchangeMode: boolean) {
      return true;
    },
    "exchange-letters": function(letters: Letter[]): boolean {
      if (letters) {
        return true;
      }
      return false;
    },
    "go-complete": function() {
      return true;
    },
    "get-clue": function() {
      return true;
    },
    "start-new-game": function() {
      return true;
    },
    "save-game": function() {
      return true;
    },
    "load-game": function(file: File) {
      return true;
    }
  },

  data() {
    return {
      checkForExchange: false,
      fileToLoad: {} as File
    };
  },
  computed: {
    goMode() : GoCompleteMode{
      if(this.player.chars.length === this.player.maxNumLetters
        && !this.checkForExchange)
        return GoCompleteMode.skip;
      if(this.player.chars.length === this.player.maxNumLetters
        && this.checkForExchange){
        if( this.letters.some(el => {return el.flagged;}) )
          return GoCompleteMode.exchange;
        else
          return GoCompleteMode.skip;
      }
      return GoCompleteMode.ready;
    },

    isInteractive(): boolean {
      return this.player.interartive;
    },

    isActive(): boolean {
      return this.player.active;
    },

    letters(): Letter[] {
      return this.player.chars;
    },

    wordsInGo(): WordSite[] {
      return this.player.wordsInTheGo;
    },

    lettersArrNotFull(): boolean {
      return this.letters.length !== this.player.maxNumLetters;
    }
  },
  methods: {
    setCurrentLetter(letter: Letter) {
      if(this.checkForExchange)
        letter.flagged=!letter.flagged;
      else
        this.$emit("set-current-letter", letter);
    },

    isLetterCurrent(letter: Letter) {
      if (!this.isActive) return false;
      return this.player.currentLetter === letter;
    },

    letterCheckChange(event: Event, letter: Letter) {
      const checkedLetters = this.letters.filter(el => {
        return el.flagged;
      });
    },

    selectForExchange() {
      this.checkForExchange = !this.checkForExchange;
      this.letters.forEach(el => {
        el.flagged = this.checkForExchange;
      });
      this.$emit("select-exchange", this.checkForExchange);
    },

    getClue() {
      this.$emit("get-clue");
    },

    canCompleteGo(): boolean {
      return true;
      // if (this.checkForExchange) {
      //   return (
      //     this.letters.filter(el => {
      //       return el.flagged;
      //     }).length !== 0
      //   );
      // } else {
      //   return true;
      // }
    },

    goComplete() {
      if (this.checkForExchange) {
        const checkedLetters = this.letters.filter(el => {
          return el.flagged;
        });
        this.checkForExchange = false;
        if(checkedLetters.length !== 0)
          this.$emit("exchange-letters", checkedLetters);
        else
          this.$emit("go-complete");  
      } else {
        this.$emit("go-complete");
      }
    },

    startNewGame() {
      this.$emit("start-new-game");
    },

    saveGame() {
      this.$emit("save-game");
    },

    onFileChange(evt: Event) {
      const inputEl = evt.target as HTMLInputElement;
      if (!inputEl.files?.length) return;
      this.fileToLoad = inputEl.files[0];
    },

    loadGame() {
      this.$emit("load-game", this.fileToLoad);
    }
  }
});
</script>

<style scoped>
.player-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  min-width: 124px;
}

.player-container h2 {
  margin-left: 0;
  margin-right: 0;
  margin-top: 2px;
  margin-bottom: 4px;
  padding-left: 2px;
  padding-right: 2px;
}

.letters-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 340;
  height: 340px;
}

.skipped-go {
  flex: 0 0 36;
  height: 36px;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  width: 100%;
}

.skipped-mark {
  display: inline-block;
  font-size: 30px;
}

.i-warn {
  color: yellow;
}

.i-critical {
  color: red;
}

.buttons-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  justify-content: flex-start;
  padding-bottom: 2px;
  padding-left: 2px;
  padding-right: 2px;
}

.words-ingo-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 auto;
  justify-content:flex-start;
  padding-left: 4px;
  width: 100%;
}

.go-word {
  font-size: 0.8em;
  text-align: center;
  text-transform: lowercase;
  width: 100%;
}

.human-header {
  color: green;
}

.robot-header {
  color: blue;
}

.player-icon {
  margin-right: 8px;
}

.extra-points {
  font-size: 0.8rem;
}

.total-points {
  font-size: 0.8em;
}

.go-points {
  font-weight: bold;
  background-color: lightgrey;
  color: green;
  font-size: 1em;
}

.btn-command {
  margin-top: 4px;
  margin-bottom: 4px;
  width: 100%;
  font-size: 1.2em;
  border-radius: 6px;
}

.btn-highlight {
  filter: invert(100%);
  /* box-shadow: inset 2px 2px 5px rgba(154, 147, 140, 0.5), 1px 1px 5px rgba(255, 255, 255, 1); */
}

.player-letter {
  -webkit-flex: 0 0 40px;
  -ms-flex: 0 0 40px;
  flex: 0 0 40px;
  height: 40px;
  width: 40px;
  margin-top: 2px;
  margin-bottom: 2px;
  border-radius: 8px;
  border-width: 2px;
  border-style: solid;
  border-color: rebeccapurple;
}

.current-letter {
  border-style: dashed;
  border-color: red;
}

.item-check {
  margin-top: -100%;
  margin-bottom: 0;
  width: 100%;
}

/* для стилизации изображения его надо полностью отрисовывать */
.item-cb {
  margin-top: 2px;
  margin-right: 0;
  margin-left: 50%;
  border-width: 2px;
}
</style>
