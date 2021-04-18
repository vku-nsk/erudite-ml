<template>
  <table>
    <tr v-for="wr in wordCheckResuls" :key="wordCheckResuls.indexOf(wr)">
      <td class="word-col">{{ wr.word }}</td>
      <td>{{ wr.comment }}</td>
    </tr>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WordCheckResult } from "../../data/WordCheckResult";

export default defineComponent({
  name: "CheckResultsInfo",
  props: {
    wordCheckResuls: {
      type: Object as PropType<WordCheckResult[]>,
      required: true
    }
  }
});
</script>

<style scoped>

.word-col {
  font-weight: bold;
  padding-right: 4px;
}

</style>
