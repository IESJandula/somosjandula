<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="form-wrapper">
    <!-- Tarjeta de aplicaciones existentes -->
    <div class="card-preferencias">
      <h2 class="t-2">Listado de aplicaciones</h2>
      
      <!-- Tabla con todas las aplicaciones -->
      <div class="tabla-responsive">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Calendar (hoy/max)</th>
              <th>Email (hoy/max)</th>
              <th>Web (hoy/max)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(aplicacion, index) in aplicaciones" :key="index">
              <td class="nombre-aplicacion">
                {{ aplicacion.nombre }}
              </td>
              <!-- Notificaciones de calendario con tooltip de fecha -->
              <td class="tooltip-cell" @touchstart="showTooltip($event)" @touchend="hideTooltip($event)" @touchcancel="hideTooltip($event)">
                <div class="notificacion-cell-content">
                  <span class="notificacion-hoy">{{ aplicacion.notifHoyCalendar }}</span>
                  <span class="notificacion-separador">/</span>
                  <input type="number" :value="aplicacion.notifMaxCalendar" @change="actualizarNotificacionesMaximasCalendarHandler(aplicacion.nombre, $event.target.value)" @click.stop class="input-max-notificacion" min="0" />
                </div>
                <span class="tooltip-text" v-if="aplicacion.fechaUltimaNotificacionCalendar">Última notificación: {{ aplicacion.fechaUltimaNotificacionCalendar }}</span>
              </td>
              <!-- Notificaciones de email con tooltip de fecha -->
              <td class="tooltip-cell" @touchstart="showTooltip($event)" @touchend="hideTooltip($event)" @touchcancel="hideTooltip($event)">
                <div class="notificacion-cell-content">
                  <span class="notificacion-hoy">{{ aplicacion.notifHoyEmail }}</span>
                  <span class="notificacion-separador">/</span>
                  <input type="number" :value="aplicacion.notifMaxEmail" @change="actualizarNotificacionesMaximasEmailHandler(aplicacion.nombre, $event.target.value)" @click.stop class="input-max-notificacion" min="0" />
                </div>
                <span class="tooltip-text" v-if="aplicacion.fechaUltimaNotificacionEmail">
                  Última notificación: {{ aplicacion.fechaUltimaNotificacionEmail }}
                </span>
              </td>
              <!-- Notificaciones de web con tooltip de fecha -->
              <td class="tooltip-cell" @touchstart="showTooltip($event)" @touchend="hideTooltip($event)" @touchcancel="hideTooltip($event)">
                <div class="notificacion-cell-content">
                  <span class="notificacion-hoy">{{ aplicacion.notifHoyWeb }}</span>
                  <span class="notificacion-separador">/</span>
                  <input type="number" :value="aplicacion.notifMaxWeb" @change="actualizarNotificacionesMaximasWebHandler(aplicacion.nombre, $event.target.value)" @click.stop class="input-max-notificacion" min="0" />
                </div>
                <span class="tooltip-text" v-if="aplicacion.fechaUltimaNotificacionWeb">Última notificación: {{ aplicacion.fechaUltimaNotificacionWeb }}</span>
              </td>
              <!-- Columna de acciones -->
              <td class="acciones-cell">
                <button @click="borrarAplicacionHandler(aplicacion.nombre)" class="btn-borrar-aplicacion" title="Borrar aplicación">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </td>
            </tr> 
            <!-- Fila para insertar nueva aplicación -->
            <tr>
              <td class="nombre-aplicacion">
                <input 
                  type="text" 
                  v-model="nuevaAplicacionNombre" 
                  placeholder="Nombre de la aplicación"
                  class="input-nombre-aplicacion"
                />
              </td>
              <!-- Notificaciones de calendario para nueva aplicación -->
              <td>
                <div class="notificacion-cell-content">
                  <span class="notificacion-hoy">0</span>
                  <span class="notificacion-separador">/</span>
                  <input 
                    type="number" 
                    v-model="nuevaAplicacionNotificacionesMaximasCalendar" 
                    class="input-max-notificacion" 
                    min="0"
                    placeholder="0"
                  />
                </div>
              </td>
              <!-- Notificaciones de email para nueva aplicación -->
              <td>
                <div class="notificacion-cell-content">
                  <span class="notificacion-hoy">0</span>
                  <span class="notificacion-separador">/</span>
                  <input 
                    type="number" 
                    v-model="nuevaAplicacionNotificacionesMaximasEmail" 
                    class="input-max-notificacion" 
                    min="0"
                    placeholder="0"
                  />
                </div>
              </td>
              <!-- Notificaciones de web para nueva aplicación -->
              <td>
                <div class="notificacion-cell-content">
                  <span class="notificacion-hoy">0</span>
                  <span class="notificacion-separador">/</span>
                  <input 
                    type="number" 
                    v-model="nuevaAplicacionNotificacionesMaximasWeb" 
                    class="input-max-notificacion" 
                    min="0"
                    placeholder="0"
                  />
                </div>
              </td>
              <!-- Columna de acciones para nueva aplicación -->
              <td class="acciones-cell">
                <button 
                  @click="crearAplicacionHandler" 
                  class="btn-crear-aplicacion" 
                  title="Crear aplicación"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </td>
            </tr>
            <!-- Fila si no hay aplicaciones -->
            <tr v-if="!aplicaciones.length">
              <td colspan="5" style="text-align:center; opacity:0.7;">
                No hay aplicaciones registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Configuración de Gmail -->
    <div class="form-container">
      <h1 class="title">Configuración de Gmail</h1>
      <div class="form-section">
        <div style="margin-top: 15px;">
          <ion-button expand="block" @click="autorizarGmailOAuthLlamadaServicio">Autorizar Gmail OAuth</ion-button>
        </div>
      </div>
    </div>
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
  </div>
  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>

<script setup>
import { notificationsApiUrl } from "@/environment/apiUrls.ts";
import { ref, onMounted } from "vue";
import { IonRow, IonCol, IonItem, IonLabel } from "@ionic/vue";
import { IonSelect, IonSelectOption, IonInput, IonButton, IonToast } from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";
import { obtenerConstantes, actualizarConstantes } from "@/services/constantes";
import { autorizarGmailOAuth, listarAplicaciones, actualizarNotificacionesMaximasCalendar, actualizarNotificacionesMaximasEmail, actualizarNotificacionesMaximasWeb, borrarAplicacion, crearAplicacion } from '@/services/notifications';

// Selección de constante
const selectedConstante = ref(null);
const constantes = ref([]);
const aplicaciones = ref([]);

// Campos para la nueva aplicación a insertar
const nuevaAplicacionNombre = ref("");
const nuevaAplicacionNotificacionesMaximasCalendar = ref(0);
const nuevaAplicacionNotificacionesMaximasEmail = ref(0);
const nuevaAplicacionNotificacionesMaximasWeb = ref(0);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Nueva variable reactiva para el mensaje de actualización
let mensajeColor = "";

/**
 * Función que se llama cuando el usuario selecciona una constante
 */
const onConstanteChange = () =>
{
  if (!selectedConstante.value)
  {
    selectedConstante.value = { valor: "" };
  }
  else if (selectedConstante.value.valor === undefined)
  {
    selectedConstante.value.valor = "";
  }
};

/**
 * Función para actualizar la constante seleccionada
 */
const actualizarConstanteSeleccionada = async () =>
{
  try
  {
    // Buscamos la constante seleccionada y la actualizamos
    const constantesActualizadas = constantes.value.map((c) => c.clave === selectedConstante.value.clave ? selectedConstante.value : c);

    // Llamamos al servicio para actualizar las constantes
    await actualizarConstantes(notificationsApiUrl + "/notifications/constants", toastMessage, toastColor, isToastOpen, constantesActualizadas);

    // Listamos de nuevo las aplicaciones
    await listarAplicacionesVista();
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para obtener las constantes al cargar el componente
 */
const cargarConstantes = async () =>
{
  try
  {
    // Llamamos al servicio para obtener las constantes
    constantes.value = await obtenerConstantes(notificationsApiUrl + "/notifications/constants", toastMessage, toastColor, isToastOpen);
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para listar las aplicaciones
 */
const listarAplicacionesVista = async () =>
{
  try
  {
    // Llamamos al servicio para listar las aplicaciones
    aplicaciones.value = await listarAplicaciones(toastMessage, toastColor, isToastOpen, 1, 10);
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para autorizar el OAuth de Gmail
 */
const autorizarGmailOAuthLlamadaServicio = async () =>
{
  try
  {
    // Llamamos al servicio para autorizar el OAuth de Gmail
    await autorizarGmailOAuth(toastMessage, toastColor, isToastOpen);
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Funciones para manejar tooltips en dispositivos táctiles
 */
const showTooltip = (event) =>
{
  try
  {
    // Mostramos el tooltip
    const cell = event.currentTarget;

    // Añadimos la clase tooltip-active
    cell.classList.add('tooltip-active');

    // Prevenimos el scroll
    event.preventDefault();
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para actualizar los valores máximos de calendario
 */
const actualizarNotificacionesMaximasCalendarHandler = async (nombreAplicacion, nuevoValor) =>
{
  try
  {
    // Validamos los valores numéricos
    if (validarValoresNumericos(nuevoValor))
    {
      // Llamamos al servicio para actualizar el valor máximo de calendario
      await actualizarNotificacionesMaximasCalendar(toastMessage, toastColor, isToastOpen, nombreAplicacion, nuevoValor);
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para actualizar el valor máximo de email
 */
const actualizarNotificacionesMaximasEmailHandler = async (nombreAplicacion, nuevoValor) =>
{
  try
  {
    // Validamos los valores numéricos
    if (validarValoresNumericos(nuevoValor))
    {
      // Llamamos al servicio para actualizar el valor máximo de email
      await actualizarNotificacionesMaximasEmail(toastMessage, toastColor, isToastOpen, nombreAplicacion, nuevoValor);
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para actualizar el valor máximo de web
 */
const actualizarNotificacionesMaximasWebHandler = async (nombreAplicacion, nuevoValor) =>
{
  try
  {
    // Convertimos el valor a número
    if (validarValoresNumericos(nuevoValor))
    {
      // Llamamos al servicio para actualizar el valor máximo de web
      await actualizarNotificacionesMaximasWeb(toastMessage, toastColor, isToastOpen, nombreAplicacion, nuevoValor);
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

const validarValoresNumericos = (valor) =>
{
  let outcome = true;

  // Convertimos el valor a número
  const valorNumerico = parseInt(valor);

  // Asignamos a outcome el resultado de la validación
  outcome = !isNaN(valorNumerico) && valorNumerico >= 0;

  if (!outcome)
  {
    // Mostramos un mensaje de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "El valor debe ser un número positivo: " + valorNumerico);
  }

  // Devolvemos el resultado
  return outcome;
};

/**
 * Función para borrar una aplicación
 */
const borrarAplicacionHandler = async (nombreAplicacion) =>
{
  try
  {
    // Llamamos al servicio para borrar la aplicación
    await borrarAplicacion(toastMessage, toastColor, isToastOpen, nombreAplicacion);
    
    // Recargamos la lista de aplicaciones
    await listarAplicacionesVista();
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

/**
 * Función para crear una nueva aplicación
 */
const crearAplicacionHandler = async () =>
{
  try
  {
    // Validamos que el nombre no esté vacío
    if (!nuevaAplicacionNombre.value || nuevaAplicacionNombre.value.trim() === "")
    {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "El nombre de la aplicación es obligatorio");
      return;
    }

    // Le quitamos los espacios en blanco
    nuevaAplicacionNombre.value = nuevaAplicacionNombre.value.trim();

    // Validamos que los valores máximos sean números positivos
    const notificacionesMaximasCalendar = parseInt(nuevaAplicacionNotificacionesMaximasCalendar.value) || 0;
    const notificacionesMaximasEmail = parseInt(nuevaAplicacionNotificacionesMaximasEmail.value) || 0;
    const notificacionesMaximasWeb = parseInt(nuevaAplicacionNotificacionesMaximasWeb.value) || 0;

    if (notificacionesMaximasCalendar < 0 || notificacionesMaximasEmail < 0 || notificacionesMaximasWeb < 0)
    {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "Los valores máximos deben ser números positivos");
    }
    else
    {
      // Llamamos al servicio para crear la aplicación
      await crearAplicacion(toastMessage, toastColor, isToastOpen, nuevaAplicacionNombre.value, notificacionesMaximasCalendar, notificacionesMaximasEmail, notificacionesMaximasWeb);
    }

    // Limpiamos el formulario
    nuevaAplicacionNombre.value = "";
    nuevaAplicacionNotificacionesMaximasCalendar.value = 0;
    nuevaAplicacionNotificacionesMaximasEmail.value = 0;
    nuevaAplicacionNotificacionesMaximasWeb.value = 0;
    
    // Recargamos la lista de aplicaciones
    await listarAplicacionesVista();
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
  }
};

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await cargarConstantes();
  await listarAplicacionesVista();
});
</script>

<style scoped>
.t-2 {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1.5rem;
}

.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

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

/* Estilos para la tarjeta de aplicaciones (igual que card-preferencias) */
.card-preferencias {
  margin: 2rem auto;
  max-width: 1400px;
  background: var(--form-bg-light);
  border-radius: 10px;
  box-shadow: rgba(0,0,0,0.15) 0px 5px 15px;
  padding: 1.5rem;
  overflow: hidden;
}

.tabla-responsive {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}

.tabla-responsive table {
  min-width: 800px;
  border-collapse: collapse;
  width: 100%;
  margin: 0;
}

.tabla-responsive th, 
.tabla-responsive td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
}

.tabla-responsive th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.nombre-aplicacion {
  font-weight: 600;
  text-align: center;
  min-width: 200px;
}

/* Estilos para filas alternadas */
.tabla-responsive tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.tabla-responsive tbody tr:hover {
  background-color: #f0f0f0;
}

/* Estilos para mejorar el scroll */
.tabla-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tabla-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tabla-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tabla-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-container {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }

  .card-preferencias {
    background: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .tabla-responsive {
    box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.1);
  }

  .tabla-responsive::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  .tabla-responsive::-webkit-scrollbar-thumb {
    background: #555;
  }

  .tabla-responsive::-webkit-scrollbar-thumb:hover {
    background: #666;
  }

  .tabla-responsive th {
    background-color: #333;
  }

  .tabla-responsive th, 
  .tabla-responsive td {
    border-color: #555;
  }

  .tabla-responsive tbody tr:nth-child(even) {
    background-color: #2a2a2a;
  }

  .tabla-responsive tbody tr:hover {
    background-color: #3a3a3a;
  }

  .input-max-notificacion {
    background-color: #333;
    border-color: #555;
    color: white;
  }

  .input-max-notificacion:focus {
    border-color: #64b5f6;
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
  }

  .input-max-notificacion:hover {
    border-color: #777;
  }

  .btn-borrar-aplicacion {
    color: #ef5350;
  }

  .btn-borrar-aplicacion:hover {
    background-color: rgba(239, 83, 80, 0.2);
    color: #e57373;
  }

  .input-nombre-aplicacion {
    background-color: #333;
    border-color: #555;
    color: white;
  }

  .input-nombre-aplicacion:focus {
    border-color: #64b5f6;
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
  }

  .input-nombre-aplicacion:hover {
    border-color: #777;
  }

  .input-nombre-aplicacion::placeholder {
    color: #666;
  }

  .btn-crear-aplicacion {
    color: #059669;
  }

  .btn-crear-aplicacion:hover {
    background-color: rgba(5, 150, 105, 0.2);
    color: #10B981;
  }
}

/* Estilos para las celdas de notificaciones */
.notificacion-cell-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.notificacion-hoy {
  font-weight: 600;
}

.notificacion-separador {
  margin: 0 2px;
}

.input-max-notificacion {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-max-notificacion:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.input-max-notificacion:hover {
  border-color: #999;
}

/* Estilos para el input de nombre de nueva aplicación */
.input-nombre-aplicacion {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-size: 0.9rem;
  background-color: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-nombre-aplicacion:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.input-nombre-aplicacion:hover {
  border-color: #999;
}

.input-nombre-aplicacion::placeholder {
  color: #999;
  opacity: 0.7;
}

/* Estilos para el botón de crear aplicación */
.btn-crear-aplicacion {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: #10B981;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-crear-aplicacion:hover {
  background-color: rgba(16, 185, 129, 0.1);
  color: #059669;
  transform: scale(1.1);
}

.btn-crear-aplicacion:active {
  transform: scale(0.95);
}

.btn-crear-aplicacion svg {
  width: 20px;
  height: 20px;
}

/* Estilos para la columna de acciones */
.acciones-cell {
  text-align: center;
  vertical-align: middle;
  min-width: 80px;
}

.btn-borrar-aplicacion {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: #d32f2f;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-borrar-aplicacion:hover {
  background-color: rgba(211, 47, 47, 0.1);
  color: #b71c1c;
  transform: scale(1.1);
}

.btn-borrar-aplicacion:active {
  transform: scale(0.95);
}

.btn-borrar-aplicacion svg {
  width: 20px;
  height: 20px;
}

/* Estilos para tooltips */
.tooltip-cell {
  position: relative;
  cursor: help;
}

.tooltip-trigger {
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.9);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: absolute;
  z-index: 1000;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  transition: opacity 0.3s, visibility 0.3s;
  pointer-events: none;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
}

/* Mostrar tooltip en hover (PC) */
.tooltip-cell:hover .tooltip-text,
.tooltip-cell:focus .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Mostrar tooltip en touch (móvil/tablet) */
.tooltip-cell:active .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Para dispositivos táctiles, mantener visible mientras se toca */
@media (hover: none) and (pointer: coarse) {
  .tooltip-cell.tooltip-active .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
}

/* Estilos responsive */
@media (max-width: 768px) {
  .form-container {
    border: 1px solid #444;
  }

  .card-preferencias {
    margin: 1rem;
    padding: 1rem;
    border-radius: 8px;
  }

  .tabla-responsive {
    max-width: 100%;
    max-height: 300px;
    border-radius: 6px;
  }

  .tabla-responsive table {
    min-width: 600px;
  }

  .nombre-aplicacion {
    min-width: 150px;
    font-size: 0.85rem;
  }

  .t-2 {
    font-size: 1.25rem;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.25rem;
    font-size: 0.8rem;
  }

  /* Ajustar tooltip en móvil */
  .tooltip-text {
    bottom: auto;
    top: 125%;
    font-size: 11px;
    padding: 6px 10px;
    max-width: 200px;
    white-space: normal;
    word-wrap: break-word;
  }

  .tooltip-text::after {
    top: auto;
    bottom: 100%;
    border-color: transparent transparent rgba(0, 0, 0, 0.9) transparent;
  }
}

@media (max-width: 480px) {
  .card-preferencias {
    margin: 0.5rem;
    padding: 0.75rem;
  }

  .tabla-responsive {
    max-height: 250px;
  }

  .tabla-responsive table {
    min-width: 500px;
  }

  th, td {
    padding: 0.2rem;
    font-size: 0.75rem;
  }

  .nombre-aplicacion {
    min-width: 120px;
    font-size: 0.7rem;
  }

  .t-2 {
    font-size: 1.1rem;
  }

  .btn-borrar-aplicacion {
    padding: 2px 4px;
  }

  .btn-borrar-aplicacion svg {
    width: 16px;
    height: 16px;
  }

  .acciones-cell {
    min-width: 60px;
  }

  .input-nombre-aplicacion {
    font-size: 0.75rem;
    padding: 2px 4px;
  }

  .btn-crear-aplicacion {
    padding: 2px 4px;
  }

  .btn-crear-aplicacion svg {
    width: 16px;
    height: 16px;
  }
}
</style>
