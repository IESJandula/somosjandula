<template>
  <div class="fullscreen-container">
    <!-- Sección del formulario de Google Forms -->
    <div class="form-container">
      <iframe
        class="google-form-iframe"
        :src="googleFormUrl"
        frameborder="0"
        scrolling="yes"
      ></iframe>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref } from 'vue';
  
  // URL del formulario de Google Forms que deseas embeber
  const googleFormUrl = ref(
    'https://docs.google.com/forms/d/e/1FAIpQLSczI-w2XGzGDRaEJGfO04U059WQhVWLhi0i-zpnr0DU9uUIdg/viewform'
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
  
  .form-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .google-form-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  </style>
  