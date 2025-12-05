<template>
  <h1 class="t-1">Elección de horarios</h1>
  <div v-if="isDesabilitado" class="constante">{{ valorConstante }}</div>
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
            <option v-for="profesor in listaProfesores" 
              :key="profesor" 
              :value="profesor">
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
              <option v-for="asignatura in listaAsignaturas" 
                :key="asignatura" 
                :value="asignatura">
                {{ asignatura.nombre }} ({{ asignatura.horas }} horas) - {{ asignatura.curso }} {{ asignatura.etapa }}
              </option>
            </select>
            <button class="btn-asignar" :disabled="isDesabilitado" @click="asignacionDeAsignaturas">Asignar</button>
          </div>
          <div class="dropdowns">
            <label for="reduccion-select">Reducción:</label>
            <select id="reduccion-select" v-model="reduccionSeleccionada" @change="obtenerSolicitud"
              class="dropdown-select">
              <option value="" disabled hidden>Selecciona una reducción</option>
              <option v-for="reduccion in listaReducciones" 
                :key="reduccion.id" 
                :value="reduccion">
                {{ reduccion.nombre }} ({{ reduccion.horas }} horas)
              </option>
            </select>
            <button class="btn-asignar" :disabled="isDesabilitado" @click="asignarReduccion">Asignar</button>
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
        <input type="radio" class="radio" id="opcion1" name="opcion" :value="true" v-model="sinClasePrimeraHoraSeleccionado">
        <label for="opcion1"> No tener clase a primera hora</label>
      </div>
      <div class="t-5">
        <input type="radio" class="radio" id="opcion2" name="opcion" :value="false" v-model="sinClasePrimeraHoraSeleccionado">
        <label for="opcion2"> No tener clase a ultima hora</label>
      </div>
      <hr class="separator-line" />
      <!-- Dropdowns -->
      <div class="t-6">Elige tres horas que te gustaría no tener clase, exceptuando la última del viernes y la primera del lunes:</div>
      <div class="top-content">
        <div>
          <select id="tramoHorario-select-1" v-model="tramoHorarioSeleccionado1" class="dropdown-select-hours">
            <option v-for="tramoHorario in tramosFiltrados" 
              :key="tramoHorario.diaDesc + '-' + tramoHorario.tramoDesc" 
              :value="tramoHorario">
              {{ tramoHorario.diaDesc === 'Sin Seleccionar' && tramoHorario.tramoDesc === 'Sin Seleccionar' ? 'Sin Seleccionar' : tramoHorario.diaDesc + ' - ' + tramoHorario.tramoDesc }}
            </option>
          </select>
        </div>
        <div>
          <select id="tramoHorario-select-2" v-model="tramoHorarioSeleccionado2" class="dropdown-select-hours">
            <option v-for="tramoHorario in tramosFiltrados" 
              :key="tramoHorario.diaDesc + '-' + tramoHorario.tramoDesc" 
              :value="tramoHorario">
              {{ tramoHorario.diaDesc === 'Sin Seleccionar' && tramoHorario.tramoDesc === 'Sin Seleccionar' ? 'Sin Seleccionar' : tramoHorario.diaDesc + ' - ' + tramoHorario.tramoDesc }}
            </option>
          </select>
        </div>
        <div>
          <select id="tramoHorario-select-3" v-model="tramoHorarioSeleccionado3" class="dropdown-select-hours">
            <option v-for="tramoHorario in tramosFiltrados" 
              :key="tramoHorario.diaDesc + '-' + tramoHorario.tramoDesc" 
              :value="tramoHorario">
              {{ tramoHorario.diaDesc === 'Sin Seleccionar' && tramoHorario.tramoDesc === 'Sin Seleccionar' ? 'Sin Seleccionar' : tramoHorario.diaDesc + ' - ' + tramoHorario.tramoDesc }}
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
      <!-- Botón solo para otras observaciones -->
      <button @click="actualizarOtrasObservacionesVista()" :disabled="isDesabilitado" class="btn-actualizar">Actualizar otras observaciones</button>
    </div>
    <!-- Tabla con todas las asignaturas y reducciones elegidas por el profesor -->
    <div class="card-solicitudes">
      <div class="t-2">Tus solicitudes ({{ totalHorasAsignaturas }} horas)</div>
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
                <button @click="eliminarSolicitud(index)" :disabled="isDesabilitado" class="btn-eliminar">&times;</button>
              </td>
              <td class="columna">{{ asignaturaReduccion.tipo }}</td>
              <td class="columna">{{ asignaturaReduccion.tipo === 'Asignatura' ? asignaturaReduccion.nombreAsignatura :
                asignaturaReduccion.nombreReduccion }}</td>
              <td class="columna">
                <span v-if="asignaturaReduccion.tipo === 'Asignatura'">
                  <span v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
                    <select v-model="asignaturaReduccion.horasSeleccionadas" class="dropdown-select-solicitudes">
                      <option value="" disabled hidden></option>
                      <option v-for="hora in asignaturaReduccion.horasMax" 
                        :key="hora" 
                        :value="hora">
                        {{ hora }}
                      </option>
                    </select>
                  </span>
                  <span v-else>{{ asignaturaReduccion.horasSeleccionadas }}</span>
                </span>
                <span v-else>{{ asignaturaReduccion.horasReduccion }}</span>
              </td>
              <td class="columna">{{ asignaturaReduccion.tipo === 'Asignatura' ? asignaturaReduccion.curso : '-' }}</td>
              <td class="columna white-space">{{ asignaturaReduccion.tipo === 'Asignatura' ? asignaturaReduccion.etapa : '-' }}</td>
              <td class="columna">
                <span v-if="asignaturaReduccion.tipo === 'Asignatura'">
                  <span v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
                    <select 
                      id="grupo-select" 
                      v-model="asignaturaReduccion.grupoSeleccionado"
                      @change="obtenerGrupoDeAsignatura(index)" 
                      class="dropdown-select-solicitudes">
                      <option v-for="(grupo, i) in listaGrupos[index]" 
                        :key="grupo" 
                        :value="grupo.grupo"
                        :selected="asignaturaReduccion.grupoSeleccionado === undefined && i === 0">
                        {{ grupo.grupo }}
                      </option>
                    </select>
                  </span>
                  <span v-else>{{ asignaturaReduccion.asignadoDireccion === true ? asignaturaReduccion.grupo : '-' }}</span>
                </span>
                <span v-else>-</span>
              </td>
              <td class="columna" v-if="(rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION'))">
                <span v-if="asignaturaReduccion.tipo === 'Asignatura'">
                  <button @click="guardarSolicitud(index)" :disabled="isDesabilitado" class="btn">Guardar</button>
                </span>
                <samp v-else>-</samp>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button v-if="(listaAsignaturasReducciones.length > 0) && (rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION'))" 
        :disabled="isDesabilitado" 
        class="btn-guardar-todo" 
        @click="guardarTodo">
        Guardar todo
      </button>
    </div>
  </div>
  <ion-toast 
    :is-open="isToastOpen" 
    :message="toastMessage" 
    :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top">
  </ion-toast>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {IonInput, IonToast} from "@ionic/vue";
import {crearToast} from '@/utils/toast.js';
import {obtenerEmailUsuario, obtenerRolesUsuario} from '@/services/firebaseService';
import {
  actualizarConciliacion,
  actualizarOtrasObservaciones,
  actualizarPreferenciaHoraria,
  actualizarSinClasePrimeraHora,
  asignarAsignatura,
  asignarReducciones,
  eliminarSolicitudes,
  guardarSolicitudes,
  obtenerAsignaturas,
  obtenerListaDiaTramoTipoHorario,
  obtenerGruposDeAsignaturas,
  obtenerObservaciones,
  obtenerProfesoresHorarios,
  obtenerReducciones,
  obtenerSolicitudes
} from "@/services/schoolManager.js";
import {obtenerConstantes} from '@/services/constantes'
import {schoolManagerApiUrl} from "@/environment/apiUrls.ts";

const rolesUsuario = ref([]);
const profesorSeleccionado = ref('');
const listaProfesores = ref([]);
const reduccionSeleccionada = ref('');
const listaReducciones = ref([]);
const asignaturaSeleccionada = ref('');
const listaAsignaturas = ref([]);
const listaAsignaturasReducciones = ref([]);
const isOn = ref(false)
const tramoHorarioSeleccionado1 = ref(null);
const tramoHorarioSeleccionado2 = ref(null);
const tramoHorarioSeleccionado3 = ref(null);
const listaTramoHorarioSeleccionado = ref([]);
const emailUsuarioActual = ref(null);
const sinClasePrimeraHoraSeleccionado = ref(true);
const otrasObservacionesSeleccionado = ref('');
const listaGrupos = ref([]);
const constantes = ref([]);
const isDesabilitado = ref(false)
const valorConstante = ref('')
const observacionesUsuario = ref(null);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";
// Bandera para evitar que los watchers se ejecuten durante la carga inicial
const isInitializing = ref(true);

//FUNCION PARA DESHABILITAR EN FUNCION DE LA CONSTANTE DE LA VENTANA DE ADMINISTRACION
const verificarConstantes = async () => {
  try {
    constantes.value = await obtenerConstantes(schoolManagerApiUrl + '/schoolManager/constants');

    const solicitudesDeshabilitada = constantes.value.find(c => c.clave === 'Selección horarios por claustro');
    valorConstante.value = solicitudesDeshabilitada.valor;

    // Deshabilitar solo si no es dirección/admin y hay valor en la constante
    if (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR')) {
      isDesabilitado.value = false; // Nunca se deshabilita para dirección/admin
    } else {
      isDesabilitado.value = solicitudesDeshabilitada.valor !== ''; // Se deshabilita para otros si hay valor
    }
  }
  catch (error) {
    mensajeActualizacion = 'Error al obtener constantes';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    throw new Error(error.message);
  }
}

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

    const response = await obtenerProfesoresHorarios(toastMessage, toastColor, isToastOpen);
    listaProfesores.value = response;

    // Asignar automáticamente el primer profesor de la lista
    if (listaProfesores.value.length > 0) {
      profesorSeleccionado.value = listaProfesores.value[0];
    } else {
      profesorSeleccionado.value = '';
    }

    listaAsignaturas.value = [];

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const obtenerListaAsignaturas = async () => {

  listaAsignaturas.value = [];

  try {
    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await obtenerAsignaturas(emailDestino, toastMessage, toastColor, isToastOpen);
    listaAsignaturas.value = response;

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const asignacionDeAsignaturas = async () => {
  try {

    await verificarConstantes();

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    // Validar que se haya seleccionado una asignatura
    if (!asignaturaSeleccionada.value) {
      mensajeActualizacion = 'Debes seleccionar una asignatura';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    const response = await asignarAsignatura(
      asignaturaSeleccionada.value.nombre,
      asignaturaSeleccionada.value.horas,
      asignaturaSeleccionada.value.curso,
      asignaturaSeleccionada.value.etapa,
      emailDestino,
      toastMessage, toastColor, isToastOpen);
    

    await obtenerSolicitud();

    if(response.ok) {
      mensajeActualizacion = "Asignatura asignada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }
    
  } catch (error) {
    mensajeActualizacion = 'Error al cargar las asignaturas.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
}

const obtenerListaReducciones = async () => {
  try {

    const response = await obtenerReducciones(toastMessage, toastColor, isToastOpen);
    listaReducciones.value = response;

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const asignarReduccion = async () => {
  try {

    await verificarConstantes();

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

      if (!reduccionSeleccionada.value) {
        mensajeActualizacion = 'Debes seleccionar una reducción';
        mensajeColor = 'warning';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
        return;
      }

    const response = await asignarReducciones(
      emailDestino,
      reduccionSeleccionada.value.nombre,
      reduccionSeleccionada.value.horas,
      toastMessage, toastColor, isToastOpen);
    
    await obtenerSolicitud();


    if(response.ok) {
      mensajeActualizacion = "Reducción asignada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = 'Error al cargar las reducciones.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const resetearValores = () => {
      isOn.value = false;
      sinClasePrimeraHoraSeleccionado.value = true;
      otrasObservacionesSeleccionado.value = '';
      if (listaTramoHorarioSeleccionado.value.length > 0) {
        tramoHorarioSeleccionado1.value = listaTramoHorarioSeleccionado.value[0];
        tramoHorarioSeleccionado2.value = listaTramoHorarioSeleccionado.value[0];
        tramoHorarioSeleccionado3.value = listaTramoHorarioSeleccionado.value[0];
      }
    };

const obtenerObservacionesVista = async () => {
  try {

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    listaTramoHorarioSeleccionado.value =
        await (async () => {
            return await obtenerListaDiaTramoTipoHorario(toastMessage, toastColor, isToastOpen);
        })();
    
    // Asignar el primer elemento (Sin Seleccionar) por defecto
    if (listaTramoHorarioSeleccionado.value.length > 0) {
      const opcionSinSeleccionar = listaTramoHorarioSeleccionado.value.find(tramo => 
        tramo.diaDesc === 'Sin Seleccionar' && tramo.tramoDesc === 'Sin Seleccionar'
      );
      const valorPorDefecto = opcionSinSeleccionar || listaTramoHorarioSeleccionado.value[0];
      
      tramoHorarioSeleccionado1.value = valorPorDefecto;
      tramoHorarioSeleccionado2.value = valorPorDefecto;
      tramoHorarioSeleccionado3.value = valorPorDefecto;
    }

    observacionesUsuario.value = await obtenerObservaciones(emailDestino, toastMessage, toastColor, isToastOpen);

    // Inicializamos todos los valores

    isOn.value = observacionesUsuario.value.conciliacion !== false;
    sinClasePrimeraHoraSeleccionado.value = observacionesUsuario.value.sinClasePrimeraHora !== false;
    otrasObservacionesSeleccionado.value = observacionesUsuario.value.otrasObservaciones || '';

    // Inicializamos los tramos horarios a su valor por defecto antes del if
    tramoHorarioSeleccionado1.value = listaTramoHorarioSeleccionado.value[0] ;
    tramoHorarioSeleccionado2.value = listaTramoHorarioSeleccionado.value[0] ;
    tramoHorarioSeleccionado3.value = listaTramoHorarioSeleccionado.value[0] ;

    // Si el tamaño de la lista de tramos horarios es mayor que 0, asignamos el primer tramo horario a los tres campos
    if (observacionesUsuario.value.tramosHorarios.length > 0) 
    {  
      let contador = 0;
      
      for (const tramoH of observacionesUsuario.value.tramosHorarios)
      {
  
        const encontrado = listaTramoHorarioSeleccionado.value.find(item => {
          return item.diaDesc === tramoH.diaDesc &&
                 item.tramoDesc === tramoH.tramoDesc &&
                 (tramoH.horarioMatutino === null || item.horarioMatutino === tramoH.horarioMatutino);
        });
  
        if (encontrado)
        {
          switch (contador)
          {
            case 0:

              tramoHorarioSeleccionado1.value = encontrado;
              break;

            case 1:

              tramoHorarioSeleccionado2.value = encontrado;
              break;

            case 2:

              tramoHorarioSeleccionado3.value = encontrado;
              break;
          }
        }

        // Incrementamos el contador para el siguiente tramo horario
        contador++;
      }
    }
  } catch (error) {
    resetearValores();
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const obtenerListaDiaTramoTipoHorarioService = async () => {
  try {

    const response = await obtenerListaDiaTramoTipoHorario(toastMessage, toastColor, isToastOpen);
    listaTramoHorarioSeleccionado.value = response;
    
    // Asignar valores por defecto si no están asignados
    if (listaTramoHorarioSeleccionado.value.length > 0) {
      const opcionSinSeleccionar = listaTramoHorarioSeleccionado.value.find(tramo => 
        tramo.diaDesc === 'Sin Seleccionar' && tramo.tramoDesc === 'Sin Seleccionar'
      );
      const valorPorDefecto = opcionSinSeleccionar || listaTramoHorarioSeleccionado.value[0];
      
      if (!tramoHorarioSeleccionado1.value) {
        tramoHorarioSeleccionado1.value = valorPorDefecto;
      }
      if (!tramoHorarioSeleccionado2.value) {
        tramoHorarioSeleccionado2.value = valorPorDefecto;
      }
      if (!tramoHorarioSeleccionado3.value) {
        tramoHorarioSeleccionado3.value = valorPorDefecto;
      }
    }

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

// Mostramos todas las opciones disponibles sin filtrar
const tramosFiltrados = computed(() => {
  const opcionSinSeleccionar = listaTramoHorarioSeleccionado.value.find(tramo => 
    tramo.diaDesc === 'Sin Seleccionar' && tramo.tramoDesc === 'Sin Seleccionar'
  );
  const tramosRestantes = listaTramoHorarioSeleccionado.value.filter(tramo => 
    !(tramo.diaDesc === 'Sin Seleccionar' && tramo.tramoDesc === 'Sin Seleccionar')
  );
  return opcionSinSeleccionar ? [opcionSinSeleccionar, ...tramosRestantes] : tramosRestantes;
});

// Los watchers se han eliminado para permitir selecciones duplicadas

const actualizarConciliacionFamiliar = async () => {
  try {
    await verificarConstantes();

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await actualizarConciliacion(emailDestino, Boolean(isOn.value), toastMessage, toastColor, isToastOpen);

    if(!response.ok) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = 'Error al actualizar la conciliación familiar'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const actualizarPrimeraHora = async () => {
  try {
    await verificarConstantes();

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await actualizarSinClasePrimeraHora(emailDestino, Boolean(sinClasePrimeraHoraSeleccionado.value), toastMessage, toastColor, isToastOpen);

    if(!response.ok) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = 'Error al actualizar la preferencia de primera hora'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const actualizarPreferenciaHorariaIndividual = async (idSeleccion, tramo) => {
  try {
    await verificarConstantes();

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await actualizarPreferenciaHoraria(emailDestino, idSeleccion, tramo.diaDesc, tramo.tramoDesc, toastMessage, toastColor, isToastOpen);

    if (!response.ok) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }
  } catch (error) {
    mensajeActualizacion = `Error al actualizar el tramo horario ${idSeleccion + 1}`;
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
}

const actualizarOtrasObservacionesVista = async () => {
  try {
    await verificarConstantes();

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await actualizarOtrasObservaciones(emailDestino, otrasObservacionesSeleccionado.value || '', toastMessage, toastColor, isToastOpen);

    if(!response.ok) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }
    else
    {
      mensajeActualizacion = 'Otras observaciones actualizadas correctamente';
      mensajeColor = 'success';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    }

  } catch (error) {
    mensajeActualizacion = 'Error al actualizar las otras observaciones'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const totalHorasAsignaturas = computed(() => {
  return listaAsignaturasReducciones.value
    .reduce((total, item) => {
      // Para los que son de tipo Asignatura
      if (item.tipo === 'Asignatura') {
        return total + Number(item.horasSeleccionadas || 0);
      }
      // Para los que son de tipo Reduccion
      if (item.tipo === 'Reducción') {
        return total + Number(item.horasReduccion || 0);
      }
      return total;
    }, 0);
});

const obtenerSolicitud = async () => {
  try {

    let response = null;
    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
    ? profesorSeleccionado.value.email
    : emailUsuarioActual.value;
    
    response = await obtenerSolicitudes(emailDestino, toastMessage, toastColor, isToastOpen);
    const solicitudes = response;

    listaGrupos.value = [];

    listaAsignaturasReducciones.value = [
      ...solicitudes.asigunaturas.map(a => {
        const esAdmin = rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR');
        return {
        ...a,
        horasMax: a.horasAsignatura,                  //Maximo original
        horasSeleccionadas: a.cupoHorasAsignatura,    //Las horas que se quieren
        grupoOriginal: a.grupo,                       // Grupo original
        // Si es admin o dirección y la asignatura ya está asignada, mostrará el grupo actual
        // Si no, dejará vacío el grupo seleccionado
        grupoSeleccionado: esAdmin 
            ? (a.asignadoDireccion ? a.grupo : '')
            : a.grupo                                 // Grupo que se quiere cambiar
        };
      }),
      ...solicitudes.reduccionAsignadas
    ];

    for (let i = 0; i < listaAsignaturasReducciones.value.length; i++) {
      if (listaAsignaturasReducciones.value[i].tipo === 'Asignatura') {
        await obtenerGrupoDeAsignatura(i);
      }
    }
  }
  catch (error) {
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message)
  }
}

const eliminarSolicitud = async (index) => {
  try {

    await verificarConstantes();

    const solicitud = listaAsignaturasReducciones.value[index];

    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await eliminarSolicitudes(
      emailDestino, 
      solicitud.nombreAsignatura, 
      solicitud.horasSeleccionadas, 
      solicitud.curso, 
      solicitud.etapa,
      solicitud.grupoSeleccionado,
      solicitud.nombreReduccion,
      solicitud.horasReduccion,
      toastMessage, toastColor, isToastOpen);

    if (response.ok) {
      mensajeActualizacion = "Solicitud eliminada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      // Elimina la solicitud de la lista
      listaAsignaturasReducciones.value.splice(index, 1);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  }
  catch (error) {
    mensajeActualizacion = 'Error al eliminar solicitud'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const guardarSolicitud = async (index) => {
  try {

    await verificarConstantes();

    const solicitud = listaAsignaturasReducciones.value[index];

    if (listaAsignaturasReducciones.value[index].grupoSeleccionado === '') {
      mensajeActualizacion = 'Tienes que elegir el grupo antes de guardar'
      mensajeColor = 'warning'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
      return
    }
    
    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    const response = await guardarSolicitudes(
      emailDestino, 
      solicitud.nombreAsignatura,
      solicitud.horasSeleccionadas,
      solicitud.curso,
      solicitud.etapa,
      solicitud.grupoOriginal,
      solicitud.grupoSeleccionado,
      toastMessage, 
      toastColor, 
      isToastOpen);

    if (response.ok) {
      mensajeActualizacion = "Solicitud guardada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      solicitud.grupoOriginal = solicitud.grupoSeleccionado; // Actualiza el grupo original al nuevo
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  }
  catch (error) {
    mensajeActualizacion = 'Error al guardar solicitud'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

const guardarTodo = async () => {

  await verificarConstantes();

  const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
    ? profesorSeleccionado.value.email
    : emailUsuarioActual.value;

    
  for (let index = 0; index < listaAsignaturasReducciones.value.length; index++) {
    const solicitud = listaAsignaturasReducciones.value[index];

    if (solicitud.tipo === 'Reducción' ) {
      return;
    }

    if (solicitud.grupoSeleccionado === '') {
      mensajeActualizacion = 'Tienes que elegir el grupo antes de guardar'
      mensajeColor = 'warning'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
      return
    }

    try {
      const response = await guardarSolicitudes(
        emailDestino, 
        solicitud.nombreAsignatura,
        solicitud.horasSeleccionadas,
        solicitud.curso,
        solicitud.etapa,
        solicitud.grupoOriginal,
        solicitud.grupoSeleccionado,
        toastMessage, 
        toastColor, 
        isToastOpen);

      if (response.ok) {
        mensajeActualizacion = 'Todas las solicitudes se han guardado correctamente'
        mensajeColor = "success";
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

        solicitud.grupoOriginal = solicitud.grupoSeleccionado; // Actualiza el grupo original al nuevo
      } else {
        const errorData = await response.json();
        mensajeColor = 'danger';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
      }

    }
    catch (error) {
      mensajeActualizacion = 'Error al guardar todas las solicitudes'
      mensajeColor = 'danger'
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
    }
  }
}

const obtenerGrupoDeAsignatura = async (index) => {
  try {
    const asignatura = listaAsignaturasReducciones.value[index];

    if (asignatura.tipo !== 'Asignatura') return;

    const response = await obtenerGruposDeAsignaturas(
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
    listaGrupos.value[index] = response;

    // Si no hay grupo seleccionado, establecer el grupo original
    if (!asignatura.grupoSeleccionado && asignatura.grupoOriginal) {
      asignatura.grupoSeleccionado = asignatura.grupoOriginal;
    }

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

onMounted(async () => {
  await verificarRoles();
  await obtenerEmailUsuarioActual();
  if (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR')) {
    await obtenerProfesor();
    // Si se cargó un profesor, cargar sus datos
    if (profesorSeleccionado.value) {
      await obtenerListaAsignaturas();
      await obtenerSolicitud();
      await obtenerObservacionesVista();
    }
  }
  await verificarConstantes();
  await obtenerListaReducciones();
  await obtenerListaDiaTramoTipoHorarioService();
  if (!(rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))) {
    await obtenerListaAsignaturas();
    await obtenerSolicitud();
    await obtenerObservacionesVista();
  }
  // Marcar que la inicialización ha terminado
  isInitializing.value = false;
});

// Watcher para actualizar automáticamente la conciliación familiar
watch(isOn, async (nuevoValor) => {
  if (!isDesabilitado.value) {
    await actualizarConciliacionFamiliar();
  }
});

// Watcher para actualizar automáticamente la preferencia de primera hora
watch(sinClasePrimeraHoraSeleccionado, async (nuevoValor) => {
  if (!isDesabilitado.value) {
    await actualizarPrimeraHora();
  }
});

// Watcher para actualizar automáticamente las preferencias horarias individuales
watch(tramoHorarioSeleccionado1, async (nuevoValor) => {
  if (!isDesabilitado.value && nuevoValor && !isInitializing.value) {
    await actualizarPreferenciaHorariaIndividual(0, nuevoValor);
  }
}, { deep: true, immediate: false });

watch(tramoHorarioSeleccionado2, async (nuevoValor) => {
  if (!isDesabilitado.value && nuevoValor && !isInitializing.value) {
    await actualizarPreferenciaHorariaIndividual(1, nuevoValor);
  }
}, { deep: true, immediate: false });

watch(tramoHorarioSeleccionado3, async (nuevoValor) => {
  if (!isDesabilitado.value && nuevoValor && !isInitializing.value) {
    await actualizarPreferenciaHorariaIndividual(2, nuevoValor);
  }
}, { deep: true, immediate: false });

watch(profesorSeleccionado, async (nuevoProfesor) => {
  if (
    nuevoProfesor &&
    (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
  ) {
    // Activar la bandera de inicialización para evitar watchers durante la carga
    isInitializing.value = true;
    asignaturaSeleccionada.value = '';
    await obtenerListaAsignaturas();
    await obtenerSolicitud();
    resetearValores();
    await obtenerObservacionesVista();
    // Desactivar la bandera después de cargar los datos
    isInitializing.value = false;
  }
});

</script>

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
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
  align-self: center;
  margin-top: 1rem;
}

.btn-asignar:hover {
  background-color: #1461eb;
}

.btn-asignar:disabled {
  background-color: #7fa9f4;
  cursor: not-allowed;
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

.radio {
  width: 15px;
  height: 16px;
  cursor: pointer;
  margin-right: 0.4rem;
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
  white-space: normal;
  margin-left: 0;
  width: 200px;
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
  background-color: #0054e9;
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

.btn-actualizar:hover {
  background-color: #1461eb;
}

.btn-actualizar:disabled {
  background-color: #7fa9f4;
  cursor: not-allowed;
}

.card-solicitudes {
  min-width: 750px;
  min-height: 917px;
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

.btn-eliminar:disabled {
  cursor: not-allowed;
}

.dropdown-group {
  width: 100px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.btn {
  border: 1px solid;
  border-radius: 0.375rem;
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
  height: 2.1rem;
  display: flex;          
  align-items: center;    
  justify-content: center;
  white-space: nowrap; 
  }

.btn:hover {
  background-color: #1461eb;
}

.btn-guardar-todo {
  width: 170px;
  padding: 0.5rem;
  border: 1px solid;
  border-radius: 0.375rem;
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-top: 15px;
  margin-bottom: 5px;
  position: sticky;
  top: 0;
  left: 550px;
  height: 2.1rem;
}

.btn-guardar-todo:hover {
  background-color: #1461eb;
}

.white-space {
  white-space: nowrap; 
}

@media (prefers-color-scheme: dark) {
  .card-asignaturas-reducciones,
  .card-solicitudes {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .option.active,
  .info-circle {
    color: black;
  }

  .btn-asignar,
  .btn-actualizar,
  .btn,
  .btn-guardar-todo {
    color: black;
    background-color: #4782eb;
    border: none;
  }



  .separator-line {
    border-top: 1.3px solid #a1a1a1;
  }

  .dropdown-select-solicitudes {
    background-color: #353c36;
    border: 1px solid #828181;
  }

  .btn-asignar:hover {
    background-color: #3476eb;
  }
  
  .btn-actualizar:hover {
    background-color: #3476eb;
  }

  .btn:hover {
    background-color: #3476eb;
  }

  .btn-guardar-todo:hover {
    background-color: #3476eb;
  }
}

@media ((min-width: 768px) and (max-width: 1422px)) {
  .card-solicitudes {
    min-width: 535px;
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
  
  .tooltip {
    width: 250px;
    font-size: 0.9rem;
    padding: 4px 8px;
    left: -70px;
  }


}

@media (max-width: 540px) {
  .card-asignaturas-reducciones {
    min-width: 100%;
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
    min-width: 100%;
    min-height: 100%;
    margin-right: 5px;
    padding-right: 25px;
  }

  .tooltip {
    font-size: 0.8rem;
    max-width: 200px;
    margin-right: 2rem;
    padding: 3px 6px;
    bottom: 120%;
    left: -70px;
  }
}
</style>