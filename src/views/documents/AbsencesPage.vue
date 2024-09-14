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
  position: fixed; /* Fija el contenedor a la ventana */
  top: 0;
  left: 0;
  width: 100vw; /* Ocupa el 100% del ancho de la ventana */
  height: 100vh; /* Ocupa el 100% de la altura de la ventana */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff; /* Fondo blanco para toda la pantalla */
  margin: 0;
  padding: 0;
  overflow: hidden; /* Oculta cualquier desbordamiento */
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
</style>
