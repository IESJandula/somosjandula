<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <!-- Dropdown para seleccionar recurso -->
    <select class="custom-select" v-model="recursoSeleccionado">
      <option v-for="(recurso, index) in recursos" :key="index" :value="recurso.recursos">
        {{ recurso.recursos }} ({{ recurso.cantidad }})
      </option>
    </select>

    <!-- Tabla con horarios y reservas -->
    <table v-if="mostrarTabla">
      <thead>
        <tr>
          <th>Horarios</th>
          <th v-for="(dia, index) in diasSemanas" :key="index">{{ dia.diaSemana }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td>{{ tramo.tramoHorario }}</td>
          <td v-for="(dia, index) in diasSemanas" :key="index" @click="openModal(tramo, dia)">
            <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos > 0">
              {{ reservas[tramo.id][dia.id].nombreYapellidos }} <br> (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos
              }})
              <button v-if="rolesUsuario.includes('ADMINISTRADOR') || (rolesUsuario.includes('PROFESOR') && reservas[tramo.id][dia.id].email === emailUsuarioActual)" @click.stop="deleteReservas(tramo, dia, $event, recursoSeleccionado, reservas[tramo.id][dia.id].email)">Borrar</button>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de edición -->
    <div v-if="isModalOpen && (!reservas[currentTramo?.id]?.[currentDia?.id]?.nalumnos)" class="modal-overlay">
      <div class="modal-content">
        <h2>Editar Reserva</h2>
        
        <label v-if="rolesUsuario.includes('ADMINISTRADOR')" for="profesorCorreo">Profesor:</label>
        <select v-if="rolesUsuario.includes('ADMINISTRADOR')" class="custom-select-modal" v-model="profesorSeleccionado">
          <option value="" disabled hidden>Seleccione un Profesor</option>
          <option v-for="user in users" :key="user.email" :value="user.email">
            {{ `${user.nombre} ${user.apellidos}` }}
          </option>
        </select>

        <label class="custom-numAlumnos" for="numAlumnos">Número de Alumnos:</label>
        <input class="custom-select-modal" v-model="numAlumnos" type="number" id="numAlumnos" placeholder="Número de alumnos" min="0" :max="cantidadSeleccionada" />

        <button v-if="numAlumnos" @click="saveChanges">Reservar</button>
        <button @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>
<script setup>

import { ref, onMounted, watch } from 'vue'
import { IonToast } from '@ionic/vue';
import { getDiasSemana, getTramosHorarios, getRecursos, getReservas, postReserva, deleteReserva } from '@/services/bookings.js'
import { obtenerInfoUsuarios, obtenerRolesUsuario, obtenerEmailUsuario } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast.js';

// Variables reactivas
const diasSemanas = ref([])
const tramosHorarios = ref([])
const recursos = ref([])
const reservas = ref({})
const users = ref([]);
const rolesUsuario = ref([]);
const recursoSeleccionado = ref('')
const cantidadSeleccionada = ref('')
const profesorSeleccionado = ref('')
const isModalOpen = ref(false)
const correoProfesor = ref('')
const numAlumnos = ref('')
const currentTramo = ref(null)
const currentDia = ref(null)
let mensajeActualizacion = ''
let mensajeColor = ''
let emailUserActual = '';
const mostrarTabla = ref(true);
const emailLogged = ref('');
// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const emailUsuarioActual = ref(null);

const verificarRecursos = () => {
  if (recursos.value.length === 0) {
    mostrarTabla.value = false;
    crearToast(toastMessage, toastColor, isToastOpen, 'warning', 'No hay recursos')
  }
};

const obtenerEmailUsuarioActual = async () => {
  emailUsuarioActual.value = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
};

// Función para abrir el modal
const openModal = (tramo, dia) => {
  currentTramo.value = tramo
  currentDia.value = dia
  correoProfesor.value = reservas[dia.id]?.[tramo.id]?.email || '' // Cargar correo si existe
  numAlumnos.value = reservas[dia.id]?.[tramo.id]?.nalumnos || '' // Cargar número de alumnos si existe
  isModalOpen.value = true
}

// Función para cerrar el modal
const closeModal = () => {
  isModalOpen.value = false
}

// Función para guardar los cambios (ahora usando `postReserva`)
const saveChanges = async () => {
  if (currentDia.value && currentTramo.value && recursoSeleccionado.value) {
    try {

      // Llamar a la API para guardar la reserva
      await postReserva(
        isToastOpen,
        toastMessage,
        toastColor,
        profesorSeleccionado.value,
        recursoSeleccionado.value,
        currentDia.value.id,
        currentTramo.value.id,
        numAlumnos.value
      )

      // Actualizar localmente las reservas después de guardar
      if (!reservas.value[currentDia.value.id]) {
        reservas.value[currentDia.value.id] = {}
      }
      reservas.value[currentDia.value.id][currentTramo.value.id] = {
        nombreYapellidos: correoProfesor.value,
        nalumnos: numAlumnos.value,
      }
      mensajeActualizacion = 'Reserva guardada exitosamente'
      mensajeColor = 'success'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
    } catch (error) {
      mensajeActualizacion = 'Reserva creada correctamente'
      mensajeColor = 'warning'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
    }
  } else {
    mensajeActualizacion = 'Faltan datos para guardar la reserva'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
  closeModal()
  getReserva(recursoSeleccionado) // Actualizar reservas después de guardar
}

// Función para obtener los días de la semana
const getDiasSemanas = async () => {
  try {
    const data = await getDiasSemana(isToastOpen,toastMessage,toastColor)
    diasSemanas.value = data.map((item) => ({ diaSemana: item.diaSemana, id: item.id }))
  } catch (error) {
    mensajeActualizacion = 'Error obteniendo los días de la semana'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

// Función para obtener los tramos horarios
const getTramosHorario = async () => {
  try {
    const data = await getTramosHorarios(isToastOpen,toastMessage,toastColor)
    tramosHorarios.value = data.map((item) => ({
      tramoHorario: item.tramoHorario,
      id: item.id,
    }))
  } catch (error) {
    mensajeActualizacion = 'Error obteniendo los tramos horarios'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

// Función para obtener los recursos
const getRecurso = async () => {
  try {
    const data = await getRecursos(isToastOpen,toastMessage,toastColor)   
    recursos.value = data.map((item) => ({ recursos: item.id, cantidad: item.cantidad }))
    
    // Nos aseguraramos que recursos no está vacío antes de asignar
    if (recursos.value.length > 0)
    {
      recursoSeleccionado.value = recursos.value[0].recursos;
      cantidadSeleccionada.value = recursos.value[0].cantidad;
    }    

  } catch (error) {
    mensajeActualizacion = 'Error obteniendo los recursos'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

// Función para obtener las reservas estructuradas
const getReserva = async () => {
  const recurso = recursoSeleccionado.value;
  const data = await getReservas(isToastOpen,toastMessage,toastColor,recurso)

  // Reestructurar reservas en un objeto organizado por tramos y días
  const estructuraReservas = {}

  for (let i = 0; i < data.length; i++) {
    const reserva = data[i]
    const tramo = reserva.tramoHorario
    const dia = reserva.diaSemana

    if (!estructuraReservas[tramo]) {
      estructuraReservas[tramo] = {}
    }

    estructuraReservas[tramo][dia] = {
      nalumnos: reserva.nalumnos,
      nombreYapellidos: reserva.nombreYapellidos,
      email: reserva.email,
    }
  }
  reservas.value = estructuraReservas
}

const deleteReservas = async (tramo, dia, event, recursoSeleccionado, email) => {
  try {
    event.stopPropagation()

    // Llamar a la API para cancelar la reserva
    await deleteReserva(isToastOpen,toastMessage,toastColor,email, recursoSeleccionado, dia.id, tramo.id)


    mensajeActualizacion = 'Reserva cancelada exitosamente'
      mensajeColor = 'success'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  } catch (error) {
    mensajeActualizacion = 'Error al cancelar la reserva'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
  getReserva(recursoSeleccionado) // Actualizar reservas después de cancelar
}

// Watcher para actualizar cantidadSeleccionada cuando recursoSeleccionado cambie
watch(recursoSeleccionado, () => {
  const recursoEncontrado = recursos.value.find(
    (recurso) => recurso.recursos === recursoSeleccionado.value
  );
  cantidadSeleccionada.value = recursoEncontrado ? recursoEncontrado.cantidad : '';
  getReserva()
});

const cargarDatos = async () => {
  users.value = await obtenerInfoUsuarios(isToastOpen, toastMessage, toastColor);  
};

async function verificarRoles() {
  try {
    const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);
    rolesUsuario.value = roles; // Asigna los roles al array `rolesUsuario`
  } catch (error) {
    mensajeActualizacion = 'Error al verificar roles'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await getDiasSemanas()
  await getTramosHorario()
  await getRecurso();
  verificarRecursos();
  await cargarDatos()
  await verificarRoles();
  await obtenerEmailUsuarioActual();
  emailUserActual = await obtenerEmailUsuario(toastMessage,toastColor,isToastOpen);

  emailLogged.value = emailUserActual;
})

</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-top: 70px;
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
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.custom-select-modal {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #007bff;
  outline: none;
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.custom-numAlumnos
{
  margin-top: 10px;
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

@media (max-width: 768px) {
  table {
    font-size: 14px;
    width: 100%;
  }

  .custom-select {
    width: 100%;
  }
}
</style>
