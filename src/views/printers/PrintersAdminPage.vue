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
                      <ion-select-option v-for="user in users" 
                                         :key="`${user.nombre} ${user.apellidos}`" 
                                         :value="`${user.nombre} ${user.apellidos}`">
                        {{ `${user.nombre} ${user.apellidos}` }}
                      </ion-select-option>
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
        <div class="table-content">
          <div class="table-scroll-inner">
            <PrintInfoTable :info="filteredInfo" :adminRole="true" @actualizar-tabla="submitForm" />
          </div>
        </div>
      </div>
    </div>

    <!-- Segunda Fila: Tabla de Estado de las Impresoras -->
    <div class="bottom-section">
      <!-- Estado de las impresoras -->
      <div class="printer-status-table">
        <div class="title-container">
          <h1 class="title">Estado de las Impresoras</h1>
          <ion-button class="refresh-button" fill="solid" color="primary" @click="refrescarImpresoras" shape="round">
            <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
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
    </div>
  </div>
</template>


<script setup>
import { IonGrid, IonRow, IonCol, IonItem, IonLabel, IonText } from '@ionic/vue';
import { IonSelect, IonSelectOption, IonInput, IonButton, IonIcon } from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { obtenerInfoUsuarios } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast.js';
import PrintInfoTable from '@/components/printers/PrintInfoTable.vue';
import { obtenerImpresoras, obtenerEstados, filtrarDatos } from '@/services/printers';
import { obtenerConstantes, actualizarConstantes } from '@/services/constantes';
import { printersApiUrl } from "@/environment/apiUrls.ts";

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

// Nueva variable reactiva para el mensaje de actualización
const mensajeActualizacion = ref('');
const mensajeColor = ref('');

// Selección de constante
const selectedConstante = ref(null);
const constantes = ref([]);

// Función para obtener las constantes al cargar el componente
const cargarConstantes = async () => {
  try {
    constantes.value = await obtenerConstantes(printersApiUrl + '/printers/web/constantes', toastMessage, toastColor, isToastOpen);

    // Seleccionar la constante "Impresión Deshabilitada" por defecto
    const impresionDeshabilitada = constantes.value.find(c => c.clave === 'Impresion Deshabilitada');
    
    if (impresionDeshabilitada) {
      selectedConstante.value = impresionDeshabilitada;
    }
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al obtener constantes');
    mensajeActualizacion.value = 'Error al obtener constantes';
    mensajeColor.value = 'danger';
    throw new Error(error.message);
  }
};

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
  try {
    const constantesActualizadas = constantes.value.map(c =>
      c.clave === selectedConstante.value.clave ? selectedConstante.value : c
    );

    await actualizarConstantes(printersApiUrl + '/printers/web/constantes', toastMessage, toastColor, isToastOpen, constantesActualizadas);
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Constante actualizada con éxito');
    mensajeActualizacion.value = 'Constantes actualizadas con éxito';
    mensajeColor.value = 'success';
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar la constante');
    mensajeActualizacion.value = 'Error al actualizar la constante';
    mensajeColor.value = 'danger';
    throw new Error(error.message);
  }
};

function formatDate(timestamp) {
  const date = new Date(timestamp);
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
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const filtroBusquedaRequest = {
      user: filtroBusqueda.value.user !== 'Todos' ? filtroBusqueda.value.user : null,
      printer: filtroBusqueda.value.printer !== 'Todos' ? filtroBusqueda.value.printer : null,
      status: filtroBusqueda.value.status !== 'Todos' ? filtroBusqueda.value.status : null,
      startDate: formatDate(filtroBusqueda.value.startDate),
      endDate: formatDate(filtroBusqueda.value.endDate),
    };

    const response = await filtrarDatos(toastMessage, toastColor, isToastOpen, filtroBusquedaRequest);

    if (!response.ok) {
      let errorString = 'Error al obtener los datos filtrados';
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', errorString);
      throw new Error(errorString);
    }

    filteredInfo.value = await response.json();
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Datos filtrados con éxito');
  } catch (error) {
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
  users.value = await obtenerInfoUsuarios(isToastOpen, toastMessage, toastColor);
  printers.value = await obtenerImpresoras(toastMessage, toastColor, isToastOpen);
  states.value = await obtenerEstados(toastMessage, toastColor, isToastOpen);
};

const refrescarImpresoras = async () => {
  try {
    printers.value = await obtenerImpresoras();
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Impresoras actualizadas');
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar impresoras');
    throw new Error(error.message);
  }
};

onMounted(() => {
  cargarDatos();
  resetForm();
  submitForm();
  cargarConstantes();
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
  justify-content: space-between;
  gap: 20px;
}

/* Estilos para la tarjeta del formulario */
.form-container {
  flex: 1 1 45%;
  min-width: 300px;
  background-color: var(--form-bg-light);
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
  overflow: hidden;
}

.table-content {
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: 360px;
}

.table-scroll-inner {
  min-width: 1600px;
  width: 100%;
}

.printer-status-table {
  flex: 1 1 25%;
  min-width: 300px;
  max-width: 600px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  overflow: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.title-container ion-button {
  margin-left: auto;
  margin-top: 0;
}

.printer-status-table .title {
  margin: 0;
  text-align: center;
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
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-light);
}

.update-constants-card {
  flex: 1 1 30%;
  min-width: 300px;
  max-width: 600px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {
  .bottom-section {
    flex-direction: column;
  }

  .update-constants-card,
  .printer-status-table {
    flex: 1 1 100%;
    margin-bottom: 20px;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-container,
  .printer-status-table,
  .update-constants-card {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }

  .printer-status-table th {
    background-color: #3a3a3a;
    color: var(--text-color-dark);
  }

  .printer-status-table tr:nth-child(even) {
    background-color: #2c2c2c;
  }

  .printer-status-table tr:hover {
    background-color: #3e3e3e;
  }

  .table-container {
    background-color: #2c2c2c;
  }
}
</style>

