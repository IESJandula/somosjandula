<!-- src/views/AdministracionNotificaciones.vue -->
<template>
  <div class="form-wrapper">
    <!-- Formulario Alta Notificación -->
    <div class="form-container">
      <div class="title-container">
        <h1 class="title">Crear Notificación</h1>
      </div>

      <ion-row>
        <ion-col size="12">
          <ion-item>
            <ion-label position="stacked">Texto</ion-label>
            <ion-input v-model="texto"></ion-input>
          </ion-item>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-item>
            <ion-label position="stacked">Fecha Inicio</ion-label>
            <ion-datetime v-model="fechaInicio" presentation="date-time"></ion-datetime>
          </ion-item>
        </ion-col>
        <ion-col size="6">
          <ion-item>
            <ion-label position="stacked">Fecha Fin</ion-label>
            <ion-datetime v-model="fechaFin" presentation="date-time"></ion-datetime>
          </ion-item>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="6">
          <ion-item>
            <ion-label position="stacked">Nivel</ion-label>
            <ion-select v-model="nivel">
              <ion-select-option value="GLOBAL">Global</ion-select-option>
              <ion-select-option value="SECUNDARIO">Secundario</ion-select-option>
            </ion-select>
          </ion-item>
        </ion-col>

        <ion-col size="6">
          <ion-item>
            <ion-label position="stacked">Roles</ion-label>
            <ion-select multiple v-model="roles">
              <ion-select-option v-for="rol in rolesDisponibles" :key="rol" :value="rol">
                {{ rol }}
              </ion-select-option>
            </ion-select>
          </ion-item>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="12">
          <ion-item>
            <ion-label position="stacked">Imagen</ion-label>
            <input type="file" @change="onFileChange" />
          </ion-item>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="12">
          <ion-button expand="block" color="secondary" @click="crearNotificacion">
            Crear Notificación
          </ion-button>
        </ion-col>
      </ion-row>
    </div>

    <!-- Lista de Notificaciones -->
    <div class="form-container-table">
      <div class="title-container">
        <h1 class="title">Lista de Notificaciones</h1>
      </div>
      <ion-row>
        <ion-col size="12">
          <table v-if="notificaciones.length > 0">
            <thead>
              <tr>
                <th>Texto</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Nivel</th>
                <th>Roles</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(n, index) in notificaciones" :key="index">
                <td>{{ n.texto }}</td>
                <td>{{ n.fechaInicio }}</td>
                <td>{{ n.fechaFin }}</td>
                <td>{{ n.nivel }}</td>
                <td>{{ n.roles }}</td>
                <td>
                  <img v-if="n.imagen" :src="`/uploads/${n.imagen}`" alt="imagen notificación" width="50" />
                </td>
                <td>
                  <button @click="eliminarNotificacion(n)">X</button>
                </td>
              </tr>
            </tbody>
          </table>
          <ion-label v-else>No hay notificaciones disponibles.</ion-label>
        </ion-col>
      </ion-row>
    </div>
  </div>

  <ion-toast
    :is-open="isToastOpen"
    :message="toastMessage"
    :color="toastColor"
    duration="2000"
    @did-dismiss="() => (isToastOpen = false)"
    position="top"
  ></ion-toast>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonDatetime,
} from "@ionic/vue";

import {
  crearNotificacionWeb,
  obtenerNotificacionesHoy,
  eliminarNotificacionWeb,
} from "@/services/firebaseService";

const texto = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");
const nivel = ref("GLOBAL");
const roles = ref([]);
const imagen = ref(null);

const notificaciones = ref([]);
const rolesDisponibles = ["ADMINISTRADOR", "PROFESOR", "DIRECCIÓN"]; 

// Toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const onFileChange = (e) => {
  imagen.value = e.target.files[0];
};

const crearNotificacion = async () => {
  await crearNotificacionWeb(toastMessage, toastColor, isToastOpen, {
    texto: texto.value,
    fechaInicio: fechaInicio.value.split("T")[0],
    fechaFin: fechaFin.value.split("T")[0],
    nivel: nivel.value,
    roles: roles.value,
    imagen: imagen.value ? imagen.value.name : ""
  });
  await cargarNotificaciones();
};

const cargarNotificaciones = async () => {
  notificaciones.value = await obtenerNotificacionesHoy(toastMessage, toastColor, isToastOpen);
};

const eliminarNotificacion = async (n) => {
  await eliminarNotificacionWeb(toastMessage, toastColor, isToastOpen, n.id);
  await cargarNotificaciones();
};

onMounted(() => {
  cargarNotificaciones();
});
</script>

<style scoped>
.form-container {
  width: 100%;
  max-width: 500px;
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 20px 30px;
  margin: auto;
  margin-top: 2%;
}

.form-container-table {
  width: 100%;
  max-width: 80%;
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 20px 30px;
  margin: auto;
  margin-top: 2%;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: #f8f9fa;
}

th, td {
  border: 1px solid #007bff;
  padding: 8px;
  color: #000;
}

th {
  background: #007bff;
  color: white;
}

button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
