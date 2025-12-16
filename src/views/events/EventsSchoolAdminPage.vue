<template>
  <div class="main-container">
    <div class="top-row">
      <div class="left-top-container">
        <div class="form-container usuario-container">
          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">TÍTULO:</label>
              <input 
                type="text" 
                v-model="evento.titulo"
                class="form-input"
                required
              />
            </div>
            
            <div class="form-row">
              <label class="form-label">CATEGORIA:</label>
              <select 
                v-model="evento.categoria"
                class="form-select"
                required
              >
                <option value="">Seleccione</option>
                <option 
                  v-for="categoria in categorias" 
                  :key="categoria.nombre" 
                  :value="categoria.nombre"
                >
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>
            
            <div class="form-row">
              <label class="form-label">FECHA INICIO:</label>
              <input 
                type="date" 
                v-model="evento.fechaInicio"
                class="form-input"
                required
              />
            </div>
            
            <div class="form-row combined-row">
              <div class="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="eventoMismoDia" 
                  v-model="eventoMismoDia"
                  @change="toggleMismoDia"
                  class="form-checkbox"
                />
                <label for="eventoMismoDia" class="checkbox-label">
                  EVENTO FINALIZA ESE DIA DE
                </label>
              </div>
              
              <div v-if="!eventoMismoDia" class="fecha-fin-wrapper">
                <label class="form-label">FECHA FIN:</label>
                <input 
                  type="date" 
                  v-model="evento.fechaFin"
                  class="form-input"
                  :required="!eventoMismoDia"
                />
              </div>
            </div>
            
            <div class="button-row">
              <button 
                type="button" 
                @click="crearEventoFunc"
                class="btn-enviar"
              >
                ENVIAR
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="right-top-container">
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
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="eventoItem in eventos" :key="`${eventoItem.titulo}-${eventoItem.fechaInicio}`">
                  <td>{{ eventoItem.titulo }}</td>
                  <td>{{ eventoItem.categoria }}</td>
                  <td>{{ formatFecha(eventoItem.fechaInicio) }}</td>
                  <td>{{ formatFecha(eventoItem.fechaFin) }}</td>
                  <td>
                    <button 
                      @click="borrarEventoFunc(eventoItem)" 
                      class="btn-eliminar"
                    >
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
    <div class="bottom-row">
      <div class="left-bottom-container">
        <div class="form-container">
          <h2 class="window-title">CREAR CATEGORÍA</h2>
          
          <div class="form-grid">
            <div class="form-row">
              <label class="form-label">NOMBRE:</label>
              <input 
                type="text" 
                v-model="nuevaCategoria.nombre"
                class="form-input"
                placeholder=""
              />
            </div>
            
            <div class="form-row">
              <label class="form-label">COLOR:</label>
              <div class="color-selection">
                <select 
                  v-model="nuevaCategoria.color"
                  class="form-select"
                >
                  <option value="">Seleccione color</option>
                  <option 
                    v-for="color in coloresDisponibles" 
                    :key="color.value" 
                    :value="color.value"
                  >
                    {{ color.nombre }}
                  </option>
                </select>
                <div 
                  v-if="nuevaCategoria.color"
                  class="color-preview"
                  :style="{ backgroundColor: nuevaCategoria.color }"
                ></div>
              </div>
            </div>
            
            <div class="button-row">
              <button 
                type="button" 
                @click="agregarCategoria"
                class="btn-enviar"
              >
                ENVIAR
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="right-bottom-container">
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
                        <span 
                          class="color-display" 
                          :style="{ backgroundColor: getColorForCategory(categoria.nombre) }"
                        ></span>
                        <span class="color-name">{{ getColorName(getColorForCategory(categoria.nombre)) }}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        @click="eliminarCategoria(categoria)"
                        class="btn-eliminar-cat"
                      >
                        Eliminar
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
    <IonToast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      :duration="3000"
      @didDismiss="isToastOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { IonToast } from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";

import {
  obtenerEventos,
  crearEvento,
  borrarEvento,
  obtenerCategorias,
} from "@/services/events.js";

// Interfaces
interface Evento {
  titulo: string;
  fechaInicio: number;
  fechaFin: number;
  categoria: string;
}

interface EventoForm {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  categoria: string;
}

interface Categoria {
  nombre: string;
}
const eventos = ref<Evento[]>([]);
const categorias = ref<Categoria[]>([]);
const eventoMismoDia = ref(false);
const fechaEspecial = ref<string>('');

// Formulario evento
const evento = ref<EventoForm>({
  titulo: "",
  fechaInicio: "",
  fechaFin: "",
  categoria: "",
});

// Nueva categoría
const nuevaCategoria = ref({
  nombre: "",
  color: ""
});

// Toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Colores disponibles para seleccionar
const coloresDisponibles = ref([
  { value: '#008000', nombre: 'VERDE' },
  { value: '#0000FF', nombre: 'AZUL' },
  { value: '#FFFF00', nombre: 'AMARILLO' }
]);

// Cargar todos los eventos
async function cargarEventos() {
  try {
    eventos.value = await obtenerEventos(toastMessage, toastColor, isToastOpen);
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar eventos");
  }
}

// Cargar todas las categorías
async function cargarCategorias() {
  try {
    categorias.value = await obtenerCategorias(toastMessage, toastColor, isToastOpen);
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar categorías");
  }
}

// Crear un nuevo evento
async function crearEventoFunc() {
  try {
    if (!evento.value.titulo || !evento.value.fechaInicio || !evento.value.categoria) {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "Título, fecha inicio y categoría son obligatorios");
      return;
    }

    const fechaInicioLong = new Date(evento.value.fechaInicio).getTime();
    let fechaFinLong: number;

    if (eventoMismoDia.value) {
      fechaFinLong = fechaInicioLong;
    } else {
      if (!evento.value.fechaFin) {
        crearToast(toastMessage, toastColor, isToastOpen, "danger", "Debe especificar fecha fin para eventos de múltiples días");
        return;
      }
      fechaFinLong = new Date(evento.value.fechaFin).getTime();
    }

    if (fechaFinLong < fechaInicioLong) {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "La fecha fin no puede ser anterior a la fecha inicio");
      return;
    }

    await crearEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      evento.value.titulo,
      fechaInicioLong,
      fechaFinLong,
      evento.value.categoria
    );

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Evento creado correctamente");

    // Limpiar formulario
    evento.value = { titulo: "", fechaInicio: "", fechaFin: "", categoria: "" };
    eventoMismoDia.value = false;

    // Recargar eventos
    await cargarEventos();
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al crear evento");
  }
}

// Borrar un evento
async function borrarEventoFunc(e: Evento) {
  try {
    await borrarEvento(toastMessage, toastColor, isToastOpen, e.titulo, e.fechaInicio, e.fechaFin);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Evento eliminado");
    await cargarEventos();
  } catch {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al borrar evento");
  }
}

// Funciones auxiliares
function toggleMismoDia() {
  if (eventoMismoDia.value) {
    evento.value.fechaFin = "";
  }
}

async function agregarCategoria() {
  if (!nuevaCategoria.value.nombre || !nuevaCategoria.value.color) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Debe ingresar nombre y seleccionar un color");
    return;
  }
  
  // Agregar a la lista local
  categorias.value.push({
    nombre: nuevaCategoria.value.nombre
  });
  
  crearToast(toastMessage, toastColor, isToastOpen, "success", `Categoría "${nuevaCategoria.value.nombre}" agregada`);
  
  // Limpiar formulario
  nuevaCategoria.value = { nombre: "", color: "" };
}

function eliminarCategoria(categoria: Categoria) {
  // Eliminar de la lista local
  const index = categorias.value.findIndex(c => c.nombre === categoria.nombre);
  if (index !== -1) {
    categorias.value.splice(index, 1);
    crearToast(toastMessage, toastColor, isToastOpen, "success", `Categoría "${categoria.nombre}" eliminada`);
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

function getColorForCategory(nombreCategoria: string): string {
  // Para categorías existentes, usar color asignado
  const index = categorias.value.findIndex(cat => cat.nombre === nombreCategoria);
  if (index !== -1 && nuevaCategoria.value.color) {
    return nuevaCategoria.value.color;
  }
  // Por defecto, usar color basado en el índice
  const colorIndex = index % coloresDisponibles.value.length;
  return coloresDisponibles.value[colorIndex].value;
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
.top-row, .bottom-row {
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
  flex: 1; /* Formulario más pequeño */
}

.right-top-container {
  flex: 2; /* Tabla más grande */
}

.left-bottom-container {
  flex: 1; /* Formulario categoría */
}

.right-bottom-container {
  flex: 1; /* Lista categorías */
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

.events-table, .categorias-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #007bff;
  font-size: 12px;
}

.events-table th, .categorias-table th {
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

.events-table td, .categorias-table td {
  padding: 8px 12px;
  border: 2px solid #007bff;
  background-color: #e9f5ff;
  height: 40px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.events-table tr:hover td, .categorias-table tr:hover td {
  background-color: #d0eaff;
}

.no-data {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 15px;
}

.btn-eliminar, .btn-eliminar-cat {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}

.btn-eliminar:hover, .btn-eliminar-cat:hover {
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
  .top-row, .bottom-row {
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
  
  .events-table, .categorias-table {
    font-size: 11px;
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
}
</style>