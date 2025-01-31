<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Nueva tarjeta: Actualizar constantes -->
  <div class="update-constants-card">
    <div class="title-container">
      <h1 class="title">Actualizar constantes</h1>
    </div>
    <ion-grid>
      <ion-row>
        <ion-col size="12">
          <ion-item>
            <ion-label position="stacked">Clave de la constante:</ion-label>
            <ion-select v-model="selectedConstante" @ionChange="onConstanteChange">
              <ion-select-option v-for="constante in constantes" :key="constante.clave" :value="constante">{{ constante.clave }}</ion-select-option>
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
          <ion-button expand="block" color="primary" @click="actualizarConstanteSeleccionada">Actualizar</ion-button>
        </ion-col>
      </ion-row>
      <!-- Mensaje de resultado de la actualización -->
      <ion-row v-if="mensajeActualizacion">
        <ion-col size="12">
          <ion-text :color="mensajeColor">{{ mensajeActualizacion }}</ion-text>
        </ion-col>
      </ion-row>
    </ion-grid>
  </div>
</template>
<script setup>
import { bookingsApiUrl } from "@/environment/apiUrls.ts";
import { ref, onMounted } from 'vue'
import { IonGrid, IonRow, IonCol, IonItem, IonLabel, IonText } from '@ionic/vue';
import { IonSelect, IonSelectOption, IonInput, IonButton } from '@ionic/vue';
import { crearToast } from '@/utils/toast.js';
import { obtenerConstantes, actualizarConstantes } from '@/services/constantes';

// Selección de constante
const selectedConstante = ref(null);
const constantes = ref([]);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Nueva variable reactiva para el mensaje de actualización
const mensajeActualizacion = ref('');
const mensajeColor = ref('');

// Función que se llama cuando el usuario selecciona una constante
const onConstanteChange = () => {
  if (selectedConstante.value && selectedConstante.value.valor !== undefined) {
    selectedConstante.value.valor = selectedConstante.value.valor;
  } else {
    selectedConstante.value = { valor: '' };
  }
};

// Función para actualizar la constante seleccionada
const actualizarConstanteSeleccionada = async () => {
  try
  {
    const constantesActualizadas = constantes.value.map(c => c.clave === selectedConstante.value.clave ? selectedConstante.value : c);

    await actualizarConstantes(bookingsApiUrl + '/bookings/constants', toastMessage, toastColor, isToastOpen, constantesActualizadas);
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Constante actualizada con éxito');
    mensajeActualizacion.value = 'Constantes actualizadas con éxito';
    mensajeColor.value = 'success';
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar la constante');
    mensajeActualizacion.value = 'Error al actualizar la constante';
    mensajeColor.value = 'danger';
    throw new Error(error.message);
  }
};

// Función para obtener las constantes al cargar el componente
const cargarConstantes = async () =>
{
  try
  {
    constantes.value = await obtenerConstantes(bookingsApiUrl + '/bookings/constants', toastMessage, toastColor, isToastOpen);

    // Seleccionar la constante "Reserva Deshabilitada" por defecto
    const reservaDeshabilitada = constantes.value.find(c => c.clave === 'Reserva Deshabilitada');
    
    if (reservaDeshabilitada)
    {
      selectedConstante.value = reservaDeshabilitada;
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al obtener constantes');
    mensajeActualizacion.value = 'Error al obtener constantes';
    mensajeColor.value = 'danger';
    throw new Error(error.message);
  }
};

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await cargarConstantes()
})
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: white;
  color: #1a1a1a;
  font-family: Arial, sans-serif;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-select {
  width: 80%;
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #007bff;
  outline: none;
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  margin-top: 20px;
  border-radius: 5px;
  overflow: hidden;
}

span {
  cursor: pointer;
  font-weight: bold;
  font-style: oblique;
}

th,
td {
  border: 2px solid #007bff;
  padding: 10px;
}

td {
  height: 50px;
  width: 150px;
  /* Establece un ancho fijo */
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  /* Para manejar contenido largo */
  overflow: hidden;
  /* Oculta cualquier contenido que desborde */
  word-wrap: break-word;
  /* Permite que el texto largo se divida y se ajuste */
}


th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

td {
  height: 50px;
  background-color: #e9f5ff;
}

th:first-child {
  background-color: #0056b3;
  /* Diferenciar la columna de tramos horarios */
}

button {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

tr:hover td {
  background-color: #d0eaff;
  /* Efecto hover en filas */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 300px;
}

.modal-content h2 {
  margin-bottom: 10px;
}

.modal-content label {
  display: block;
  margin-bottom: 5px;
}

.modal-content input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.modal-content button {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.modal-content button:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  table {
    font-size: 14px;
    width: 100%;
  }

  .custom-select {
    width: 100%;
  }
}
</style>
