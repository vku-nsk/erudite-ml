<template>
  <div class="buttons-container">
      <div class="buttons-row">
        <command-button id="setSelectMode"
          :class="{'btn-highlight' : player.selectForChange}"
          @command="selectForExchange"
          :disabled="!isActive || lettersArrNotFull"
        >
          <span>Менять</span>
        </command-button>
        <command-button id="goBtn"
          :disabled="!isActive"
          @command="goComplete"
        >
          <span v-if="goMode === 2">Готово</span>
          <span v-if="goMode === 0">Пропустить</span>
          <span v-if="goMode === 1">Обменять</span>
        </command-button>
        <command-button id="getClue"
          @command="getClue"
          :disabled="!isActive || lettersArrNotFull || player.selectForChange"
        >
          <span>Подсказка</span>
        </command-button>
      </div>
      <div class="buttons-column">
        <command-button
          :class="{'btn-highlight' : player.selectForChange}"
          @command="selectForExchange"
          :disabled="!isActive || lettersArrNotFull"
        >
          <span>Менять</span>
        </command-button>
        <command-button 
          @command="getClue"
          :disabled="!isActive || lettersArrNotFull || player.selectForChange"
        >
          <span>Подсказка</span>
        </command-button>
        <command-button id="goBtn"
          :disabled="!isActive"
          @command="goComplete"
        >
          <span v-if="goMode === 2">Готово</span>
          <span v-if="goMode === 0">Пропустить</span>
          <span v-if="goMode === 1">Обменять</span>
        </command-button>
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Player, GoCompleteMode } from "../model/Player";
import { Letter } from "../model/Letter";
import { WordSite } from "../model/WordSite";
import CommandButton from "./UI/CommandButton.vue"

export default defineComponent({
  name: "PlayerCommmadPanel",

  components: {
    CommandButton
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    }
  },
  emits: {
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
    }
  },

  computed: {
    goMode() : GoCompleteMode{
      if(this.player.chars.length === this.player.maxNumLetters
        && !this.player.selectForChange)
        return GoCompleteMode.skip;
      if(this.player.chars.length === this.player.maxNumLetters
        && this.player.selectForChange){
        if( this.letters.some(el => {return el.flagged;}) )
          return GoCompleteMode.exchange;
        else
          return GoCompleteMode.skip;
      }
      return GoCompleteMode.ready;
    },

    isInteractive(): boolean {
      return this.player.interactive;
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
    selectForExchange() {
      this.letters.forEach(el => {
        el.flagged = !this.player.selectForChange;
      });
      this.$emit("select-exchange", !this.player.selectForChange);
    },

    getClue() {
      this.$emit("get-clue");
    },

    goComplete() {
      if (this.player.selectForChange) {
        const checkedLetters = this.letters.filter(el => {
          return el.flagged;
        });
        if(checkedLetters.length !== 0)
          this.$emit("exchange-letters", checkedLetters);
        else
          this.$emit("go-complete");  
      } else {
        this.$emit("go-complete");
      }
    }
    
  }
})
</script>

<style scoped>

.buttons-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-command {
  font-size: 1.5rem;
}

@media (orientation: landscape){

  .buttons-container {
    width: 100%;
  }

  .buttons-row {
    display: none;
  }

  .buttons-column {
    display: -webkit-flex;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .btn-command:first-child {
    margin-top: 1px;
    margin-bottom: 2px;
  }

  .btn-command:last-child {
    margin-top: 2px;
    margin-bottom: 1px;
  }
}

@media (orientation: portrait){

  .buttons-row {
    display: -webkit-flex;
    display: flex;
    flex-direction: row;
    justify-content:space-between;
    width: 100%;
    flex: 0 0 4rem;
    min-height: 4rem;
    align-items: flex-end;
  }

  .buttons-column {
    display: none;
  }

  #setSelectMode,
  #getClue {
    width: auto;
  }

  #goBtn {
    width: auto;
    align-self: baseline;
  }
}

</style>
