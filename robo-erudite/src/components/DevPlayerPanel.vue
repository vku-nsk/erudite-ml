<template>
  <div class="player-container">
    <div class="letters-container">
        <div class="player-letter"
          :class="letterClasses(letter)"
          v-for="letter in letters"
          :key="letter.id"
        >
          <BaseLetter :letter="letter" 
            :showCheckBtn="player.selectForChange" 
            v-model:hasMark="letter.flagged"
            @click="setCurrentLetter(letter)" 
          />
        </div>
    </div>
    <div class="buttons-container">
      <input type="file" @change="onFileChange" />
      <command-button  
        @command="loadGame(fileToLoad)">
        Load
      </command-button>
      <command-button  
        @command="$emit('save-game')">
        Save
      </command-button>
      <command-button 
        :class="{'btn-highlight': player.active}" 
        @command="$emit('developer-player-active')">
        Active
      </command-button>
      <command-button
        :class="{'btn-highlight' : player.selectForChange}"
        :disabled="!player.active"
        @command="toggleCheckMode"
      >
        Check Mode
      </command-button>
      <command-button  
        :disabled="!player.selectForChange"
        @command="$emit('developer-checked-send-p0')"
      >
        Send checked to p0
      </command-button>
      <div class="mini-btn-container">
        <command-button class="mini-button" 
          @command="toggleFullScreen">
          <font-awesome-icon icon="expand" />
        </command-button>
      </div>
    </div>
    <div class="info-container">
      w:{{wdt()}} h:{{hgt()}}
    </div>  
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Player } from "../model/Player";
import { Letter } from "../model/Letter";
import BaseLetter from "./UI/BaseLetter.vue";
import CommandButton from "./UI/CommandButton.vue"

export default defineComponent({
  name: "DevPlayerPanel",
  components: {
    BaseLetter,
    CommandButton
  },

  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    checkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    "set-current-letter": function(letter: Letter) {
      return true;
    },
    "save-game": function() {
      return true;
    },
    "load-game": function(file: File) {
      return true;
    },
    "developer-player-active": function() {
      return true;
    },
    "update:checkMode": function(checkMode: boolean) {
      return true;
    },
    "developer-checked-send-p0": function() {
      return true;
    },

  },

  data() {
    return {
      fileToLoad: {} as File
    };
  },

  computed: {
    isInteractive(): boolean {
      return this.player.interactive;
    },

    isActive(): boolean {
      return this.player.active;
    },

    letters(): Letter[] {
      return this.player.chars;
    },

    lettersArrNotFull(): boolean {
      return this.letters.length !== this.player.maxNumLetters;
    }
  },

  methods: {
    wdt() : number {
      return window.screen.width;
    },
    hgt() : number {
      return window.screen.height;
    },
    letterClasses(letter: Letter) {
      return {'current-letter': this.isLetterCurrent(letter), 
          'lt-vowel': letter.isVowel,
          'lt-mark': letter.isMark, 
          'lt-consonant': letter.isConsonant};
    },
    setCurrentLetter(letter: Letter) {
      if(this.player.selectForChange)
        letter.flagged=!letter.flagged;
      else {
        this.$emit("set-current-letter", letter);
      }
    },

    isLetterCurrent(letter: Letter) {
      if (!this.isActive) return false;
      return this.player.currentLetter === letter;
    },
    
    loadGame(file: File) {
      this.$emit("load-game", file);
    },

    toggleFullScreen() {
      if(document.fullscreenElement){
        document.exitFullscreen();
      }
      else{
        const appRoot=document.getElementById('app');
        if(appRoot?.requestFullscreen){
          appRoot.requestFullscreen();
        }
      }
    },

    toggleCheckMode() {
      this.$emit("update:checkMode", !this.checkMode);
    },

    onFileChange(evt: Event) {
      const inputEl = evt.target as HTMLInputElement;
      if (!inputEl.files?.length) return;
      this.fileToLoad = inputEl.files[0];
    },

  }
});
</script>

<style scoped>

.player-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  background-color: rgba(0, 0, 192, 0.1);
  padding: 6px;
}

.letters-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  gap: 0.5em;
  box-sizing: border-box;
}

.player-letter {
  -webkit-flex: 0 0 1.5rem;
  -ms-flex: 0 0 1.5rem;
  flex: 0 0 1.5rem;
  height: 1.5rem;
  width: 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(128, 128, 128, 0.5);
  box-sizing: inherit;
}

  .lt-vowel {
    background-color: rgba(255, 255, 0, 0.4);
  }

  .lt-mark {
    background-color: rgba(192, 0, 0, 0.2);
  }

.current-letter {
  border-width: 2px;
  border-style: dashed;
  border-color: rgba(255, 0, 0, 0.7);
}

.buttons-container {
  display: -webkit-flex;
  display: flex;
  font-size: 1rem;
  flex-direction: row;
  align-items: stretch;
  gap: 0.2rem;
}

</style>
