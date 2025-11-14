<template>
  <div class="page-wrapper">
    <!-- Crear Notificación -->
    <div class="card">
      <h2>Crear Notificación</h2>

      <div class="form-group">
        <label>Texto</label>
        <input type="text" v-model="texto" placeholder="Escribe el texto..." />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Fecha inicio</label>
          <Datepicker
            v-model="fechaInicio"
            :auto-apply="true"
            :enable-time-picker="true"
            :clearable="false"
            :format="'dd/MM/yyyy HH:mm'"
            locale="es"
          />
        </div>

        <div class="form-group">
          <label>Fecha fin</label>
          <Datepicker
            v-model="fechaFin"
            :auto-apply="true"
            :enable-time-picker="true"
            :clearable="false"
            :format="'dd/MM/yyyy HH:mm'"
            locale="es"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Nivel</label>
          <select v-model="nivel">
            <option v-for="nivel in nivelesDisponibles" :key="nivel" :value="nivel">{{ nivel }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Roles</label>
          <button class="btn-primary" @click="showRolesModal = true">
            {{ roles.length ? roles.join(", ") : "Seleccionar roles" }}
          </button>
        </div>
      </div>

      <div v-if="nivel === 'Global'" class="form-group">
        <label>Imagen</label>
        <input type="file" @change="onFileChange" />
      </div>

      <button class="btn-primary" @click="crearNotificacion">
        Crear Notificación
      </button>
    </div>

    <!-- Actualizar Constantes -->
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

    <!-- Lista de Notificaciones -->
    <div class="card">
      <h2>Lista de Notificaciones</h2>
      <table v-if="notificaciones.length > 0">
        <thead>
          <tr>
            <th>Texto</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Nivel</th>
            <th>Roles</th>
            <th>Acciones</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in notificaciones" :key="n.id || n.texto">
            <td>{{ n.texto }}</td>
            <td>{{ n.fechaInicio }}</td>
            <td>{{ n.fechaFin }}</td>
            <td>{{ n.nivel }}</td>
            <td>{{ n.roles }}</td>
            <td>
              <button class="btn-danger" @click="cambiarEstadoNotificacion(n)">X</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="no-data">No hay notificaciones disponibles.</p>
    </div>

    <!-- Toast -->
    <div v-if="isToastOpen" :class="['toast', toastColor]">
      {{ toastMessage }}
    </div>

    <!-- Modal de Roles -->
    <div v-if="showRolesModal" class="modal-backdrop" @click.self="showRolesModal = false">
      <div class="modal">
        <h3>Selecciona Roles</h3>
        <div class="roles-list">
          <label v-for="rol in rolesDisponibles" :key="rol" @click="addRole(rol)">
            <input type="checkbox" :value="rol" v-model="roles" /> {{ rol }}
          </label>
        </div>
        <button class="btn-primary" @click="showRolesModal = false">Aceptar</button>
      </div>
    </div>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2000"
      position="top"
      @did-dismiss="() => (isToastOpen = false)">
    </ion-toast>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { format, parseISO, isValid, parse } from "date-fns";
import {
  crearNotificacionWeb,
  obtenerNotificacionesVigentesPorUsuario,
  cambiarEstadoNotificacionWeb,
  obtenerRolesUsuario,
  obtenerNivelesNotificaciones,
  obtenerConstantes, 
  actualizarConstantes
} from "@/services/notifications";

const texto = ref("");
const fechaInicio = ref(null);
const fechaFin = ref(null);
const nivel = ref("");
const roles = ref([]);
const imagen = ref(null);
const showRolesModal = ref(false);

const selectedConstante = ref(null);
const constantes = ref([]);
const notificaciones = ref([]);
const rolesDisponibles = ref([]);
const nivelesDisponibles = ref([]);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Función que se llama cuando el usuario selecciona una constante
const onConstanteChange = () => {
  if (!selectedConstante.value) {
    selectedConstante.value = { valor: "" };
  } else if (selectedConstante.value.valor === undefined) {
    selectedConstante.value.valor = "";
  }
};

const onFileChange = (e) => {
  imagen.value = e.target.files[0];
};

// 🔹 Función para convertir fecha + hora a Date y formatear en DD/MM/YYYY HH:mm
function formatDateTime(fecha, hora) {
  try {
    if (!fecha || !hora) return "";
    const dateTime = parseISO(`${fecha}T${hora}`);
    return isValid(dateTime) ? format(dateTime, "dd/MM/yyyy HH:mm") : "";
  } catch {
    return "";
  }
}

function toDateObject(val) {
  if (!val) return null;
  if (val instanceof Date && isValid(val)) return val;
  try {
    const parsed = parse(val, "dd-MM-yyyy HH:mm", new Date());
    if (isValid(parsed)) return parsed;
  } catch {
    const iso = new Date(val);
    return isValid(iso) ? iso : null;
  }
}

function formatDateAndTime(val) {
  const d = toDateObject(val);
  return d ? { date: format(d, "yyyy-MM-dd"), time: format(d, "HH:mm") } : { date: "", time: "" };
}

const crearNotificacion = async () => {
  if (!texto.value) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "El texto no puede estar vacío");
    return;
  }
  const inicio = formatDateAndTime(fechaInicio.value);
  const fin = formatDateAndTime(fechaFin.value);
  if (!inicio.date || !inicio.time || !fin.date || !fin.time) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Fechas de inicio y fin inválidas");
    return;
  }
  if (roles.value.length === 0) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Selecciona al menos un rol");
    return;
  }

  try {
    await crearNotificacionWeb(
      toastMessage,
      toastColor,  
      isToastOpen, 
      texto.value,
      inicio.date,
      inicio.time,
      fin.date,
      fin.time,
      nivel.value,
      roles.value.join(","),
      imagen.value ? imagen.value.name : ""
    );
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Notificación creada correctamente");
    await cargarNotificaciones();

    texto.value = "";
    fechaInicio.value = null;
    fechaFin.value = null;
    nivel.value = nivelesDisponibles.value[0];
    roles.value = [];
  } catch (err) {
    console.error(err);
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al obtener notificaciones");
  }
};

const cargarNotificaciones = async () => {
  try {
    const data = await obtenerNotificacionesVigentesPorUsuario(toastMessage, toastColor, isToastOpen);
    
    if (!data || data.length === 0) {
      notificaciones.value = [];
      return;
    }

    notificaciones.value = data.map((n) => ({
      id: n.id,
      texto: n.texto ? n.texto.replace(/\n?\[Imagen:.*?\]/, "").trim() : "",
      fechaInicio: formatDateTime(n.fechaInicio || n.fecha_inicio, n.horaInicio || n.hora_inicio),
      fechaFin: formatDateTime(n.fechaFin || n.fecha_fin, n.horaFin || n.hora_fin),
      nivel: n.nivel || "",
      roles: Array.isArray(n.roles) ? n.roles.join(", ") : n.roles || "",
    }));
  } catch (err) {
    console.error(err);
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al obtener notificaciones");
  }
};


const cambiarEstadoNotificacion = async (n) => {
  if (!n || !n.id) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Notificación inválida");
    return;
  }
  try {
    await cambiarEstadoNotificacionWeb(toastMessage, toastColor, isToastOpen, n.id);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Estado cambiado correctamente");
    await cargarNotificaciones();
  } catch (err) {
    console.error(err);
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cambiar el estado de la notificación");
  }
};

// Función para actualizar la constante seleccionada
const actualizarConstanteSeleccionada = async () => {
  try {
    const constantesActualizadas = constantes.value.map((c) =>
      c.clave === selectedConstante.value.clave ? selectedConstante.value : c
    );

    await actualizarConstantes(
      firebaseApiUrl + "/notifications/constants",
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
      firebaseApiUrl + "/notifications/constants",
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

onMounted(() => {
  cargarNotificaciones();
  obtenerRolesUsuario(toastMessage, toastColor, isToastOpen).then((roles) => {
    rolesDisponibles.value = roles;
  });
  obtenerNivelesNotificaciones(toastMessage, toastColor, isToastOpen).then((niveles) => {
    nivelesDisponibles.value = niveles;
    nivel.value = niveles[0];
  });
  cargarConstantes();
});
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  background: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 🔹 Tarjetas */
.card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  min-width: 600px;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 16px;
  color: #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

.form-row {
  display: flex;
  gap: 16px;
}

/* 🔹 Inputs y selects */
input,
select,
button {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #bbb;
  font-size: 14px;
  box-sizing: border-box;
}

button {
  font-weight: bold;
  cursor: pointer;
}

.btn-primary {
  background: #007bff;
  color: #fff;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #a71d2a;
}

.no-data {
  margin-top: 12px;
  color: #666;
  font-style: italic;
}

/* 🔹 Toast */
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: bold;
  color: #fff;
  z-index: 2000;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
}

.toast.warning {
  background: #ffc107;
  color: #000;
}

/* 🔹 Modal roles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1500;
  padding: 10px; 
}

.modal {
  background: #fff;
  padding: 20px 25px;
  border-radius: 12px;
  width: 320px;
  max-width: 95%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.2s ease-in-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 5px; 
}

.roles-list label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

/* 🔹 Tabla con scroll */
table {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
  white-space: nowrap;
  background: #fff;
}

th,
td {
  padding: 8px 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
  vertical-align: middle;
}

td img {
  display: block;
  margin: 0 auto;
}

td .btn-danger {
  display: block;
  margin: 6px auto;
  padding: 4px 10px;
}

/* 🔹 Mejor comportamiento responsive */
@media (max-width: 768px) {
  .card {
    max-width: 95%;
    min-width: auto;
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
  }

  table {
    font-size: 14px;
  }
}
</style>

