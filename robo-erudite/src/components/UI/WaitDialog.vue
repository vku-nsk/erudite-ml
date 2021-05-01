<template>
  <div class="modal-backdrop">
    <div class="modal"
      role="dialog"
      aria-describedby="modalDescription"
    >
      <section class="modal-body" id="modalDescription">
        <slot name="content">
          This is the default body!
        </slot>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent} from "vue";

export default defineComponent({
  name: "WaitDialog",
  props: {
    dialogId: {
      type: String,
      required: true
    }
  },
  emits: {
    close: function(dialogId: string) {
      if (dialogId) return true;
      return false;
    }
  }
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: #FFFFFF;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  min-width: 12rem;
  min-height: 6rem;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-body {
  position: relative;
  padding: 0.2rem;
  font-size: 1.5rem;
  text-align: center;
}

</style>