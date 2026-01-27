<template>
  <div class="main-container">
    <div class="top-row">
      <div class="left-top-container">
        <div class="form-container">
          <h2 class="window-title">CREAR HUELGA</h2>

          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">NOMBRE:</label>
              <input type="text" v-model="nuevaHuelga.nombre" class="form-input" placeholder="" />
            </div>

            <div class="form-row">
              <label class="form-label">FECHA INICIO:</label>
              <input type="date" v-model="huelga.fechaInicio" class="form-input" required />
            </div>

            <div class="form-row combined-row">
              <div class="checkbox-wrapper">
                <input type="checkbox" id="huelgaMismoDia" v-model="huelgaMismoDia" @change="toggleMismoDia"
                  class="form-checkbox" />
                <label for="huelgaMismoDia" class="checkbox-label">
                  HUELGA FINALIZA ESE DIA
                </label>
              </div>

              <div v-if="!huelgaMismoDia" class="fecha-fin-wrapper">
                <label class="form-label">FECHA FIN:</label>
                <input type="date" v-model="evento.fechaFin" class="form-input" :required="!huelgaMismoDia" />
              </div>
            </div>

            <div class="button-row">
              <button type="button" @click="crearHuelgaFn" class="btn-enviar">
                ENVIAR
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="right-bottom-container">
        <div class="form-container-table table-container">
          <h2 class="window-title">CALENDARIO DE HUELGAS</h2>

          <div class="table-wrapper">
            <table class="events-table">
              <thead>
                <tr>
                  <th>TÍTULO</th>
                  <th>FECHA INICIO</th>
                  <th>FECHA FIN</th>
                  <th>ESTADO</th>
                  <th>Nº PARTICIPANTES</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eventoItem in eventos" :key="`${eventoItem.titulo}-${eventoItem.fechaInicio}`">
                  <td>{{ eventoItem.titulo }}</td>
                  <td>{{ formatFecha(eventoItem.fechaInicio) }}</td>
                  <td>{{ formatFecha(eventoItem.fechaFin) }}</td>
                  <td>{{ eventoItem.nombre }}</td>

                  <td>
                    <button @click="borrarEventoFn(eventoItem)" class="btn-eliminar">
                      Eliminar
                    </button>
                  </td>
                </tr>
                <tr v-if="eventos.length === 0">
                  <td colspan="5" class="no-data">No hay eventos registrados</td>
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
}

interface EventoForm {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  nombre: string;
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
const eventoMismoDia = ref(false);
const fechaEspecial = ref<string>('');

// Formulario evento
const evento = ref<EventoForm>({
  titulo: "",
  nombre: "",
  fechaInicio: "",
  fechaFin: ""
});

// Nueva categoría
const nuevaCategoria = ref({
  nombre: "",
  color: ""
});
// Colores disponibles para seleccionar
const coloresDisponibles = ref([
  { value: '#008000', nombre: 'VERDE' },
  { value: '#0000FF', nombre: 'AZUL' },
  { value: '#FFFF00', nombre: 'AMARILLO' },
  { value: '#FF0000', nombre: 'ROJO' }
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
    
    if (!evento.value.titulo || !evento.value.nombre || !evento.value.fechaInicio) 
    {
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
    });

    await crearEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      evento.value.titulo,
      evento.value.nombre,
      fechaInicioLong,
      fechaFinLong

    );

    console.log("Evento creado, recargando lista");

    // Reset formulario
    evento.value = {
      titulo: "",
      nombre: "",
      fechaInicio: "",
      fechaFin: ""
    };


    // Limpiar formulario
    evento.value = { titulo: "", fechaInicio: "", fechaFin: "", nombre: "" };
    eventoMismoDia.value = false;

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

async function agregarCategoriaFn(){
 if (!nuevaCategoria.value.nombre || !nuevaCategoria.value.color) {
      crearToast(toastMessage, toastColor, isToastOpen,"error","Debes indicar un nombre y un color para la categoría");
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
  padding: 20px;
  background-color: var(--background-color, #f0f2f5);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* FILAS */
.top-row,
.bottom-row {
  display: flex;
  gap: 20px;
  flex: 1;
}

/* CONTENEDORES */
.left-top-container,
.right-top-container,
.left-bottom-container,
.right-bottom-container {
  flex: 1;
  min-height: 400px;
  display: flex;
}

/* Ajustes de tamaño para cada contenedor */
.left-top-container {
  flex: 1;
  /* Formulario más pequeño */
}

.right-top-container {
  flex: 2;
  /* Tabla más grande */
}

.left-bottom-container {
  flex: 1;
  /* Formulario categoría */
}

.right-bottom-container {
  flex: 1;
  /* Lista categorías */
}

/* ESTILOS COMUNES DE FORMULARIO */
.form-container {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 10px;
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  padding: 25px;
  font-family: "Roboto", sans-serif;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.form-container-table {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 10px;
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  padding: 25px;
  font-family: "Roboto", sans-serif;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.window-title {
  color: var(--text-color);
  font-size: 16px;
  font-weight: bold;
  text-align: left;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #007bff;
  text-transform: uppercase;
}

/* FORMULARIO EN GRID */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
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
  font-size: 13px;
  text-align: right;
}

.form-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
}

.form-select {
  flex: 1;
  padding: 8px 10px;
  border: 2px solid #007bff;
  border-radius: 4px;
  background-color: white;
  color: #007bff;
  font-size: 13px;
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

.button-row {
  justify-content: flex-end;
  margin-top: 15px;
}

.btn-enviar {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  font-size: 13px;
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
  font-size: 13px;
  text-align: right;
}

.date-input {
  flex: 1;
}

/* TABLAS */
.table-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.events-table,
.categorias-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #007bff;
  font-size: 12px;
}

.events-table th,
.categorias-table th {
  background-color: #007bff;
  color: white;
  padding: 10px 12px;
  text-align: left;
  font-weight: bold;
  border: 2px solid #007bff;
  font-size: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.events-table td,
.categorias-table td {
  padding: 8px 12px;
  border: 2px solid #007bff;
  background-color: #e9f5ff;
  height: 40px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.events-table tr:hover td,
.categorias-table tr:hover td {
  background-color: #d0eaff;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 15px;
}

.btn-eliminar,
.btn-eliminar-cat {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
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
}

.color-display {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;
}

.color-name {
  font-size: 11px;
  font-weight: 600;
}

/* RESPONSIVE */
@media (max-width: 1024px) {

  .top-row,
  .bottom-row {
    flex-direction: column;
  }

  .left-top-container,
  .right-top-container,
  .left-bottom-container,
  .right-bottom-container {
    width: 100%;
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
    overflow-x: auto;
  }

  .events-table,
  .categorias-table {
    font-size: 11px;
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
    color: #ecf0f1;
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
