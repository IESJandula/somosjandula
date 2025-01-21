<template>
  <div class="fullscreen-container">
    <!-- Sección de la hoja de cálculo -->
    <div class="spreadsheet-container">
      <iframe
        class="google-sheet-iframe"
        :src="googleSheetUrl"
        frameborder="0"
        scrolling="no"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// URL de la hoja de cálculo de Google que deseas embeber
const googleSheetUrl = ref(
  'https://docs.google.com/spreadsheets/d/1Gj7aFN9Ys-sWYwbSefWpWsVYgFZdkEc0PB06-3R5Lvo/edit?gid=2027701287#gid=2027701287'
);
</script>

<style scoped>
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--form-bg-light); /* Fondo claro para modo claro */
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.spreadsheet-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.google-sheet-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .fullscreen-container {
    background-color: var(--form-bg-dark); /* Fondo oscuro para modo oscuro */
  }
}
</style>

