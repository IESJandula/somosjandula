<template>
  <!-- Actualizar Constantes -->
  <div class="form-wrapper">
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
    @did-dismiss="() => (isToastOpen = false)" position="top">
  </ion-toast>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { IonToast, IonInput, IonRow, IonCol, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { obtenerConstantes, actualizarConstantes } from "@/services/constantes";
import { schoolManagerApiUrl } from "@/environment/apiUrls.ts";

const selectedConstante = ref(null);
const constantes = ref([]);

// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
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
      schoolManagerApiUrl + "/schoolManager/constants",
      toastMessage,
      toastColor,
      isToastOpen,
      constantesActualizadas
    );
    mensajeActualizacion = "Constantes actualizadas con éxito";
    mensajeColor = "success";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
  } catch (error) {
    mensajeActualizacion = "Error al actualizar la constante";
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
    throw new Error(error.message);

  }
};

// Función para obtener las constantes al cargar el componente
const cargarConstantes = async () => {
  try {
    constantes.value = await obtenerConstantes(
      schoolManagerApiUrl + "/schoolManager/constants",
      toastMessage,
      toastColor,
      isToastOpen
    );

    // Seleccionar la constante "Reserva Deshabilitada" por defecto
    const solicitudDeshabilitada = constantes.value.find(
      (c) => c.clave === "Solicitudes Deshabilitada"
    );

    if (solicitudDeshabilitada) {
      selectedConstante.value = solicitudDeshabilitada;
    }
  } catch (error) {
    mensajeActualizacion = "Error al obtener constantes";
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
    throw new Error(error.message);
  }
};

onMounted(async () => {
  await cargarConstantes();
});

</script>

<style scoped>
.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  /* Espaciado entre las tarjetas */
  justify-content: center;
  /* Centrar las tarjetas */
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
  font-family: "Roboto", sans-serif;
  margin-top: 2%;
}

.title-container {
  display: flex;
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

  .title {
    color: var(--text-color-dark);
  }
}

@media (max-width: 768px) {
    .form-container {
    border: 1px solid #444;
  }

  table {
    font-size: 14px;
    width: 100%;
  }
}
</style>