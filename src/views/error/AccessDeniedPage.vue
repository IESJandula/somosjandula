<template>
<div class="fullscreen-container">
    <div class="message-container">
    <h1 class="error-title">Acceso Denegado</h1>
    <p class="error-message">
        No tienes permiso para acceder a esta página. Si crees que esto es un error, contacta con el administrador.
    </p>
    <button class="back-button" @click="goBack">Volver al inicio</button>
    </div>
</div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goBack = () =>
{
    router.push({ name: 'Login' }); // O redirige a cualquier página que prefieras
};
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
  padding: 20px;
  text-align: center;
  box-sizing: border-box;
}

.message-container {
  max-width: 500px;
  padding: 20px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;
  border-radius: 10px;
}

.error-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--text-color-light);
}

.error-message {
  font-size: 1rem;
  margin-bottom: 20px;
  color: var(--text-color-dark);
}

.back-button {
  background-color: #f1f1f1;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;
}

.back-button:hover {
  background-color: #e0e0e0;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .fullscreen-container {
    background-color: var(--form-bg-dark);
  }

  .message-container {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 4px 12px;
  }

  .error-title {
    color: var(--text-color-light);
  }

  .error-message {
    color: var(--text-color-light);
  }

  .back-button {
    background-color: #444;
    color: white;
    border: 1px solid #555;
  }

  .back-button:hover {
    background-color: #666;
  }
}
</style>