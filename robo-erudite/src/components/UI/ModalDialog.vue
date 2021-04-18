
<template>
  <div class="modal-backdrop">
    <div class="modal"
      role="dialog"
      aria-describedby="modalDescription"
    >
      <section
        class="modal-body"
        id="modalDescription"
      >
        <slot name="content">
          This is the default body!
        </slot>
      </section>

      <footer class="modal-footer">
        <slot name="actions">
          <button
            type="button"
            @click="$emit('close', dialogId)"
            aria-label="Close modal"
          >
            Закрыть
          </button>
        </slot>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent} from "vue";

export default defineComponent({
  name: "ModalDialog",
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
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: #FFFFFF;
    box-shadow: 2px 2px 20px 1px;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    min-width: 200px;
    min-height: 150px;
    border-radius: 8px;
  }

  .modal-footer {
    border-top: 1px solid #eeeeee;
    padding: 5px;
    flex: 0 0 auto;
  }

  .modal-body {
    position: relative;
    padding: 20px 10px;
    flex: 1;
  }

  .modal-footer button {
    color: white;
    background: #4AAE9B;
    border: 1px solid #4AAE9B;
    border-radius: 4px;
    margin-left: 4px;
    margin-right: 4px;
    font-size: 1.5em;
    border-radius: 8px;
}

</style>