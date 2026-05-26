<template>

  <div class="form-wrapper">

    <div class="form-container-table">

      <div class="title-container">

        <h1 class="title">Imágenes Clonezilla</h1>

        <ion-button

          class="refresh-button"

          fill="solid"

          color="primary"

          shape="round"

          :disabled="loading"

          @click="cargarImagenes"

        >

          <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>

        </ion-button>

      </div>



      <p class="hint">

        Selecciona la imagen activa y la acción post-restore (<code>poweroff</code> o

        <code>reboot</code>)

      </p>



      <div v-if="imagenSeleccionada" class="activation-panel section">

        <h2 class="panel-title">Activar: {{ imagenSeleccionada }}</h2>

        <div class="row">

          <label>Acción tras restaurar:</label>

          <select v-model="accionElegida" class="custom-select">

            <option value="poweroff">poweroff</option>

            <option value="reboot">reboot</option>

          </select>

        </div>

        <div class="button-row">

          <button class="btn-primary btn-inline" :disabled="loading" @click="confirmarActivacion">

            Confirmar

          </button>

          <button class="btn-secondary btn-inline" :disabled="loading" @click="cancelarSeleccion">

            Cancelar

          </button>

        </div>

      </div>



      <div class="table-scroll" v-if="imagenes.length > 0">

        <table>

          <thead>

            <tr>

              <th>Nombre imagen</th>

              <th>Estado</th>

              <th>Acciones</th>

            </tr>

          </thead>

          <tbody>

            <tr v-for="img in imagenes" :key="img.nombreImagen">

              <td>{{ img.nombreImagen }}</td>

              <td>

                <span
                  class="estado-badge"
                  :class="[claseEstado(img.estado), { 'estado-con-accion': muestraTooltipAccion(img) }]"
                  :title="tooltipAccionEstado(img)"
                >

                  {{ img.estado }}

                </span>

              </td>

              <td>

                <button

                  class="btn-primary btn-small"

                  :disabled="loading || img.estado === 'PENDIENTE'"

                  @click="abrirSeleccion(img.nombreImagen)"

                >

                  Seleccionar activa

                </button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>



      <div v-else-if="!loading" class="empty-message">

        <span>No hay imágenes registradas. El cliente PXE las sincronizará desde disco.</span>

      </div>

    </div>



    <div class="form-container">

      <div class="title-container">

        <h1 class="title">Menú completo Clonezilla</h1>

      </div>

      <p class="hint">

        Desactiva todas las imágenes en el servidor. En el PXE se mostrará el menú completo de

        restauración (ninguna imagen preseleccionada).

      </p>

      <div class="section center">

        <button

          class="btn-danger"

          :disabled="loading"

          @click="confirmarMenuCompleto"

        >

          Habilitar

        </button>

      </div>

    </div>



    <IonToast

      :is-open="isToastOpen"

      :message="toastMessage"

      :color="toastColor"

      :duration="4000"

      @didDismiss="isToastOpen = false"

    />

  </div>

</template>



<script setup lang="ts">

import { ref, onMounted } from 'vue';

import { IonButton, IonIcon, IonToast } from '@ionic/vue';

import {

  listarImagenesClonezilla,

  establecerImagenPorDefecto,

  habilitarMenuCompletoClonezilla,

  type ImagenClonezillaRow,

} from '@/services/imagesCloner.js';



const imagenes = ref<ImagenClonezillaRow[]>([]);

const loading = ref(false);

const imagenSeleccionada = ref<string | null>(null);

const accionElegida = ref<'poweroff' | 'reboot'>('poweroff');



const isToastOpen = ref(false);

const toastMessage = ref('');

const toastColor = ref('success');



const claseEstado = (estado: string) => {

  if (estado === 'ACTIVADA') return 'estado-activada';

  if (estado === 'PENDIENTE') return 'estado-pendiente';

  return 'estado-desactivada';

};

const muestraTooltipAccion = (img: ImagenClonezillaRow) =>
  img.estado === 'PENDIENTE' || img.estado === 'ACTIVADA';

const tooltipAccionEstado = (img: ImagenClonezillaRow): string | undefined => {
  if (!muestraTooltipAccion(img)) {
    return undefined;
  }

  const accion = img.accion?.trim().toLowerCase();

  if (accion === 'reboot') {
    return 'Acción al finalizar: reiniciar (reboot)';
  }

  if (accion === 'poweroff') {
    return 'Acción al finalizar: apagar (poweroff)';
  }

  if (accion) {
    return `Acción al finalizar: ${accion}`;
  }

  return 'Acción al finalizar: apagar (poweroff)';
};



const cargarImagenes = async () => {

  loading.value = true;

  try {

    imagenes.value = await listarImagenesClonezilla(toastMessage, toastColor, isToastOpen);

  } catch (error) {

    toastColor.value = 'danger';

    toastMessage.value = (error as Error).message || 'Error al cargar imágenes';

    isToastOpen.value = true;

  } finally {

    loading.value = false;

  }

};



const abrirSeleccion = (nombre: string) => {

  imagenSeleccionada.value = nombre;

  accionElegida.value = 'poweroff';

};



const cancelarSeleccion = () => {

  imagenSeleccionada.value = null;

};



const confirmarActivacion = async () => {

  if (!imagenSeleccionada.value) return;



  loading.value = true;

  try {

    imagenes.value = await establecerImagenPorDefecto(

      toastMessage,

      toastColor,

      isToastOpen,

      imagenSeleccionada.value,

      accionElegida.value

    );

    imagenSeleccionada.value = null;

  } catch {

    // toast ya mostrado en el servicio

  } finally {

    loading.value = false;

  }

};



const confirmarMenuCompleto = async () => {

  if (!window.confirm('¿Desactivar todas las imágenes y habilitar el menú completo en Clonezilla?')) {

    return;

  }



  loading.value = true;

  try {

    imagenes.value = await habilitarMenuCompletoClonezilla(

      toastMessage,

      toastColor,

      isToastOpen

    );

    imagenSeleccionada.value = null;

  } catch {

    // toast ya mostrado en el servicio

  } finally {

    loading.value = false;

  }

};



onMounted(() => {

  cargarImagenes();

});

</script>



<style scoped>

.form-wrapper {

  display: flex;

  flex-wrap: wrap;

  gap: 20px;

  justify-content: center;

  padding: 16px;

}



.form-container-table {

  min-width: 700px;

  width: 90%;

  max-width: 900px;

  background-color: var(--form-bg-light);

  box-shadow: rgba(0, 0, 0, 0.1) 0 5px 15px;

  border: 1px solid #444;

  border-radius: 10px;

  box-sizing: border-box;

  padding: 12px 15px;

  margin: auto;

  font-family: 'Roboto', sans-serif;

}



.form-container {

  width: 100%;

  max-width: 400px;

  background-color: var(--form-bg-light);

  box-shadow: rgba(0, 0, 0, 0.1) 0 5px 15px;

  border: 1px solid #444;

  border-radius: 10px;

  box-sizing: border-box;

  padding: 20px 30px;

  margin: auto;

  font-family: 'Roboto', sans-serif;

}



.title-container {

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 12px;

  padding-bottom: 10px;

}



.title {

  margin: 0;

  font-size: 24px;

  text-align: center;

}



.hint {

  color: #555;

  margin-bottom: 16px;

  font-size: 0.95rem;

  text-align: center;

}



.section {

  margin-bottom: 16px;

}



.section.center {

  display: flex;

  justify-content: center;

}



.activation-panel {

  background: #e9f5ff;

  border: 2px solid #007bff;

  border-radius: 8px;

  padding: 16px;

  margin-bottom: 16px;

}



.panel-title {

  margin: 0 0 12px;

  font-size: 1.1rem;

  text-align: center;

}



.row {

  display: flex;

  flex-direction: column;

  align-items: center;

  margin-bottom: 12px;

}



.row label {

  margin-bottom: 8px;

}



.custom-select {

  min-width: 180px;

  padding: 10px;

  font-size: 16px;

  border: 2px solid #007bff;

  border-radius: 5px;

  background-color: white;

  color: #000;

}



.button-row {

  display: flex;

  gap: 10px;

  justify-content: center;

  flex-wrap: wrap;

}



.table-scroll {

  width: 100%;

  overflow-x: auto;

}



table {

  border-collapse: collapse;

  width: 100%;

  min-width: 500px;

  text-align: center;

  background-color: #f8f9fa;

  color: #1a1a1a;

  border: 2px solid #007bff;

  margin-top: 10px;

  border-radius: 5px;

  overflow: hidden;

  font-size: 13px;

}



th,

td {

  border: 2px solid #007bff;

  padding: 8px;

}



th {

  background-color: #007bff;

  color: white;

  font-weight: bold;

}



td {

  background-color: #e9f5ff;

}



tr:hover td {

  background-color: #d0eaff;

}



.estado-badge {

  display: inline-block;

  padding: 4px 10px;

  border-radius: 12px;

  font-size: 0.85rem;

  font-weight: 600;

}



.estado-activada {

  background: #d4edda;

  color: #155724;

}



.estado-pendiente {

  background: #fff3cd;

  color: #856404;

}



.estado-desactivada {

  background: #e2e3e5;

  color: #383d41;

}

.estado-con-accion {

  cursor: help;

  text-decoration: underline dotted;

  text-underline-offset: 3px;

}



.btn-primary {

  padding: 10px 16px;

  font-size: 14px;

  font-weight: bold;

  background-color: #2196f3;

  border-radius: 6px;

  border: none;

  color: white;

  cursor: pointer;

}



.btn-primary:disabled,

.btn-secondary:disabled,

.btn-danger:disabled {

  opacity: 0.5;

  cursor: not-allowed;

}



.btn-secondary {

  padding: 10px 16px;

  font-size: 14px;

  background-color: #6c757d;

  border-radius: 6px;

  border: none;

  color: white;

  cursor: pointer;

}



.btn-danger {

  width: 100%;

  padding: 12px;

  font-size: 14px;

  font-weight: bold;

  background-color: #dc3545;

  border-radius: 6px;

  border: none;

  color: white;

  cursor: pointer;

  text-transform: uppercase;

}



.btn-inline {

  width: auto;

  min-width: 140px;

}



.btn-small {

  padding: 6px 12px;

  font-size: 0.9rem;

}



.refresh-button {

  flex-shrink: 0;

}



.empty-message {

  text-align: center;

  padding: 12px;

}



@media (prefers-color-scheme: dark) {

  .form-container-table,

  .form-container {

    background: var(--form-bg-dark, #1e1e1e);

  }



  .title,

  .hint,

  .panel-title {

    color: var(--text-color-dark, #eee);

  }



  .activation-panel {

    background: #1a2a3a;

    border-color: #335;

  }



  td {

    color: #ddd;

  }

}

</style>

