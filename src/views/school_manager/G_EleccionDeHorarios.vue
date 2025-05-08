<script setup>
import { computed, onMounted, ref } from 'vue';
import { IonToast, IonInput } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { obtenerRolesUsuario, obtenerEmailUsuario } from '@/services/firebaseService';
import { useConstanteSolicitudes } from '@/services/useConstanteSolicitudes.js'
import {
  asignarAsignatura,
  obtenerAsignaturas,
  obtenerGruposDeAsignaturas,
  obtenerProfesores,
  obtenerReducciones,
  asignarReducciones,
  obtenerDiasTramosTipoHorario,
  obtenerSolicitudes,
  eliminarSolicitudes,
  guardarSolicitudes,
  actualizarObservaciones
} from "@/services/schoolManager.js";

const rolesUsuario = ref([]);
const profesorSeleccionado = ref('');
const listaProfesores = ref([]);
const reduccionSeleccionada = ref('');
const listaReducciones = ref([]);
const asignaturaSeleccionada = ref('');
const listaAsignaturas = ref([]);
const listaAsignaturasReducciones = ref([]);
const isOn = ref(false)
const tramoHorarioSeleccionado = ref('');
const tramoHorarioSeleccionado2 = ref('');
const tramoHorarioSeleccionado3 = ref('');
const listaTramoHorarioSeleccionado = ref([]);
const emailUsuarioActual = ref(null);
const trabajarPrimeraHoraSeleccionado = ref(false);
const otrasObservacionesSeleccionado = ref('');
const listaGrupos = ref([]);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

//FUNCION PARA DESHABILITAR EN FUNCION DE LA CONSTANTE DE LA VENTANA DE ADMINISTRACION
async function antesDe(actionFn) {
  await cargar()
  console.log('isDeshabilitada=', isDeshabilitada.value)
  if (isDeshabilitada.value) {
    return
  }
  return actionFn()
}

const { isDeshabilitada, cargar } = useConstanteSolicitudes()

const toggle = () => {
  isOn.value = !isOn.value
}

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

const obtenerEmailUsuarioActual = async () => {
  emailUsuarioActual.value = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
};

const obtenerProfesor = async () => {

  try {

    const data = await obtenerProfesores(toastMessage, toastColor, isToastOpen);
    listaProfesores.value = data;

    profesorSeleccionado.value = '';

    await obtenerSolicitud();
    await obtenerListaAsignaturas();

  } catch (error) {
    mensajeActualizacion = 'Error al cargar los profesores.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerListaAsignaturas = async () => {
  try {
    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const data = await obtenerAsignaturas(emailDestino, toastMessage, toastColor, isToastOpen);
    listaAsignaturas.value = data;
  } catch (error) {
    console.error(error);
  }
};

const asignacionDeAsignaturas = async () => {
  try {

    if (profesorSeleccionado.value !== '') {
      await asignarAsignatura(
        asignaturaSeleccionada.value.nombre,
        asignaturaSeleccionada.value.horas,
        asignaturaSeleccionada.value.curso,
        asignaturaSeleccionada.value.etapa,
        asignaturaSeleccionada.value.grupo,
        profesorSeleccionado.value.email,
        toastMessage, toastColor, isToastOpen);
    }
    else {
      // Primero obtener la lista completa de profesores y sus asignaturas
      const todosLosProfesores = await obtenerProfesores(toastMessage, toastColor, isToastOpen);

      // Buscar si la asignatura ya está asignada a algún profesor
      for (const profesor of todosLosProfesores) {
        const solicitudes = await obtenerSolicitudes(profesor.email, toastMessage, toastColor, isToastOpen);

        const asignaturaExistente = solicitudes.asigunaturas.find(item =>
          item.nombreAsignatura === asignaturaSeleccionada.value.nombre &&
          item.curso === asignaturaSeleccionada.value.curso &&
          item.etapa === asignaturaSeleccionada.value.etapa &&
          item.grupo === asignaturaSeleccionada.value.grupo
        );

        if (asignaturaExistente) {
          mensajeActualizacion = `Esta asignatura ya está asignada al profesor ${profesor.nombre} ${profesor.apellidos}`;
          mensajeColor = "danger";
          crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
          return;
        }
      }

      await asignarAsignatura(
        asignaturaSeleccionada.value.nombre,
        asignaturaSeleccionada.value.horas,
        asignaturaSeleccionada.value.curso,
        asignaturaSeleccionada.value.etapa,
        asignaturaSeleccionada.value.grupo,
        emailUsuarioActual.value,
        toastMessage, toastColor, isToastOpen);
    }

    await obtenerSolicitud();

    mensajeActualizacion = "Asignación de asignatura realizada correctamente.";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  } catch (error) {
    mensajeActualizacion = 'Error al cargar las reducciones.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
}

const obtenerListaReducciones = async () => {

  try {

    const data = await obtenerReducciones(toastMessage, toastColor, isToastOpen);
    listaReducciones.value = data;
    console.log(listaReducciones.value)

  } catch (error) {
    mensajeActualizacion = 'Error al cargar las reducciones.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const asignarReduccion = async () => {
  try {
    if (profesorSeleccionado.value !== '') {
      await asignarReducciones(
        profesorSeleccionado.value.email,
        reduccionSeleccionada.value.nombre,
        reduccionSeleccionada.value.horas,
        toastMessage, toastColor, isToastOpen);
    }
    else {
      await asignarReducciones(
        emailUsuarioActual.value,
        reduccionSeleccionada.value.nombre,
        reduccionSeleccionada.value.horas,
        toastMessage, toastColor, isToastOpen);
    }

    await obtenerSolicitud();

    mensajeActualizacion = "Asignación de reducción realizada correctamente.";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  } catch (error) {
    mensajeActualizacion = 'Error al cargar las reducciones.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerDiaTramoTipoHorario = async () => {
  try {

    listaTramoHorarioSeleccionado.value = await obtenerDiasTramosTipoHorario(tramoHorarioSeleccionado.value, toastMessage, toastColor, isToastOpen);

  } catch (error) {
    mensajeActualizacion = 'Error al cargar los tramos horarios.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const trabajarPrimeraHora = computed(() => {
  return trabajarPrimeraHoraSeleccionado.value === 'Opción 1';
});

const actualizarObservacion = async () => {
  try {
    // Array con los tramos horarios seleccionados
    const tramos = [
      tramoHorarioSeleccionado.value,
      tramoHorarioSeleccionado2.value,
      tramoHorarioSeleccionado3.value,
    ];

    // Iteramos sobre los tramos y envíamos una solicitud por cada uno
    for (const tramo of tramos) {
      if (tramo) {
        // Llama al método para enviar los datos al backend
        await actualizarObservaciones(isOn.value, trabajarPrimeraHora.value, otrasObservacionesSeleccionado.value || '', tramo.dia, tramo.tramo, tramo.tipoHorario, emailUsuarioActual.value,
          toastMessage, toastColor, isToastOpen);
      }
    }
    mensajeActualizacion = 'Observaciones actualizadas correctamente'
    mensajeColor = 'success'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  } catch (error) {
    mensajeActualizacion = 'Error al actualizar las observaciones'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const obtenerSolicitud = async () => {
  try {

    let solicitudes = null;
    if (profesorSeleccionado.value !== undefined) {

      solicitudes = await obtenerSolicitudes(profesorSeleccionado.value.email, toastMessage, toastColor, isToastOpen);

    }
    if (rolesUsuario.value.includes('PROFESOR') && !(rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))) {
      solicitudes = await obtenerSolicitudes(emailUsuarioActual.value, toastMessage, toastColor, isToastOpen);
    }

    listaGrupos.value = [];

    listaAsignaturasReducciones.value = [
      ...solicitudes.asigunaturas.map(a => ({
        ...a,
        horasMax: a.horasAsignatura,              //Maximo original
        horasSeleccionadas: a.cupoHorasAsignatura,    //Las horas que se quieren
        grupoOriginal: a.grupo,                   // Grupo original
        grupoSeleccionado: a.grupo                // Grupo que se quiere cambiar
      })),
      ...solicitudes.reduccionAsignadas
    ];
    console.log(listaAsignaturasReducciones.value);

    for (let i = 0; i < listaAsignaturasReducciones.value.length; i++) {
      if (listaAsignaturasReducciones.value[i].tipo === 'Asignatura') {
        await obtenerGrupoDeAsignatura(i);
      }
    }
  }
  catch (error) {
    mensajeActualizacion = 'Error al obtener solicitudes'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const obtenerGrupoDeAsignatura = async (index) => {
  try {
    const asignatura = listaAsignaturasReducciones.value[index];

    if (asignatura.tipo !== 'Asignatura') return;

    const grupos = await obtenerGruposDeAsignaturas(
      asignatura.nombreAsignatura,
      asignatura.horasAsignatura,
      asignatura.curso,
      asignatura.etapa,
      toastMessage,
      toastColor,
      isToastOpen
    );

    // Inicializa el array si no existe
    if (!listaGrupos.value[index]) {
      listaGrupos.value[index] = [];
    }

    // Asigna los grupos directamente
    listaGrupos.value[index] = grupos;

    console.log('Grupos obtenidos:', grupos);

  } catch (error) {
    console.error(error);
  }
};

const eliminarSolicitud = async (index) => {
  try {
    const solicitud = listaAsignaturasReducciones.value[index];
    console.log(solicitud);

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const data = {
      email: emailDestino,
      nombreAsignatura: solicitud.nombreAsignatura,
      horasAsignatura: solicitud.horasSeleccionadas,
      curso: solicitud.curso,
      etapa: solicitud.etapa,
      grupo: solicitud.grupo,
      nombreReduccion: solicitud.nombreReduccion,
      horasReduccion: solicitud.horasReduccion,
    };
    await eliminarSolicitudes(data, toastMessage, toastColor, isToastOpen);

    // Elimina la solicitud de la lista
    listaAsignaturasReducciones.value.splice(index, 1);
    mensajeActualizacion = 'Solicitud eliminada correctamente'
    mensajeColor = 'success'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
  catch (error) {
    mensajeActualizacion = 'Error al eliminar solicitud'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const guardarSolicitud = async (index) => {
  try {

    const solicitud = listaAsignaturasReducciones.value[index];

    let data = null;
    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    data = {
      email: emailDestino,
      nombreAsignatura: solicitud.nombreAsignatura,
      horasAsignatura: solicitud.horasSeleccionadas,
      curso: solicitud.curso,
      etapa: solicitud.etapa,
      grupoAntiguo: solicitud.grupoOriginal,
      grupoNuevo: solicitud.grupoSeleccionado,
      nombreReduccion: solicitud.nombreReduccion,
      horasReduccion: solicitud.horasReduccion,
    };

    await guardarSolicitudes(data, toastMessage, toastColor, isToastOpen);

    mensajeActualizacion = 'Solicitud guardada correctamente'
    mensajeColor = 'success'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
  catch (error) {
    mensajeActualizacion = 'Error al guardar solicitud'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const guardarTodo = async () => {

  const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
    ? profesorSeleccionado.value.email
    : emailUsuarioActual.value;

  for (let index = 0; index < listaAsignaturasReducciones.value.length; index++) {
    const solicitud = listaAsignaturasReducciones.value[index];
    const data = {
      email: emailDestino,
      nombreAsignatura: solicitud.nombreAsignatura,
      horasAsignatura: solicitud.horasSeleccionadas,
      curso: solicitud.curso,
      etapa: solicitud.etapa,
      grupoAntiguo: solicitud.grupoOriginal,
      grupoNuevo: solicitud.grupoSeleccionado,
      nombreReduccion: solicitud.nombreReduccion,
      horasReduccion: solicitud.horasReduccion,
    };

    try {
      await guardarSolicitudes(data, toastMessage, toastColor, isToastOpen);

      mensajeActualizacion = 'Todas las solicitudes guardadas correctamente'
      mensajeColor = 'success'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
    }
    catch (error) {
      mensajeActualizacion = 'Error al guardar todas las solicitudes'
      mensajeColor = 'danger'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
    }
  }
}

const handleAsignarAsignatura = () => antesDe(() => asignacionDeAsignaturas())
const handleAsignarReduccion = () => antesDe(() => asignarReduccion())
const handleGuardarSolicitud = (index) => antesDe(() => guardarSolicitud(index))
const handleEliminarSolicitud = (index) => antesDe(() => eliminarSolicitud(index))
const handleActualizarObservaciones = () => antesDe(() => actualizarObservacion())
const handleGuardarTodo = () => antesDe(() => guardarTodo())

onMounted(async () => {
  await cargar();
  await verificarRoles();
  await obtenerEmailUsuarioActual();
  await obtenerProfesor();
  await obtenerListaReducciones();
  await obtenerDiaTramoTipoHorario();
  if (!(rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))) {
    await obtenerListaAsignaturas();
    await obtenerSolicitud();
  }
});

</script>

<template>
  <h1 class="t-1">Elección de horarios</h1>
  <div v-if="isDeshabilitada" class="constante">¡No puedes elegir más asignaturas o reducciones!</div>
  <div class="top-section">
    <!-- Tarjeta para asignar las asignaturas, las reducciones y indicar observaciones personales -->
    <div class="card-asignaturas-reducciones">
      <div class="t-2">Asignaturas y reducciones</div>
      <!-- Contenedor para hacer una columna -->
      <div class="top-container">
        <!-- Dropdowns que aparece si eres dirección o administrador -->
        <div class="dropdowns">
          <label class="form-label" v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')"
            for="profesor-select">Profesor:
          </label>
          <select v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')"
            id="profesor-select" v-model="profesorSeleccionado" @change="async () => {
              await obtenerSolicitud();
              await obtenerListaAsignaturas();
            }" class="dropdown-select">
            <option value="">Selecciona un profesor</option>
            <option v-for="profesor in listaProfesores" :key="profesor" :value="profesor">
              {{ profesor.nombre }} {{ profesor.apellidos }}
            </option>
          </select>
        </div>
        <!-- Contenedor para hacer filas -->
        <div class="top-section">
          <div class="dropdowns">
            <label for="asignatura-select">Asignatura:</label>
            <select id="asignatura-select" v-model="asignaturaSeleccionada" class="dropdown-select">
              <option value="" disabled hidden>Selecciona una asignatura</option>
              <option v-for="asignatura in listaAsignaturas" :key="asignatura" :value="asignatura">
                {{ asignatura.nombre }} ({{ asignatura.horas }} horas) - {{ asignatura.curso }} {{ asignatura.etapa }}
                {{ asignatura.grupo }}
              </option>
            </select>
            <button class="btn-asignar" :disabled="isDeshabilitada" @click="handleAsignarAsignatura">Asignar</button>
          </div>
          <div class="dropdowns">
            <label for="reduccion-select">Reducción:</label>
            <select id="reduccion-select" v-model="reduccionSeleccionada" @change="obtenerSolicitud"
              class="dropdown-select">
              <option value="" disabled hidden>Selecciona una reducción</option>
              <option v-for="reduccion in listaReducciones" :key="reduccion.id" :value="reduccion">
                {{ reduccion.nombre }} ({{ reduccion.horas }} horas)
              </option>
            </select>
            <button class="btn-asignar" :disabled="isDeshabilitada" @click="handleAsignarReduccion">Asignar</button>
          </div>
        </div>
      </div>
      <div class="t-2">Preferencias horarias personales</div>
      <div class="top-content">
        <!-- Boton switch -->
        <div class="switch" @click="toggle">
          <div :class="['option', !isOn ? 'active' : '']">No</div>
          <div :class="['option', isOn ? 'active on' : '']">Si</div>
        </div>
        <div class="t-3">¿Solicitaste conciliación familiar?</div>
      </div>
      <hr class="separator-line" />
      <!-- Botón radio -->
      <div class="t-4">Independientemente de la respuesta anterior, elige la opción que desearías:</div>
      <div class="t-5">
        <input type="radio" id="opcion1" name="opcion" :value="true" v-model="trabajarPrimeraHoraSeleccionado">
        <label for="opcion1"> No tener clase a primera hora</label>
      </div>
      <div class="t-5">
        <input type="radio" id="opcion2" name="opcion" :value="false" v-model="trabajarPrimeraHoraSeleccionado">
        <label for="opcion2"> No tener clase a ultima hora</label>
      </div>
      <hr class="separator-line" />
      <!-- Dropdowns -->
      <div class="t-6">Elige tres horas que te gustaría no tener clase, exceptuando la última del viernes y la primera
        del lunes:</div>
      <div class="top-content">
        <div>
          <select id="tramoHorario-select" v-model="tramoHorarioSeleccionado" class="dropdown-select-hours">
            <option value="">Elige una hora</option>
            <option v-for="tramoHorario in listaTramoHorarioSeleccionado" :key="tramoHorario" :value="tramoHorario">
              {{ tramoHorario.dia }} {{ tramoHorario.tramo }}ª hora - {{ tramoHorario.tipoHorario }}
            </option>
          </select>
        </div>
        <div>
          <select id="tramoHorario-select" v-model="tramoHorarioSeleccionado2" class="dropdown-select-hours">
            <option value="" disabled hidden>Elige una hora</option>
            <option v-for="tramoHorario in listaTramoHorarioSeleccionado" :key="tramoHorario" :value="tramoHorario">
              {{ tramoHorario.dia }} {{ tramoHorario.tramo }}ª hora - {{ tramoHorario.tipoHorario }}
            </option>
          </select>
        </div>
        <div>
          <select id="tramoHorario-select" v-model="tramoHorarioSeleccionado3" class="dropdown-select-hours">
            <option value="" disabled hidden>Elige una hora</option>
            <option v-for="tramoHorario in listaTramoHorarioSeleccionado" :key="tramoHorario" :value="tramoHorario">
              {{ tramoHorario.dia }} {{ tramoHorario.tramo }}ª hora - {{ tramoHorario.tipoHorario }}
            </option>
          </select>
        </div>
      </div>
      <hr class="separator-line" />
      <!-- Texto con otras observaciones -->
      <div class="t-6">Escribe otras observaciones
        <div class="info-circle">
          i
          <div class="tooltip">Solamente si quieren guardias de recreo, recursos necesarios, alternancia de clases con
            horas de descanso de voz, ...</div>
        </div>
      </div>
      <ion-input type="text" v-model="otrasObservacionesSeleccionado" placeholder="Observaciones" class="form-input" />
      <!-- Botón para guardar las observaciónes -->
      <button @click="handleActualizarObservaciones()" :disabled="isDeshabilitada" class="btn-actualizar">Actualizar observaciones</button>
    </div>
    <!-- Tabla con todas las asignaturas y reducciones elegidas por el profesor -->
    <div class="card-solicitudes">
      <div class="t-2">Tus solicitudes</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="columna">Eliminar</th>
              <th class="columna">Tipo</th>
              <th class="columna">Nombre</th>
              <th class="columna">Horas</th>
              <th class="columna">Curso</th>
              <th class="columna">Etapa</th>
              <th class="columna">Grupo</th>
              <th v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')" class="columna">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(asignaturaReduccion, index) in listaAsignaturasReducciones" :key="index">
              <td class="columna">
                <button @click="handleEliminarSolicitud(index)" :disabled="isDeshabilitada" class="btn-eliminar">&times;</button>
              </td>
              <td class="columna">{{ asignaturaReduccion.tipo }}</td>
              <td class="columna">{{ asignaturaReduccion.tipo === 'Asignatura' ? asignaturaReduccion.nombreAsignatura :
                asignaturaReduccion.nombreReduccion }}</td>
              <td class="columna">
                <span v-if="asignaturaReduccion.tipo === 'Asignatura'">
                  <span v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
                    <select v-model="asignaturaReduccion.horasSeleccionadas" class="dropdown-select-solicitudes">
                      <option value="" disabled hidden>Selecciona horas</option>
                      <option v-for="n in asignaturaReduccion.horasMax" :key="n" :value="n">{{ n }}</option>
                    </select>
                  </span>
                  <span v-else>{{ asignaturaReduccion.horasSeleccionadas }}</span>
                </span>
                <span v-else>{{ asignaturaReduccion.horasReduccion }}</span>
              </td>
              <td class="columna">{{ asignaturaReduccion.tipo === 'Asignatura' ? asignaturaReduccion.curso : '-' }}</td>
              <td class="columna">{{ asignaturaReduccion.tipo === 'Asignatura' ? asignaturaReduccion.etapa : '-' }}</td>
              <td class="columna">
                <span v-if="asignaturaReduccion.tipo === 'Asignatura'">
                  <span v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
                    <select id="grupo-select" v-model="asignaturaReduccion.grupoSeleccionado"
                      @change="obtenerGrupoDeAsignatura(index)" class="dropdown-select-solicitudes">
                      <option v-for="grupo in listaGrupos[index]" :key="grupo" :value="grupo.grupo">
                        {{ grupo.grupo }}
                      </option>
                    </select>
                  </span>
                  <span v-else>-</span>
                </span>
                <span v-else>-</span>
              </td>
              <td v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')" class="columna">
                <button @click="handleGuardarSolicitud(index)" :disabled="isDeshabilitada" class="btn">Guardar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button v-if="(listaAsignaturasReducciones.length > 0) && (rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION'))" :disabled="isDeshabilitada" class="btn-guardar-todo" @click="handleGuardarTodo">Guardar
        todo</button>
    </div>
  </div>
  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top">
  </ion-toast>
</template>

<style scoped>
.t-1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.constante {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #EF4444;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card-asignaturas-reducciones {
  max-width: 530px;
  min-height: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.t-2 {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1.5rem;
}

.top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;
}

.dropdowns {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.dropdowns label {
  margin-bottom: 0.8rem;
  margin-left: 0rem;
}

.dropdown-select {
  width: 225px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.btn-asignar {
  width: 160px;
  padding: 0.4rem;
  border: 1px solid;
  border-radius: 0.375rem;
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
  align-self: center;
  margin-top: 1rem;
}

/* Botón sitch de si o no */
.switch {
  display: flex;
  border: 1px solid #888;
  border-radius: 5px;
  overflow: hidden;
  width: 100px;
  cursor: pointer;
  margin-left: 1rem;
}

.option {
  flex: 1;
  text-align: center;
  padding: 5px 10px;
  background-color: #ccc;
  color: black;
  transition: 0.3s;
}

.option.active {
  background-color: #EF4444;
  color: white;
  font-weight: bold;
}

.option.on {
  background-color: green;
}

.option:not(.active) {
  background-color: #ddd;
}

.t-3 {
  font-size: 1.15rem;
  margin-left: 1rem;
}

.t-4 {
  font-size: 1.15rem;
  margin-left: 1rem;
}

.t-5 {
  font-size: 1.15rem;
  margin-left: 1rem;
  margin-top: 0.5rem;
}

.t-6 {
  font-size: 1.15rem;
  margin-left: 1rem;
}

.separator-line {
  border: none;
  border-top: 1.3px solid #b8b8b8;
  margin: 0.8rem 0;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.dropdown-select-hours {
  width: 143px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
  margin-left: 1rem;
}

.dropdown-select-solicitudes {
  width: 50px;
  padding: 0.5rem;
  border-radius: 3px;
  border: 1px solid currentColor;
}

/* Circulo de información */
.info-circle {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #4782eb;
  color: white;
  text-align: center;
  line-height: 24px;
  cursor: pointer;
  position: relative;
}

.info-circle:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.tooltip {
  visibility: hidden;
  opacity: 0;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 5px 10px;
  position: absolute;
  z-index: 1;
  bottom: 130%;
  /* posición arriba del icono */
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.3s;
  white-space: nowrap;
  margin-left: 10rem;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  /* flecha apunta hacia abajo */
  left: 50%;
  margin-left: 5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

.top-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 1rem;
}

.form-input {
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid currentColor;
  padding: 0.5rem;
  max-width: 450px;
  margin-left: 1rem;
}

.btn-actualizar {
  background-color: #3B82F6;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  margin-top: 2rem;
  margin-left: 15px;
  margin-right: 15px;
}

.card-solicitudes {
  min-width: 750px;
  min-height: 859px;
  height: 300px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  height: 300px;
  width: 300px;
}

.table-wrapper {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.columna {
  width: 12, 5%;
  border: 1px solid currentColor;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.btn-eliminar {
  color: #EF4444;
  font-size: 2rem;
  background-color: transparent;
  line-height: 1;
  border: none;
}

.dropdown-group {
  width: 100px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.btn {
  padding: 0.5rem;
  border: 1px solid;
  border-radius: 0.375rem;
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
}

.btn-guardar-todo {
  width: 170px;
  padding: 0.5rem;
  border: 1px solid;
  border-radius: 0.375rem;
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-top: 15px;
  margin-bottom: 5px;
  position: sticky;
  top: 0;
  left: 550px;
}

@media (prefers-color-scheme: dark) {

  .card-asignaturas-reducciones,
  .card-solicitudes {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .btn-asignar,
  .option.active,
  .info-circle,
  .btn-actualizar,
  .btn,
  .btn-guardar-todo {
    color: black;
  }

  .separator-line {
    border-top: 1.3px solid #949494;
  }

  .dropdown-select-solicitudes {
    background-color: #353c36;
    border: 1px solid #828181;
  }
}

@media ((min-width: 768px) and (max-width: 1422px)) {

  .card-solicitudes {
    min-width: 420px;
  }

  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: calc(100% - 180px);
  }
}

@media (max-width: 768px) {
  .card-asignaturas-reducciones {
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }

  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 160px;
  }

  .dropdowns {
    margin-top: 0.4rem;
  }

  .top-content {
    display: flex;
    flex-direction: column;
    margin-top: -1rem;
  }

  .dropdown-select-hours {
    width: 100%;
    margin-top: 1.1rem;
  }

  .card-solicitudes {
    min-width: 390px;
    min-height: 100%;
    margin-right: 5px;
    padding-right: 25px;
  }
}

@media (max-width: 500px) {
  .card-asignaturas-reducciones {
    min-width: 100%;
    min-height: 100%;
    margin-right: 5px;
  }

  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 0;
  }

  .dropdowns {
    margin-top: 0.4rem;
  }

  .top-content {
    display: flex;
    flex-direction: column;
    margin-top: -1rem;
  }

  .dropdown-select-hours {
    width: 100%;
    margin-top: 1.1rem;
  }

  .card-solicitudes {
    min-width: 100%;
    min-height: 100%;
    margin-right: 5px;
    padding-right: 25px;
  }
}
</style>