<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="form-wrapper">
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
    <div class="form-container">
      <ion-row v-if="mensajeActualizacion"> </ion-row>
      <div class="title-container">
        <h1 class="title">Gestión de Recursos</h1>
      </div>
      <ion-row>
        <ion-col size="12">
          <ion-item>
            <ion-label position="stacked">Recurso:</ion-label>
            <ion-input v-model="recurso"></ion-input>
          </ion-item>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="12">
          <ion-item>
            <ion-label position="stacked">Cantidad:</ion-label>
            <ion-input type="number" v-model="cantidad" min="0"></ion-input>
          </ion-item>
        </ion-col>
        <ion-col size="12">
          <div class="switch-container-gestion">
            <span>No Compartido</span>
            <label class="switch">
              <input type="checkbox" v-model="esCompartibleGestion" />
              <span class="slider"></span>
            </label>
            <span>Compartido
            </span>
          </div>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="12">
          <ion-button expand="block" v-if="cantidad > 0 && recurso" color="secondary" @click="crearRecurso">
            Crear / Modificar Recurso
          </ion-button>
        </ion-col>
      </ion-row>
    </div>
  </div>
  <div class="form-wrapper">
    <div class="form-container-table">
      <div class="title-container">
        <h1 class="title">Lista de Recursos</h1>
      </div>
      <div class="switch-container">
        <span>No Compartido</span>
        <label class="switch">
          <input type="checkbox" v-model="esCompartibleLista" @change="switchRecurso" />
          <span class="slider"></span>
        </label>
        <span>Compartido
        </span>
      </div>
      <ion-row>
        <ion-col size="12">
          <table v-if="recursosNoCompartido.length > 0 || recursosCompartido.length > 0">
            <thead>
              <tr>
                <th>Recurso</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody v-if="!esCompartibleLista">
              <tr v-for="r in recursosNoCompartido" :key="r.id">
                <td>{{ r.recursos }}</td>
                <td>{{ r.cantidad }}</td>
                <td>
                  <button color="danger" @click.stop="eliminarRecurso(r.recursos, $event)">
                    X
                  </button>
                </td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="r in recursosCompartido" :key="r.id">
                <td>{{ r.recursos }}</td>
                <td>{{ r.cantidad }}</td>
                <td>
                  <button color="danger" @click.stop="eliminarRecurso(r.recursos, $event)">
                    X
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <ion-col v-else size="12">
            <ion-label>No hay recursos disponibles.</ion-label>
          </ion-col>
        </ion-col>
      </ion-row>
    </div>
  </div>
  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>

<script setup>
import { bookingsApiUrl } from "@/environment/apiUrls.ts";
import { ref, onMounted } from "vue";
import { IonRow, IonCol, IonItem, IonLabel } from "@ionic/vue";
import {
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonToast,
} from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";
import { obtenerConstantes, actualizarConstantes } from "@/services/constantes";
import {
  postRecurso,
  getRecursosCompartible,
  deleteRecurso,
  getReservas,
} from "@/services/bookings";

// Selección de constante
const selectedConstante = ref(null);
const constantes = ref([]);
const recursosNoCompartido = ref([]);
const recursosCompartido = ref([]);
const esCompartibleLista = ref(false);
const esCompartibleGestion = ref(false);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const recurso = ref("");
const cantidad = ref("");

// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

// Función que se llama cuando el usuario selecciona una constante
const onConstanteChange = () => {
  if (!selectedConstante.value) {
    selectedConstante.value = { valor: "" };
  } else if (selectedConstante.value.valor === undefined) {
    selectedConstante.value.valor = "";
  }
};

// Función para actualizar la constante seleccionada
const actualizarConstanteSeleccionada = async () => {
  try {
    const constantesActualizadas = constantes.value.map((c) =>
      c.clave === selectedConstante.value.clave ? selectedConstante.value : c
    );

    await actualizarConstantes(
      bookingsApiUrl + "/bookings/constants",
      toastMessage,
      toastColor,
      isToastOpen,
      constantesActualizadas
    );
    mensajeActualizacion = "Constantes actualizadas con éxito";
    mensajeColor = "success";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
  } catch (error) {
    mensajeActualizacion = "Error al actualizar la constante";
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
    throw new Error(error.message);
  }
};

// Función para obtener las constantes al cargar el componente
const cargarConstantes = async () => {
  try {
    constantes.value = await obtenerConstantes(
      bookingsApiUrl + "/bookings/constants",
      toastMessage,
      toastColor,
      isToastOpen
    );

    // Seleccionar la constante "Reserva Deshabilitada" por defecto
    const reservaDeshabilitada = constantes.value.find(
      (c) => c.clave === "Reserva Deshabilitada"
    );

    if (reservaDeshabilitada) {
      selectedConstante.value = reservaDeshabilitada;
    }
  } catch (error) {
    mensajeActualizacion = "Error al obtener constantes";
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
    throw new Error(error.message);
  }
};

const crearRecurso = async () => {
  try {
    if (parseInt(cantidad.value) < 0) {
      cantidad.value = cantidad.value * -1;
    }

    const status = await postRecurso(
      toastMessage,
      toastColor,
      isToastOpen,
      recurso.value,
      parseInt(cantidad.value),
      esCompartibleGestion.value
    );

    if (status.status == 200) {
      mensajeActualizacion = "Recurso creado con éxito";
      mensajeColor = "success";
    }
    else if (status.status == 409) {

      const compartido = recursosCompartido.value.find((item) => item.recursos === recurso.value);

      if (compartido) {
        mensajeActualizacion = `El recurso: "${recurso.value}" ya existe en la lista de recursos compartidos`;
      }
      else {
        mensajeActualizacion = `El recurso: "${recurso.value}" ya existe en la lista de recursos no compartidos`;
      }
      mensajeColor = "danger";
    }

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
    // Limpiar el formulario después de crear el recurso
    recurso.value = "";
    cantidad.value = "";
    cargarRecursos();
  } catch (error) {
    mensajeActualizacion = "Error al crear el recurso";
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
  }
};

const cargarRecursos = async () => {
  try {
    const data = await getRecursosCompartible(
      isToastOpen,
      toastMessage,
      toastColor,
      esCompartibleLista.value
    );

    if (esCompartibleLista.value) {
      recursosCompartido.value = data.map((item) => ({
        recursos: item.id,
        cantidad: item.cantidad,
        esCompartible: item.esCompartibleLista,
      }));
    } else {
      recursosNoCompartido.value = data.map((item) => ({
        recursos: item.id,
        cantidad: item.cantidad,
        esCompartible: item.esCompartibleLista,
      }));
    }


  } catch (error) {
    mensajeActualizacion = "No existen recursos todavía";
    mensajeColor = "warning";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
  }
};

const eliminarRecurso = async (recurso, event) => {
  try {
    event.stopPropagation();

    const data = await getReservas(
      isToastOpen,
      toastMessage,
      toastColor,
      recurso
    );

    // Obtener un array de recursos asignados
    const recursoEliminar = data.map((item) => item.recurso);

    // Verificar si el recurso está asignado a alguna reserva
    if (recursoEliminar.includes(recurso)) {
      mensajeColor = "danger";
      mensajeActualizacion =
        "No es posible eliminar un recurso asignado a una reserva";
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        mensajeColor,
        mensajeActualizacion
      );
      return;
    }

    // Llamar a la API para eliminar el recurso en el backend
    await deleteRecurso(
      toastMessage,
      toastColor,
      isToastOpen,
      recurso
    );

    // Mostrar mensaje de éxito
    mensajeColor = "success";
    mensajeActualizacion = "Recurso eliminado correctamente";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );

    // Recargar los recursos desde el backend para asegurarse de que todo esté sincronizado
    cargarRecursos();
  } catch (error) {
    // Si ocurre un error, mostrar mensaje de error
    mensajeActualizacion = "Error eliminando el recurso";
    mensajeColor = "danger";
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      mensajeColor,
      mensajeActualizacion
    );
  }
};

const switchRecurso = async () => {
  cargarRecursos();
};

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await cargarConstantes();
  await cargarRecursos();
  await switchRecurso();
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
  width: 100%;
  max-width: 700px;
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


.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  /* Espaciado entre las tarjetas */
  justify-content: center;
  /* Centrar las tarjetas */
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
  /* Establece un ancho fijo */
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  /* Para manejar contenido largo */
  overflow: hidden;
  /* Oculta cualquier contenido que desborde */
  word-wrap: break-word;
  /* Permite que el texto largo se divida y se ajuste */
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
  /* Diferenciar la columna de tramos horarios */
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
  /* Efecto hover en filas */
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
  align-items: center;
  position: relative;
  width: 100%;
  padding: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
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
</style>
