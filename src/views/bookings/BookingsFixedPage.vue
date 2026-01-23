<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <h1 class="titulo-pagina">Reservas Fijas</h1>
  <div class="container">
    <span class="valorConstante" v-if="valorConstante">{{ valorConstante }}</span>
    <span class="valorConstante" v-if="logRecursos">{{ logRecursos }}</span>
    <span class="mensajeInformativo"
      v-if="mensajeInformativo && valorConstante == '' && !recursoSeleccionadoBloqueado">{{ mensajeInformativo }}</span>
    <span class="mensajeInformativoBloqueo" v-if="recursoSeleccionadoBloqueado">Actualmente el recurso está
      bloqueado</span>
    <!-- Dropdown para seleccionar recurso -->
    <select class="custom-select" v-model="recursoSeleccionado">
      <option v-for="(recurso, index) in recursos" :key="index" :value="recurso.recursos">
        {{ recurso.recursos }} (Máximo permitido: {{ recurso.cantidad }})
      </option>
    </select>
    <div class="incidence-message">
      {{ mensajeIncidencia }} <a @click.prevent="navigateToIssues">aquí</a>
    </div>

    <!-- Tabla con horarios y reservas -->
    <table class="tabla-container" v-if="mostrarTabla">
      <thead>
        <tr>
          <th class="sticky-column">Horarios</th>
          <th v-for="(dia, index) in diasSemanas" :key="index">{{ dia.diaSemana }}</th>
        </tr>
      </thead>
      <tbody v-if="valorConstante === '' && !recursoSeleccionadoBloqueado">
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td class="sticky-column">{{ tramo.tramoHorario }}</td>
          <td class="reservaHover" v-for="(dia, index) in diasSemanas" :key="index"
            @click="openModal(tramo, dia, reservas[tramo.id]?.[dia.id]?.email)">
            <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos[0] > 0">
              <template v-for="(nombre, index) in reservas[tramo.id][dia.id].nombreYapellidos" :key="index">
                <div class="div_profesor" :title="reservas[tramo.id][dia.id].motivoCurso[index]">
                  {{ nombre }} <br>
                  (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos[index] }})

                  <button
                    v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION') ||
                      (rolesUsuario.includes('PROFESOR') && reservas[tramo.id][dia.id].email[index] === emailUsuarioActual)"
                    @click.stop="deleteReservas(tramo, dia, $event, recursoSeleccionado, reservas[tramo.id][dia.id].email[index])">
                    Borrar
                  </button>
                </div>
              </template>
            </span>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td class="sticky-column">{{ tramo.tramoHorario }}</td>
          <td class="reservaHover" v-for="(dia, index) in diasSemanas" :key="index"
            @click="openModal(tramo, dia, reservas[tramo.id]?.[dia.id]?.email)">
            <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos[0] > 0">
              <template v-for="(nombre, index) in reservas[tramo.id][dia.id].nombreYapellidos" :key="index">
                <div class="div_profesor" :title="reservas[tramo.id][dia.id].motivoCurso[index]">
                  {{ nombre }} <br>
                  (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos[index] }})

                  <button
                    v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION') ||
                      (rolesUsuario.includes('PROFESOR') && reservas[tramo.id][dia.id].email[index] === emailUsuarioActual)"
                    @click.stop="deleteReservas(tramo, dia, $event, recursoSeleccionado, reservas[tramo.id][dia.id].email[index])">
                    Borrar
                  </button>
                </div>
              </template>
            </span>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td class="sticky-column">{{ tramo.tramoHorario }}</td>
          <td class="reservaBloqueadaHover" v-for="(dia, index) in diasSemanas" :key="index">
            <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos[0] > 0">
              <template v-for="(nombre, index) in reservas[tramo.id][dia.id].nombreYapellidos" :key="index">
                <div class="div_profesor" :title="reservas[tramo.id][dia.id].motivoCurso[index]">
                  {{ nombre }} <br>
                  (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos[index] }})
                </div>
              </template>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de edición -->
    <div
      v-if="isModalOpen && (!reservas[currentTramo?.id]?.[currentDia?.id]?.nalumnos[0]) || (isModalOpen && recursoSeleccionadoCompartible && reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes > 0)"
      class="modal-overlay">
      <div class="modal-content">
        <h2>Reservar</h2>

        <label v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')"
          for="profesorCorreo">Profesor:</label>
        <select v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')"
          class="custom-select-modal" v-model="profesorSeleccionado">
          <option value="" disabled hidden>Seleccione un Profesor</option>
          <option v-for="user in users" :key="user.email" :value="user.email">
            {{ `${user.nombre} ${user.apellidos}` }}
          </option>
        </select>

        <label class="custom-numAlumnos" for="numAlumnos">Número de Alumnos:</label>
        <input class="custom-select-modal" v-model="numAlumnos" type="number" id="numAlumnos"
          placeholder="Número de alumnos" min="0"
          :max="((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada))" />

        <label class="custom-motivoCurso" for="motivoCurso">Motivo y Curso:</label>
        <input class="custom-select-modal" v-model="motivoCurso" type="text" id="motivoCurso"
          placeholder="Justifica el motivo y curso" />

        <span class="custom-message-numAlumno"
          v-if="numAlumnos > ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada))">Máximo
          permitido: {{ ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ??
            cantidadSeleccionada)) }} alumnos</span>
        <span class="custom-message-numAlumno" v-else-if="numAlumnos <= 0">Mínimo permitido: 1 Alumno</span>
        <button
          v-if="numAlumnos && numAlumnos > 0 && numAlumnos <= ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada)) && profesorSeleccionado && motivoCurso"
          @click="saveChanges">Reservar</button>
        <button
          v-else-if="motivoCurso && numAlumnos && numAlumnos > 0 && numAlumnos <= ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada)) && rolesUsuario.includes('PROFESOR') && !rolesUsuario.includes('ADMINISTRADOR') && !rolesUsuario.includes('DIRECCION')"
          @click="saveChanges">Reservar</button>
        <button @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>

  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="3000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>
<script setup>

import { ref, onMounted, watch } from 'vue'
import { IonToast } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { getDiasSemana, getTramosHorarios, getRecursos, getReservas, postReserva, deleteReserva } from '@/services/bookings.js'
import { obtenerInfoUsuarios, obtenerRolesUsuario, obtenerEmailUsuario } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast.js';
import { obtenerConstantes } from '@/services/constantes';
import { bookingsApiUrl } from '@/environment/apiUrls';

// Variables reactivas
const diasSemanas = ref([])
const tramosHorarios = ref([])
const recursos = ref([])
const constantes = ref([]);
const reservas = ref({})
const users = ref([]);
const rolesUsuario = ref([]);
const recursoSeleccionado = ref('')
const cantidadSeleccionada = ref('')
const profesorSeleccionado = ref('')
const recursoSeleccionadoCompartible = ref(false)
const recursoSeleccionadoBloqueado = ref(false)
const isModalOpen = ref(false)
const correoProfesor = ref('')
const numAlumnos = ref('')
const motivoCurso = ref('')
const currentTramo = ref(null)
const currentDia = ref(null)
const valorConstante = ref('')
let mensajeColor = ''
let emailUserActual = '';
let logRecursos = '';
let mensajeInformativo = '';
let mensajeIncidencia = '';
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
    logRecursos = 'No hay recursos'
  }
};

const verificarConstantes = async () => {
  try {
    constantes.value = await obtenerConstantes(bookingsApiUrl + '/bookings/constants', toastMessage, toastColor, isToastOpen);

    const reservaDeshabilitada = constantes.value.find(c => c.clave === 'Reservas fijas');
    valorConstante.value = reservaDeshabilitada.valor
  }
  catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    throw new Error(error.message);
  }
}

const obtenerEmailUsuarioActual = async () => {
  emailUsuarioActual.value = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
};

// Función para abrir el modal
const openModal = (tramo, dia, email) => {

  if ((!rolesUsuario.value.includes('ADMINISTRADOR') && !rolesUsuario.value.includes('DIRECCION'))) {
    if (email !== undefined && email.includes(emailUsuarioActual.value)) {
      closeModal();
      return;
    }
  }

  if (recursoSeleccionadoCompartible.value) {
    currentTramo.value = tramo
    currentDia.value = dia
    correoProfesor.value = reservas[dia.id]?.[tramo.id]?.email || '' // Cargar correo si existe
    numAlumnos.value = reservas[dia.id]?.[tramo.id]?.nalumnos || 1 // Cargar número de alumnos si existe
    isModalOpen.value = true
    verificarConstantes()
    getReserva()
  }
  else {
    currentTramo.value = tramo
    currentDia.value = dia
    correoProfesor.value = reservas[dia.id]?.[tramo.id]?.email || '' // Cargar correo si existe
    numAlumnos.value = reservas[dia.id]?.[tramo.id]?.nalumnos || 1 // Cargar número de alumnos si existe
    isModalOpen.value = true
    verificarConstantes()
    getReserva()
  }
}

// Función para cerrar el modal
const closeModal = () => {
  isModalOpen.value = false
}

// Función para guardar los cambios (ahora usando `postReserva`)
const saveChanges = async () => {
  if (!currentDia.value || !currentTramo.value || !recursoSeleccionado.value) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'Faltan datos para guardar la reserva');
    return;
  }

  // Validar si ya existe un email en la reserva del mismo día y tramo
  const reservaExistente = reservas.value[currentTramo.value.id]?.[currentDia.value.id];
  if (reservaExistente && reservaExistente.email[0] && !recursoSeleccionadoCompartible.value) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'Ya existe una reserva con un email en este día y tramo.');
    return;
  }

  if (motivoCurso.value === '') {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'El campo "Motivo y Curso" es obligatorio');
    return;
  }

  try {
    let mensajeActualizacion = 'Reserva guardada correctamente';
    mensajeColor = 'success';

    // Normalizar número de alumnos
    let alumnos = Math.abs(parseInt(numAlumnos.value) || 0);
    const maxAlumnos = parseInt(cantidadSeleccionada.value) || 0;

    if (alumnos > maxAlumnos) {
      alumnos = maxAlumnos;
    }

    // Llamar a la API para guardar la reserva
    await postReserva(
      toastMessage,
      toastColor,
      isToastOpen,
      profesorSeleccionado.value || emailUsuarioActual.value,
      recursoSeleccionado.value,
      currentDia.value.id,
      currentTramo.value.id,
      alumnos,
      motivoCurso.value,
    );

    // Actualizar reservas localmente
    if (!reservas.value[currentDia.value.id]) {
      reservas.value[currentDia.value.id] = {};
    }

    reservas.value[currentDia.value.id][currentTramo.value.id] = {
      email: correoProfesor.value, // Guardamos el email del profesor
      nombreYapellidos: users.value.find(u => u.email === correoProfesor.value)?.nombre || correoProfesor.value,
      nalumnos: alumnos,
    };

    if (valorConstante.value != '' && !rolesUsuario.value.includes('ADMINISTRADOR') && !rolesUsuario.value.includes('DIRECCION')) {
      mensajeActualizacion = 'Error al crear la reserva -> ' + valorConstante.value;
      mensajeColor = 'danger';
    }

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
  }

  closeModal();
  motivoCurso.value = '';
  getReserva(recursoSeleccionado); // Actualizar reservas después de guardar
};


// Función para obtener los días de la semana
const getDiasSemanas = async () => {
  try {
    const data = await getDiasSemana(isToastOpen, toastMessage, toastColor)
    diasSemanas.value = data.map((item) => ({ diaSemana: item.diaSemana, id: item.id }))
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message)
  }
}

// Función para obtener los tramos horarios
const getTramosHorario = async () => {
  try {
    const data = await getTramosHorarios(isToastOpen, toastMessage, toastColor)
    tramosHorarios.value = data.map((item) => ({
      tramoHorario: item.tramoHorario,
      id: item.id,
    }))
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message)
  }
}

// Función para obtener los recursos
const getRecurso = async () => {
  try {
    const data = await getRecursos(isToastOpen, toastMessage, toastColor)
    recursos.value = data.map((item) => ({ recursos: item.id, cantidad: item.cantidad, esCompartible: item.esCompartible, bloqueado: item.bloqueado }))

    // Nos aseguraramos que recursos no está vacío antes de asignar
    if (recursos.value.length > 0) {
      recursoSeleccionado.value = recursos.value[0].recursos;
      cantidadSeleccionada.value = recursos.value[0].cantidad;
      recursoSeleccionadoCompartible.value = recursos.value[0].esCompartible;
      recursoSeleccionadoBloqueado.value = recursos.value[0].bloqueado;
    }
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message)
  }
}

// Función para obtener las reservas estructuradas
const getReserva = async () => {
  try {
    const recurso = recursoSeleccionado.value;
    const data = await getReservas(isToastOpen, toastMessage, toastColor, recurso)

    // Reestructurar reservas en un objeto organizado por tramos y días
    const estructuraReservas = {}

    for (let i = 0; i < data.length; i++) {
      const reserva = data[i]
      const tramo = reserva.tramoHorario
      const dia = reserva.diaSemana

      if (!estructuraReservas[tramo]) {
        estructuraReservas[tramo] = {}
      }

      estructuraReservas[tramo][dia] =
      {
        nalumnos: reserva.nalumnos,
        nombreYapellidos: reserva.nombreYapellidos,
        email: reserva.email,
        plazasRestantes: reserva.plazasRestantes,
        motivoCurso: reserva.motivoCurso,
      }
    }
    reservas.value = estructuraReservas
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message)
  }
}

const deleteReservas = async (tramo, dia, event, recursoSeleccionado, email) => {
  try {
    event.stopPropagation() // Evitar que se abra el modal al hacer clic en el botón

    // Llamar a la API para cancelar la reserva
    await deleteReserva(isToastOpen, toastMessage, toastColor, email, recursoSeleccionado, dia.id, tramo.id)

    mensajeColor = 'success'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'Reserva cancelada correctamente')
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message)
  }
  getReserva(recursoSeleccionado) // Actualizar reservas después de cancelar
}

// Watcher para actualizar cantidadSeleccionada cuando recursoSeleccionado cambie
watch(recursoSeleccionado, () => {
  const recursoEncontrado = recursos.value.find(
    (recurso) => recurso.recursos === recursoSeleccionado.value
  );
  cantidadSeleccionada.value = recursoEncontrado ? recursoEncontrado.cantidad : '';
  recursoSeleccionadoCompartible.value = recursoEncontrado ? recursoEncontrado.esCompartible : false;
  recursoSeleccionadoBloqueado.value = recursoEncontrado ? recursoEncontrado.bloqueado : false;
  isModalOpen.value = false

  if (recursoSeleccionadoCompartible.value) {
    mensajeInformativo = 'Recuerda, este recurso SÍ se puede compartir en el mismo tramo horario'
    mensajeIncidencia = '¿Encontraste algun problema en el aula o necesitas más recursos? Crea una incidencia '
  }
  else {
    mensajeInformativo = 'Recuerda, este recurso NO se puede compartir en el mismo tramo horario'
    mensajeIncidencia = '¿Encontraste algun problema en el aula? Crea una incidencia '
  }
  getReserva();
});
const router = useRouter();
const navigateToIssues = () => {
  router.push({ path: '/issues' });
};

const cargarDatos = async () => {
  users.value = await obtenerInfoUsuarios(isToastOpen, toastMessage, toastColor);
};

async function verificarRoles() {
  try {
    const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);
    rolesUsuario.value = roles; // Asigna los roles al array `rolesUsuario`
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
  }
}

// Ejecutar las funciones iniciales al montar el componente
onMounted(async () => {
  await getDiasSemanas()
  await getTramosHorario()
  await getRecurso()
  verificarRecursos()
  await getReserva()
  await cargarDatos()
  await verificarRoles()
  await obtenerEmailUsuarioActual()
  await verificarConstantes()
  emailUserActual = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen)

  emailLogged.value = emailUserActual;
})

</script>

<style scoped>
.valorConstante {
  color: #dc3545;
  padding: 10px;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 15px;
}

.mensajeInformativo {
  color: #007bff;
  padding: 10px;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 15px;
}

.mensajeInformativoBloqueo {
  color: #ff9900;
  padding: 10px;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 15px;
}

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

.custom-numAlumnos {
  margin-top: 10px;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

h1 {
  margin-bottom: -3%;
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

.div_profesor {
  padding: 6px;
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

.reservaHover:hover {
  /* Para que cuando se pase por encima de la tabla con el ratón se cambie el formato del ratón */
  cursor: pointer;
}

.reservaBloqueadaHover:hover {
  /* Para que cuando se pase por encima de la tabla con el ratón se cambie el formato del ratón */
  cursor: auto;
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

/* Contenedor que permite el scroll horizontal solo en móviles */
@media (max-width: 768px) {
  .tabla-container {
    overflow-x: auto;
    display: block;
    white-space: nowrap;
  }

  /* Hacer que los tramos se mantengan visibles (bloqueados) */
  .sticky-column {
    position: sticky;
    left: 0;
    background: white;
    /* Para que no se mezcle con otras celdas */
    z-index: 2;
  }

  .custom-select {
    width: 100%;
  }
}

.titulo-pagina {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 20px;
}

.incidence-message {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: var(--text-color-light);
}

.incidence-message a {
  color: var(--primary-color);
  text-decoration: underline;
}

.incidence-message a:hover {
  color: var(--primary-color-hover);
  cursor: pointer;
}
</style>
