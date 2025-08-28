<template>
  <div class="file-drop-area" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop" @click="triggerFileInput" :class="{ 'dragging': isDragging }">
    <p v-if="!file">Arrastra un archivo o haz clic aquí</p>
    <p v-else>Archivo seleccionado: {{ file.name }}</p>
    <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emits = defineEmits(['file-selected']); // Define el evento emitido

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
    emits('file-selected', file.value); // Emite el archivo seleccionado
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files.length) {
    file.value = files[0];
    emits('file-selected', file.value); // Emite el archivo seleccionado
  }
};

const fileClear = () => {
  file.value = null; // Limpia el archivo seleccionado
  if (fileInput.value) {
    fileInput.value.value = ""; // Resetea el input de archivo
  }
};

defineExpose({
  fileClear // Expone el método para poder llamarlo desde el componente padre
});
</script>
<style scoped>
.file-drop-area {
  position: relative;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  border: 2px dashed var(--button-border-light);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  background-color: var(--form-bg-light);
}

.file-drop-area p {
  margin: 0;
  width: 100%;
  text-align: center;
}

.file-drop-area:hover {
  border-color: var(--text-color-light);
}

.file-drop-area.dragging {
  border-color: var(--text-color-light);
  background-color: #f9f9f9;
}

.hidden {
  display: none;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .file-drop-area {
    border-color: var(--button-border-dark);
    background-color: var(--form-bg-dark);
  }

  .file-drop-area:hover {
    border-color: var(--text-color-dark);
  }

  .file-drop-area.dragging {
    border-color: var(--text-color-dark);
    background-color: #2c2c2c;
  }
}
</style>
