<template>
  <div class="page-wrapper">
    <!-- Crear Notificación -->
    <div class="card">
      <h2 align="center">¡Crear una noticia!</h2>

      <div align="center" class="form-group">
        <label>Escribe aquí el texto</label>
        <input type="text" v-model="texto" placeholder="Escribe el texto..." />
      </div>

      <div class="form-row">
        <div align="center" class="form-group">
          <label>¿Desde cuándo?</label>
          <Datepicker
            v-model="fechaInicio"
            :auto-apply="true"
            :enable-time-picker="true"
            :clearable="false"
            :format="'dd/MM/yyyy HH:mm'"
            locale="es"
          />
        </div>

        <div align="center" class="form-group">
          <label>¿Hasta cuándo?</label>
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
        <div align="center" class="form-group">
          <label>¿Qué quieres mostrar?</label>
          <select v-model="tipo">
            <option align="center" v-for="tipo in tiposDisponibles" :key="tipo" :value="tipo">{{ tipo }}</option>
          </select>
        </div>

        <div align="center" class="form-group">
          <label>¿Quién la leerá?</label>
          <select v-model="receptor">
            <option align="center" v-for="receptor in receptoresDisponibles" :key="receptor" :value="receptor">{{ receptor }}</option>
          </select>
        </div>
      </div>

      <div v-if="tipo === 'Texto e imagen'" class="form-group">
        <label>Imagen</label>
        <input type="file" @change="onFileChange" />
      </div>

      <button class="btn-primary" @click="crearNotificacion">
        Crear Notificación
      </button>
    </div>

    <!-- Lista de Notificaciones -->
    <div class="card">
      <h2 align="center">Noticias creadas por ti ...</h2>
      <table v-if="notificaciones.length > 0">
        <thead>
          <tr>
            <th>Creador</th>
            <th>Texto</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Receptor</th>
            <th>Tipo</th>
            <th>Acciones</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in notificaciones" :key="n.id || n.texto">
            <td>{{ n.creador }}</td>
            <td>{{ n.texto }}</td>
            <td>{{ n.fechaHoraInicio }}</td>
            <td>{{ n.fechaHoraFin }}</td>
            <td>{{ n.receptor }}</td>
            <td>{{ n.tipo }}</td>
            <td>
              <button class="btn-danger" @click="borrarNotificacion(n)">X</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else align="center" class="no-data">No has creado aún noticias</p>
    </div>

    <!-- Toast -->
    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2500"
          @did-dismiss="() => isToastOpen = false" position="top">
    </ion-toast>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { IonToast } from "@ionic/vue";
import { format } from "date-fns";
import { crearToast } from '@/utils/toast.js';
import {
  crearNotificacionWeb,
  obtenerNotificacionesVigentesPorUsuario,
  borrarNotificacionWeb,
  obtenerReceptores,
  obtenerTiposNotificaciones,
} from "@/services/notifications";

// Variables en la creación de la notificación
const texto = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");
const receptor = ref("");
const tipo = ref("");
const imagen = ref(null);

// Receptores y niveles disponibles
const receptoresDisponibles = ref([]);
const tiposDisponibles = ref([]);

const notificaciones = ref([]);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const onFileChange = (e) => {
  imagen.value = e.target.files[0];
};

// Función para crear una notificación
const crearNotificacion = async () =>
{
  try
  {
    // Realizamos las validaciones previas
    await crearNotificacionValidacionesPrevias();

    const fechaHoraInicio = { fecha: format(fechaInicio.value, "dd/MM/yyyy"), hora: format(fechaInicio.value, "HH:mm") } ;
    const fechaHoraFin    = { fecha: format(fechaFin.value, "dd/MM/yyyy"),    hora: format(fechaFin.value, "HH:mm") } ;

    // Creamos la notificacion en el servidor
    await crearNotificacionWebInternal(texto.value, fechaHoraInicio, fechaHoraFin, tipo.value, receptor.value, imagen.value);
  }
  catch (err)
  {
    // Mostramos mensaje de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", err.message);
  }
};

const crearNotificacionValidacionesPrevias = async () =>
{
  // Validamos si se ha escrito texto
  if (!texto.value || String(texto.value).trim() === "")
  {
    throw new Error("El texto no puede estar vacío");
  }

  // Validamos si se ha seleccionado la fecha de inicio
  if (!fechaInicio.value || String(fechaInicio.value).trim() === "")
  {
    throw new Error("La fecha de inicio no puede estar vacía");
  }

  // Validamos si se ha seleccionado la fecha de fin
  if (!fechaFin.value || String(fechaFin.value).trim() === "")
  {
    throw new Error("La fecha de fin no puede estar vacía");
  }

  // Validamos si la fecha de fin es anterior a la fecha de inicio
  if (fechaFin.value < fechaInicio.value)
  {
    throw new Error("La fecha de fin no puede ser anterior a la fecha de inicio");
  }
}

// Función interna para crear una notificación
 const crearNotificacionWebInternal = async (texto, fechaHoraInicio, fechaHoraFin, tipo, receptor, imagen) =>
{
  try
  {
    // Creamos la notificacion en el servidor
    await crearNotificacionWeb(
      toastMessage,
      toastColor,  
      isToastOpen, 
      texto,
      fechaHoraInicio.fecha,
      fechaHoraInicio.hora,
      fechaHoraFin.fecha,
      fechaHoraFin.hora,
      receptor,
      tipo,
      imagen ? imagen.value.name : ""
    );

    // Mostramos mensaje de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Notificación creada correctamente");

    // Recargamos la lista de notificaciones
    await cargarNotificaciones();

    // Limpiamos los campos de la notificación
    limpiarCamposNotificacion();
  }
  catch (err)
  {
    // Tratamos de obtener el mensaje de error
    try
    {
      // Si el error es un objeto, lo parseamos
      let errorMessage = JSON.parse(err.message);

      // Mostramos el mensaje de error
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage["message"]);
    }
    catch (err)
    {
      // Si el error no es un objeto, mostramos el mensaje de error genérico
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al crear la notificación");
    }
  }
}

// Función para limpiar los campos de la notificación
const limpiarCamposNotificacion = () =>
{
  texto.value       = "";
  fechaInicio.value = null;
  fechaFin.value    = null;
  tipo.value        = tiposDisponibles.value[0];
  receptor.value    = receptoresDisponibles.value[0];
}

// Función para cargar las notificaciones
const cargarNotificaciones = async () => {
  try {
    const data = await obtenerNotificacionesVigentesPorUsuario(toastMessage, toastColor, isToastOpen);
    
    if (!data || data.length === 0) {
      notificaciones.value = [];
      return;
    }

    notificaciones.value = data.map((n) => ({
      id: n.id,
      creador: n.creador,
      texto: n.texto,
      fechaHoraInicio: n.fechaHoraInicio,
      fechaHoraFin: n.fechaHoraFin,
      receptor: n.receptor,
      tipo: n.tipo,
    }));
  } 
  catch (err)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al obtener notificaciones");
  }
};

const borrarNotificacion = async (n) => {
  if (!n || !n.id) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Identificador de la notificación inválido");
    return;
  }
  try {
    await borrarNotificacionWeb(toastMessage, toastColor, isToastOpen, n.id);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Notificación borrada correctamente");
    await cargarNotificaciones();
  } catch (err) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al borrar la notificación");
  }
};

onMounted(() => {
  cargarNotificaciones();
  obtenerReceptores(toastMessage, toastColor, isToastOpen).then((receptores) => {
    receptoresDisponibles.value = receptores;
    receptor.value = receptores[0];
  });
  obtenerTiposNotificaciones(toastMessage, toastColor, isToastOpen).then((tipos) => {
    tiposDisponibles.value = tipos;
    tipo.value = tipos[0];
  });
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

