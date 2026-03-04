<template>
  <div class="main-container">
    <div class="top-row">
      <div class="left-top-container">
        <div class="form-container">
          <h2 class="window-title">CREAR CATEGORÍA</h2>
          <div class="form-content">
            <div class="form-grid">
              <div class="form-row">
                <label class="form-label">NOMBRE:</label>
                <input type="text" v-model="nuevaCategoria.nombre" class="form-input" placeholder="" />
              </div>

              <div class="form-row">
                <label class="form-label">COLOR:</label>
                <div class="color-selection">
                  <select v-model="nuevaCategoria.color" class="form-select">
                    <option value="">Seleccione color</option>
                    <option v-for="color in coloresDisponibles" :key="color.value" :value="color.value">
                      {{ color.nombre }}
                    </option>
                  </select>
                  <div v-if="nuevaCategoria.color" class="color-preview"
                    :style="{ backgroundColor: nuevaCategoria.color }"></div>
                </div>
              </div>
              <div class="button">
                <button type="button" @click="agregarCategoriaFn" class="btn-enviar">
                  ENVIAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-top-container">
        <div class="form-container">
          <h2 class="window-title">LISTA DE CATEGORÍAS</h2>

          <div class="categorias-table-container">
            <div class="table-wrapper">
              <table class="categorias-table">
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>COLOR</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="categoria in categorias" :key="categoria.nombre">
                    <td>{{ categoria.nombre }}</td>
                    <td>
                      <div class="color-cell">
                        <span class="color-display" :style="{ backgroundColor: categoria.color }"></span>
                        <span class="color-name">{{ getColorName(categoria.color) }}</span>
                      </div>
                    </td>
                    <td>
                      <button @click="eliminarCategoriaFn(categoria)" class="btn-eliminar-cat">
                        X
                      </button>

                    </td>
                  </tr>
                  <tr v-if="categorias.length === 0">
                    <td colspan="3" class="no-data">No hay categorías creadas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-row">
      <div class="left-bottom-container">
        <div class="form-container usuario-container">
          <h2 class="window-title">CREAR EVENTO</h2>
          <div class="form-content">
            <div class="form-grid">
              <div class="form-row">
                <label class="form-label">TÍTULO:</label>
                <input type="text" v-model="evento.titulo" class="form-input" required />
              </div>

              <div class="form-row">
                <label class="form-label">CATEGORIA:</label>
                <select v-model="evento.nombre" class="form-select" required>
                  <option value="">Seleccione</option>
                  <option v-for="categoria in categorias" :key="categoria.nombre" :value="categoria.nombre">
                    {{ categoria.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-row">
                <label class="form-label">FECHA INICIO:</label>
                <input type="date" v-model="evento.fechaInicio" class="form-input" required />
              </div>

              <div class="form-row combined-row">
                <div class="checkbox-wrapper">
                  <input type="checkbox" id="eventoMismoDia" v-model="eventoMismoDia" @change="toggleMismoDia"
                    class="form-checkbox" />
                  <label for="eventoMismoDia" class="checkbox-label">
                    EVENTO FINALIZA ESE DIA
                  </label>
                </div>

                <div v-if="!eventoMismoDia" class="fecha-fin-wrapper">
                  <label class="form-label">FECHA FIN:</label>
                  <input type="date" v-model="evento.fechaFin" class="form-input" :required="!eventoMismoDia" />
                </div>
              </div>

              <div class="button">
                <button type="button" @click="crearEventoFn" class="btn-enviar">
                  ENVIAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="right-bottom-container">
        <div class="form-container-table table-container">
          <h2 class="window-title">CALENDARIO DE EVENTOS</h2>

          <div class="table-wrapper">
            <table class="events-table">
              <thead>
                <tr>
                  <th>TÍTULO</th>
                  <th>CATEGORIA</th>
                  <th>FECHA INICIO</th>
                  <th>FECHA FIN</th>
                  <th>NOMBRE</th>
                  <th>APELLIDOS</th>
                  <th>EMAIL</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eventoItem in eventos" :key="`${eventoItem.titulo}-${eventoItem.fechaInicio}`">
                  <td>{{ eventoItem.titulo }}</td>
                  <td>{{ eventoItem.nombre }}</td>
                  <td>{{ formatFecha(eventoItem.fechaInicio) }}</td>
                  <td>{{ formatFecha(eventoItem.fechaFin) }}</td>
                  <td>{{ eventoItem.usuarioNombre }}</td>
                  <td>{{ eventoItem.usuarioApellidos }}</td>
                  <td>{{ eventoItem.usuarioEmail }}</td>
                  <td>
                    <button @click="borrarEventoFn(eventoItem)" class="btn-eliminar">
                      X
                    </button>
                  </td>
                </tr>
                <tr v-if="eventos.length === 0">
                  <td colspan="8" class="no-data">No hay eventos registrados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { crearToast } from "@/utils/toast.js";
import { IonToast } from "@ionic/vue";

import {
  obtenerEventos,
  crearEvento,
  borrarEvento,
  crearCategoria,
  borrarCategoria,
  obtenerCategorias,
} from "@/services/events.js";

// Interfaces
interface Evento {
  titulo: string;
  fechaInicio: number;
  fechaFin: number;
  nombre: string;
  usuarioNombre: string;
  usuarioApellidos: string;
  usuarioEmail: string;
}

interface EventoForm {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  nombre: string;
  usuarioNombre: string;
  usuarioApellidos: string;
  usuarioEmail: string;
}

interface Categoria {
  nombre: string;
  color: string;
}

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const eventos = ref<Evento[]>([]);
const categorias = ref<Categoria[]>([]);
const eventoMismoDia = ref(true);
const fechaEspecial = ref<string>('');

// Formulario evento
const evento = ref<EventoForm>({
  titulo: "",
  nombre: "",
  fechaInicio: "",
  fechaFin: "",
  usuarioNombre: "",
  usuarioApellidos: "",
  usuarioEmail: ""
});

// Nueva categoría
const nuevaCategoria = ref({
  nombre: "",
  color: ""
});
// Colores disponibles para seleccionar
const coloresDisponibles = ref([
  { value: '#008000', nombre: 'VERDE' },
  { value: '#4682B4', nombre: 'AZUL' },
  { value: '#F4D03F', nombre: 'AMARILLO' },
  { value: '#B9484E', nombre: 'ROJO' }
]);


function dateToTimestamp(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
}
// Cargar todos los eventos
async function cargarEventos() {
  eventos.value = await obtenerEventos(toastMessage, toastColor, isToastOpen);
}

// Cargar todas las categorías
async function cargarCategorias() {
  categorias.value = await obtenerCategorias(toastMessage, toastColor, isToastOpen);
}

// Crear evento
async function crearEventoFn() {

  try {

    if (!evento.value.titulo || !evento.value.nombre || !evento.value.fechaInicio) {
      console.error("Faltan campos obligatorios", evento.value);
      return;
    }

    if (!eventoMismoDia.value && !evento.value.fechaFin) {
      console.error("Falta fecha fin");
      return;
    }

    // Conversión segura de fechas
    const fechaInicioLong = dateToTimestamp(evento.value.fechaInicio);
    const fechaFinLong = eventoMismoDia.value
      ? fechaInicioLong
      : dateToTimestamp(evento.value.fechaFin);

    if (fechaFinLong < fechaInicioLong) {
      console.error("Fecha fin menor que fecha inicio");
      return;
    }

    // Log de datos que van al backend
    console.log("DATOS A ENVIAR:", {
      titulo: evento.value.titulo,
      fechaInicio: fechaInicioLong,
      fechaFin: fechaFinLong,
      nombre: evento.value.nombre,
      usuarioNombre: evento.value.usuarioNombre,
      usuarioEmail: evento.value.usuarioEmail
    });

    await crearEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      evento.value.titulo,
      evento.value.nombre,
      fechaInicioLong,
      fechaFinLong,
      evento.value.usuarioNombre,
      evento.value.usuarioApellidos,
      evento.value.usuarioEmail,
    );

    console.log("Evento creado, recargando lista");

    // Reset formulario
    evento.value = {
      titulo: "",
      nombre: "",
      fechaInicio: "",
      fechaFin: "",
      usuarioNombre: "",
      usuarioApellidos: "",
      usuarioEmail: ""
    };


    // Limpiar formulario
    evento.value = { titulo: "", fechaInicio: "", fechaFin: "", nombre: "", usuarioNombre: "", usuarioApellidos: "", usuarioEmail: "" };
    eventoMismoDia.value = true;

    // Recargar lista de eventos
    await cargarEventos();

  } catch (error) {
    console.error("🔥ERROR EN CREAR EVENTO:", error);

  }
}

// Borrar evento
async function borrarEventoFn(e: Evento) {
  try {
    await borrarEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      e.titulo,
      e.fechaInicio
    );
    await cargarEventos();
  } catch (error) {
    console.error("🔥 ERROR AL BORRAR EVENTO:", error);
  }
}

// Check evento mismo día
function toggleMismoDia() {
  if (eventoMismoDia.value) evento.value.fechaFin = "";
}

// Crear categoría

async function agregarCategoriaFn() {
  if (!nuevaCategoria.value.nombre || !nuevaCategoria.value.color) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", "Debes indicar un nombre y un color para la categoría");
    return;
  }
  try {
    await crearCategoria(
      toastMessage,
      toastColor,
      isToastOpen,
      nuevaCategoria.value.nombre,
      nuevaCategoria.value.color
    );

    nuevaCategoria.value = { nombre: "", color: "" };
    await cargarCategorias();
  } catch (error) {
    console.error("🔥 ERROR AL CREAR CATEGORÍA:", error);
  }

}

// Eliminar categoría
async function eliminarCategoriaFn(categoria: Categoria) {
  try {
    await borrarCategoria(
      toastMessage,
      toastColor,
      isToastOpen,
      categoria.nombre
    );
    await cargarCategorias();
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
  }

}

function formatFecha(timestamp: number): string {
  const fecha = new Date(timestamp);
  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getColorName(colorValue: string): string {
  const colorObj = coloresDisponibles.value.find(c => c.value === colorValue);
  return colorObj ? colorObj.nombre : colorValue;
}
// Montaje inicial
onMounted(async () => {
  await cargarCategorias();
  await cargarEventos();
});
</script>

<style scoped>
/* CONTENEDOR PRINCIPAL */
.main-container {
  height: 100%;
  padding: 20px;
  background-color: var(--background-color, #f0f2f5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  align-content: center;
  gap: 20px;
  overflow: hidden;
}

/* FILAS */
.top-row,
.bottom-row {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

/* CONTENEDORES */
.left-top-container,
.left-bottom-container {
  flex: 1;
  min-height: 0;
  align-content: center;
}

.right-top-container {
  flex: 1;
  min-height: 0;
  align-content: center;
}
.right-bottom-container {
  flex: 1;
  min-height: 0;
  align-content: center;
  overflow-y: auto;
  overflow-x: auto;
}


/* ESTILOS COMUNES DE FORMULARIO */
.form-container {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-content: center;
  min-height: 0;
}

.form-container-table {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 25px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  align-content: center;
}

.window-title {
  color: var(--text-color);
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #007bff;
  text-transform: uppercase;
  font-size: 16px;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 6px;
}

/* FORMULARIO EN GRID */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 0;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.combined-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.form-label {
  min-width: 100px;
  font-weight: 600;
  color: var(--text-color);
  font-size: 16px;
  text-align: right;
}

.form-input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
}

.form-select {
  flex: 1;
  padding: 8px 10px;
  border: 2px solid #007bff;
  border-radius: 4px;
  background-color: white;
  color: #007bff;
  font-size: 16px;
  cursor: pointer;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 12px;
  white-space: nowrap;
}

.fecha-fin-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.button {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;

}

.btn-enviar {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 11px 28px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-enviar:hover {
  background-color: #0056b3;
}

/* SECCIÓN EXTRAORDINARIA */
.extraordinary-section {
  margin-top: auto;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.section-title {
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.date-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-label {
  min-width: 100px;
  font-weight: 600;
  color: var(--text-color);
  font-size: 23px;
  text-align: right;
}

.date-input {
  flex: 1;
}

/* TABLAS */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  min-height: 0;
}

.events-table,
.categorias-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #007bff;
  font-size: 16px;
}

.events-table th,
.categorias-table th {
  background-color: #007bff;
  color: white;
  padding: 6px 8px;
  text-align: center;
  font-weight: bold;
  border: 2px solid #007bff;
  font-size: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.events-table td,
.categorias-table td {
  padding: 6px 8px;
  border: 2px solid #007bff;
  background-color: #e9f5ff;
  height: 40px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
}

.events-table tr:hover td,
.categorias-table tr:hover td {
  background-color: #d0eaff;
}

.categorias-table-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 25px;
}

.btn-eliminar,
.btn-eliminar-cat {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-eliminar:hover,
.btn-eliminar-cat:hover {
  background-color: #c82333;
}

/* COLORES */
.color-selection {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.color-preview {
  width: 25px;
  height: 25px;
  border-radius: 4px;
  border: 1px solid #ddd;

}

.color-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;

}

.color-display {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;

}

.color-name {
  font-size: 12px;
  font-weight: 600;

}
/* RESPONSIVE */
@media (max-width: 1024px) {

  .top-row,
  .bottom-row {
    flex-direction: column;
  }


  .right-bottom-container,
  .right-top-container {
    flex: 1;
  }

  .window-title {
    font-size: 14px;
    margin-bottom: 6px;
    padding-bottom: 4px;
  }

  .form-label {
    font-size: 14px;
  }

  .form-input,
  .form-select {
    font-size: 14px;
    padding: 5px 7px;
  }


  .btn-enviar {
    font-size: 14px;
    padding: 8px 20px;
  }


  .events-table,
  .categorias-table {
    font-size: 14px;
  }

  .events-table th,
  .categorias-table th,
  .events-table td,
  .categorias-table td {
    padding: 5px 6px;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .form-label {
    text-align: left;
    min-width: auto;
  }

  .combined-row {
    flex-direction: column;
    align-items: flex-start;
  }

  

  .form-input,
  .form-select {
    width: 100%;
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: auto;
  }

  .events-table,
  .categorias-table {
    font-size: 14px;
  }

  .toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    padding: 12px 18px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .2);
    opacity: 1;
    transition: opacity .3s ease;
  }

  .success {
    background: #28a745;
  }

  .error {
    background: #dc3545;
  }

  .warning {
    background: #ffc107;
    color: black;
  }

  .info {
    background: #17a2b8;
  }

  @media (max-width: 480px) {
    .window-title {
      font-size: 13px;
    }

    .form-label {
      font-size: 13px;
    }

    .btn-enviar {
      padding: 7px 16px;
    }
  }

  @media (max-width: 360px) {

    .form-container,
    .form-container-table {
      padding: 10px;
      border-radius: 8px;
    }

    .window-title {
      font-size: 12px;
      margin-bottom: 4px;
      padding-bottom: 3px;
    }

    .form-label {
      font-size: 12px;
    }

    .form-input,
    .form-select {
      font-size: 12px;
      padding: 4px 6px;
    }

    .checkbox-label {
      font-size: 11px;
    }

    .btn-enviar {
      font-size: 12px;
      padding: 6px 14px;
    }

    .events-table,
    .categorias-table {
      font-size: 12px;
    }

    .events-table th,
    .categorias-table th {
      padding: 4px 5px;
    }

    .events-table td,
    .categorias-table td {
      padding: 4px 5px;
      height: 28px;
    }

    .btn-eliminar,
    .btn-eliminar-cat {
      padding: 6px 10px;
      font-size: 10px;
    }

    .color-display {
      width: 14px;
      height: 14px;
    }

    .color-name {
      font-size: 11px;
    }

    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, .3);
      border-radius: 3px;
    }
  }

  .events-table th,
  .categorias-table th {
    font-size: 11px;
    padding: 4px 5px;
    line-height: 1.1;
    white-space: nowrap;
  }

  .events-table th {
    height: 30px;
  }
/* CONTENEDORES */
  .form-container,
  .form-container-table {
    padding: 6px;
    border-radius: 5px;
  }

  /* SEPARACIÓN GENERAL */
  .top-row,
  .bottom-row,
  .right-top-container,
  .right-bottom-container {
    gap: 6px;
  }

  /* TÍTULOS */
  .window-title {
    font-size: 10.5px;
    margin-bottom: 2px;
    padding-bottom: 1px;
    line-height: 1;
    letter-spacing: .2px;
  }

  /* LABELS */
  .form-label {
    font-size: 10.5px;
    margin-bottom: 1px;
    line-height: 1;
  }

  /* FORM ROWS */
  .form-row {
    gap: 3px;
  }

  /* INPUTS / SELECT */
  .form-input,
  .form-select {
    font-size: 11px;
    padding: 3px 5px;
    height: 26px;
  }

  /* BOTONES */
  .btn-enviar {
    font-size: 11px;
    padding: 5px 10px;
    height: 28px;
  }

  .btn-eliminar,
  .btn-eliminar-cat {
    font-size: 9px;
    padding: 4px 6px;
    height: 24px;
  }

  /* TABLAS */
  .events-table,
  .categorias-table {
    font-size: 10px;
  }

  /* HEADERS */
  .events-table th,
  .categorias-table th {
    font-size: 9.5px;
    padding: 2px 3px;
    height: 22px;
    line-height: 1;
    white-space: nowrap;
  }

  /* CELDAS */
  .events-table td,
  .categorias-table td {
    font-size: 10px;
    padding: 2px 3px;
    height: 22px;
    line-height: 1;
    white-space: nowrap;
  }

  /* COLUMNA ACCIONES MÁS ESTRECHA */
  .categorias-table th:last-child,
  .categorias-table td:last-child,
  .events-table th:last-child,
  .events-table td:last-child {
    width: 1%;
    padding-left: 2px;
    padding-right: 2px;
  }

  /* COLOR */
  .color-display {
    width: 10px;
    height: 10px;
  }

  .color-name {
    font-size: 9.5px;
  }

  /* TABLAS SCROLL */
  .table-wrapper {
    overflow-x: auto;
    overflow-y: auto;
  }

  /* SCROLLBAR ULTRA FINO */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,.35);
    border-radius: 2px;
  }

  /* TOAST */
  .toast {
    font-size: 10.5px;
    padding: 8px 10px;
    right: 8px;
    bottom: 8px;
  }
}


/* MODO OSCURO */
@media (prefers-color-scheme: dark) {

  .form-container,
  .form-container-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  }

  .window-title,
  .form-label,
  .checkbox-label,
  .section-title,
  .date-label {
    color: var(--text-color-dark);
  }

  .events-table td,
  .categorias-table td {
    background-color: #34495e;
    color: var(--text-color-dark);
  }

  .events-table tr:hover td,
  .categorias-table tr:hover td {
    background-color: #3a506b;
  }

  .form-input,
  .form-select {
    background-color: #2c3e50;
    color: #b4cdd3;
    border: 1px solid #555;
  }

  .form-input::placeholder {
    color: #aaa;
  }

  .form-select option {
    background-color: #2c3e50;
    color: #ecf0f1;
  }
}
</style>
