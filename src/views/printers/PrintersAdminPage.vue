<template>
  <div class="container">
    <!-- Primera Fila: Filtro de Búsqueda y Tabla de Resultados -->
    <div class="top-section">
      <!-- Tarjeta de Filtrado -->
      <div class="form-container">
        <h1 class="title">Consultar impresión</h1>
        <form @submit.prevent="submitForm">
          <div class="form-section">
            <ion-grid>
              <!-- Primera Fila: Usuario, Impresora y Estado -->
              <ion-row>
                <ion-col size="6">
                  <ion-item>
                    <ion-label position="stacked">Usuario:</ion-label>
                    <ion-select v-model="filtroBusqueda.user" placeholder="Todos">
                      <ion-select-option value="Todos">Todos</ion-select-option>
                      <ion-select-option v-for="user in users" :key="user.nombreCompleto" :value="user.nombreCompleto">{{ user.nombreCompleto }}</ion-select-option>
                    </ion-select>
                  </ion-item>
                </ion-col>
                <ion-col size="6">
                  <ion-item>
                    <ion-label position="stacked">Impresora:</ion-label>
                    <ion-select v-model="filtroBusqueda.printer" placeholder="Todos">
                      <ion-select-option value="Todos">Todos</ion-select-option>
                      <ion-select-option v-for="printer in printers" :key="printer.name" :value="printer.name">{{ printer.name }}</ion-select-option>
                    </ion-select>
                  </ion-item>
                </ion-col>
              </ion-row>

              <!-- Segunda Fila: Fechas -->
              <ion-row>
                <ion-col size="4">
                  <ion-item>
                    <ion-label position="stacked">Estado:</ion-label>
                    <ion-select v-model="filtroBusqueda.status" placeholder="Todos">                      
                      <ion-select-option value="Todos">Todos</ion-select-option>
                      <ion-select-option v-for="state in states" :key="state" :value="state">{{ state }}</ion-select-option>
                    </ion-select>
                  </ion-item>
                </ion-col>
                <ion-col size="4">
                  <ion-item>
                    <ion-label position="stacked">Fecha de Inicio:</ion-label>
                    <ion-input v-model="filtroBusqueda.startDate" type="date" placeholder="Fecha de inicio"></ion-input>
                  </ion-item>
                </ion-col>
                <ion-col size="4">
                  <ion-item>
                    <ion-label position="stacked">Fecha de Fin:</ion-label>
                    <ion-input v-model="filtroBusqueda.endDate" type="date" placeholder="Fecha de fin"></ion-input>
                  </ion-item>
                </ion-col>
              </ion-row>
            </ion-grid>

            <!-- Botones -->
            <ion-button expand="block" type="submit">Filtrar</ion-button>
            <ion-button expand="block" color="danger" @click="resetForm">Reset</ion-button>
          </div>
        </form>
      </div>

      <!-- Tabla de resultados -->
      <div class="table-container">
        <PrintInfoTable :info="filteredInfo" :adminRole="true" />
      </div>
    </div>

    <!-- Segunda Fila: Tabla de Estado de las Impresoras -->
    <div class="bottom-section">
      <div class="printer-status-table">
        <h1 class="title">Estado de las Impresoras</h1>
        <ion-grid>
          <ion-row>
            <ion-col>
              <table class="table-container">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Cola</th>
                    <th>Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="printer in printers" :key="printer.name">
                    <td>{{ printer.name }}</td>
                    <td>{{ printer.status }}</td>
                    <td>{{ printer.printingQueue }}</td>
                    <td>{{ formatDate(printer.lastUpdate) }}</td>
                  </tr>
                </tbody>
              </table>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IonGrid, IonRow, IonCol, IonItem, IonLabel } from '@ionic/vue';
import { IonSelect, IonSelectOption, IonInput, IonButton, IonIcon } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { obtenerUsuariosConRoles } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast.js';
import PrintInfoTable from '@/components/printers/PrintInfoTable.vue';
import { obtenerImpresoras, obtenerEstados, filtrarDatos } from '@/services/printers';

const filtroBusqueda = ref({
  user: '',
  printer: '',
  status: '',
  startDate: '',
  endDate: '',
});

const users = ref([]);
const printers = ref([]);
const states = ref([]);
const filteredInfo = ref([]);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

function formatDate(timestamp) {
  const date = new Date(timestamp); // Convertir timestamp a objeto Date
  return date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const submitForm = async () => {
  try {
    // Formatear las fechas a DD/MM/YYYY si están presentes
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Construir los parámetros de la consulta basados en filtroBusqueda
    const filtroBusquedaRequest = {
      user: filtroBusqueda.value.user !== 'Todos' ? filtroBusqueda.value.user : null,
      printer: filtroBusqueda.value.printer !== 'Todos' ? filtroBusqueda.value.printer : null,
      status: filtroBusqueda.value.status !== 'Todos' ? filtroBusqueda.value.status : null,
      startDate: formatDate(filtroBusqueda.value.startDate),
      endDate: formatDate(filtroBusqueda.value.endDate),
    };

    // Hacer la solicitud a la API para obtener los datos filtrados, enviando los datos como JSON en el cuerpo
    const response = await filtrarDatos(toastMessage, toastColor, isToastOpen, filtroBusquedaRequest);

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      let errorString = 'Error al obtener los datos filtrados';

      // Creamos toast y lanzamos excepción
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', errorString);
      throw new Error(errorString);
    }

    // Asignar los datos filtrados a la tabla
    filteredInfo.value = await response.json();

    // Mostrar un mensaje de éxito
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Datos filtrados con éxito');
  } catch (error) {
    // Crear toast y lanzar excepción
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
    throw new Error(error.message);
  }
};

const resetForm = () => {
  filtroBusqueda.value = {
    user: 'Todos',
    printer: 'Todos',
    status: 'Todos',
    startDate: '',
    endDate: '',
  };
};

const cargarDatos = async () => {
  users.value = await obtenerUsuariosConRoles(isToastOpen, toastMessage, toastColor);
  printers.value = await obtenerImpresoras(toastMessage, toastColor, isToastOpen);
  states.value = await obtenerEstados(toastMessage, toastColor, isToastOpen);
};

onMounted(() => {
  cargarDatos();
  resetForm();
  submitForm();
});
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.bottom-section {
  display: flex;
  justify-content: center; /* Centra la tabla horizontalmente */
  align-items: center;     /* Centra la tabla verticalmente */
}

.form-container {
  flex: 1 1 45%;
  min-width: 300px;
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px 30px;
  font-family: 'Roboto', sans-serif;
}

.table-container {
  flex: 1 1 50%;
  min-width: 300px;
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
  border-radius: 10px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
}

.printer-status-table {
  flex: 1 1 25%;
  min-width: 300px;
  max-width: 600px;
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  overflow: auto;
  max-height: 400px;
  margin: 0 auto; /* Centra el contenedor de la tabla */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra los elementos dentro del contenedor */
}

.printer-status-table .title {
  margin-bottom: 10px;
}

.printer-status-table table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Roboto', sans-serif;
}

.printer-status-table th,
.printer-status-table td {
  border: 1px solid #dddddd;
  text-align: center;
  padding: 8px;
}

.printer-status-table th {
  background-color: #f2f2f2;
  color: #3a7ca5;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.printer-status-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.printer-status-table tr:hover {
  background-color: #e6f7ff;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  color: #3a7ca5;
}

ion-button {
  margin-top: 15px;
}

</style>