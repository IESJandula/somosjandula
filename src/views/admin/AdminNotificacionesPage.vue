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
            :format="'dd-MM-yyyy HH:mm'"
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
            :format="'dd-MM-yyyy HH:mm'"
            locale="es"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Nivel</label>
          <select v-model="nivel">
            <option value="GLOBAL">Global</option>
            <option value="SECUNDARIO">Secundario</option>
          </select>
        </div>

        <div class="form-group">
          <label>Roles</label>
          <button class="btn-primary" @click="showRolesModal = true">
            {{ roles.length ? roles.join(", ") : "Seleccionar roles" }}
          </button>
        </div>
      </div>

      <div v-if="nivel === 'GLOBAL'" class="form-group">
        <label>Imagen</label>
        <input type="file" @change="onFileChange" />
      </div>

      <button class="btn-primary" @click="crearNotificacion">
        Crear Notificación
      </button>
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
              <button class="btn-danger" @click="eliminarNotificacion(n)">X</button>
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
          <label v-for="rol in rolesDisponibles" :key="rol">
            <input type="checkbox" :value="rol" v-model="roles" /> {{ rol }}
          </label>
        </div>
        <button class="btn-primary" @click="showRolesModal = false">Aceptar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { format, parseISO, isValid, parse } from "date-fns";
import {
  crearNotificacionWeb,
  obtenerNotificacionesHoy,
  eliminarNotificacionWeb,
} from "@/services/firebaseService";

const texto = ref("");
const fechaInicio = ref(null);
const fechaFin = ref(null);
const nivel = ref("GLOBAL");
const roles = ref([]);
const imagen = ref(null);
const showRolesModal = ref(false);

const notificaciones = ref([]);
const rolesDisponibles = ["ADMINISTRADOR", "PROFESOR", "DIRECCIÓN"];

const toastMessage = ref("");
const toastColor = ref("success");
const isToastOpen = ref(false);

const showToastLocal = (msg, color = "success") => {
  isToastOpen.value = false;
  toastMessage.value = msg;
  toastColor.value = color;
  isToastOpen.value = true;
  setTimeout(() => (isToastOpen.value = false), 2500);
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
    showToastLocal("Falta el texto de la notificación", "warning");
    return;
  }
  const inicio = formatDateAndTime(fechaInicio.value);
  const fin = formatDateAndTime(fechaFin.value);
  if (!inicio.date || !inicio.time || !fin.date || !fin.time) {
    showToastLocal("Falta seleccionar fecha/hora inicio o fin", "warning");
    return;
  }
  if (roles.value.length === 0) {
    showToastLocal("Debes seleccionar al menos un rol", "warning");
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
    showToastLocal("Notificación creada correctamente", "success");
    await cargarNotificaciones();

    texto.value = "";
    fechaInicio.value = null;
    fechaFin.value = null;
    nivel.value = "GLOBAL";
    roles.value = [];
  } catch (err) {
    console.error(err);
    showToastLocal("Error creando la notificación", "error");
  }
};

const cargarNotificaciones = async () => {
  try {
    const data = await obtenerNotificacionesHoy(toastMessage, toastColor, isToastOpen, nivel.value);
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
    showToastLocal("Error al obtener notificaciones", "error");
  }
};

const eliminarNotificacion = async (n) => {
  if (!n || !n.id) {
    showToastLocal("Notificación inválida", "warning");
    return;
  }
  try {
    await eliminarNotificacionWeb(toastMessage, toastColor, isToastOpen, n.id);
    showToastLocal("Notificación eliminada", "success");
    await cargarNotificaciones();
  } catch (err) {
    console.error(err);
    showToastLocal("Error al eliminar notificación", "error");
  }
};

onMounted(() => cargarNotificaciones());
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 🔹 Centra las tarjetas */
  gap: 24px;
}

/* 🔹 Tarjetas más estrechas y centradas */
.card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px; /* ancho máximo */
  min-width: 600px; /* ancho mínimo igual al de la tabla */
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

/* 🔹 Inputs y selects adaptados al ancho de la tarjeta */
input,
select {
  padding: 6px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
}

button {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
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
  color: white;
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
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 🔹 Tabla con scroll horizontal y vertical */
table {
  width: 100%;
  border-collapse: collapse;
  display: block;
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
  white-space: nowrap;
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

