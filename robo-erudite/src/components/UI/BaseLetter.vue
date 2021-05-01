<template>
  <div class="letter-container">
    <div class="top-container">
      <div class="letter-symbol">{{ letter.character }}</div>
      <button class="btn-remove" v-if="showRemoveBtn">
        X
      </button>
        <!-- v-model="letter.flagged" -->
      <input v-if="showCheckBtn"
        class="item-cb"
        type="checkbox"
        :checked="hasMark"
        @input="checkOnOff()"
        @change="$emit('check-state-changed', letter)"
      />
    </div>
    <div class="points-symbol">{{ letter.points }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Letter } from "../../model/Letter";

export default defineComponent({
  name: "BaseLetter",
  props: {
    letter: {
      type: Object as PropType<Letter>,
      required: true
    },
    showRemoveBtn: {
      type: Boolean,
      default: false
    },
    showCheckBtn: {
      type: Boolean,
      default: false
    },
    hasMark: {
      type: Boolean,
      default: false
    }

  },
  
  emits: {
    "check-state-changed": function(letter: Letter) {
      return true;
    },
    "update:hasMark" : null
  },

  methods: {
    checkOnOff()
    {
      this.$emit('update:hasMark', this.hasMark);
    }
  }

});
</script>

<style scoped>
.letter-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.top-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  width: 100%;
  line-height: 0.8em;
}

.letter-symbol {
  flex: 0 0;
  font-size: 1em;
  font-weight: 600;
  vertical-align: top;
  text-align: left;
  padding-left: 0.1em;
  padding-top: 0.1em;
  text-transform: uppercase;
}

.btn-remove {
  flex-grow: 1;
  margin-right: 0;
  padding: 0;
  color: red;
  background-color: transparent;
  border-style: none;
}

.points-symbol {
  align-self: flex-end;
  text-align: right;
  margin-right: 0.15em;
  line-height: 0.85em;
  font-size: 0.6em;
}

.item-cb {
  margin-left: 1px;
  margin-right: 1px;
  margin-top: 1px;
  margin-bottom: 1px;
}

</style>
