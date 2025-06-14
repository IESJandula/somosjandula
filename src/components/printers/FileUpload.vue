<template>
  <div
      class="drop__area"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="{ 'drop__area--dragging': isDragging }"
  >
    <p v-if="!file" class="drop__message">Arrastra un archivo aquí o haz clic para seleccionar</p>
    <p v-else class="drop__message">Archivo seleccionado: {{ file.name }}</p>
    <input ref="fileInput" type="file" class="drop__input" @change="handleFileChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emits = defineEmits(['file-selected']);

const isDragging = ref(false);
const file = ref(null);
const fileInput = ref(null);

const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length) {
    file.value = files[0];
    emits('file-selected', file.value);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length) {
    file.value = files[0];
    emits('file-selected', file.value);
  }
};

const fileClear = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

defineExpose({
  fileClear
});
</script>

<style scoped>
.drop__area {
  position: relative;
  text-align: center;
  border: 2px dashed var(--button-border-light);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  background-color: var(--form-bg-light);
  transition: background-color 0.3s, border-color 0.3s;
}

.drop__area:hover {
  border-color: var(--text-color-light);
}

.drop__area--dragging {
  border-color: var(--text-color-light);
  background-color: #f9f9f9;
}

.drop__message {
  font-size: 14px;
  color: var(--text-color-light);
}

.drop__input {
  display: none;
}

@media (prefers-color-scheme: dark) {
  .drop__area {
    border-color: var(--button-border-dark);
    background-color: var(--form-bg-dark);
  }

  .drop__area:hover {
    border-color: var(--text-color-dark);
  }

  .drop__area--dragging {
    border-color: var(--text-color-dark);
    background-color: #2c2c2c;
  }

  .drop__message {
    color: var(--text-color-dark);
  }
}
</style>
