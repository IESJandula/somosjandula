<template>
  <div class="form-wrapper">
    <div class="form-container">
      <h1 class="title">Inserción masiva de usuarios</h1>
      <div class="form-section">
        <form @submit.prevent="uploadUsers">
          <div>
            <input type="file" ref="fileInputUsers" />
            <ion-button expand="block" type="submit">Crear usuarios</ion-button>
          </div>
        </form>
      </div>
    </div>

    <div class="form-container">
      <h1 class="title">Inserción masiva de apps</h1>
      <div class="form-section">
        <form @submit.prevent="uploadApps">
          <div>
            <input type="file" ref="fileInputApps" />
            <ion-button expand="block" type="submit">Crear aplicaciones</ion-button>
          </div>
        </form>
      </div>
    </div>

    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
  </div>
</template>

<script setup>
  import { IonButton, IonToast } from '@ionic/vue';
  import { ref } from 'vue';
  import { importarUsuarios, importarAplicaciones }  from '@/services/firebaseService';

  const toastMessage = ref('');
  const toastColor = ref('success');
  const isToastOpen = ref(false);

  // Ref para el input de archivo
  const fileInputUsers = ref(null);
  const fileInputApps = ref(null);

  const uploadUsers = async () => {
    const file = fileInputUsers.value.files[0];
    await importarUsuarios(toastMessage, toastColor, isToastOpen, file);
  };

  const uploadApps = async () => {
    const file = fileInputApps.value.files[0];
    await importarAplicaciones(toastMessage, toastColor, isToastOpen, file);
  };
</script>

<style scoped>
  .form-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 20px; /* Espaciado entre las tarjetas */
    justify-content: center; /* Centrar las tarjetas */
  }

  .form-container {
    width: 100%;
    max-width: 400px;
    background-color: var(--form-bg-light);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 10px;
    box-sizing: border-box;
    padding: 20px 30px;
    margin: auto;
    font-family: 'Roboto', sans-serif;
    margin-top: 2%;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-color-light);
  }

  ion-button {
    margin-top: 15px;
  }

  /* Modo oscuro */
  @media (prefers-color-scheme: dark) {
    .form-container {
      background-color: var(--form-bg-dark);
      box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
      border: 1px solid #444;
    }

    .title {
      color: var(--text-color-dark);
    }
  }
</style>
