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
    'https://docs.google.com/document/d/19gYlWfXGjtuqHJXxb0cI6BZoy3DvTImh2ohbtDJ86HI/preview'
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

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .fullscreen-container {
    background-color: var(--form-bg-dark); /* Fondo oscuro para modo oscuro */
  }
}
</style>