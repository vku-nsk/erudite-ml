<template>
  <div>
    <h2
      :class="{ 'human-header': player.interartive, 'robot-header': !player.interartive }"
    >
      <font-awesome-icon class="player-icon" icon="user" v-if="player.interartive" />
      <font-awesome-icon
        class="player-icon"
        icon="robot"
        v-if="!player.interartive"
      />
      <span>{{ player.totalPoints }}</span>
    </h2>
    <div>
      <div>
        <span>ходов: {{player.numGo}} слов: {{wordsByWorth.length}}</span>
      </div>
      <table>
        <tr v-for="w in wordsByWorth" :key="w">
          <td>{{w.str}}</td>
          <td>{{w.points}}</td>
        </tr>  
      </table>  
    </div> 
  </div>   
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Player } from "../model/Player";
import { WordSite } from "../model/WordSite";

export default defineComponent({
  name: "PlayerReport",

  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    }
  },
  computed: {
    wordsByWorth(): WordSite[] {
      return this.player.wordsByWorth();
    },

  },
  methods: {

  }
});

</script>

<style scoped>
.human-header {
  color: lightgreen;
}

.robot-header {
  color: lightblue;
}

.player-icon {
  margin-right: 8px;
}

.total-points {
  font-size: 1.2em;
}

</style>