<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="form-wrapper">
    <div class="form-container">

      <!-- TÍTULO -->
      <div class="title-container">
        <h1 class="title">Dispositivos</h1>
      </div>

      <!-- ===== DATOS BÁSICOS ===== -->
      <div class="section">
        <div class="row">
          <label>MAC:</label>
          <input type="text" v-model="dispositivo" />
        </div>

        <div class="row">
          <label>Ubicación:</label>
          <select v-model="ubicacionElegida">
            <option
              v-for="ubicacion in ubicaciones"
              :key="ubicacion.nombreUbicacion"
              :value="ubicacion.nombreUbicacion"
            >
              {{ ubicacion.nombreUbicacion }}
            </option>
          </select>
        </div>

        <!-- ✅ APLICABILIDAD (nuevo) -->
        <div class="row">
          <label>Aplicabilidad:</label>
          <select v-model="aplicabilidadElegida">
            <option disabled value="">Selecciona aplicabilidad</option>
            <option
              v-for="ap in aplicabilidades"
              :key="ap.id ?? ap.nombreAplicabilidad ?? ap"
              :value="ap.nombreAplicabilidad ?? ap"
            >
              {{ ap.nombreAplicabilidad ?? ap }}
            </option>
          </select>
        </div>
      </div>

      <!-- ===== TIPO DISPOSITIVO ===== -->
      <div class="section center">
        <div class="switch-container-gestion">
          <span>Actuador</span>
          <label class="switch">
            <input type="checkbox" v-model="esSensorForm" />
            <span class="slider"></span>
          </label>
          <span>Sensor</span>
        </div>
      </div>

      <!-- ===== TIPO SENSOR ===== -->
      <div class="section center" v-if="esSensorForm">
        <div class="switch-container-gestion">
          <span>Booleano</span>
          <label class="switch">
            <input type="checkbox" v-model="esNumericoForm" />
            <span class="slider"></span>
          </label>
          <span>Numérico</span>
        </div>
      </div>

      <!-- ===== UMBRALES ===== -->
      <div class="section" v-if="esSensorForm">
        <div class="row">
          <label>Umbral Mínimo:</label>
          <input type="number" v-model="umbralMin" />
        </div>

        <div class="row">
          <label>Umbral Máximo:</label>
          <input type="number" v-model="umbralMax" />
        </div>
      </div>

      <!-- ===== BOTONES ===== -->
      <div class="section">

        <!-- ACTUADOR -->
        <button
          v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && !esSensorForm"
          class="btn-primary"
          @click="crearActuadorVista"
        >
          Crear / Modificar
        </button>

        <!-- SENSOR BOOLEANO -->
        <button
          v-if="dispositivo && dispositivo.trim() !== '' && ubicacionElegida && esSensorForm && !esNumericoForm && umbralMin < umbralMax"
          class="btn-primary"
          @click="crearSensorBooleanoVista"
        >
          Crear / Modificar
        </button>

        <!-- SENSOR NUMÉRICO -->
        <button
          v-if="dispositivo && ubicacionElegida && esSensorForm && esNumericoForm && umbralMin < umbralMax"
          class="btn-primary"
          @click="crearSensorNumericoVista"
        >
          Crear / Modificar
        </button>

      </div>

    </div>

    <!-- ==== LISTA DE DISPOSITIVOS ==== -->

    <!-- TÍTULO -->
    <div class="form-container-table">
      <div class="title-container">
        <h1 class="title">Lista de dispositivos</h1>
      </div>

      <!-- ===== TIPO DISPOSITIVO ===== -->

      <!-- ACTUADOR -->
      <div class="section center">
        <div class="switch-container-gestion">
          <span>Actuador</span>
          <label class="switch">
            <input type="checkbox" v-model="esSensorLista" />
            <span class="slider"></span>
          </label>
          <span>Sensor</span>
        </div>
      </div>

      <!-- SENSOR BOOLEANO -->
      <div class="section center" v-if="esSensorLista">
        <div class="switch-container-gestion">
          <span>Booleano</span>
          <label class="switch">
            <input type="checkbox" v-model="esNumericoLista" />
            <span class="slider"></span>
          </label>

          <!-- SENSOR NUMÉRICO -->
          <span>Numérico</span>
        </div>
      </div>

      <!-- ==== TABLA DE LOS DISPOSITIVOS ==== -->
      <table>
        <thead>
          <tr>
            <th>MAC</th>
            <th>Estado</th>
            <th>Ubicación</th>
            <th>Aplicabilidad</th>

            <th v-if="esSensorLista">Valor actual</th>
            <th v-if="esSensorLista">Umbral máximo</th>
            <th v-if="esSensorLista">Umbral mínimo</th>
            <th v-if="esSensorLista">Última actualización</th>

            <th>Acciones</th>
          </tr>
        </thead>

        <!-- ACTUADOR -->
        <tbody v-if="!esSensorLista">
          <tr v-for="dispositivo in actuadores" :key="dispositivo.mac">
            <td>{{ dispositivo.mac }}</td>
            <td>{{ dispositivo.estado }}</td>
            <td>{{ dispositivo.nombreUbicacion }}</td>
            <td>{{ dispositivo.aplicabilidad }}</td>

            <td>
              <button @click="eliminarActuadorVista(dispositivo.mac)">
                X
              </button>
            </td>
          </tr>
        </tbody>

        <!-- SENSOR BOOLEANO -->
        <tbody v-if="esSensorLista && !esNumericoLista">
          <tr v-for="sensor in sensoresBooleanos" :key="sensor.mac">
            <td>{{ sensor.mac }}</td>
            <td>{{ sensor.estado }}</td>
            <td>{{ sensor.nombreUbicacion }}</td>
            <td>{{ sensor.aplicabilidad }}</td>

            <td>
              <span v-if="sensor.valorActual !== null">
                {{ sensor.valorActual }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="sensor.ultimaActualizacion !== null">
                {{ sensor.ultimaActualizacion }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ sensor.umbralMinimo }}</td>
            <td>{{ sensor.umbralMaximo }}</td>
            <td>
              <button @click="eliminarSensorBooleanoVista(sensor.mac)">
                X
              </button>
            </td>
          </tr>
        </tbody>

        <!-- SENSOR NUMÉRICO -->
        <tbody v-if="esSensorLista && esNumericoLista">
          <tr v-for="sensor in sensoresNumericos" :key="sensor.mac">
            <td>{{ sensor.mac }}</td>
            <td>{{ sensor.estado }}</td>
            <td>{{ sensor.nombreUbicacion }}</td>
            <td>{{ sensor.aplicabilidad }}</td>
            <td>
              <span v-if="sensor.ultimaActualizacion !== null">
                {{ sensor.ultimaActualizacion }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ sensor.umbralMaximo }}</td>
            <td>{{ sensor.umbralMinimo }}</td>
            <td>
              <span v-if="sensor.valorActual !== null">
                {{ sensor.valorActual }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <button @click="eliminarSensorNumericoVista(sensor.mac)">
                X
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { crearToast } from "@/utils/toast.js";
import {
  obtenerAplicabilidad,
  crearActuador,
  crearSensorBooleano,
  crearSensorNumerico,
  obtenerActuadores,
  obtenerUbicaciones,
  obtenerSensorNumerico,
  obtenerSensorBooleano,
  eliminarActuador,
  eliminarSensorBooleano,
  eliminarSensorNumerico
} from "@/services/automations";

// DATOS
const dispositivo = ref("");
const ubicacionElegida = ref("");
const estado = ref("indefinido");
const umbralMin = ref(0);
const umbralMax = ref(0);

const actuadores = ref([]);
const sensoresNumericos = ref([]);
const sensoresBooleanos = ref([]);
const ubicaciones = ref([]);

// ✅ APLICABILIDAD (nuevo)
const aplicabilidadElegida = ref("");
const aplicabilidades = ref([]);

// booleanos para los botones de CREAR
const esSensorForm = ref(false);
const esNumericoForm = ref(false);

// booleanos para los botones de LISTAR
const esSensorLista = ref(false);
const esNumericoLista = ref(false);

// TOAST
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// ********* FUNCIONES ********

// ✅ Obtener lista de APLICABILIDAD (nuevo)
const obtenerAplicabilidadVista = async () => {
  try {
    aplicabilidades.value = await obtenerAplicabilidad(
      toastMessage,
      toastColor,
      isToastOpen
    );
  } catch (error) {
    aplicabilidades.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// Obtener la lista de UBICACIONES
const obtenerUbicacionesVista = async () => {
  ubicaciones.value = await obtenerUbicaciones(
    isToastOpen,
    toastMessage,
    toastColor
  );
};

// Crear Dispositivo ACTUADOR
const crearActuadorVista = async () => {
  try {
    await crearActuador(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivo,
      estado,
      ubicacionElegida,
      aplicabilidadElegida
    );

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "Actuador creado correctamente"
    );

    obtenerActuadoresVista();
    obtenerSensorBooleanoVista();
    obtenerSensorNumericoVista();

  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      error.message
    );
  }
};

// Obtener la lista de ACTUADORES
const obtenerActuadoresVista = async () => {
  try {
    actuadores.value = await obtenerActuadores(
      isToastOpen,
      toastMessage,
      toastColor,
    );
  } catch (error) {
    actuadores.value = [];
  }
};

//Eliminar ACTUADOR
const eliminarActuadorVista = async (mac) => {
  try {
    await eliminarActuador(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Actuador eliminado correctamente");
    await obtenerActuadoresVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// Crear dispositivo SENSOR BOOLEANO
const crearSensorBooleanoVista = async () => {
  try {
    await crearSensorBooleano(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivo,
      estado,
      ubicacionElegida,
      umbralMin,
      umbralMax
    );

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "Sensor booleano creado correctamente"
    );

    obtenerSensorBooleanoVista();
    obtenerActuadoresVista();
    obtenerSensorNumericoVista();

  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      error.message
    );
  }
};

const obtenerSensorBooleanoVista = async () => {
  try {
    sensoresBooleanos.value = await obtenerSensorBooleano(
      isToastOpen,
      toastMessage,
      toastColor,
    );
  } catch (error) {
    sensoresBooleanos.value = [];
  }
};

// Eliminar SENSOR BOOLEANO
const eliminarSensorBooleanoVista = async (mac) => {
  try {
    await eliminarSensorBooleano(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Sensor booleano eliminado correctamente");
    await obtenerSensorBooleanoVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

// Crear dispositivo SENSOR NÚMERICO
const crearSensorNumericoVista = async () => {
  try {
    await crearSensorNumerico(
      toastMessage,
      toastColor,
      isToastOpen,
      dispositivo,
      estado,
      ubicacionElegida,
      umbralMin,
      umbralMax
    );

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "Sensor numérico creado correctamente"
    );

    obtenerSensorNumericoVista();
    obtenerSensorBooleanoVista();
    obtenerActuadoresVista();

  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      error.message
    );
  }
};

// Obtener la lista de SENSORES NÚMERICOS
const obtenerSensorNumericoVista = async () => {
  try {
    sensoresNumericos.value = await obtenerSensorNumerico(
      isToastOpen,
      toastMessage,
      toastColor,
    );
  } catch (error) {
    sensoresNumericos.value = [];
  }
};

//Eliminar SENSOR NUMÉRICO
const eliminarSensorNumericoVista = async (mac) => {
  try {
    await eliminarSensorNumerico(toastMessage, toastColor, isToastOpen, mac);
    crearToast(toastMessage, toastColor, isToastOpen, "Sensor numérico eliminado correctamente");
    await obtenerSensorNumericoVista();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, error.message);
  }
};

onMounted(async () => {
  // ✅ antes llamabas obtenerAplicabilidad() sin guardar nada
  await obtenerAplicabilidadVista();

  await obtenerUbicacionesVista();
  await obtenerActuadoresVista();
  await obtenerSensorNumericoVista();
  await obtenerSensorBooleanoVista();

  // ❌ Eliminaciones automáticas quitadas (no tiene sentido y te rompe porque falta mac)
  // await eliminarActuadorVista();
  // await eliminarSensorBooleano();
  // await eliminarSensorNumericoVista();
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

.form-container-table {
  min-width: 1200px;
  width: fit-content;
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

.form-container-table-logs {
  overflow-x: auto;
  max-width: 83%;
  overflow-y: auto;
  display: block;
  white-space: nowrap;
}

.sticky-column {
  position: sticky;
  left: 0;
  background: white;
  z-index: 2;
}

.decrementar-button {
  background-color: #dc3545;
  float: left;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
}

.incrementar-button {
  background-color: #007bff;
  color: white;
  border: none;
  float: right;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
}

.numPagina {
  display: flex;
  align-items: center;
  justify-content: block;
}

.pagina-container {
  display: flex;
  padding-top: 2%;
  justify-content: space-between;
  width: 100%;
}

.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

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
  transition: border-color 0.3s, box-shadow 0.3s;
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
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
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

.title {
  text-align: center;
  width: 100%;
}

.switch-container {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  margin-left: 14%;
}

.switch-container-gestion {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 8%;
}

.switch-container span {
  font-size: 20px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked+.slider {
  background-color: #2196f3;
}

input:checked+.slider:before {
  transform: translateX(26px);
}

.btn-modify-lock {
  color: white;
  border: none;
  margin-left: 15px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-modify-unlock {
  background-color: #025ec0;
  color: white;
  border: none;
  margin-left: 15px;
  border-radius: 5px;
  cursor: pointer;
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

  table {
    font-size: 14px;
    width: 100%;
  }

  .custom-select {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .switch-container {
    margin-left: 0;
  }
}

/* ===== SECCIONES (RESPIRACIÓN TIPO IONIC) ===== */
.section {
  margin-bottom: 25px;
}

.section.center {
  display: flex;
  justify-content: center;
}

/* Filas más limpias */
.row {
  margin-bottom: 15px;
}

/* Botón principal */
.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border-radius: 6px;
  margin-top: 10px;
  text-transform: uppercase;
}

/* Centrar switches */
.switch-container-gestion {
  margin-left: 0;
  justify-content: center;
}

/* Título más aireado */
.title-container {
  padding-bottom: 10px;
}
</style>
