<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Actualizar Constantes -->
  <div class="form-wrapper">
    <div class="form-container">
      <h1 class="title">Configuración de Gmail</h1>
      <div class="form-section">
        <div style="margin-top: 15px;">
          <ion-button expand="block" @click="autorizarGmailOAuthLlamadaServicio">Autorizar Gmail OAuth</ion-button>
        </div>
      </div>
    </div>
    <div class="form-container">
      <div class="title-container">
        <h1 class="title">Actualizar Constantes</h1>
      </div>
      <ion-row>
        <ion-col size="12">
          <ion-item>
            <ion-label position="stacked">Clave de la constante:</ion-label>
            <ion-select v-model="selectedConstante" @ionChange="onConstanteChange">
              <ion-select-option v-for="constante in constantes" :key="constante.clave" :value="constante">
                {{ constante.clave }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="12">
          <ion-item v-if="selectedConstante">
            <ion-label position="stacked">Valor:</ion-label>
            <ion-input v-model="selectedConstante.valor"></ion-input>
          </ion-item>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="12">
          <ion-button expand="block" color="primary" @click="actualizarConstanteSeleccionada">
            Actualizar
          </ion-button>
        </ion-col>
      </ion-row>
    </div>
  </div>
  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>

<script setup>
import { notificationsApiUrl } from "@/environment/apiUrls.ts";
import { ref, onMounted } from "vue";
import { IonRow, IonCol, IonItem, IonLabel } from "@ionic/vue";
import {
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonToast,
} from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";
import { obtenerConstantes, actualizarConstantes } from "@/services/constantes";
import { autorizarGmailOAuth } from '@/services/notifications';

// Selección de constante
const selectedConstante = ref(null);
const constantes = ref([]);
// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Nueva variable reactiva para el mensaje de actualización
let mensajeColor = "";

// Función que se llama cuando el usuario selecciona una constante
const onConstanteChange = () => {
  if (!selectedConstante.value) {
    selectedConstante.value = { valor: "" };
  } else if (selectedConstante.value.valor === undefined) {
    selectedConstante.value.valor = "";
  }
};

// Función para actualizar la constante seleccionada
const actualizarConstanteSeleccionada = async () => {
  try {
    const constantesActualizadas = constantes.value.map((c) =>
      c.clave === selectedConstante.value.clave ? selectedConstante.value : c
    );

    await actualizarConstantes(
      notificationsApiUrl + "/notifications/constants",
      toastMessage,
      toastColor,
      isToastOpen,
      constantesActualizadas
    );
    mensajeColor = "success";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      "Constantes actualizadas con éxito"
    );
  } catch (error) {
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      error.message
    );
  }
};

// Función para obtener las constantes al cargar el componente
const cargarConstantes = async () => {
  try {
    constantes.value = await obtenerConstantes(
      notificationsApiUrl + "/notifications/constants",
      toastMessage,
      toastColor,
      isToastOpen
    );
  } catch (error) {
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      error.message
    );
  }
};

const autorizarGmailOAuthLlamadaServicio = async () => {
    await autorizarGmailOAuth(toastMessage, toastColor, isToastOpen);
  };

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await cargarConstantes();
});
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  border: 1px solid #444;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  margin: auto;
  font-family: "Roboto", sans-serif;
  margin-top: 2%;
}

.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  /* Espaciado entre las tarjetas */
  justify-content: center;
  /* Centrar las tarjetas */
}

.title-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  width: 100%;
  padding: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-container {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .form-container-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .form-container-table-logs {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }
}

@media (max-width: 768px) {
  .form-container {
    border: 1px solid #444;
  }

  .form-container-table table {
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
    display: block;
    white-space: nowrap;
  }

  .form-container-table-logs table {
    overflow-x: auto;
    max-height: 300px;
    overflow-y: auto;
    display: block;
    white-space: nowrap;
  }
}
</style>
