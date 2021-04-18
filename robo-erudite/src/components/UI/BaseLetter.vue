<template>
  <div class="letter-container">
    <div class="top-container">
      <div class="letter-symbol">{{ letterData.character }}</div>
      <button class="btn-remove" v-if="showRemoveBtn">
        X
      </button>
    </div>
    <div class="points-symbol">{{ letterData.points }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Letter } from "../../model/Letter";

export default defineComponent({
  name: "BaseLetter",
  props: {
    letterData: {
      type: Object as PropType<Letter>,
      required: true
    },
    showRemoveBtn: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style scoped>
.letter-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  line-height: normal;
  height: 100%;
  width: 100%;
}

.top-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  width: 100%;
}

.letter-symbol {
  flex: 0 0;
  font-size: 16px;
  font-weight: 600;
  vertical-align: top;
  text-align: left;
  padding-left: 2px;
  padding-top: 2px;
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
  margin-right: 0.2em;
}
</style>
