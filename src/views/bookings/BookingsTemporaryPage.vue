<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <h1 class="titulo-pagina">Reservas Temporales</h1>
  <div class="container">
    <span class="valorConstante" v-if="valorConstante">{{ valorConstante }}</span>
    <span class="valorConstante" v-if="logRecursos">{{ logRecursos }}</span>
    <span class="mensajeInformativo" v-if="mensajeInformativo && valorConstante == ''">{{ mensajeInformativo }}</span>

    <div class="date-picker-container">
      <label for="start">Selecciona una fecha</label>
      <input type="date" id="start" name="trip-start" :value="fechaActual" :min="fechaInicioCurso" :max="fechaFinCurso"
        @change="actualizarSemana($event)" />
    </div>
    <br>
    <!-- Dropdown para seleccionar recurso -->
    <select class=" custom-select" v-model="recursoSeleccionado">
      <option v-for="(recurso, index) in recursos" :key="index" :value="recurso.recursos">
        {{ recurso.recursos }} (Máximo permitido: {{ recurso.cantidad }})
      </option>
    </select>

    <div class="incidence-message" v-if="recursoSeleccionadoCompartible">
      {{ mensajeIncidencia }} <a @click.prevent="navigateToIssues">aquí</a>
    </div>

    <div class="semana_button-container">
      <button class="semanaAnterior_button" @click.stop="decrementarSemana()"
        v-if="!deshabilitarSemanaAnterior()">Semana Anterior</button>
      <button class="semanaSiguiente_button" @click.stop="incrementarSemana()"
        v-if="!deshabilitarSemanaSiguiente()">Semana Siguiente</button>
    </div>

    <!-- Tabla con horarios y reservas -->
    <table class="tabla-container" v-if="mostrarTabla">
      <thead>
        <tr>
          <th class="sticky-column">Horarios</th>
          <th v-for="(dia, index) in diasSemanas" :key="index">
            {{ dia.diaSemana }}
          </th>
        </tr>
      </thead>
      <tbody v-if="valorConstante === ''">
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td class="sticky-column">{{ tramo.tramoHorario }}</td>
          <td class="reservaHover" v-for="(dia, index) in diasSemanas" :key="index" @click="openModal(tramo, dia)">
            <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos[0] > 0">
              <template v-for="(nombre, index) in reservas[tramo.id][dia.id].nombreYapellidos" :key="index">
                <div class="div_profesor">
                  {{ nombre }} <br>
                  (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos[index] }})

                  <div class="reservaFija" v-if="reservas[tramo.id][dia.id].esfija[index]">Fija</div>
                  <button
                    v-if="rolesUsuario.includes('ADMINISTRADOR') ||
                      (rolesUsuario.includes('PROFESOR') && reservas[tramo.id][dia.id].email[index] === emailUsuarioActual) && !reservas[tramo.id][dia.id].esfija"
                    @click.stop="deleteReservas(tramo, dia, $event, recursoSeleccionado, reservas[tramo.id][dia.id].email[index], !reservas[tramo.id][dia.id].esfija[index])">
                    Borrar
                  </button>
                </div>
              </template>
            </span>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="rolesUsuario.includes('ADMINISTRADOR')">
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td class="sticky-column">{{ tramo.tramoHorario }}</td>
          <td class="reservaHover" v-for="(dia, index) in diasSemanas" :key="index" @click="openModal(tramo, dia)">
            <span v-if="reservas[tramo.id]?.[dia.id] && reservas[tramo.id][dia.id].nalumnos[0] > 0">
              <template v-for="(nombre, index) in reservas[tramo.id][dia.id].nombreYapellidos" :key="index">
                <div class="div_profesor">
                  {{ nombre }} <br>
                  (Alumnos: {{ reservas[tramo.id][dia.id].nalumnos[index] }})

                  <button
                    v-if="rolesUsuario.includes('ADMINISTRADOR') ||
                      (rolesUsuario.includes('PROFESOR') && reservas[tramo.id][dia.id].email[index] === emailUsuarioActual)"
                    @click.stop="deleteReservas(tramo, dia, $event, recursoSeleccionado, reservas[tramo.id][dia.id].email[index], reservas[tramo.id][dia.id].esfija[index])">
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
                <div class="div_profesor">
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

        <label v-if="rolesUsuario.includes('ADMINISTRADOR')" for="profesorCorreo">Profesor:</label>
        <select v-if="rolesUsuario.includes('ADMINISTRADOR')" class="custom-select-modal"
          v-model="profesorSeleccionado">
          <option value="" disabled hidden>Seleccione un Profesor</option>
          <option v-for="user in users" :key="user.email" :value="user.email">
            {{ `${user.nombre} ${user.apellidos}` }}
          </option>
        </select>

        <label class="custom-numAlumnos" for="numAlumnos">Número de Alumnos:</label>
        <input class="custom-select-modal" v-model="numAlumnos" type="number" id="numAlumnos"
          placeholder="Número de alumnos" min="0"
          :max="((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada))" />
        <label>Opciones de Repetición:</label>

        <select class="custom-select-modal" v-model="opcionRepeticion">
          <option value="" selected>Ninguna</option>
          <option value="Semanal">Semanal</option>
        </select>
        <div class="date-picker-container-modal" v-if="opcionRepeticion != ''">
          <label for="start">Limite de Repetición</label>
          <input type="date" id="start" name="trip-start" v-model="fechaSeleccionada" :min="fechaInicioCurso"
            :max="fechaFinCurso" @change="fechaModal($event)" />
        </div>
        <span class="custom-message-numAlumno"
          v-if="numAlumnos > ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada))">Máximo
          permitido: {{ ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ??
            cantidadSeleccionada)) }} alumnos</span>
        <span class="custom-message-numAlumno" v-else-if="numAlumnos <= 0">Mínimo permitido: 1 Alumno</span>
        <button
          v-if="numAlumnos && numAlumnos > 0 && numAlumnos <= ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada)) && profesorSeleccionado && (opcionRepeticion == '' || fechaSeleccionada) && disponibleSemanal && comprobarDisponibilidad()"
          @click="saveChanges">Reservar</button>
        <button
          v-else-if="numAlumnos && numAlumnos > 0 && numAlumnos <= ((reservas[currentTramo?.id]?.[currentDia?.id]?.plazasRestantes ?? cantidadSeleccionada)) && rolesUsuario.includes('PROFESOR') && !rolesUsuario.includes('ADMINISTRADOR') && (opcionRepeticion == '' || fechaSeleccionada) && disponibleSemanal && comprobarDisponibilidad()"
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
import { getWeek, format, startOfWeek, addWeeks, getMonth } from 'date-fns';
import { getDiasSemana, getTramosHorarios, getRecursos, getReservasTemporary, postReservaTemporary, deleteReservaTemporary, deleteReserva, getCheckAvailable } from '@/services/bookings.js'
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
const isModalOpen = ref(false)
const correoProfesor = ref('')
const numAlumnos = ref('')
const currentTramo = ref(null)
const currentDia = ref(null)
let mensajeActualizacion = ''
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
const opcionRepeticion = ref('');
const disponibleSemanal = ref(false);

//Variables de Fecha
const fechaActual = ref(new Date().toISOString().slice(0, 10));
const fechaSeleccionada = ref('')
const fechaInicioCurso = ref('');
const fechaFinCurso = ref('');
const semana = ref('');
const semanas = ref([])
const semanaLimite = ref('');
const mes = ref('');
const day = ref('');
const month = ref('');
const preCargaSemana = ref('');
const fechaLimite = ref('');

// Obtener el año actual
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

// Verificar si estamos antes o después de septiembre
let inicioYear = currentYear;
let finYear = currentYear + 1;

if (currentDate.getMonth() >= 6) {
  // Si estamos después de junio, el curso pertenece al próximo ciclo
  inicioYear = currentYear;
  finYear = currentYear + 1;
} else if (currentDate.getMonth() < 6) {
  inicioYear = currentYear - 1;
  finYear = currentYear;
}

// Establecer las fechas de inicio y fin del curso
fechaInicioCurso.value = new Date(inicioYear, 8, 2).toISOString().slice(0, 10); // 1 de septiembre
fechaFinCurso.value = new Date(finYear, 5, 31).toISOString().slice(0, 10); // 30 de junio

const actualizarSemana = (event) => {
  event.stopPropagation();
  fechaSeleccionada.value = new Date(event.target.value);
  fechaActual.value = fechaSeleccionada.value.toISOString().slice(0, 10);
  semana.value = getWeek(fechaSeleccionada);
  mes.value = getMonth(fechaSeleccionada);
  validarFecha(); // Añadir validación de fecha
  getReserva();
  incrementarFecha();
}

const resetearSemana = () => {
  semana.value = getWeek(fechaActual.value);
}

const deshabilitarSemanaAnterior = () => {
  if (parseInt(semana.value) === parseInt(getWeek(fechaInicioCurso.value))) {
    return true;
  }
  return false;
}

const deshabilitarSemanaSiguiente = () => {
  if (parseInt(semana.value) === parseInt(getWeek(fechaFinCurso.value))) {
    return true;
  }
  return false;
}

const fechaModal = (event) => {
  event.stopPropagation();
  fechaSeleccionada.value = new Date(event.target.value).toISOString().slice(0, 10);
  fechaLimite.value = fechaSeleccionada.value;
  semanaLimite.value = getWeek(fechaLimite.value);
  mes.value = getMonth(fechaLimite.value) + 1;
}

const decrementarSemana = () => {

  semana.value = parseInt(semana.value) - 1;

  if (semana.value < 1) {
    semana.value = getWeek(new Date(new Date().getFullYear() - 1, 11, 31 - 7));
  }
  incrementarFecha();
  validarFecha(); // Añadir validación de fecha
  getReserva();
}

const incrementarSemana = () => {
  semana.value = parseInt(semana.value) + 1;
  if (semana.value > getWeek(new Date(new Date().getFullYear(), 11, 31 - 7))) {
    semana.value = 1;
  }
  incrementarFecha();
  validarFecha(); // Añadir validación de fecha
  getReserva();
}

const getDaysInMonth = (year, month) => {
  // Verificar si es año bisiesto para febrero
  if (month === 1) {
    return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 29 : 28;
  }
  const daysInMonth = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month];
}

const validarFecha = () => {
  const fecha = new Date(fechaActual.value);
  const mes = fecha.getMonth(); // 0-11
  const año = fecha.getFullYear();
  const diasEnMes = getDaysInMonth(año, mes);

  // Si el día actual es mayor que los días del mes
  if (parseInt(day.value) > diasEnMes) {
    // Ajustamos al último día del mes
    const ultimoDiaMes = new Date(año, mes, diasEnMes);
    fechaActual.value = ultimoDiaMes.toISOString().slice(0, 10);
    day.value = format(ultimoDiaMes, 'dd');
  }
}

const incrementarFecha = () => {
  const primerDiaSemana = startOfWeek(addWeeks(new Date(fechaActual.value), semana.value - getWeek(new Date(fechaActual.value))), { weekStartsOn: 1 });
  const fechaBase = new Date(primerDiaSemana);

  diasSemanas.value.forEach((dia, index) => {
    const fechaDia = new Date(fechaBase);
    fechaDia.setDate(fechaBase.getDate() + index);

    if (index === 0) {
      day.value = fechaDia.getDate().toString().padStart(2, '0');
      month.value = (fechaDia.getMonth() + 1).toString().padStart(2, '0');
    }
    const nombreDia = dia.diaSemana.split(' ')[0];
    dia.diaSemana = `${nombreDia} ${fechaDia.getDate()}/${(fechaDia.getMonth() + 1).toString().padStart(2, '0')}`;
  });
}

const repetirReserva = async () => {
  if (opcionRepeticion.value === 'Semanal') {
    do {
      await postReservaTemporary(
        isToastOpen,
        toastMessage,
        toastColor,
        profesorSeleccionado.value,
        recursoSeleccionado.value,
        currentDia.value.id,
        currentTramo.value.id,
        numAlumnos.value,
        +semana.value
      );
      semana.value = parseInt(semana.value) + 1;
    }
    while (semana.value <= semanaLimite.value);
    resetearSemana();
  }
  getReserva(recursoSeleccionado);
}

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

    const reservaDeshabilitada = constantes.value.find(c => c.clave === 'Reservas temporales');
    valorConstante.value = reservaDeshabilitada.valor
  }
  catch (error) {
    mensajeActualizacion = 'Error al obtener constantes';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    throw new Error(error.message);
  }
}

const obtenerEmailUsuarioActual = async () => {
  emailUsuarioActual.value = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
};

// Función para abrir el modal
const openModal = (tramo, dia) => {

  if (recursoSeleccionadoCompartible.value) {
    currentTramo.value = tramo
    currentDia.value = dia
    correoProfesor.value = reservas[dia.id]?.[tramo.id]?.email || '' // Cargar correo si existe
    numAlumnos.value = reservas[dia.id]?.[tramo.id]?.nalumnos || '' // Cargar número de alumnos si existe
    isModalOpen.value = true
    getReserva()
    verificarConstantes()
  }
  else {
    currentTramo.value = tramo
    currentDia.value = dia
    correoProfesor.value = reservas[dia.id]?.[tramo.id]?.email || '' // Cargar correo si existe
    numAlumnos.value = reservas[dia.id]?.[tramo.id]?.nalumnos || '' // Cargar número de alumnos si existe
    isModalOpen.value = true
    getReserva()
    verificarConstantes()
  }

}

// Función para cerrar el modal
const closeModal = () => {
  isModalOpen.value = false
}

// Función para guardar los cambios (ahora usando `postReserva`)
const saveChanges = async () => {
  if (!currentDia.value || !currentTramo.value || !recursoSeleccionado.value) {
    mensajeActualizacion = 'Faltan datos para guardar la reserva';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  // Validar si ya existe un email en la reserva del mismo día y tramo
  const reservaExistente = reservas.value[currentTramo.value.id]?.[currentDia.value.id];
  if (reservaExistente && reservaExistente.email[0] && !recursoSeleccionadoCompartible.value) {
    mensajeActualizacion = 'Ya existe una reserva con un email en este día y tramo.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  try {
    mensajeActualizacion = 'Reserva guardada exitosamente';
    mensajeColor = 'success';

    // Normalizar número de alumnos
    let alumnos = Math.abs(parseInt(numAlumnos.value) || 0);
    const maxAlumnos = parseInt(cantidadSeleccionada.value) || 0;

    if (alumnos > maxAlumnos) {
      alumnos = maxAlumnos;
    }

    if (opcionRepeticion.value === 'Semanal') {
      repetirReserva();
      getReserva(recursoSeleccionado);
    }
    else {
      // Llamar a la API para guardar la reserva
      await postReservaTemporary(
        isToastOpen,
        toastMessage,
        toastColor,
        profesorSeleccionado.value,
        recursoSeleccionado.value,
        currentDia.value.id,
        currentTramo.value.id,
        alumnos,
        +semana.value
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

      if (valorConstante.value != '') {
        mensajeActualizacion = 'Error al crear la reserva -> ' + valorConstante.value;
        mensajeColor = 'danger';
      }
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    }
  } catch (error) {
    mensajeActualizacion = 'Error al crear la reserva';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);

  }

  closeModal();
  getReserva(recursoSeleccionado); // Actualizar reservas después de guardar
};


// Función para obtener los días de la semana
const getDiasSemanas = async () => {
  try {
    const data = await getDiasSemana(isToastOpen, toastMessage, toastColor)
    diasSemanas.value = data.map((item) => ({ diaSemana: item.diaSemana, id: item.id }))
  }
  catch (error) {
    mensajeActualizacion = 'Error obteniendo los días de la semana'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
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
    mensajeActualizacion = 'Error obteniendo los tramos horarios'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

// Función para obtener los recursos
const getRecurso = async () => {
  try {
    const data = await getRecursos(isToastOpen, toastMessage, toastColor)
    recursos.value = data.map((item) => ({ recursos: item.id, cantidad: item.cantidad, esCompartible: item.esCompartible }))

    // Nos aseguraramos que recursos no está vacío antes de asignar
    if (recursos.value.length > 0) {
      recursoSeleccionado.value = recursos.value[0].recursos;
      cantidadSeleccionada.value = recursos.value[0].cantidad;
      recursoSeleccionadoCompartible.value = recursos.value[0].esCompartible;
    }
  }
  catch (error) {
    mensajeActualizacion = 'Error obteniendo los recursos'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

// Función para obtener las reservas estructuradas
const getReserva = async () => {
  const recurso = recursoSeleccionado.value;
  preCargaSemana.value = getWeek(new Date());
  mes.value = getMonth(new Date()) + 1;

  if (!semana.value) {
    semana.value = preCargaSemana.value;
  }

  const data = await getReservasTemporary(isToastOpen, toastMessage, toastColor, recurso, +semana.value)

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
      esfija: reserva.esfija
    }
  }
  reservas.value = estructuraReservas
}

const deleteReservas = async (tramo, dia, event, recursoSeleccionado, email, esFija) => {
  try {
    event.stopPropagation() // Evitar que se abra el modal al hacer clic en el botón

    // Llamar a la API para cancelar la reserva
    if (rolesUsuario.value.includes('ADMINISTRADOR')) {
      if (!esFija) {
        await deleteReserva(isToastOpen, toastMessage, toastColor, email, recursoSeleccionado, dia.id, tramo.id)
      }
      else {
        await deleteReservaTemporary(isToastOpen, toastMessage, toastColor, email, recursoSeleccionado, dia.id, tramo.id, +semana.value)
      }
    }
    else {
      await deleteReservaTemporary(isToastOpen, toastMessage, toastColor, email, recursoSeleccionado, dia.id, tramo.id, +semana.value)
    }
    mensajeActualizacion = 'Reserva cancelada exitosamente'
    mensajeColor = 'success'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
  catch (error) {
    mensajeActualizacion = 'No se pueden eliminar las reservas fijas desde las temporales'
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
  recursoSeleccionadoCompartible.value = recursoEncontrado ? recursoEncontrado.esCompartible : false;
  isModalOpen.value = false

  if (recursoSeleccionadoCompartible.value) {
    mensajeInformativo = 'Recuerda, este recurso SÍ se puede compartir en el mismo tramo horario'
    mensajeIncidencia = '¿Necesitas más recursos? Crea una incidencia '
  }
  else {
    mensajeInformativo = ''
    mensajeIncidencia = ''
  }
  getReserva();
});


const cargarDatos = async () => {
  users.value = await obtenerInfoUsuarios(isToastOpen, toastMessage, toastColor);
};

async function verificarRoles() {
  try {
    const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);
    rolesUsuario.value = roles; // Asigna los roles al array `rolesUsuario`
  }
  catch (error) {
    mensajeActualizacion = 'Error al verificar roles'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const comprobarDisponibilidad = async () => {

  const data = ref(false);

  // Array para almacenar las semanas

  if (opcionRepeticion.value == 'Semanal') {
    for (let i = +semana.value; i <= getWeek(fechaLimite.value); i++) {
      semanas.value.push(i);  // Se agrega la semana al array
    }
    data.value = await getCheckAvailable(isToastOpen, toastMessage, toastColor, currentDia.value.id, recursoSeleccionado.value, currentTramo.value.id, numAlumnos.value, semanas.value);
  }
  disponibleSemanal.value = data.value;
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
  semana.value = getWeek(new Date());
  emailLogged.value = emailUserActual;
  await incrementarFecha();


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
  color: #ffae00;
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

.mensajeInformativo {
  color: #007bff;
  padding: 10px;
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 15px;
}

.custom-select-modal {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #007bff;
  outline: none;
  cursor: pointer;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

.date-picker-container-modal {
  display: flex;
  margin-top: 10px;
  margin-right: 10%;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  font-family: Arial, sans-serif;
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

/* Estilo para el contenedor del input */
.date-picker-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  font-family: Arial, sans-serif;
}

/* Etiqueta asociada */
label {
  font-weight: bold;
  color: #555;
}

/* Estilo para el input */
input[type="date"] {
  padding: 10px;
  margin-left: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  color: #ffffff;
  background-color: #0078d7;
  transition: all 0.3s ease;
}

/* Estilo al hacer hover */
input[type="date"]:hover {
  border-color: #0078d7;
  background-color: #353030;
}

/* Estilo al estar en focus */
input[type="date"]:focus {
  outline: none;
  border-color: #0078d7;
  box-shadow: 0 0 5px rgba(0, 120, 215, 0.5);
  background-color: #242222;
}

/* Estilo cuando el campo está deshabilitado */
input[type="date"]:disabled {
  background-color: #e9e9e9;
  border-color: #d3d3d3;
  color: #a9a9a9;
}

.titulo-pagina {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 20px;
}

.custom-message-numAlumno {
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 5px;
}

.reservaFija {
  background-color: #28a745;
  color: white;
  padding: 5px;
  border-radius: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  margin-right: 5px;
  cursor: pointer;
}

.semana_button-container {
  justify-content: space-between;
  width: 100%;
}

.semanaAnterior_button {
  background-color: #007bff;
  color: white;
  float: left;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
}

.semanaSiguiente_button {
  background-color: #007bff;
  color: white;
  float: right;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
  cursor: pointer;
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