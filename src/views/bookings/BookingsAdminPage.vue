<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="booking__form-wrapper">
    <!-- Gestión de Recursos -->
    <div class="booking__form-container">
      <div class="booking__title-container">
        <h1 class="booking__title">Gestión de Recursos</h1>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <div class="booking__item">
            <label class="booking__label">Recurso:</label>
            <input class="booking__input" v-model="recurso" />
          </div>
        </div>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <div class="booking__item">
            <label class="booking__label">Cantidad:</label>
            <input class="booking__input" type="number" v-model="cantidad"
                   :min="recursosCantidadMaxima[recurso] ? recursosCantidadMaxima[recurso] : 0" />
          </div>
        </div>
        <div class="booking__col">
          <div class="booking__switch-container">
            <span>No Compartido</span>
            <label class="booking__switch">
              <input type="checkbox" v-model="esCompartiblebooking" />
              <span class="booking__slider"></span>
            </label>
            <span>Compartido</span>
          </div>
        </div>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <button
              class="booking__button"
              v-if="cantidad && recurso && ((recursosCantidadMaxima[recurso] === undefined && cantidad > 0) || recursosCantidadMaxima[recurso] <= cantidad)"
              @click="crearRecurso"
          >
            Crear / Modificar Recurso
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de Recursos -->
    <div class="booking__form-container-table">
      <div class="booking__title-container">
        <h1 class="booking__title">Lista de Recursos</h1>
      </div>

      <div class="booking__switch-container">
        <span>No Compartido</span>
        <label class="booking__switch">
          <input type="checkbox" v-model="esCompartibleLista" @change="switchRecurso" />
          <span class="booking__slider"></span>
        </label>
        <span>Compartido</span>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <table v-if="recursosNoCompartido.length > 0 || recursosCompartido.length > 0" class="booking__table">
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
                <button class="booking__delete-button" @click.stop="eliminarRecurso(r.recursos, $event)">
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
                <button class="booking__delete-button" @click.stop="eliminarRecurso(r.recursos, $event)">
                  X
                </button>
              </td>
            </tr>
            </tbody>
          </table>
          <div v-else class="booking__no-recursos">
            No hay recursos disponibles.
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Actualizar Constantes -->
  <div class="booking__form-wrapper">
    <div class="booking__form-container">
      <div class="booking__title-container">
        <h1 class="booking__title">Actualizar Constantes</h1>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <div class="booking__item">
            <label class="booking__label">Clave de la constante:</label>
            <select v-model="selectedConstante" @change="onConstanteChange" class="booking__select">
              <option v-for="constante in constantes" :key="constante.clave" :value="constante">
                {{ constante.clave }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <div v-if="selectedConstante" class="booking__item">
            <label class="booking__label">Valor:</label>
            <input v-model="selectedConstante.valor" class="booking__input" />
          </div>
        </div>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <button class="booking__button" @click="actualizarConstanteSeleccionada">
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Borrado Reservas -->
    <div class="booking__form-container">
      <div class="booking__title-container">
        <h1 class="booking__title">Borrado de Reservas por recurso</h1>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <div class="booking__item">
            <label class="booking__label">Seleccione el recurso a borrar:</label>
            <select v-model="selectedRecurso" @change="onReservaChange" class="booking__select">
              <option v-for="recurso in [...recursos]" :key="recurso.id" :value="recurso">
                {{ recurso.recursos }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="booking__row">
        <div class="booking__col">
          <button class="booking__button" @click="borrarReservasRecurso">
            Borrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="isToastOpen" class="booking__toast booking__toast--{{ toastColor }}">
    {{ toastMessage }}
  </div>
</template>

<script setup>
import { bookingsApiUrl } from "@/environment/apiUrls.ts";
import { ref, onMounted } from "vue";
import { crearToast } from "@/utils/toast.js";
import { obtenerConstantes, actualizarConstantes } from "@/services/constantes";
import {
  postRecurso,
  getRecursosCompartible,
  deleteRecurso,
  getReservas,
  getRecursos,
  getCantMaxResource,
  deleteRecursoReserva
} from "@/services/bookings";

// Selección de constante
const selectedConstante = ref(null);
const selectedRecurso = ref(null);
const constantes = ref([]);
const recursosNoCompartido = ref([]);
const recursosCompartido = ref([]);
const esCompartibleLista = ref(false);
const esCompartiblebooking = ref(false);
const recursosCantidadMaxima = ref('');
const recursos = ref([]);
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

// Función que se llama cuando el usuario selecciona una reserva para borrar
const onReservaChange = () => {
  if (!selectedRecurso.value) {
    selectedRecurso.value = { valor: "" };
  } else if (selectedRecurso.value.valor === undefined) {
    selectedRecurso.value.valor = "";
  }
};

const borrarReservasRecurso = async () => {
  await deleteRecursoReserva(isToastOpen, toastMessage, toastColor, selectedRecurso.value.recursos);
  mensajeActualizacion = "Reservas eliminadas correctamente";
  mensajeColor = "success";
  crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  getRecurso();
};

const getRecurso = async () => {
  const data = await getRecursos(isToastOpen, toastMessage, toastColor);
  recursos.value = data.map((item) => ({ recursos: item.id }));
};

const getCantMax = async () => {
  const data = await getCantMaxResource(isToastOpen, toastMessage, toastColor);
  recursosCantidadMaxima.value = data;
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
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  } catch (error) {
    mensajeActualizacion = "Error al actualizar la constante";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
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
    getCantMax();

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
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
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
        esCompartiblebooking.value
    );

    if (status.status == 200) {
      mensajeActualizacion = "Operación realizada correctamente";
      mensajeColor = "success";
    } else if (status.status == 409) {
      const compartido = recursosCompartido.value.find((item) => item.recursos === recurso.value);
      if (compartido) {
        mensajeActualizacion = `El recurso: "${recurso.value}" ya existe en la lista de recursos compartidos`;
      } else {
        mensajeActualizacion = `El recurso: "${recurso.value}" ya existe en la lista de recursos no compartidos`;
      }
      mensajeColor = "danger";
    }

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    cargarRecursos();
  } catch (error) {
    mensajeActualizacion = "Error al crear el recurso";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
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
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};

const eliminarRecurso = async (recurso, event) => {
  try {
    event.stopPropagation();

    const data = await getReservas(isToastOpen, toastMessage, toastColor, recurso);
    const recursoEliminar = data.map((item) => item.recurso);

    if (recursoEliminar.includes(recurso)) {
      mensajeColor = "danger";
      mensajeActualizacion = "Como existen reservas asignadas a este recurso, no es posible borrarlo";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    await deleteRecurso(toastMessage, toastColor, isToastOpen, recurso);
    mensajeColor = "success";
    mensajeActualizacion = "Recurso eliminado correctamente";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    cargarRecursos();
  } catch (error) {
    mensajeActualizacion = "Error eliminando el recurso";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};

const switchRecurso = async () => {
  cargarRecursos();
};

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await cargarConstantes();
  await cargarRecursos();
  await getRecurso();
  await switchRecurso();
  await getCantMaxResource();
});
</script>


<style scoped>
.booking__form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.booking__form-container,
.booking__form-container-table {
  width: 100%;
  max-width: 700px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  border: 1px solid #444;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  margin: 2% auto;
  font-family: "Roboto", sans-serif;
}

.booking__title-container {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.booking__title {
  margin: 0;
  font-size: 24px;
  color: var(--text-color-light);
}

.booking__row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.booking__col {
  flex: 1 1 100%;
}

.booking__item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.booking__label {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.booking__input,
.booking__select {
  padding: 10px;
  font-size: 16px;
  border: 2px solid var(--button-border-light);
  border-radius: 5px;
  background-color: var(--background-light);
  color: var(--text-color-light);
}

.booking__button {
  width: 100%;
  padding: 10px;
  background-color: var(--button-bg-light);
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.booking__delete-button {
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.booking__switch-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  justify-content: center;
}

.booking__switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.booking__switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.booking__slider {
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

.booking__slider::before {
  content: "";
  position: absolute;
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.booking__switch input:checked + .booking__slider {
  background-color: #2196f3;
}

.booking__switch input:checked + .booking__slider::before {
  transform: translateX(26px);
}

.booking__table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid var(--button-border-light);
}

.booking__table th,
.booking__table td {
  border: 2px solid var(--button-border-light);
  padding: 10px;
}

.booking__table th {
  background-color: var(--button-border-light);
  color: white;
  font-weight: bold;
}

.booking__table td {
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
}

.booking__table tr:hover td {
  background-color: #d0eaff;
}

.booking__no-recursos {
  text-align: center;
  font-style: italic;
  padding: 10px;
  color: var(--text-color-light);
}

.booking__toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--button-bg-light);
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  z-index: 999;
  color: white;
}

.booking__toast--success {
  background-color: var(--button-bg-light);
}

.booking__toast--danger {
  background-color: #dc3545;
}

.booking__toast--warning {
  background-color: #f0ad4e;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .booking__form-container,
  .booking__form-container-table {
    background-color: var(--form-bg-dark);
    border: 1px solid #444;
  }

  .booking__title {
    color: var(--text-color-dark);
  }

  .booking__input,
  .booking__select {
    background-color: var(--background-dark);
    color: var(--text-color-dark);
    border: 2px solid var(--button-border-dark);
  }

  .booking__button {
    background-color: var(--button-bg-dark);
  }

  .booking__toast {
    background-color: var(--button-bg-dark);
  }
}

/* Responsive para tablets */
@media (max-width: 768px) {
  .booking__form-container,
  .booking__form-container-table {
    padding: 15px 20px;
  }

  .booking__table {
    font-size: 14px;
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .booking__switch-container {
    flex-direction: column;
  }
}

/* Responsive para móviles */
@media (max-width: 400px) {
  .booking__title {
    font-size: 20px;
    text-align: center;
  }

  .booking__input,
  .booking__select {
    font-size: 14px;
  }

  .booking__button {
    font-size: 14px;
    padding: 8px;
  }

  .booking__switch-container span {
    font-size: 16px;
  }
}
</style>

