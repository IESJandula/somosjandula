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

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .fullscreen-container {
    background-color: var(--form-bg-dark); /* Fondo oscuro para modo oscuro */
  }
}
</style>
