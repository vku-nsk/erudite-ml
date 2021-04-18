<template>
  <div class="title">
    <span v-if="player0.totalPoints > player1.totalPoints">
      Вы выиграли !
    </span>
    <span v-else-if="player0.totalPoints < player1.totalPoints">
      Робот выиграл
    </span>  
    <span v-else>
      Ничья !
    </span>  
    <button class="btn-close" @click="$emit('close')">Закрыть</button>
  </div>
  <div class="pr-container">
    <player-report id="humanReport" class="pl-report" 
    :player="player0">
    </player-report>  
    <player-report id="robotReport" class="pl-report"
    :player="player1">
    </player-report>  
  </div>  
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Player } from "../model/Player";
import { WordSite } from "../model/WordSite";
import PlayerReport from "./PlayerReport.vue"

export default defineComponent({
  name: "GameReport",
  components: {
    PlayerReport
  },
  emits: ["close"],
  props: {
    player0: {
      type: Object as PropType<Player>,
      required: true
    },
    player1: {
      type: Object as PropType<Player>,
      required: true
    }
  },
  methods: {

  }
});

</script>

<style scoped>

.title {
  font-size: 2rem;
  width: 100%;
}

.btn-close {
  font-size: inherit;
  height: 100%;
  margin-left: 20px;
  border-radius: 6px;
}

.pr-container {
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  padding-top: 2px;
}

.pl-report {
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
}

#humanReport{
  border-right: solid;
  border-right-width: 2px;
  border-right-color: lightgrey;
}

#robotReport{
  border-left: solid;
  border-left-width: 2px;
  border-left-color: lightgrey;
}

</style>
