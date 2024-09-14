<template>
  <div class="fullscreen-container">
    <!-- Sección del documento de Google Docs -->
    <div class="document-container">
      <iframe
        class="google-doc-iframe"
        :src="googleDocUrl"
        frameborder="0"
        scrolling="yes"
      ></iframe>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref } from 'vue';
  
  // URL del documento de Google Docs que deseas embeber
  const googleDocUrl = ref(
    'https://docs.google.com/document/d/1uLGTRioelHaEF15n7GxekRCLHv9CoCmPfYp82jrzpJQ/preview'
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
  
  .document-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .google-doc-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  </style>
  