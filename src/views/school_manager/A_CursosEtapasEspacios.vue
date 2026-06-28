<template>
  <div class="page-cursos-espacios">
    <header class="page-header">
      <h1 class="t-1">Configuración básica</h1>
      <SchoolManagerNav>
        <p class="page-subtitle">Elige el curso académico y añade espacios, departamentos y cursos y etapas</p>
      </SchoolManagerNav>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Acciones</h2>

        <div class="actions-grid">
          <!-- Elección de curso académico (sin modo dual)-->
          <article class="action-card">
            <h3 class="card-title">Selector de curso académico</h3>
            <div class="card-body">
              <div class="field">
                <label for="curso-elegido">Curso académico</label>
                <select id="curso-elegido" v-model="cursoElegido" class="custom-select">
                  <option
                    v-for="curso in cursos"
                    :key="curso.cursoAcademico"
                    :value="curso.cursoAcademico"
                  >
                    {{ curso.cursoAcademico }}
                  </option>
                </select>
              </div>
            </div>
          </article>

          <!-- Creador (modo dual)-->
          <article class="action-card">
            <h3 class="card-title">Crear</h3>
            <div class="card-body">
              <div class="field">
                <label for="modo-creador">Modo</label>
                <select id="modo-creador" v-model="modoCreador" class="custom-select">
                  <option value="espacios">Espacios</option>
                  <option value="cursos_etapas">Cursos y etapas</option>
                  <option value="departamentos">Departamentos</option>
                  <option value="reducciones">Reducciones</option>
                </select>
              </div>

              <template v-if="modoCreador === 'espacios'">
                <div class="field">
                  <label for="nombre-creador">Nombre del espacio</label>
                  <input
                    id="nombre-creador"
                    type="text"
                    v-model="nombreCreador"
                    placeholder="Nombre del espacio"
                  />
                </div>
              </template>

              <template v-else-if="modoCreador === 'departamentos'">
                <div class="field">
                  <label for="nombre-departamento">Nombre</label>
                  <input
                    id="nombre-departamento"
                    type="text"
                    v-model="nombreDepartamentoCreador"
                    placeholder="Nombre del departamento"
                  />
                </div>
              </template>

              <template v-else-if="modoCreador === MODO_REDUCCIONES">
                <div class="field">
                  <label for="tipo-reduccion-creador">Tipo de reducción</label>
                  <select
                    id="tipo-reduccion-creador"
                    v-model="tipoReduccionCreador"
                    class="custom-select"
                  >
                    <option :value="TIPO_REDUCCION_NO_TUTORIAS">Reducciones (no tutorías)</option>
                    <option :value="TIPO_REDUCCION_TUTORIAS">Reducciones (tutorías)</option>
                  </select>
                </div>

                <div class="field">
                  <label for="nombre-reduccion-creador">Nombre</label>
                  <input
                    id="nombre-reduccion-creador"
                    type="text"
                    v-model="nombreReduccionCreador"
                    placeholder="Nombre de la reducción"
                  />
                </div>

                <div class="field">
                  <label for="horas-reduccion-creador">Horas</label>
                  <input
                    id="horas-reduccion-creador"
                    type="number"
                    min="0"
                    step="1"
                    v-model.number="horasReduccionCreador"
                    placeholder="Ej: 2"
                  />
                </div>

                <div v-if="tipoReduccionCreador === TIPO_REDUCCION_TUTORIAS" class="field">
                  <label for="curso-etapa-reduccion-creador">Curso y etapa</label>
                  <select
                    id="curso-etapa-reduccion-creador"
                    v-model="cursoEtapaReduccionCreador"
                    class="custom-select"
                  >
                    <option disabled :value="null">Selecciona un curso y etapa</option>
                    <option
                      v-for="ce in cursosEtapasConGrupos"
                      :key="`${ce.curso}-${ce.etapa}`"
                      :value="ce"
                    >
                      {{ ce.curso }}º {{ ce.etapa }}
                    </option>
                  </select>
                  <span class="field-hint">Solo se muestran cursos y etapas con grupos creados o bloques de optativas.</span>
                </div>
              </template>

              <template v-else>
                <div class="field">
                  <label for="curso-creador">Curso</label>
                  <input
                    id="curso-creador"
                    type="number"
                    min="1"
                    step="1"
                    v-model.number="cursoCreador"
                    placeholder="Ej: 1"
                  />
                </div>

                <div class="field">
                  <label for="etapa-creador">Etapa</label>
                  <input
                    id="etapa-creador"
                    type="text"
                    v-model="etapaCreador"
                    placeholder="Ej: ESO"
                  />
                </div>

                <label class="checkbox-field" for="eso-bachillerato-creador">
                  <input
                    id="eso-bachillerato-creador"
                    type="checkbox"
                    v-model="esoBachilleratoCreador"
                  />
                  <span>ESO / Bachillerato</span>
                </label>
              </template>

              <button type="button" class="btn-primary" @click="crearElemento">
                Crear
              </button>

              <div class="separador-o" aria-hidden="true">
                <span>ó</span>
              </div>

              <div class="field">
                <label>{{ etiquetaCargaCsv }}</label>
                <FileUpload
                  ref="fileUploadCsvRef"
                  accept=".csv"
                  @file-selected="onArchivoCsvSeleccionado"
                />
                <span class="field-hint">{{ ayudaCargaCsv }}</span>
              </div>

              <div v-if="cargandoCsv" class="fondo-gris">
                <div class="circulo"></div>
              </div>
            </div>
          </article>

          <!-- Copiar (modo dual)-->
          <article class="action-card">
            <h3 class="card-title">Copiar</h3>
            <div class="card-body">
              <div class="field">
                <label for="modo-copiar">Modo</label>
                <select id="modo-copiar" v-model="modoCopiar" class="custom-select">
                  <option value="espacios">Espacios</option>
                  <option value="cursos_etapas">Cursos y etapas</option>
                  <option value="asignaturas">Asignaturas</option>
                  <option value="reducciones">Reducciones</option>
                  <option value="departamentos">Departamentos</option>
                </select>
              </div>

              <div class="field">
                <label for="curso-origen">Origen</label>
                <select id="curso-origen" v-model="cursoOrigen" class="custom-select">
                  <option disabled :value="null">Selecciona un curso académico</option>
                  <option
                    v-for="curso in cursos"
                    :key="'origen-' + curso.cursoAcademico"
                    :value="curso.cursoAcademico"
                  >
                    {{ curso.cursoAcademico }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label for="curso-destino">Destino</label>
                <select id="curso-destino" v-model="cursoDestino" class="custom-select">
                  <option disabled :value="null">Selecciona un curso académico</option>
                  <option
                    v-for="curso in cursos"
                    :key="'destino-' + curso.cursoAcademico"
                    :value="curso.cursoAcademico"
                  >
                    {{ curso.cursoAcademico }}
                  </option>
                </select>
              </div>

              <span v-if="modoCopiar === MODO_ASIGNATURAS || modoCopiar === MODO_REDUCCIONES" class="field-hint">
                Al copiar {{ modoCopiar === MODO_ASIGNATURAS ? 'asignaturas' : 'reducciones' }} se incluyen
                automáticamente los cursos y etapas necesarios.
              </span>
              <span v-if="modoCopiar === MODO_REDUCCIONES" class="field-hint">
                Se copian todas las reducciones (tutorías y no tutorías).
              </span>

              <button type="button" class="btn-primary" @click="copiarElementos">
                Copiar
              </button>
            </div>
          </article>
        </div>
      </section>

      <div class="panel-divider" aria-hidden="true"></div>

      <section class="panel-section listado-section">
        <div class="listado-header">
          <div class="listado-header-left">
            <h2 class="section-title section-title-inline">Listado</h2>
            <div class="listado-filtros">
              <div class="field field-inline">
                <label for="modo-listado">Modo</label>
                <select id="modo-listado" v-model="modoListado" class="custom-select custom-select-compact">
                  <option value="espacios">Espacios</option>
                  <option value="cursos_etapas">Cursos y etapas</option>
                  <option value="asignaturas">Asignaturas</option>
                  <option value="reducciones">Reducciones</option>
                  <option value="departamentos">Departamentos</option>
                </select>
              </div>
              <div v-if="modoListado === MODO_REDUCCIONES" class="field field-inline">
                <label for="tipo-reduccion-listado">Tipo</label>
                <select id="tipo-reduccion-listado" v-model="tipoReduccionListado" class="custom-select custom-select-compact">
                  <option :value="TIPO_REDUCCION_NO_TUTORIAS">Reducciones (no tutorías)</option>
                  <option :value="TIPO_REDUCCION_TUTORIAS">Reducciones (tutorías)</option>
                </select>
              </div>
            </div>
            <p v-if="cursoElegido" class="listado-context">
              Curso académico: <strong>{{ cursoElegido }}</strong>
            </p>
          </div>
          <button
            v-if="mostrarBorrarTodos"
            type="button"
            class="btn-delete btn-borrar-todos"
            :disabled="!cursoElegido"
            @click="borrarTodos"
          >
            {{ textoBorrarTodos }}
          </button>
        </div>

        <!-- Listado espacios-->
        <template v-if="modoListado === 'espacios'">
          <div class="table-scroll" v-if="espaciosOrdenados.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in espaciosOrdenados" :key="e.nombre">
                  <td>{{ e.nombre }}</td>
                  <td>
                    <button type="button" class="btn-delete" @click="eliminarEspacio(e)">X</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-state">No hay espacios creados para este curso académico.</p>
        </template>

        <!-- Listado cursos y etapas (modo "Cursos y etapas") -->
        <template v-else-if="modoListado === MODO_CURSOS_ETAPAS">
          <div class="table-scroll" v-if="cursosEtapasOrdenados.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Etapa</th>
                  <th>ESO / Bachillerato</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in cursosEtapasOrdenados"
                  :key="`${item.curso}-${item.etapa}`"
                >
                  <td>{{ item.curso }}</td>
                  <td>{{ item.etapa }}</td>
                  <td>{{ item.esoBachillerato ? 'Sí' : 'No' }}</td>
                  <td>
                    <button type="button" class="btn-delete" @click="eliminarCursoEtapaItem(item)">X</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-state">No hay cursos y etapas registrados.</p>
        </template>

        <!-- Listado asignaturas (modo "Asignaturas") -->
        <template v-else-if="modoListado === MODO_ASIGNATURAS">
          <div class="table-scroll" v-if="asignaturasListadoOrdenadas.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Etapa</th>
                  <th>Asignatura</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in asignaturasListadoOrdenadas"
                  :key="`${item.curso}-${item.etapa}-${item.nombre}-${index}`"
                >
                  <td>{{ item.curso }}</td>
                  <td>{{ item.etapa }}</td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.horas }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-state">No hay asignaturas registradas para este curso académico.</p>
        </template>

        <!-- Listado reducciones (modo propio con sub-selección tutorías / no tutorías) -->
        <template v-else-if="modoListado === MODO_REDUCCIONES">
          <!-- Reducciones (no tutorías) -->
          <template v-if="tipoReduccionListado === TIPO_REDUCCION_NO_TUTORIAS">
            <div class="table-scroll" v-if="reduccionesNoTutoriasOrdenadas.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Horas</th>
                    <th>Asigna dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in reduccionesNoTutoriasOrdenadas"
                    :key="`${item.nombre}-${item.horas}-${index}`"
                  >
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.horas }}</td>
                    <td>{{ item.decideDireccion ? 'Sí' : 'No' }}</td>
                    <td>
                      <button type="button" class="btn-delete" @click="eliminarReduccion(item)">X</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="empty-state">No hay reducciones (no tutorías) registradas para este curso académico.</p>
          </template>

          <!-- Reducciones (tutorías) -->
          <template v-else>
            <div class="table-scroll" v-if="reduccionesTutoriasOrdenadas.length > 0">
              <table>
                <thead>
                  <tr>
                    <th>Curso / Etapa</th>
                    <th>Nombre</th>
                    <th>Horas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in reduccionesTutoriasOrdenadas"
                    :key="`${item.nombre}-${item.horas}-${index}`"
                  >
                    <td>{{ item.cursoEtapa }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.horas }}</td>
                    <td>
                      <button type="button" class="btn-delete" @click="eliminarReduccion(item)">X</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="empty-state">No hay reducciones (tutorías) registradas para este curso académico.</p>
          </template>
        </template>

        <!-- Listado departamentos -->
        <template v-else>
          <div class="table-scroll" v-if="departamentosOrdenados.length > 0">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in departamentosOrdenados" :key="d.nombre">
                  <td>{{ d.nombre }}</td>
                  <td>
                    <button type="button" class="btn-delete" @click="eliminarDepartamento(d)">X</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-state">No hay departamentos creados para este curso académico.</p>
        </template>
      </section>
    </div>
  </div>

  <IonToast
    :is-open="isToastOpen"
    :message="toastMessage"
    :color="toastColor"
    duration="2000"
    position="top"
    @didDismiss="isToastOpen = false"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { IonToast } from "@ionic/vue";
import SchoolManagerNav from "@/components/school_manager/SchoolManagerNav.vue";
import FileUpload from "@/components/printers/FileUpload.vue";
import {
  obtenerCursosAcademicos,
  seleccionarCursoAcademico,
  subirEspaciosCsv,
  subirCursosEtapasCsv,
  subirDepartamentosCsv,
  crearEspacioSinDocencia,
  obtenerEspaciosSinDocencia,
  borrarEspacioSinDocencia,
  copiarEspaciosCursoAcademico,
  borrarTodosEspaciosCursoAcademico,
  crearCursoEtapa,
  listarCursosEtapas,
  borrarCursoEtapa,
  copiarCursosEtapasGruposCursoAcademico,
  borrarTodosCursosEtapasGruposCursoAcademico,
  listarAsignaturasCursoAcademico,
  listarReduccionesCursoAcademico,
  listarDepartamentos,
  crearDepartamento,
  copiarDepartamentosCursoAcademico,
  borrarTodosDepartamentosCursoAcademico,
  borrarDepartamento,
  crearReducciones,
  subirReduccionesTutoriasCsv,
  subirReduccionesNoTutoriasCsv,
  obtenerCursosEtapasGrupos,
  borrarReduccion,
  borrarTodasAsignaturas,
  borrarTodasReduccionesNoTutoria,
  borrarTodasReduccionesTutoria
} from "@/services/schoolManager";

const MODO_ESPACIOS = "espacios";
const MODO_CURSOS_ETAPAS = "cursos_etapas";
const MODO_ASIGNATURAS = "asignaturas";
const MODO_DEPARTAMENTOS = "departamentos";
const MODO_REDUCCIONES = "reducciones";

const TIPO_REDUCCION_NO_TUTORIAS = "no_tutorias";
const TIPO_REDUCCION_TUTORIAS = "tutorias";

// Grupo "catálogo" (curso/etapa registrado sin grupos reales). Se excluye del desplegable de tutorías para
// mostrar solo cursos/etapas que tengan grupos creados (A, B, …) o bloques de optativas. El backend ya excluye
// el grupo "Sin grupo" en este endpoint.
const GRUPO_CATALOGO_CURSO_ETAPA = "-";
// Opciones que entiende el endpoint de copia del backend (/cursosEtapasGrupos/copiar). Asignaturas y Reducciones
// ya son modos de primer nivel en la vista; cada uno se traduce a su opción de copia (el backend resuelve los
// cursos/etapas necesarios como prerrequisito automáticamente).
const OPCION_COPIA_CURSOS_ETAPAS = "cursos_etapas";
const OPCION_COPIA_ASIGNATURAS = "asignaturas";
const OPCION_COPIA_REDUCCIONES = "reducciones";
const STORAGE_KEY_ESO_BACHILLERATO_CREADOR = "school_manager_eso_bachillerato";

const cargarPreferenciaBoolean = (clave, valorPorDefecto) => {
  const guardado = localStorage.getItem(clave);
  if (guardado === null) return valorPorDefecto;
  return guardado === "true";
};

const cursoElegido = ref(null);
const cursos = ref([]);
const nombreCreador = ref("");
const cursoCreador = ref(null);
const etapaCreador = ref("");
const nombreDepartamentoCreador = ref("");

const tipoReduccionCreador = ref(TIPO_REDUCCION_NO_TUTORIAS);
const nombreReduccionCreador = ref("");
const horasReduccionCreador = ref(null);
const cursoEtapaReduccionCreador = ref(null);
const cursosEtapasConGrupos = ref([]);

const modoCreador = ref(MODO_ESPACIOS);
const modoCopiar = ref(MODO_ESPACIOS);
const modoListado = ref(MODO_ESPACIOS);
const esoBachilleratoCreador = ref(cargarPreferenciaBoolean(STORAGE_KEY_ESO_BACHILLERATO_CREADOR, true));

const cursoOrigen = ref(null);
const cursoDestino = ref(null);

const tipoReduccionListado = ref(TIPO_REDUCCION_NO_TUTORIAS);

const espacios = ref([]);
const cursosEtapas = ref([]);
const asignaturasListado = ref([]);
const reduccionesListado = ref([]);
const departamentos = ref([]);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

const fileUploadCsvRef = ref(null);
const cargandoCsv = ref(false);

const etiquetaCargaCsv = computed(() => {
  if (modoCreador.value === MODO_ESPACIOS) return "Carga espacios desde un CSV";
  if (modoCreador.value === MODO_DEPARTAMENTOS) return "Carga departamentos desde un CSV";
  if (modoCreador.value === MODO_REDUCCIONES) {
    return tipoReduccionCreador.value === TIPO_REDUCCION_TUTORIAS
      ? "Carga reducciones (tutorías) desde un CSV"
      : "Carga reducciones (no tutorías) desde un CSV";
  }
  return "Carga cursos y etapas desde un CSV";
});

const ayudaCargaCsv = computed(() => {
  if (modoCreador.value === MODO_CURSOS_ETAPAS) {
    return "CSV de 2 columnas (curso, etapa). La primera fila (cabecera) se ignora.";
  }
  if (modoCreador.value === MODO_REDUCCIONES) {
    return tipoReduccionCreador.value === TIPO_REDUCCION_TUTORIAS
      ? "CSV de 3 columnas (Curso, Etapa, Horas). La primera fila (cabecera) se ignora."
      : "CSV de 2 columnas (Nombre, Horas). La primera fila (cabecera) se ignora.";
  }
  return "CSV de 1 columna con un nombre por fila. La primera fila (cabecera) se ignora.";
});

let inicializandoCurso = true;
// Cuando el curso académico cambia desde otra ventana (evento global), sincronizamos
// `cursoElegido` sin volver a llamar a seleccionarCursoAcademico ni reemitir el evento.
let aplicandoCambioExterno = false;

const lanzarToast = (color, mensaje) => {
  isToastOpen.value = false;
  setTimeout(() => {
    toastColor.value = color;
    toastMessage.value = mensaje;
    isToastOpen.value = true;
  }, 10);
};

const espaciosOrdenados = computed(() => {
  return [...espacios.value].sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const cursosEtapasOrdenados = computed(() => {
  return [...cursosEtapas.value].sort((a, b) => {
    if (a.curso !== b.curso) return a.curso - b.curso;
    return a.etapa.localeCompare(b.etapa);
  });
});

const departamentosOrdenados = computed(() => {
  return [...departamentos.value].sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const asignaturasListadoOrdenadas = computed(() => {
  return [...asignaturasListado.value].sort((a, b) => {
    if (a.curso !== b.curso) return a.curso - b.curso;
    if (a.etapa !== b.etapa) return (a.etapa || "").localeCompare(b.etapa || "");
    return (a.nombre || "").localeCompare(b.nombre || "");
  });
});

// Una reducción es de TUTORÍAS si está vinculada a un curso/etapa o si su nombre sigue el patrón sintetizado
// "Tutoría <curso>º <etapa>" (las tutorías por CSV se persisten sin docencia, así que el nombre es el criterio fiable).
const esReduccionTutoria = (item) => {
  if (item.curso != null && item.etapa != null) return true;
  const nombre = (item.nombre || "").trim().toLowerCase();
  return nombre.startsWith("tutoría") || nombre.startsWith("tutoria");
};

// Para tutorías mostramos el curso/etapa: si está vinculado se usa directamente; si no, se extrae del nombre
// quitando el prefijo "Tutoría ".
const obtenerCursoEtapaTutoria = (item) => {
  if (item.curso != null && item.etapa != null) return `${item.curso}º ${item.etapa}`;
  const sinPrefijo = (item.nombre || "").trim().replace(/^tutor[ií]a\s+/i, "").trim();
  return sinPrefijo || "—";
};

const reduccionesNoTutoriasOrdenadas = computed(() => {
  return [...reduccionesListado.value]
    .filter((item) => !esReduccionTutoria(item))
    .sort((a, b) => {
      const nombreCmp = (a.nombre || "").localeCompare(b.nombre || "");
      if (nombreCmp !== 0) return nombreCmp;
      return (a.horas ?? 0) - (b.horas ?? 0);
    });
});

const reduccionesTutoriasOrdenadas = computed(() => {
  return [...reduccionesListado.value]
    .filter((item) => esReduccionTutoria(item))
    .map((item) => ({ ...item, cursoEtapa: obtenerCursoEtapaTutoria(item) }))
    .sort((a, b) => {
      const ceCmp = (a.cursoEtapa || "").localeCompare(b.cursoEtapa || "");
      if (ceCmp !== 0) return ceCmp;
      return (a.horas ?? 0) - (b.horas ?? 0);
    });
});

// "Borrar todos" aplica a espacios, departamentos, catálogo de cursos/etapas, asignaturas y reducciones.
// En reducciones el botón actúa sobre el subtipo seleccionado (tutorías / no tutorías).
const mostrarBorrarTodos = computed(() => {
  return modoListado.value === MODO_ESPACIOS
    || modoListado.value === MODO_DEPARTAMENTOS
    || modoListado.value === MODO_CURSOS_ETAPAS
    || modoListado.value === MODO_ASIGNATURAS
    || modoListado.value === MODO_REDUCCIONES;
});

const textoBorrarTodos = computed(() => {
  if (modoListado.value === MODO_ESPACIOS) return "Borrar todos de este curso académico";
  if (modoListado.value === MODO_DEPARTAMENTOS) return "Borrar todos los departamentos";
  if (modoListado.value === MODO_ASIGNATURAS) return "Borrar todas las asignaturas";
  if (modoListado.value === MODO_REDUCCIONES) {
    return tipoReduccionListado.value === TIPO_REDUCCION_TUTORIAS
      ? "Borrar todas las reducciones (tutorías)"
      : "Borrar todas las reducciones (no tutorías)";
  }
  return "Borrar todos los cursos y etapas";
});

const validarCursoEtapaDto = () => {
  const curso = cursoCreador.value;
  const etapa = etapaCreador.value.trim();

  if (curso === null || curso === undefined || Number.isNaN(curso) || curso < 1) {
    throw new Error("Introduce un curso numérico entero positivo");
  }
  if (!etapa) {
    throw new Error("Introduce la etapa");
  }

  return {
    curso: Math.trunc(curso),
    etapa,
    esoBachillerato: esoBachilleratoCreador.value
  };
};

watch(cursoElegido, async (nuevoCurso, cursoAnterior) => {
  if (inicializandoCurso) return;
  if (!nuevoCurso || nuevoCurso === cursoAnterior) return;
  // Cambio originado por otra ventana: solo recargamos el listado con el nuevo curso,
  // sin re-persistir ni reemitir el evento (evita bucles entre ventanas).
  if (aplicandoCambioExterno) {
    aplicandoCambioExterno = false;
    await cargarListado();
    return;
  }
  try {
    await seleccionarCursoAcademico(toastMessage, toastColor, isToastOpen, nuevoCurso);
    localStorage.setItem("cursoAcademicoSeleccionado", nuevoCurso);
    window.dispatchEvent(
      new CustomEvent("curso-academico-cambiado", { detail: { cursoAcademico: nuevoCurso } })
    );
    await cargarListado();
  } catch (error) {
    lanzarToast("danger", error.message);
  }
});

const onCursoAcademicoCambiado = (event) => {
  const nuevoCurso = event.detail?.cursoAcademico || '';
  // Ignoramos el evento que esta misma ventana acaba de emitir (ya está sincronizada).
  if (!nuevoCurso || nuevoCurso === cursoElegido.value) return;
  aplicandoCambioExterno = true;
  localStorage.setItem("cursoAcademicoSeleccionado", nuevoCurso);
  // Al asignar cursoElegido se dispara el watch, que recargará el listado y
  // reseteará el flag aplicandoCambioExterno.
  cursoElegido.value = nuevoCurso;
};

watch(modoListado, async () => {
  await cargarListado();
});

// Al entrar en el modo "Reducciones" (o cambiar a tutorías) refrescamos los cursos/etapas con grupos para el
// desplegable de tutorías, por si se han creado grupos nuevos desde otra vista o curso académico.
watch([modoCreador, tipoReduccionCreador], async ([modo, tipo]) => {
  if (modo === MODO_REDUCCIONES && tipo === TIPO_REDUCCION_TUTORIAS) {
    await cargarCursosEtapasConGrupos();
  }
});

watch(esoBachilleratoCreador, (valor) => {
  localStorage.setItem(STORAGE_KEY_ESO_BACHILLERATO_CREADOR, String(valor));
});

const cargarEspacios = async () => {
  const sinDocencia = await obtenerEspaciosSinDocencia(
    toastMessage, toastColor, isToastOpen
  );
  espacios.value = sinDocencia.map(e => ({ nombre: e.nombre }));
};

const cargarCursosEtapas = async () => {
  const data = await listarCursosEtapas(
    toastMessage, toastColor, isToastOpen
  );
  cursosEtapas.value = Array.isArray(data) ? data : [];
};

const cargarAsignaturasListado = async () => {
  const data = await listarAsignaturasCursoAcademico(
    toastMessage, toastColor, isToastOpen
  );
  asignaturasListado.value = Array.isArray(data) ? data : [];
};

const cargarReduccionesListado = async () => {
  const data = await listarReduccionesCursoAcademico(
    toastMessage, toastColor, isToastOpen
  );
  reduccionesListado.value = Array.isArray(data) ? data : [];
};

// Carga los cursos/etapas que tienen grupos creados (A, B, …) o bloques de optativas para el desplegable de
// "Reducciones (tutorías)". El endpoint ya excluye el grupo "Sin grupo"; aquí descartamos además las filas de
// catálogo (grupo "-", curso/etapa sin grupos reales) y deduplicamos por curso+etapa.
const cargarCursosEtapasConGrupos = async () => {
  try {
    const data = await obtenerCursosEtapasGrupos(
      toastMessage, toastColor, isToastOpen
    );
    const lista = Array.isArray(data) ? data : [];
    const vistos = new Set();
    const resultado = [];
    for (const item of lista) {
      // El endpoint ya excluye "Sin grupo"; aquí descartamos el catálogo ("-") para dejar solo cursos/etapas
      // con grupos reales (A, B, …) o bloques de optativas.
      if (!item || item.grupo === GRUPO_CATALOGO_CURSO_ETAPA) {
        continue;
      }
      const clave = `${item.curso}-${item.etapa}`;
      if (vistos.has(clave)) {
        continue;
      }
      vistos.add(clave);
      resultado.push({ curso: item.curso, etapa: item.etapa });
    }
    resultado.sort((a, b) => {
      if (a.curso !== b.curso) return a.curso - b.curso;
      return (a.etapa || "").localeCompare(b.etapa || "");
    });
    cursosEtapasConGrupos.value = resultado;
  } catch (error) {
    // Un catálogo vacío (404) es un estado válido; no mostramos toast de error, solo dejamos la lista vacía.
    cursosEtapasConGrupos.value = [];
    console.error(error);
  }
};

const cargarDepartamentos = async () => {
  const data = await listarDepartamentos(
    toastMessage, toastColor, isToastOpen
  );
  departamentos.value = Array.isArray(data) ? data.map(d => ({ nombre: d.nombre })) : [];
};

const cargarListado = async () => {
  try {
    if (modoListado.value === MODO_ESPACIOS) {
      await cargarEspacios();
    } else if (modoListado.value === MODO_DEPARTAMENTOS) {
      await cargarDepartamentos();
    } else if (modoListado.value === MODO_ASIGNATURAS) {
      await cargarAsignaturasListado();
    } else if (modoListado.value === MODO_REDUCCIONES) {
      // Modo "Reducciones": un único endpoint devuelve todas; el filtrado tutorías / no tutorías es en frontend.
      await cargarReduccionesListado();
    } else {
      // Modo "Cursos y etapas"
      await cargarCursosEtapas();
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const obtenerCursosAcademicosVista = async () => {
  try {
    const data = await obtenerCursosAcademicos(isToastOpen, toastMessage, toastColor);
    cursos.value = data;
    const cursoSeleccionado = data.find(c => c.seleccionado === true);
    if (cursoSeleccionado) {
      await nextTick();
      cursoElegido.value = cursoSeleccionado.cursoAcademico;
      localStorage.setItem("cursoAcademicoSeleccionado", cursoSeleccionado.cursoAcademico);
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

// Alta manual de una reducción (tutorías o no tutorías) reutilizando el endpoint existente de creación de
// reducciones. El curso académico activo lo resuelve el backend. Para tutorías se envía el curso y la etapa
// seleccionados (el backend solo vincula curso/etapa/grupo cuando los tres están presentes, igual que la carga
// CSV de tutorías, que persiste la reducción sin docencia).
const crearReduccionManual = async () => {
  const nombre = nombreReduccionCreador.value.trim();
  if (!nombre) {
    lanzarToast("danger", "Introduce un nombre para la reducción");
    return;
  }

  const horas = horasReduccionCreador.value;
  if (horas === null || horas === undefined || horas === "" || Number.isNaN(horas) || horas < 0) {
    lanzarToast("danger", "Introduce un número de horas válido (mayor o igual a 0)");
    return;
  }

  let curso;
  let etapa;
  const esTutoria = tipoReduccionCreador.value === TIPO_REDUCCION_TUTORIAS;
  if (esTutoria) {
    if (!cursoEtapaReduccionCreador.value) {
      lanzarToast("danger", "Selecciona un curso y etapa para la tutoría");
      return;
    }
    curso = cursoEtapaReduccionCreador.value.curso;
    etapa = cursoEtapaReduccionCreador.value.etapa;
  }

  // Las tutorías las propone el equipo directivo: decideDireccion = true siempre. Las no tutorías, false.
  const response = await crearReducciones(
    nombre, Math.trunc(horas), esTutoria, curso, etapa, undefined,
    toastMessage, toastColor, isToastOpen
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  lanzarToast("success", "Reducción creada correctamente");
  nombreReduccionCreador.value = "";
  horasReduccionCreador.value = null;
  cursoEtapaReduccionCreador.value = null;

  if (modoListado.value === MODO_REDUCCIONES) {
    await cargarReduccionesListado();
  }
};

const crearElemento = async () => {
  try {
    if (modoCreador.value === MODO_ESPACIOS) {
      if (!nombreCreador.value.trim()) {
        lanzarToast("danger", "Introduce un valor");
        return;
      }
      await crearEspacioSinDocencia(toastMessage, toastColor, isToastOpen, {
        nombre: nombreCreador.value.trim()
      });
      lanzarToast("success", "Espacio creado correctamente");
      if (modoListado.value === MODO_ESPACIOS) await cargarEspacios();
      nombreCreador.value = "";
    } else if (modoCreador.value === MODO_DEPARTAMENTOS) {
      if (!nombreDepartamentoCreador.value.trim()) {
        lanzarToast("danger", "Introduce un nombre");
        return;
      }
      await crearDepartamento(toastMessage, toastColor, isToastOpen, {
        nombre: nombreDepartamentoCreador.value.trim()
      });
      lanzarToast("success", "Departamento creado correctamente");
      if (modoListado.value === MODO_DEPARTAMENTOS) await cargarDepartamentos();
      nombreDepartamentoCreador.value = "";
    } else if (modoCreador.value === MODO_REDUCCIONES) {
      await crearReduccionManual();
    } else {
      const dto = validarCursoEtapaDto();
      await crearCursoEtapa(toastMessage, toastColor, isToastOpen, dto);
      lanzarToast("success", "Curso y etapa creados correctamente");
      if (modoListado.value === MODO_CURSOS_ETAPAS) await cargarCursosEtapas();
      cursoCreador.value = null;
      etapaCreador.value = "";
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const limpiarUploaderCsv = () => {
  if (fileUploadCsvRef.value) {
    fileUploadCsvRef.value.fileClear();
  }
};

const construirMensajeResultadoCsv = (resultado) => {
  const creados = resultado?.creados ?? 0;
  const omitidos = resultado?.omitidos ?? 0;
  let mensaje = `Carga completada: ${creados} creados`;
  if (omitidos > 0) {
    mensaje += `, ${omitidos} ya existían (omitidos)`;
  }
  if (Array.isArray(resultado?.errores) && resultado.errores.length > 0) {
    mensaje += `, ${resultado.errores.length} fila(s) con avisos`;
  }
  return mensaje;
};

const onArchivoCsvSeleccionado = async (archivo) => {
  if (!archivo) return;

  const nombre = (archivo.name || "").toLowerCase();
  if (!nombre.endsWith(".csv")) {
    lanzarToast("danger", "El archivo debe tener extensión .csv");
    limpiarUploaderCsv();
    return;
  }

  cargandoCsv.value = true;
  try {
    let resultado;
    if (modoCreador.value === MODO_ESPACIOS) {
      resultado = await subirEspaciosCsv(archivo, toastMessage, toastColor, isToastOpen);
      if (modoListado.value === MODO_ESPACIOS) await cargarEspacios();
    } else if (modoCreador.value === MODO_DEPARTAMENTOS) {
      resultado = await subirDepartamentosCsv(archivo, toastMessage, toastColor, isToastOpen);
      if (modoListado.value === MODO_DEPARTAMENTOS) await cargarDepartamentos();
    } else if (modoCreador.value === MODO_REDUCCIONES) {
      resultado = tipoReduccionCreador.value === TIPO_REDUCCION_TUTORIAS
        ? await subirReduccionesTutoriasCsv(archivo, toastMessage, toastColor, isToastOpen)
        : await subirReduccionesNoTutoriasCsv(archivo, toastMessage, toastColor, isToastOpen);
      if (modoListado.value === MODO_REDUCCIONES) {
        await cargarReduccionesListado();
      }
    } else {
      resultado = await subirCursosEtapasCsv(archivo, toastMessage, toastColor, isToastOpen);
      if (modoListado.value === MODO_CURSOS_ETAPAS) await cargarCursosEtapas();
    }

    const huboAvisos = Array.isArray(resultado?.errores) && resultado.errores.length > 0;
    lanzarToast(huboAvisos ? "warning" : "success", construirMensajeResultadoCsv(resultado));
  } catch (error) {
    lanzarToast("danger", error.message);
  } finally {
    cargandoCsv.value = false;
    limpiarUploaderCsv();
  }
};

const copiarElementos = async () => {
  if (!cursoOrigen.value || !cursoDestino.value) {
    lanzarToast("danger", "Selecciona el curso académico de origen y de destino");
    return;
  }
  if (cursoOrigen.value === cursoDestino.value) {
    lanzarToast("danger", "El origen y el destino no pueden ser el mismo curso académico");
    return;
  }

  try {
    if (modoCopiar.value === MODO_ESPACIOS) {
      await copiarEspaciosCursoAcademico(
        toastMessage, toastColor, isToastOpen, cursoOrigen.value, cursoDestino.value
      );
      lanzarToast("success", "Espacios copiados correctamente");
      if (modoListado.value === MODO_ESPACIOS && cursoDestino.value === cursoElegido.value) {
        await cargarEspacios();
      }
    } else if (modoCopiar.value === MODO_DEPARTAMENTOS) {
      await copiarDepartamentosCursoAcademico(
        toastMessage, toastColor, isToastOpen, cursoOrigen.value, cursoDestino.value
      );
      lanzarToast("success", "Departamentos copiados correctamente");
      if (modoListado.value === MODO_DEPARTAMENTOS && cursoDestino.value === cursoElegido.value) {
        await cargarDepartamentos();
      }
    } else {
      // Modos "Cursos y etapas", "Asignaturas" y "Reducciones": se traducen a la opción de copia equivalente del
      // backend. Al copiar asignaturas o reducciones, el backend garantiza los cursos/etapas necesarios.
      let opcionCopia;
      let mensajeExito;
      if (modoCopiar.value === MODO_ASIGNATURAS) {
        opcionCopia = OPCION_COPIA_ASIGNATURAS;
        mensajeExito = "Asignaturas copiadas correctamente";
      } else if (modoCopiar.value === MODO_REDUCCIONES) {
        opcionCopia = OPCION_COPIA_REDUCCIONES;
        mensajeExito = "Reducciones copiadas correctamente";
      } else {
        opcionCopia = OPCION_COPIA_CURSOS_ETAPAS;
        mensajeExito = "Cursos y etapas copiados correctamente";
      }

      await copiarCursosEtapasGruposCursoAcademico(
        toastMessage, toastColor, isToastOpen,
        cursoOrigen.value, cursoDestino.value, [opcionCopia]
      );
      lanzarToast("success", mensajeExito);

      if (cursoDestino.value === cursoElegido.value) {
        if (modoListado.value === MODO_CURSOS_ETAPAS) await cargarCursosEtapas();
        else if (modoListado.value === MODO_ASIGNATURAS) await cargarAsignaturasListado();
        else if (modoListado.value === MODO_REDUCCIONES) await cargarReduccionesListado();
      }
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const eliminarEspacio = async (espacio) => {
  try {
    await borrarEspacioSinDocencia(toastMessage, toastColor, isToastOpen, {
      nombre: espacio.nombre
    });
    lanzarToast("success", "Espacio eliminado correctamente");
    await cargarEspacios();
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const eliminarCursoEtapaItem = async (item) => {
  try {
    await borrarCursoEtapa(toastMessage, toastColor, isToastOpen, {
      curso: item.curso,
      etapa: item.etapa
    });
    lanzarToast("success", "Curso y etapa eliminados correctamente");
    await cargarCursosEtapas();
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const eliminarDepartamento = async (departamento) => {
  try {
    await borrarDepartamento(toastMessage, toastColor, isToastOpen, {
      nombre: departamento.nombre
    });
    lanzarToast("success", "Departamento eliminado correctamente");
    await cargarDepartamentos();
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

// Borrado individual de una reducción (tutorías o no tutorías). El backend la identifica por nombre + horas +
// decideDireccion (cabeceras) y resuelve el curso académico internamente (seleccionado = true).
// SUPUESTO sobre decideDireccion: se usa el valor que devuelve el backend en el listado; si no viniera, se asume
// true para tutorías (las propone el equipo directivo) y false para el resto, coherente con la creación.
const eliminarReduccion = async (item) => {
  if (!window.confirm(`¿Borrar la reducción «${item.nombre}»? Esta acción no se puede deshacer.`)) return;

  const decideDireccion = item.decideDireccion !== undefined && item.decideDireccion !== null
    ? item.decideDireccion
    : esReduccionTutoria(item);

  try {
    await borrarReduccion(toastMessage, toastColor, isToastOpen, cursoElegido.value, {
      nombre: item.nombre,
      horas: item.horas,
      decideDireccion
    });
    lanzarToast("success", "Reducción eliminada correctamente");
    await cargarReduccionesListado();
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const borrarTodos = async () => {
  if (!cursoElegido.value) {
    lanzarToast("danger", "Selecciona un curso académico");
    return;
  }

  const esReduccionesTutoria = modoListado.value === MODO_REDUCCIONES
    && tipoReduccionListado.value === TIPO_REDUCCION_TUTORIAS;

  let mensaje;
  if (modoListado.value === MODO_ESPACIOS) {
    mensaje = `¿Borrar TODOS los espacios del curso académico ${cursoElegido.value}? Esta acción no se puede deshacer.`;
  } else if (modoListado.value === MODO_DEPARTAMENTOS) {
    mensaje = `¿Borrar TODOS los departamentos del curso académico ${cursoElegido.value}? Esta acción no se puede deshacer.`;
  } else if (modoListado.value === MODO_ASIGNATURAS) {
    mensaje = `¿Borrar TODAS las asignaturas del curso académico ${cursoElegido.value}? Esta acción no se puede deshacer.`;
  } else if (modoListado.value === MODO_REDUCCIONES) {
    mensaje = `¿Borrar TODAS las reducciones (${esReduccionesTutoria ? 'tutorías' : 'no tutorías'}) del curso académico ${cursoElegido.value}? Esta acción no se puede deshacer.`;
  } else {
    mensaje = `¿Borrar TODOS los cursos y etapas del curso académico ${cursoElegido.value}? Esta acción no se puede deshacer.`;
  }

  if (!window.confirm(mensaje)) return;

  try {
    if (modoListado.value === MODO_ESPACIOS) {
      await borrarTodosEspaciosCursoAcademico(
        toastMessage, toastColor, isToastOpen
      );
      lanzarToast("success", "Espacios borrados correctamente");
      await cargarEspacios();
    } else if (modoListado.value === MODO_DEPARTAMENTOS) {
      await borrarTodosDepartamentosCursoAcademico(
        toastMessage, toastColor, isToastOpen
      );
      lanzarToast("success", "Departamentos borrados correctamente");
      await cargarDepartamentos();
    } else if (modoListado.value === MODO_ASIGNATURAS) {
      await borrarTodasAsignaturas(
        toastMessage, toastColor, isToastOpen, cursoElegido.value
      );
      lanzarToast("success", "Asignaturas borradas correctamente");
      await cargarAsignaturasListado();
    } else if (modoListado.value === MODO_REDUCCIONES) {
      if (esReduccionesTutoria) {
        await borrarTodasReduccionesTutoria(
          toastMessage, toastColor, isToastOpen, cursoElegido.value
        );
      } else {
        await borrarTodasReduccionesNoTutoria(
          toastMessage, toastColor, isToastOpen, cursoElegido.value
        );
      }
      lanzarToast("success", "Reducciones borradas correctamente");
      await cargarReduccionesListado();
    } else {
      await borrarTodosCursosEtapasGruposCursoAcademico(
        toastMessage, toastColor, isToastOpen
      );
      lanzarToast("success", "Cursos y etapas borrados correctamente");
      await cargarCursosEtapas();
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

onMounted(async () => {
  await obtenerCursosAcademicosVista();
  await cargarListado();
  inicializandoCurso = false;
  window.addEventListener("curso-academico-cambiado", onCursoAcademicoCambiado);
});

onUnmounted(() => {
  window.removeEventListener("curso-academico-cambiado", onCursoAcademicoCambiado);
});
</script>

<style scoped>
.page-cursos-espacios {
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

.panel-section {
  width: 100%;
}

.section-title {
  margin: 0 0 1.25rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-color-light);
}

.section-title-inline {
  text-align: left;
  margin-bottom: 0.35rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  Gap: 1.25rem;
  align-items: stretch;
}

.action-card {
  display: flex;
  flex-direction: column;
  min-height: 100%;
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
  Gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  Gap: 0.45rem;
}

.field-inline {
  margin-top: 0.5rem;
  max-width: 280px;
}

.listado-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: flex-end;
}

.listado-filtros .field-inline {
  flex: 1 1 180px;
  min-width: 160px;
  max-width: 280px;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.field-hint {
  font-size: 0.8rem;
  color: #666;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  user-select: none;
}

.checkbox-field input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #007bff;
  cursor: pointer;
}

.checkbox-field-inline {
  margin-top: 0.5rem;
}

.field input,
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
}

.custom-select-compact {
  max-width: 100%;
}

.custom-select-multiple {
  min-height: 72px;
  padding-block: 6px;
}

.custom-select-multiple option {
  padding: 6px 8px;
}

.custom-select {
  cursor: pointer;
}

.custom-select:hover,
.field input:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cfd8e3 15%, #cfd8e3 85%, transparent);
  margin: 1.75rem 0;
}

.listado-section {
  padding-top: 0.25rem;
}

.listado-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  Gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.listado-header-left {
  flex: 1;
  min-width: 200px;
}

.listado-context {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  color: #555;
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

.separador-o {
  display: flex;
  align-items: center;
  text-align: center;
  color: #666;
  font-weight: 600;
  margin: 0.25rem 0;
}

.separador-o::before,
.separador-o::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #cfd8e3;
}

.separador-o span {
  padding: 0 0.75rem;
  text-transform: lowercase;
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

.btn-delete {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.btn-delete:disabled {
  background-color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-borrar-todos {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

table {
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

th, td {
  border: 2px solid #007bff;
  padding: 8px 6px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
  /* Con border-collapse el borde se desplaza al hacer scroll; el box-shadow
     mantiene la línea de separación visible bajo la cabecera fija. */
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

td {
  background-color: #e9f5ff;
  height: 38px;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
}

tr:hover td {
  background-color: #d0eaff;
}

.table-scroll {
  width: 100%;
  max-height: 360px;
  overflow: auto;
}

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .section-title { color: var(--text-color-dark); }
  .page-subtitle, .listado-context, .empty-state, .field-hint { color: #c8c8c8; }
  .separador-o { color: #c8c8c8; }
  .separador-o::before, .separador-o::after { border-bottom-color: #555; }
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label { color: var(--text-color-dark); }
  .checkbox-field { color: var(--text-color-dark); }
  .empty-state { background-color: #2a302b; border-color: #555; }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

@media (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .action-card:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .page-cursos-espacios { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .actions-grid { grid-template-columns: 1fr; }
  .action-card:last-child { grid-column: auto; }
  .listado-header { flex-direction: column; align-items: stretch; }
  .btn-borrar-todos { width: 100%; white-space: normal; }
  table { font-size: 14px; }
}
</style>
