<template>
  <div class="file-drop-area" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop" @click="triggerFileInput" :class="{ 'dragging': isDragging }">
    <p v-if="!file">Arrastra un archivo aquí o haz clic para seleccionar</p>
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
</script>
<style scoped>
.file-drop-area {
  position: relative;
  text-align: center;
  border: 2px dashed #d3d3d3;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  background-color: #f5f5f5;
}

.file-drop-area:hover {
  border-color: #3a7ca5;
}

.file-drop-area.dragging {
  border-color: #3a7ca5;
  background-color: #f9f9f9;
}

.hidden {
  display: none;
}
</style>