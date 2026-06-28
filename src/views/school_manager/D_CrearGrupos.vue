<template>
  <div class="school-manager-page">
    <header class="page-header">
      <h1 class="t-1">Creación de grupos<span v-if="cursoAcademico"> ({{ cursoAcademico }})</span></h1>
      <SchoolManagerNav>
        <p class="page-subtitle">
          Crea grupos por curso y etapa y reparte a los alumnos matriculados entre ellos.
        </p>
      </SchoolManagerNav>
    </header>

    <div class="main-panel">
      <div class="top-container">
        <article class="action-card card-upload-alumnos">
          <h3 class="card-title">Alumnos y grupos</h3>
          <div class="card-body">
            <div class="field">
              <label>Filtrar por curso y etapa</label>
              <FilterCursoEtapa
                v-model="filtroSeleccionadoString"
                @actualizar-select="actualizarSelect"
                class="texto-dropdown"/>
            </div>

            <div class="fila-botones">
              <button type="button" @click="seleccionarTodo" class="btn-secondary">Seleccionar todo</button>
              <button type="button" @click="deseleccionarTodo" class="btn-secondary">Quitar todo</button>
            </div>

            <p class="cantidad-alumnos">
              Total de alumnos: {{ listadoAlumnosSinGrupo.length }}
            </p>

            <div class="alumnos-disponibles-row">
              <div class="field alumnos-disponibles-field">
                <label>Alumnos disponibles</label>
                <select
                  v-model="listadoAlumnosSeleccionados"
                  class="custom-select custom-select-multiple lista-alumnos-select"
                  multiple
                  size="8">
                  <option v-if="listadoAlumnosSinGrupo.length === 0" disabled>No hay alumnos disponibles.</option>
                  <option v-for="alumno in listadoAlumnosSinGrupo" :key="alumno.id" :value="alumno">
                    {{ alumno.apellidos }}, {{ alumno.nombre }}
                  </option>
                </select>
                <span class="field-hint">Mantén Ctrl (o Cmd) para elegir varios alumnos</span>
              </div>

              <div class="field carga-alumnos-field">
                <label>Cargar alumnos por fichero</label>
                <FileUpload
                  ref="fileUploadAlumnosRef"
                  accept=".csv"
                  @file-selected="onArchivoAlumnosCsvSeleccionado"/>
                <span class="field-hint">CSV (.csv): cabecera <strong>nombreApellidos,cursoEtapaGrupo</strong></span>
              </div>
            </div>

            <div class="group-section">
              <div class="field">
                <label>Grupo destino</label>
                <select v-model="grupoSeleccionado" @change="actualizarGrupo(grupoSeleccionado)" class="custom-select">
                  <option value="" disabled hidden>Selecciona un grupo</option>
                  <option v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo" :value="infoGrupo.grupo">{{ infoGrupo.grupo }}</option>
                </select>
              </div>
              <button type="button" @click="asignarAlumno" class="btn-primary">Añadir alumnos</button>

              <div v-if="isLoading" class="fondo-gris">
                <div class="circulo"></div>
              </div>
            </div>
          </div>
        </article>

        <article class="action-card card-upload-table">
          <h3 class="card-title">Grupos creados</h3>
          <div class="card-body card-body-grupos">
            <p v-if="gruposConAlumnos.length === 0" class="empty-state">Todavía no se han asignado alumnos a ningún grupo.</p>
            <div v-for="infoGrupo in gruposConAlumnos" :key="infoGrupo.grupo" class="grupo-bloque">
              <h4 class="t-3">{{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ infoGrupo.grupo }}
                <button type="button" class="limpiar-grupo" @click="limpiarGrupo(infoGrupo.grupo)">Limpiar grupo</button>
              </h4>
              <p v-if="alumnosPorGrupo[infoGrupo.grupo] && alumnosPorGrupo[infoGrupo.grupo].length > 0" class="cantidad-alumnos-tabla">
                Total de alumnos: {{ alumnosPorGrupo[infoGrupo.grupo].length }}
                <label class="horario-checkbox">
                  <input type="checkbox"
                    v-model="infoGrupo.horarioMatutino"
                    @change="actualizarTurno(infoGrupo)"/>
                  Horario de mañana
                </label>
              </p>
              <div class="table-scroll table-scroll-grupos" v-if="alumnosPorGrupo[infoGrupo.grupo] && alumnosPorGrupo[infoGrupo.grupo].length > 0">
                <table class="tabla-alumnos tabla-alumnos-grupos">
                  <thead>
                    <tr>
                      <th>Acción</th>
                      <th>Nombre</th>
                      <th>Apellidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="alumno in alumnosPorGrupo[infoGrupo.grupo]" :key="alumno.id">
                      <td><button type="button" class="btn-delete" @click="borrarAlumno(alumno, infoGrupo.grupo)">&times;</button></td>
                      <td>{{ alumno.nombre }}</td>
                      <td>{{ alumno.apellidos }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="empty-state" v-else>No hay alumnos en este grupo.</p>
            </div>
          </div>
        </article>
      </div>

      <article class="action-card card-aula-referencia">
        <h3 class="card-title">Aula de referencia (espacio del instituto)</h3>
        <div class="card-body">
          <p class="espacios-ayuda">
            Asigna un espacio disponible como aula de referencia al grupo
          </p>

          <div v-if="!filtroSeleccionado.curso" class="empty-state">
            Selecciona primero un curso y etapa arriba para asignar su aula de referencia.
          </div>

          <template v-else>
            <div v-if="!grupoSeleccionado" class="empty-state">
              Selecciona el grupo destino en el desplegable superior para asignarle un aula de referencia.
            </div>

            <template v-else>
              <p class="espacios-ayuda destino-aviso">
                El aula se asignará al grupo destino:
                <strong>{{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ grupoSeleccionado }}</strong>
              </p>

              <div class="espacios-form">
                <div class="field">
                  <label>Espacio disponible</label>
                  <select v-model="espacioSeleccionado" class="custom-select">
                    <option value="" disabled hidden>Selecciona un espacio</option>
                    <option v-if="espaciosDisponiblesFijo.length === 0" value="" disabled>No hay espacios disponibles</option>
                    <option v-for="espacio in espaciosDisponiblesFijo" :key="espacio.nombre" :value="espacio.nombre">{{ espacio.nombre }}</option>
                  </select>
                </div>

                <button type="button" @click="asignarEspacio" class="btn-primary btn-espacio">Asignar espacio</button>
              </div>

              <div class="espacios-asignados">
                <h4 class="t-3">
                  Espacios asignados a {{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ grupoSeleccionado }}
                </h4>
                <p v-if="espaciosAsignadosDelGrupo.length === 0" class="empty-state">Este grupo no tiene ningún espacio asignado.</p>
                <ul v-else class="lista-espacios">
                  <li v-for="espacio in espaciosAsignadosDelGrupo" :key="espacio.nombre" class="item-espacio">
                    <span>{{ espacio.nombre }}</span>
                    <button type="button" class="btn-delete" @click="desasignarEspacio(espacio.nombre)">&times;</button>
                  </li>
                </ul>
              </div>
            </template>
          </template>
        </div>
      </article>

      <article class="action-card card-espacios">
        <h3 class="card-title">Aulas de desdoble por bloque</h3>
        <div class="card-body">
          <p class="espacios-ayuda">
            Asigna un aula disponible como aula de desdoble a cada una de las asignaturas de un bloque de optativas.
          </p>

          <div v-if="!filtroSeleccionado.curso" class="empty-state">
            Selecciona primero un curso y etapa arriba para asignar aulas de desdoble.
          </div>

          <template v-else>
            <div class="espacios-form">
              <div class="field">
                <label>Bloque</label>
                <select v-model="bloqueSeleccionado" @change="asignaturaDesdobleSeleccionada = ''" class="custom-select">
                  <option value="" disabled hidden>Selecciona un bloque</option>
                  <option v-if="bloques.length === 0" value="" disabled>No hay bloques en este curso y etapa</option>
                  <option v-for="bloque in bloques" :key="bloque.bloqueId" :value="bloque.bloqueId">{{ bloque.nombre }}</option>
                </select>
              </div>

              <div class="field">
                <label>Asignatura del bloque</label>
                <select v-model="asignaturaDesdobleSeleccionada" class="custom-select" :disabled="!bloqueSeleccionado">
                  <option value="" disabled hidden>Selecciona una asignatura</option>
                  <option v-if="asignaturasDelBloque.length === 0" value="" disabled>Este bloque no tiene asignaturas</option>
                  <option v-for="asig in asignaturasDelBloque" :key="asig" :value="asig">
                    {{ asig }}{{ aulaDeAsignatura(asig) ? ' — ' + aulaDeAsignatura(asig).nombre : '' }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label>Aula disponible</label>
                <select v-model="espacioDesdobleSeleccionado" class="custom-select" :disabled="!asignaturaDesdobleSeleccionada">
                  <option value="" disabled hidden>Selecciona un aula</option>
                  <option v-if="espaciosDisponiblesDesdoble.length === 0" value="" disabled>No hay aulas disponibles</option>
                  <option v-for="espacio in espaciosDisponiblesDesdoble" :key="espacio.nombre" :value="espacio.nombre">{{ espacio.nombre }}</option>
                </select>
              </div>

              <button type="button" @click="asignarDesdoble" class="btn-primary btn-espacio">Asignar</button>
            </div>

            <div v-if="bloqueSeleccionado" class="desdoble-tabla-wrap">
              <div class="aviso-aulas" :class="{ 'aviso-aulas-falta': faltanAulas }">
                <span class="aviso-aulas-icono" aria-hidden="true">{{ faltanAulas ? '⚠' : '✓' }}</span>
                <span>
                  Se necesitan {{ aulasNecesarias }} {{ aulasNecesarias === 1 ? 'aula' : 'aulas' }}
                  · {{ aulasAsignadas }} {{ aulasAsignadas === 1 ? 'asignada' : 'asignadas' }}
                  <template v-if="faltanAulas"> · faltan {{ aulasNecesarias - aulasAsignadas }}</template>
                </span>
              </div>

              <p v-if="asignaturasDelBloque.length === 0" class="empty-state">Este bloque no tiene asignaturas.</p>
              <div v-else class="table-scroll">
                <table class="tabla-alumnos tabla-desdoble">
                  <thead>
                    <tr>
                      <th>Asignatura</th>
                      <th>Aula de desdoble</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(fila, idx) in filasDesdoble" :key="idx">
                      <td>{{ fila.asignatura || '—' }}</td>
                      <td>
                        <span v-if="fila.aula">{{ fila.aula.nombre }}</span>
                        <span v-else class="celda-vacia">Sin asignar</span>
                      </td>
                      <td>
                        <button v-if="fila.aula" type="button" class="btn-delete" @click="desasignarDesdoble(fila.aula.nombre, fila.aula.bloqueId, fila.asignatura)">&times;</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p v-else class="empty-state">Selecciona un bloque para ver sus asignaturas y asignar sus aulas de desdoble.</p>
          </template>
        </div>
      </article>

    </div>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2000"
      @did-dismiss="() => (isToastOpen = false)"
      position="top">
    </ion-toast>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import SchoolManagerNav from '@/components/school_manager/SchoolManagerNav.vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import { crearToast } from '@/utils/toast.js';
import { obtenerAlumnosConGrupos, obtenerAlumnosSinGrupos, asignarAlumnos, borrarAlumnos, actualizarTurnoHorario, obtenerCursoAcademicoSeleccionado, obtenerEspaciosDisponibles, obtenerEspaciosFijoAsignados, crearEspacioFijo, borrarEspacioFijo, obtenerBloquesConAsignaturas, asignarEspacioDesdoble, obtenerEspaciosDesdobleAsignados, desasignarEspacioDesdoble, subirAlumnosCsv } from '@/services/schoolManager.js'
import { IonToast } from "@ionic/vue";

// Los grupos ya no se crean manualmente: se ofrece una lista fija (A-H) y el grupo se materializa
// en el backend al asignarle alumnos.
const GRUPOS_FIJOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const cursoAcademico = ref('');
const filtroSeleccionado = ref({ curso: null, etapa: '' });
const filtroSeleccionadoString = ref('');
const grupoSeleccionado = ref('');
const infoGrupos = ref([]);
const listadoAlumnosSeleccionados = ref([]);
const listadoAlumnosSinGrupo = ref([]);
const alumnosPorGrupo = ref({})
// Estado de la asignación de aulas de referencia (espacios fijos)
const espaciosDisponibles = ref([]);
const espaciosAsignados = ref([]);
const espacioSeleccionado = ref('');
// Estado de la asignación de aulas de desdoble por bloque y ASIGNATURA
const bloques = ref([]);
const bloqueSeleccionado = ref('');
const asignaturaDesdobleSeleccionada = ref('');
const espacioDesdobleSeleccionado = ref('');
const desdoblesAsignados = ref([]);
// Referencia al uploader de alumnos por CSV (para poder limpiarlo tras la subida)
const fileUploadAlumnosRef = ref(null);
// Nueva variable reactiva para el estado de carga
const isLoading = ref(false);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

// En "Grupos creados" solo mostramos los grupos que ya tienen alumnos asignados.
const gruposConAlumnos = computed(() =>
  infoGrupos.value.filter(infoGrupo => (alumnosPorGrupo.value[infoGrupo.grupo] || []).length > 0)
);

// Espacios fijos ya asignados al curso, etapa y grupo destino (desplegable superior) para el aula de referencia.
const espaciosAsignadosDelGrupo = computed(() => {
  const { curso, etapa } = filtroSeleccionado.value;
  const grupo = grupoSeleccionado.value;
  if (!curso || !etapa || !grupo) {
    return [];
  }
  return espaciosAsignados.value.filter(
    espacio => String(espacio.curso) === String(curso) && espacio.etapa === etapa && espacio.grupo === grupo
  );
});

// Asignaturas del bloque seleccionado (para mostrarlas al elegir el bloque).
const asignaturasDelBloque = computed(() => {
  const bloque = bloques.value.find(b => String(b.bloqueId) === String(bloqueSeleccionado.value));
  return bloque ? (bloque.asignaturas || []) : [];
});

// Aulas de desdoble ya asignadas al bloque seleccionado.
const desdoblesDelBloque = computed(() => {
  if (!bloqueSeleccionado.value) {
    return [];
  }
  return desdoblesAsignados.value.filter(
    desdoble => String(desdoble.bloqueId) === String(bloqueSeleccionado.value)
  );
});

// Devuelve el aula de desdoble asignada a una asignatura concreta del bloque seleccionado (o null si no tiene).
const aulaDeAsignatura = (asignatura) =>
  desdoblesDelBloque.value.find(d => d.asignatura === asignatura) || null;

// Nº de aulas necesarias para el bloque = nº de optativas (asignaturas) del bloque: cada optativa debe ir en un
// aula distinta. Y nº de aulas ya asignadas como desdoble a este bloque (una por asignatura como mucho).
const aulasNecesarias = computed(() => asignaturasDelBloque.value.length);
const aulasAsignadas = computed(() =>
  asignaturasDelBloque.value.filter(asig => aulaDeAsignatura(asig) !== null).length
);
const faltanAulas = computed(() => aulasAsignadas.value < aulasNecesarias.value);

// Filas de la tabla "asignatura ↔ aula": una fila por optativa del bloque. Como el desdoble es ahora una relación
// POR ASIGNATURA, cada fila empareja la asignatura con su aula asignada (si la tiene).
const filasDesdoble = computed(() =>
  asignaturasDelBloque.value.map(asig => ({ asignatura: asig, aula: aulaDeAsignatura(asig) }))
);

// Catálogo COMPLETO de aulas del curso académico: las disponibles (sin docencia) MÁS las usadas como aula de
// referencia (fijo). El uso como fijo NO consume el aula para desdoble (a una hora de la mañana los alumnos de ese
// grupo pueden ir a otras aulas a las optativas o quedarse en la suya), por lo que el catálogo se ofrece íntegro
// para desdoble, independientemente de las asignaciones fijas.
const catalogoCompletoEspacios = computed(() => {
  const porNombre = new Map();
  for (const espacio of espaciosDisponibles.value) {
    porNombre.set(espacio.nombre, espacio);
  }
  for (const fijo of espaciosAsignados.value) {
    if (fijo && fijo.nombre && !porNombre.has(fijo.nombre)) {
      porNombre.set(fijo.nombre, { nombre: fijo.nombre });
    }
  }
  return [...porNombre.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// Pool de aulas disponibles para DESDOBLE: el desdoble NO consume el aula (un mismo espacio puede ser desdoble de
// varios bloques) y el uso como fijo TAMPOCO lo consume para desdoble. Por eso partimos del catálogo COMPLETO del
// curso (disponibles + fijos) y solo ocultamos las que YA están asignadas como desdoble a ESTE mismo bloque (para
// no ofrecer un alta duplicada). Las aulas que son desdoble de otros bloques o aula de referencia siguen ofreciéndose.
const espaciosDisponiblesDesdoble = computed(() => {
  const nombresEnEsteBloque = new Set(desdoblesDelBloque.value.map(d => d.nombre));
  return catalogoCompletoEspacios.value.filter(espacio => !nombresEnEsteBloque.has(espacio.nombre));
});

// Pool de aulas disponibles para AULA DE REFERENCIA (fijo): son las aulas del catálogo del curso que no están ya
// ocupadas como fijo (es decir, las "sin docencia"). Un aula usada como desdoble SÍ puede elegirse como aula de
// referencia (un grupo puede no salir de su aula de referencia en las optativas), por lo que NO se excluyen las
// aulas usadas como desdoble.
const espaciosDisponiblesFijo = computed(() => espaciosDisponibles.value);

// Inicializa la lista fija de grupos (A-H) con el horario matutino por defecto (igual que el backend).
const inicializarGruposFijos = () => {
  infoGrupos.value = GRUPOS_FIJOS.map(letra => ({ grupo: letra, horarioMatutino: true }));
};

const actualizarSelect = (parametro) => {
    filtroSeleccionado.value = parametro;
    filtroSeleccionadoString.value = `${parametro.curso}-${parametro.etapa}`;
    grupoSeleccionado.value = '';
    espacioSeleccionado.value = '';
    bloqueSeleccionado.value = '';
    asignaturaDesdobleSeleccionada.value = '';
    espacioDesdobleSeleccionado.value = '';
    alumnosPorGrupo.value = {};
    listadoAlumnosSinGrupo.value = [];

    inicializarGruposFijos();
    obtenerAlumnos();
    cargarEspacios();
    cargarBloques();
};

const actualizarGrupo = (parametro) => {
    grupoSeleccionado.value = parametro;

};

const obtenerAlumnos = async () => {
  try {
    const { curso, etapa } = filtroSeleccionado.value;

    const data = await obtenerAlumnosSinGrupos(curso,etapa,toastMessage, toastColor, isToastOpen) || [];

    listadoAlumnosSinGrupo.value = data.filter(function (el) {
        return el.asignado === false;
      })
    console.log(listadoAlumnosSinGrupo)

    alumnosPorGrupo.value = {}; //HAY QUE LIMPIAR PRIMERO, SI NO SE DUPLICAN

    //La comprobacion de los grupos se realiza si la variable info grupos no esta vacía, asi se evita una falsa excepcion
    if(infoGrupos.value !== undefined) {
    for (const infoGrupo of infoGrupos.value) {

      const alumnosDeEseGrupo = await obtenerAlumnosConGrupos(
          curso, etapa, infoGrupo.grupo, toastMessage, toastColor, isToastOpen
      );
      console.log(`Alumnos de grupo ${infoGrupo.grupo}`, alumnosDeEseGrupo);
      // Guardamos ese array bajo la clave del grupo
      alumnosPorGrupo.value[infoGrupo.grupo] = alumnosDeEseGrupo;
      }
    }
  }
  catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error( error);
  }
};

const limpiarUploaderAlumnos = () => {
  if (fileUploadAlumnosRef.value) {
    fileUploadAlumnosRef.value.fileClear();
  }
};

const construirMensajeResultadoCsv = (resultado) => {
  const creados = resultado?.creados ?? 0;
  const omitidos = resultado?.omitidos ?? 0;
  let mensaje = `Carga completada: ${creados} alumno(s) creado(s)`;
  if (omitidos > 0) {
    mensaje += `, ${omitidos} ya existían (omitidos)`;
  }
  if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
    mensaje += `, ${resultado.errores.length} fila(s) con avisos`;
  }
  return mensaje;
};

const onArchivoAlumnosCsvSeleccionado = async (archivo) => {
  if (!archivo) {
    return;
  }

  const nombre = (archivo.name || '').toLowerCase();
  if (!nombre.endsWith('.csv')) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El archivo debe tener extensión .csv');
    limpiarUploaderAlumnos();
    return;
  }

  isLoading.value = true;
  try {
    const resultado = await subirAlumnosCsv(archivo, toastMessage, toastColor, isToastOpen);

    // Refrescamos las listas/tablas de la vista para reflejar los alumnos cargados
    await obtenerAlumnos();

    const huboAvisos = Array.isArray(resultado?.errores) && resultado.errores.length > 0;
    crearToast(toastMessage, toastColor, isToastOpen, huboAvisos ? 'warning' : 'success', construirMensajeResultadoCsv(resultado));
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'Error al cargar el fichero de alumnos.');
    console.error(error);
  } finally {
    isLoading.value = false;
    limpiarUploaderAlumnos();
  }
};

const asignarAlumno = async () => {
  try {
    const { curso, etapa } = filtroSeleccionado.value;
    const grupo = grupoSeleccionado.value;
    if (!grupo) {
      // Si no se ha seleccionado grupo, avisas o retornas
      mensajeActualizacion = "Debes seleccionar un grupo antes de añadir alumnos.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }
    const cursoInt = parseInt(curso);

    if(listadoAlumnosSeleccionados.value.length === 0) {
      // Si no se han seleccionado alumnos, avisas o retornas
      mensajeActualizacion = "Debes seleccionar al menos un alumno antes de añadirlo al grupo.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    isLoading.value = true; // Activar el estado de carga
    const response = await asignarAlumnos(cursoInt, etapa, grupo, listadoAlumnosSeleccionados.value, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Alumnos añadidos correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    const idsSeleccionados = listadoAlumnosSeleccionados.value.map(a => a.nombre + ' ' + a.apellidos);
    listadoAlumnosSinGrupo.value = listadoAlumnosSinGrupo.value.filter(
      (al) => !idsSeleccionados.includes(al.nombre + ' ' + al.apellidos)
    );

    // Limpiamos el array de alumnos sin grupo para que no se repitan
    listadoAlumnosSinGrupo.value = listadoAlumnosSinGrupo.value.filter(alumno => !listadoAlumnosSeleccionados.value.includes(alumno));

    // Y los añadimos al array del grupo
    if (!alumnosPorGrupo.value[grupo]) {
      alumnosPorGrupo.value[grupo] = [];
    }
    alumnosPorGrupo.value[grupo].push(...listadoAlumnosSeleccionados.value);

    // Limpiamos selección
    listadoAlumnosSeleccionados.value = [];

  } catch (error) {
    mensajeActualizacion = "Error al añadir alumnos.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
  finally {
    console.log("Desactivando spinner...");
    isLoading.value = false; // Desactivar el estado de carga
  }
};

const borrarAlumno = async (alumno, grupo) => {
  try {
    const response = await borrarAlumnos({ ...alumno, grupo }, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Alumno borrado correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
      // Buscar el índice del alumno dentro del grupo
    const index = alumnosPorGrupo.value[grupo].findIndex(a =>
      a.nombre === alumno.nombre && a.apellidos === alumno.apellidos
    );

    // Si el alumno está en la lista, lo eliminamos con splice()
    if (index !== -1) {
      alumnosPorGrupo.value[grupo].splice(index, 1);
    }

    console.log("Después de borrar, grupo:", grupo, alumnosPorGrupo.value[grupo]);

    // Agregarlo a la lista de alumnos sin grupo
    listadoAlumnosSinGrupo.value.push(alumno);
    listadoAlumnosSinGrupo.value.sort((a, b) => { //Primero filtra por nombre y después por apellido
      const cmpApellidos  = a.apellidos.localeCompare(b.apellidos);
      if (cmpApellidos  !== 0) return cmpApellidos ;
      return a.nombre.localeCompare(b.nombre);
    });
    
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    console.log("Antes de borrar, grupo:", grupo, alumnosPorGrupo.value[grupo]);

    
  } catch (error) {
    mensajeActualizacion = "Error al borrar el alumno.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const limpiarGrupo = async (grupo) => {
  try {
    const alumnosDeEsteGrupo = alumnosPorGrupo.value[grupo] || [];
    for (const alumno of alumnosDeEsteGrupo) {
      isLoading.value = true; // Activar el estado de carga
      const response = await borrarAlumnos({ ...alumno, grupo }, toastMessage, toastColor, isToastOpen);

      if(response.ok) {
      mensajeActualizacion = "Grupo limpiado correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      listadoAlumnosSinGrupo.value.push(alumno);
      listadoAlumnosSinGrupo.value.sort((a, b) => { //Primero filtra por nombre y después por apellido
        const cmpApellidos  = a.apellidos.localeCompare(b.apellidos);
        if (cmpApellidos  !== 0) return cmpApellidos ;
        return a.nombre.localeCompare(b.nombre);
      });

      alumnosPorGrupo.value[grupo] = [];
      
      } else {
        const errorData = await response.json();
        mensajeColor = 'danger';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
      }     
    }
    
  } catch (error) {
    mensajeActualizacion = "Error al limpiar el grupo.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
  finally {
    console.log("Desactivando spinner...");
    isLoading.value = false; // Desactivar el estado de carga
  }
};

const seleccionarTodo = () => {
  listadoAlumnosSeleccionados.value = [...listadoAlumnosSinGrupo.value];
};

const deseleccionarTodo = () => {
  listadoAlumnosSeleccionados.value = [];
};

const actualizarTurno = async (infoGrupo) =>
{
  try
  {
    await actualizarTurnoHorario(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, infoGrupo.grupo, infoGrupo.horarioMatutino, toastMessage, toastColor, isToastOpen);    
  }
  catch (error)
  {
    // Revertimos el cambio en el modelo si la API falla
    infoGrupo.horarioMatutino = !infoGrupo.horarioMatutino;
    
    // Mostramos toast de error
    mensajeActualizacion = "Error al actualizar el turno horario.";
    mensajeColor = "danger";

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error("Error actualizando turno:", error);
  }
};

const cargarEspacios = async () => {
  try {
    const [disponibles, asignados, desdobles] = await Promise.all([
      obtenerEspaciosDisponibles(toastMessage, toastColor, isToastOpen),
      obtenerEspaciosFijoAsignados(toastMessage, toastColor, isToastOpen),
      obtenerEspaciosDesdobleAsignados(toastMessage, toastColor, isToastOpen)
    ]);
    espaciosDisponibles.value = (disponibles || []).slice().sort((a, b) => a.nombre.localeCompare(b.nombre));
    espaciosAsignados.value = asignados || [];
    desdoblesAsignados.value = desdobles || [];
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const cargarBloques = async () => {
  const { curso, etapa } = filtroSeleccionado.value;
  if (!curso || !etapa) {
    bloques.value = [];
    return;
  }
  try {
    const data = await obtenerBloquesConAsignaturas(curso, etapa, toastMessage, toastColor, isToastOpen);
    bloques.value = Array.isArray(data) ? data : [];
  } catch (error) {
    bloques.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al obtener los bloques.");
    console.error(error);
  }
};

const asignarEspacio = async () => {
  const { curso, etapa } = filtroSeleccionado.value;
  const grupo = grupoSeleccionado.value;

  if (!grupo) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Selecciona el grupo destino en el desplegable superior antes de asignar el espacio.");
    return;
  }
  if (!espacioSeleccionado.value) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Debes seleccionar un espacio disponible.");
    return;
  }

  try {
    isLoading.value = true;
    await crearEspacioFijo(toastMessage, toastColor, isToastOpen, {
      nombre: espacioSeleccionado.value,
      curso: parseInt(curso, 10),
      etapa,
      grupo
    });
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Espacio asignado correctamente.");
    espacioSeleccionado.value = '';
    await cargarEspacios();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al asignar el espacio.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const desasignarEspacio = async (nombre) => {
  try {
    isLoading.value = true;
    await borrarEspacioFijo(toastMessage, toastColor, isToastOpen, { nombre });
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Espacio desasignado correctamente.");
    await cargarEspacios();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al desasignar el espacio.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const asignarDesdoble = async () => {
  if (!bloqueSeleccionado.value) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Debes seleccionar un bloque antes de asignar el aula de desdoble.");
    return;
  }
  if (!asignaturaDesdobleSeleccionada.value) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Debes seleccionar la asignatura del bloque a la que asignar el aula.");
    return;
  }
  if (!espacioDesdobleSeleccionado.value) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "Debes seleccionar un aula disponible.");
    return;
  }

  // TOPE: no se pueden asignar más aulas que asignaturas tiene el bloque. Como la asignación es por asignatura
  // (con reemplazo), solo hay que impedir dar de alta una asignatura NUEVA cuando ya se ha cubierto el tope.
  const yaTieneAula = aulaDeAsignatura(asignaturaDesdobleSeleccionada.value) !== null;
  if (!yaTieneAula && aulasAsignadas.value >= aulasNecesarias.value) {
    crearToast(toastMessage, toastColor, isToastOpen, "warning", "No se pueden asignar más aulas de desdoble que asignaturas tiene el bloque.");
    return;
  }

  try {
    isLoading.value = true;
    await asignarEspacioDesdoble(toastMessage, toastColor, isToastOpen, {
      nombre: espacioDesdobleSeleccionado.value,
      bloqueId: bloqueSeleccionado.value,
      asignatura: asignaturaDesdobleSeleccionada.value
    });
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Aula de desdoble asignada correctamente.");
    espacioDesdobleSeleccionado.value = '';
    asignaturaDesdobleSeleccionada.value = '';
    await cargarEspacios();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al asignar el aula de desdoble.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const desasignarDesdoble = async (nombre, bloqueId, asignatura) => {
  try {
    isLoading.value = true;
    await desasignarEspacioDesdoble(toastMessage, toastColor, isToastOpen, {
      nombre,
      bloqueId: bloqueId ?? bloqueSeleccionado.value,
      asignatura
    });
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Aula de desdoble desasignada correctamente.");
    await cargarEspacios();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al desasignar el aula de desdoble.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const sincronizarCursoAcademico = async () => {
  try {
    const curso = (await obtenerCursoAcademicoSeleccionado(isToastOpen, toastMessage, toastColor))?.trim();
    if (curso) {
      cursoAcademico.value = curso;
      localStorage.setItem('cursoAcademicoSeleccionado', curso);
      return;
    }
  } catch (error) {
    console.error(error);
  }
  cursoAcademico.value = localStorage.getItem('cursoAcademicoSeleccionado') || '';
};

const onCursoAcademicoCambiado = (event) => {
  cursoAcademico.value = event.detail?.cursoAcademico || '';
  if (cursoAcademico.value) {
    localStorage.setItem('cursoAcademicoSeleccionado', cursoAcademico.value);
  }
};

onMounted(async () => {
  await sincronizarCursoAcademico();
  window.addEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
});

onUnmounted(() => {
  window.removeEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
});
</script>

<style scoped>
.school-manager-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: "Roboto", sans-serif;
}

.page-header {
  margin-bottom: 1.75rem;
  width: 100%;
}

.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  text-align: center;
}

.page-subtitle {
  margin: 0;
}

.main-panel {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 8px 24px;
  padding: 1.5rem;
}

.top-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
  width: 100%;
  gap: 1.25rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  padding: 1.25rem 1rem 1rem;
  box-sizing: border-box;
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.35;
  color: #1a1a1a;
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.card-upload-alumnos {
  width: 450px;
  max-width: 100%;
}

.card-upload-table {
  width: 540px;
  max-width: 100%;
  /* La tarjeta se estira al alto de "Alumnos y grupos" (align-items: stretch del contenedor) y recorta el exceso.
     El scroll vivo se delega al card-body absoluto, de modo que la altura no la marca su propio contenido. */
  position: relative;
  overflow: hidden;
}

/* Card-body de "Grupos creados": ocupa todo el alto de la tarjeta (por debajo del título) y desplaza su contenido
   internamente. Al estar posicionado de forma absoluta, NO contribuye al alto intrínseco de la tarjeta, por lo que
   es la tarjeta "Alumnos y grupos" la que fija el alto de la fila y ambas columnas quedan alineadas (Tarea 5). */
.card-body-grupos {
  position: absolute;
  top: 3.4rem;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  overflow-y: auto;
}

.texto-dropdown {
  font-size: 1rem;
}

.custom-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  font-size: 15px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background-color: white;
  color: #000;
  outline: none;
  cursor: pointer;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.fila-botones {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn-primary {
  width: 100%;
  margin-top: auto;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border-radius: 6px;
  text-transform: uppercase;
  border: none;
  color: white;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-primary:disabled {
  background-color: #7fa9f4;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #90caf9;
  border-radius: 6px;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #bbdefb;
}

.cantidad-alumnos {
  font-size: 1.05rem;
  text-align: center;
  margin: 0;
}

.lista-alumnos {
  max-height: 12rem;
  height: 11.5rem;
  overflow: auto;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #cfd8e3;
  background-color: #fff;
}

.posicion-lista {
  display: block;
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.texto-lista-alumnos {
  font-size: 1rem;
  padding: 0.15rem;
  display: block;
  margin: 6px;
}

.texto-lista-alumnos:hover {
  color: #2196f3;
}

.group-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.grupo-bloque {
  width: 100%;
  margin-bottom: 1rem;
}

.t-3 {
  font-weight: 700;
  font-size: 1.1rem;
  text-align: center;
  margin: 1rem 0;
}

.limpiar-grupo {
  color: #dc3545;
  font-size: 14px;
  text-decoration: underline;
  background-color: transparent;
  line-height: 1;
  border: none;
  cursor: pointer;
}

.cantidad-alumnos-tabla {
  font-size: 1rem;
  margin-bottom: 10px;
}

.horario-checkbox {
  float: right;
  display: inline-block;
  text-align: right;
  margin-left: auto;
  vertical-align: middle;
  margin-right: 10px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

/* Tablas de "Grupos creados": el ÚNICO contenedor con scroll es el card-body (.card-body-grupos). Por eso el
   envoltorio de cada tabla de grupo NO debe crear su propio scroll (rompería el sticky): lo dejamos en overflow
   visible y sin alto máximo, de modo que el scroll viva en el card-body. */
.table-scroll-grupos {
  overflow: visible;
  max-height: none;
}

/* La tabla no debe ser contenedor de scroll para que el sticky de su cabecera se ancle al card-body (Tarea 1). */
.tabla-alumnos-grupos {
  overflow: visible;
}

/* Cabecera fija (sticky) de CADA tabla de grupo: se ancla al top del card-body con scroll. Al desplazar la lista,
   la cabecera del grupo actual permanece visible hasta que el siguiente grupo la sustituye (Tarea 1). */
.card-body-grupos .tabla-alumnos-grupos thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

/* Fila con la lista de "Alumnos disponibles" y, a su derecha, la zona de carga de alumnos por fichero CSV. */
.alumnos-disponibles-row {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 1rem;
}

.alumnos-disponibles-field {
  flex: 1 1 60%;
  min-width: 220px;
}

.carga-alumnos-field {
  flex: 1 1 35%;
  min-width: 180px;
  justify-content: flex-start;
}

.aula-referencia-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #cfd8e3;
}

.tabla-alumnos {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}

.tabla-alumnos th,
.tabla-alumnos td {
  border: 2px solid #007bff;
  padding: 8px 6px;
}

.tabla-alumnos th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

.tabla-alumnos td {
  background-color: #e9f5ff;
  height: 38px;
}

.tabla-alumnos tr:hover td {
  background-color: #d0eaff;
}

.btn-delete {
  display: block;
  margin: auto;
  padding: 2px 9px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.2;
  cursor: pointer;
}

.empty-state {
  margin: 0;
  padding: 1.25rem;
  text-align: center;
  color: #666;
  background-color: #f8f9fa;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
}

.card-espacios {
  width: 100%;
  max-width: 1010px;
  margin: 1.25rem auto 0;
}

/* Tarjeta "Aula de referencia": va en su propia tarjeta a ancho completo, con el MISMO ancho que la tarjeta
   "Aulas de desdoble por bloque" (Tarea 4), para que la tarjeta izquierda "Alumnos y grupos" no quede tan grande. */
.card-aula-referencia {
  width: 100%;
  max-width: 1010px;
  margin: 1.25rem auto 0;
}

.espacios-ayuda {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.espacios-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.espacios-form .field {
  flex: 1;
  min-width: 200px;
}

.btn-espacio {
  width: auto;
  margin-top: 0;
  flex: 0 0 auto;
  padding: 10px 18px;
}

.espacios-asignados {
  margin-top: 1rem;
}

.lista-espacios {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-espacio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #e9f5ff;
  border: 1px solid #90caf9;
  border-radius: 6px;
  color: #1a1a1a;
}

.custom-select-multiple {
  min-height: 72px;
  padding-block: 6px;
  cursor: default;
}

.custom-select-multiple option {
  padding: 6px 8px;
}

.lista-alumnos-select {
  height: 12rem;
}

.field-hint {
  font-size: 0.8rem;
  color: #666;
}

.asignaturas-bloque {
  margin-top: 1rem;
}

.desdoble-tabla-wrap {
  margin-top: 1rem;
}

.aviso-aulas {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.95rem;
  background-color: #e8f5e9;
  border: 1px solid #66bb6a;
  color: #1b5e20;
}

.aviso-aulas.aviso-aulas-falta {
  background-color: #fff3e0;
  border-color: #ffa726;
  color: #b25000;
}

.aviso-aulas-icono {
  font-size: 1.1rem;
  line-height: 1;
}

.tabla-desdoble th,
.tabla-desdoble td {
  text-align: left;
}

.tabla-desdoble td:last-child,
.tabla-desdoble th:last-child {
  text-align: center;
  width: 70px;
}

.celda-vacia {
  color: #999;
  font-style: italic;
}

.destino-aviso {
  margin: 0 0 0.75rem;
}

.fondo-gris {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circulo {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  z-index: 9999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .page-subtitle, .empty-state, .posicion-lista, .espacios-ayuda, .field-hint { color: #c8c8c8; }
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label { color: var(--text-color-dark); }
  .empty-state { background-color: #2a302b; border-color: #555; }
  .lista-alumnos { background-color: #1e1e1e; border-color: #555; }
  .item-espacio { background-color: #2a3942; border-color: #3a5a6a; color: var(--text-color-dark); }

  .btn-secondary {
    background-color: #2a3942;
    color: #90caf9;
    border-color: #3a5a6a;
  }

  .btn-secondary:hover {
    background-color: #34474f;
  }

  .aviso-aulas { background-color: #1f3a23; border-color: #3c7a44; color: #b7e2bd; }
  .aviso-aulas.aviso-aulas-falta { background-color: #3a2f1c; border-color: #b9803a; color: #f0c48a; }
  .celda-vacia { color: #9aa0a6; }
}

@media (max-width: 768px) {
  .school-manager-page { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }

  .top-container {
    flex-direction: column;
    align-items: center;
  }

  .card-upload-alumnos,
  .card-upload-table {
    width: 100%;
    max-width: 500px;
  }

  /* En móvil las tarjetas se apilan y no hay alto compartido: el card-body de "Grupos creados" vuelve al flujo
     normal con su propio scroll para no colapsar la tarjeta (la posición absoluta solo aplica en escritorio). */
  .card-upload-table {
    overflow: visible;
  }

  .card-body-grupos {
    position: static;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    max-height: 60vh;
  }
}
</style>
