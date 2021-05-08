<template>
  <dl>
    <dt>
      {{wordDefinitionInfo.word}}
    </dt>
    <hr />
    <dd>
      {{wordDefinitionInfo.definition}}
    </dd>    
  </dl>  
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { WordDefinition } from "../../data/WordDefinition";

export default defineComponent({
  name: "WordDefnInfo",
  props: {
    wordDefinitionInfo: {
      type: Object as PropType<WordDefinition>,
      required: true
    }
  }
});
</script>

<style scoped>

dl, hr {
  margin-block-start: 0.2em;
  margin-block-end: 0.2em;
}

dt {
  font-weight: 600;
}

dd {
  margin-inline-start: 1em;
  overflow-y: auto;
}

</style>
