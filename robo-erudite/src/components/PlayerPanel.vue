<template>
  <div :id="'player'+player.id" class="player-container">
    <div class="player-info">
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
      <div class="orient-portrait" v-if="player.id === 0 && player.goPoints !== 0">
        <span class="go-points">
          + {{ player.goPoints }}</span
        >
        <span class="total-points"> = {{ player.goPoints + player.totalPoints }}</span>
      </div>
      <div v-if="numLettersInBank" class="bank-info">
        Букв в банке {{numLettersInBank}}
      </div>
      <div class="skipped-go orient-portrait">
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
    </div>
    <div :id="'ltcontainer'+player.id" class="letters-container">
      <div class="consonants-container" :class="proportionClass(consonants)">
        <div
          class="player-letter"
          :class="letterClasses(letter)"
          v-for="letter in consonants"
          :key="letter.id"
        >
          <BaseLetter :letter="letter"
            :showCheckBtn="player.selectForChange" 
            v-model:hasMark="letter.flagged"
            @click="setCurrentLetter(letter)"
            @checkStateChanged="letterCheckChange(letter)" 
          />
        </div>
      </div>
      <div class="marks-container" :class="proportionClass(marks)">
        <div
          class="player-letter"
          :class="letterClasses(letter)"
          v-for="letter in marks"
          :key="letter.id"
        >
          <BaseLetter :letter="letter" 
            :showCheckBtn="player.selectForChange" 
            v-model:hasMark="letter.flagged"
            @click="setCurrentLetter(letter)"
            @checkStateChanged="letterCheckChange(letter)" 
          />
        </div>
      </div>
      <div class="vowels-container" :class="proportionClass(vowels)">
        <div
          class="player-letter"
          :class="letterClasses(letter)"
          v-for="letter in vowels"
          :key="letter.id"
        >
          <BaseLetter :letter="letter" 
            :showCheckBtn="player.selectForChange" 
            v-model:hasMark="letter.flagged"
            @click="setCurrentLetter(letter)"
            @checkStateChanged="letterCheckChange(letter)" 
          />
        </div>
      </div>
    </div>
    <div class="words-ingo-container" v-if="player.id===0">
      <div class="go-word" v-for="word in wordsInGo" :key="word.str">
        {{ word.str }} {{ word.points }}
      </div>
    </div>
    <div class="orient-landscape" v-if="player.id === 0 && player.goPoints !== 0">
      <span class="go-points">
        + {{ player.goPoints }}</span
      >
      <span class="total-points"> = {{ player.goPoints + player.totalPoints }}</span>
    </div>
    <div class="skipped-go orient-landscape">
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

  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Player } from "../model/Player";
import { Letter } from "../model/Letter";
import { WordSite } from "../model/WordSite";
import BaseLetter from "./UI/BaseLetter.vue";

export default defineComponent({
  name: "PlayerPanel",
  components: {
    BaseLetter
  },

  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    numLettersInBank: {
      type: Number
    }
  },
  emits: {
    "set-current-letter": function(letter: Letter) {
      return true;
    }
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

    consonants() : Letter[] {
      return this.player.chars.filter((lt) => {return lt.isConsonant});
    },

    vowels() : Letter[] {
      return this.player.chars.filter((lt) => {return lt.isVowel});
    },
    
    marks() : Letter[] {
      return this.player.chars.filter((lt) => {return lt.isMark});
    },

    wordsInGo(): WordSite[] {
      return this.player.wordsInTheGo;
    },

    lettersArrNotFull(): boolean {
      return this.letters.length !== this.player.maxNumLetters;
    }
  },

  methods: {
    letterClasses(letter: Letter) {
      return {'current-letter': this.isLetterCurrent(letter), 
          'lt-vowel': letter.isVowel,
          'lt-mark': letter.isMark, 
          'lt-consonant': letter.isConsonant};
    },

    proportionClass(letterArr: Letter[]) {
      const cn=letterArr.length;
      switch (cn) {
        case 0:
          return {'prop-0': true};
        case 1:
          return  {'prop-10': true};
        case 2:
          return  {'prop-20': true};
        case 3:
          return  {'prop-40': true};
        case 4:
        case 5:
          return  {'prop-60': true};
        default:
          return  {'prop-80': true};
      }
    },

    setCurrentLetter(letter: Letter) {
      if(this.player.selectForChange)
        letter.flagged=!letter.flagged;
      else
        this.$emit("set-current-letter", letter);
    },

    isLetterCurrent(letter: Letter) {
      if (!this.isActive) return false;
      return this.player.currentLetter === letter;
    },

    letterCheckChange(letter: Letter) {
      const checkedLetters = this.letters.filter(el => {
        return el.flagged;
      });
    }

  }
});
</script>

<style scoped>

.player-container {
  display: -webkit-flex;
  display: flex;
}

.player-info {
  width: 100%;
  display: flex;
}

.letters-container {
  display: -webkit-flex;
  display: flex;
}

.lt-vowel {
  background-color: rgba(255, 255, 0, 0.4);
}

.lt-mark {
  background-color: rgba(192, 0, 0, 0.2);
}

.words-ingo-container {
  display: -webkit-flex;
  display: flex;
}

.go-word {
  text-transform: lowercase;
}

@media (orientation: landscape){

  .orient-portrait {
    display: none;
  } 

  .orient-landscape {
    display: initial;
  } 

  .player-container {
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: space-between;
  }

  .player-info {
    flex-direction: column;
    text-align: center;
  }

  .player-info h2 {
    display: inline-block;
  }

  .letters-container {
    flex-direction: column;
    width: 100%;
    padding-left: 4px;
    padding-right: 4px;
    align-items: center;
    /* min-height: 24.5rem; */
  }

  #player1 .letters-container {
    gap: 0.5em;
  }

  .consonants-container,
  .marks-container,
  .vowels-container {
    display: -webkit-flex;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  } 

  #ltcontainer0 .consonants-container {
    align-self: flex-end;
  }

  #ltcontainer0 .marks-container {
    align-self:center;
  }

  #ltcontainer0 .vowels-container {
    align-self: flex-start;
  }

  .skipped-go {
    flex: 0 0 2.25rem;
    height: 2.25rem;
    width: 100%;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
  }

  .words-ingo-container {
    flex-direction: column;
    align-items: center;
    flex: 1 1 auto;
    justify-content:flex-end;
    width: 100%;
    font-size: 1.5rem;
    margin-top: auto;
  }

  .go-word {
    font-size: 1em;
    text-align: center;
    width: 100%;
  }

  #ltcontainer0 .lt-vowel {
    align-self:flex-start;
  }

  #ltcontainer0 .lt-vowel:nth-of-type(2n)
  {
    margin-left: 1rem;
  }

  #ltcontainer0 .lt-consonant {
    align-self:flex-end;
  }

  #ltcontainer0 .lt-consonant:nth-of-type(2n)
  {
    margin-right: 1rem;
  }

  #ltcontainer0 .lt-mark {
    align-self: center;
  }

  .bank-info {
    flex: 0 0 auto;
  }
}  /* @media (orientation: landscape) */

@media (orientation: portrait){

  .orient-portrait {
    display: initial;
  } 

  .orient-landscape {
    display: none;
  } 

  .player-container {
    flex-direction: column;
    align-items: center;
  }

  .player-info {
    font-size: 1.5rem;
    justify-content:space-between;
    align-items: center;
    background-color: rgba(192, 192, 192, 0.2);
 }

  .player-info h2 {
    display: inline-block;
    margin: 0%;
    padding: 2px;
  }

  .letters-container {
    flex-direction: row;
    flex: 0 0 2.8rem;
    width: 100%;
    justify-content: space-between;
  }

  .consonants-container,
  .marks-container,
  .vowels-container {
    display: -webkit-flex;
    display: flex;
    flex-direction: row;
  } 

  .marks-container{
    justify-content: center;
  }

  .vowels-container {
    justify-content: flex-end;
  }

  .prop-0 {
    display: none;
  }

  .prop-10 {
    flex: 1 1 10%;
  }

  .prop-20 {
    flex: 1 1 20%;
    gap: 6%;
  }

  .prop-40 {
    flex: 1 1 40%;
    gap: 6%;
  }

  .prop-60 {
    flex: 1 1 60%;
    gap: 6%;
  }

  .prop-80 {
    flex: 1 1 80%;
    gap: 6%;
  }

  .skipped-go {
    height: 2.25rem;
  }

  .words-ingo-container {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex: 0 0 1.5em;
    width: 100%;
    max-height: 1.2em;
    font-size: 1.4em;
    border-top-color: lightgrey;
    border-top-style: solid;
    border-top-width: 1px;
    border-bottom-color: lightgrey;
    border-bottom-style: solid;
    border-bottom-width: 1px;
  }

  .go-word {
    padding-left: 0.5em;
    text-align: center;
  }

  .bank-info {
    padding-left: 0.5em;
    padding-top: 0.25rem;
  }

} /* media (orientation: portrait) */

.skipped-mark {
  display: inline-block;
  font-size: 2rem;
}

.i-warn {
  color: rgb(255, 230, 0);
}

.i-critical {
  color: red;
}

.human-header {
  color: green;
}

.robot-header {
  color: blue;
}

.player-icon {
  margin-right: 0.5rem;
}

.extra-points {
  font-size: 0.8rem;
}

.total-points {
  font-size: 0.8em;
}

.go-points {
  font-weight: bold;
  color: green;
  font-size: 1em;
}

.player-letter {
  -webkit-flex: 0 0 2.5rem;
  -ms-flex: 0 0 2.5rem;
  flex: 0 0 2.5rem;
  height: 2.5rem;
  width: 2.5rem;
  font-size: 1.8rem;
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(128, 128, 128, 0.5);
}

.current-letter {
  border-width: 2px;
  border-style: dashed;
  border-color: rgba(255, 0, 0, 0.7);
}

</style>
