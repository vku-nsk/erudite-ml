<template>
  <div class="play-field">
    <div class="play-field-row" v-for="rowIndex in gridSize" :key="rowIndex">
      <div
        class="play-field-cell"
        :class="cellOwnerClasses(rowIndex - 1, cellIndex - 1)"
        v-for="cellIndex in gridSize"
        :key="gridSize * rowIndex + cellIndex"
        @click.stop="putLetter(rowIndex - 1, cellIndex - 1)"
      >
        <base-letter
          v-if="isCellBusy(rowIndex - 1, cellIndex - 1)"
          :letterData="playField.cellGrid[rowIndex - 1][cellIndex - 1]"
          :showRemoveBtn="isCellInGo(rowIndex - 1, cellIndex - 1)"
          @click.stop="removeLetter(rowIndex - 1, cellIndex - 1)"
        >
        </base-letter>
      </div>
    </div>
  </div>
  <div class="bank-info">
    Букв в банке {{numLettersInBank}}
  </div>  
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PlayField } from "../model/PlayField";
import BaseLetter from "./UI/BaseLetter.vue";

export default defineComponent({
  components: {
    BaseLetter
  },
  props: {
    playField: {
      type: Object as PropType<PlayField>,
      required: true
    },
    numLettersInBank : {
      type: Number,
      required: true
    }
  },
  emits: {
    "playfield-remove-letter": function(iRow: number, jCol: number) {
      return true;
    },
    "playfield-put-letter": function(iRow: number, jCol: number) {
      return true;
    }
  },
  computed: {
    gridSize(): number {
      return this.playField.gridSize;
    }
  },

  methods: {
    cellOwnerClasses(iRow: number, jCol: number) {
      if (this.playField.cellGrid[iRow][jCol].isInGo) {
        if (this.playField.cellGrid[iRow][jCol].idPlayer === 0)
          return { "cell-background-p0": true };
        else if (this.playField.cellGrid[iRow][jCol].idPlayer === 1)
          return { "cell-background-p1": true };
      }

      return {};
    },

    isCellBusy(iRow: number, jCol: number): boolean {
      return !this.playField.cellGrid[iRow][jCol].isEmpty();
    },
    isCellEmpty(iRow: number, jCol: number) {
      return this.playField.cellGrid[iRow][jCol].isEmpty();
    },
    isCellInGo(iRow: number, jCol: number) {
      return this.playField.cellGrid[iRow][jCol].isInGo;
    },

    putLetter(iRow: number, jCol: number) {
      if (!this.isCellInGo(iRow, jCol)) {
        this.$emit("playfield-put-letter", iRow, jCol);
        // if (!this.playField.lettersInTheGoHaveHeighbors()) {
        //   console.log("Не все буквы имеют соседей");
        // }
      }
    },

    removeLetter(iRow: number, jCol: number) {
      if (this.isCellInGo(iRow, jCol)) {
        this.$emit("playfield-remove-letter", iRow, jCol);
        // if (!this.playField.lettersInTheGoHaveHeighbors()) {
        //   console.log("Не все буквы имеют соседей");
        // }
      }
    }
  }
});
</script>

<style scoped>
.play-field {
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  align-items:center;
}

.play-field-row {
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  -webkit-flex: 0 0 40px;
  -ms-flex: 0 0 40px;
  flex: 0 0 40px;
  height: 40px;
}

.play-field-cell {
  -webkit-flex: 0 0 40px;
  -ms-flex: 0 0 40px;
  flex: 0 0 40px;
  height: 40px;
  width: 40px;
  border: 1px solid black;
}

.cell-background-default {
  background-color: white;
}

.cell-background-p0 {
  background-color: lightgreen;
}

.cell-background-p1 {
  background-color: lightblue;
}

.bank-info {
  padding-top: 4px;
}
</style>
