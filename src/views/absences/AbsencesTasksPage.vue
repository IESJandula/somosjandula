<template>
  <div class="fullscreen-container">
    <!-- Sección de la carpeta de Google Drive -->
    <div class="drive-container">
      <iframe
        class="google-drive-iframe"
        :src="googleDriveEmbedUrl"
        frameborder="0"
        scrolling="auto"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// ID de la carpeta de Google Drive
const folderId = '1g7zzRm0CTvNND5XO7osmhRhXJzREYzb7FzgsFIzbzOsDTqMQOsOmejfJmocUgx6VoW3x7hP4';

// URL embebida en vista grid
const googleDriveEmbedUrl = ref(
  `https://drive.google.com/embeddedfolderview?id=${folderId}#list`
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
  background-color: var(--form-bg-light);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.drive-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.google-drive-iframe {
  width: 100%;
  height: calc(100% - 6em); /* resta la altura del menú superior */
  border: none;
  margin-top: 60px; /* lo bajas 60px desde arriba */
}


/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .fullscreen-container {
    background-color: var(--form-bg-dark);
  }
}
</style>
