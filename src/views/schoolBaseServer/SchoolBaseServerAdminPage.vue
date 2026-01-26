<template>
  <!-- Creador de grupos -->
  <div class="form-wrapper">
    <div class="form-container">
      <div class="title-container">
        <h1 class="title">Creador de grupos</h1>
      </div>

      <div class="section">
        <div class="row">
          <label>Curso (número):</label>
          <input type="number" v-model.number="cursoGrupo" min="1" step="1"/>
        </div>

        <div class="row">
          <label>Etapa:</label>
          <input type="text" v-model="etapaGrupo" />
        </div>

        <div class="row">
          <label>Grupo:</label>
          <input type="text" v-model="grupoGrupo" />
        </div>
      </div>

      <div class="section">
        <button class="btn-primary" @click="crearGrupo">
          Crear
        </button>
      </div>
    </div>

    <!-- Listado de grupos -->
    <div class="form-container-table">
      <div class="title-container">
        <h1 class="title">Listado de Grupos</h1>
      </div>

      <!-- wrapper para scroll horizontal -->
      <div class="table-scroll" v-if="grupos.length > 0">
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Etapa</th>
              <th>Grupo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="g in grupos" :key="`${g.curso}-${g.etapa}-${g.grupo}`">
              <td>{{ g.curso }}</td>
              <td>{{ g.etapa }}</td>
              <td>{{ g.grupo }}</td>
              <td>
                <button class="btn-delete" @click="eliminarGrupo(g)">X</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else>
        <span>No hay grupos creados.</span>
      </div>
    </div>
  </div>

  <div class="form-wrapper">
    <!-- Elección de curso académico-->
    <div class="form-container">
      <div class="title-container">
        <h1 class="title">Elige curso académico</h1>
      </div>

      <div class="section">
        <div class="row">
          <select v-model="cursoElegido" class="custom-select">
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
    </div>
  </div>

  <div class="form-wrapper">
    <!-- CREADOR DE ESPACIOS -->
    <div class="form-container">
      <div class="title-container">
        <h1 class="title">Creador de espacios</h1>
      </div>

      <div class="section">
        <div class="row">
          <label>Nombre:</label>
          <input type="text" v-model="nombre" />
        </div>
      </div>

      <div class="section center">
        <div class="switch-container-gestion">
          <span>Sin Docencia</span>
          <label class="switch">
            <input type="checkbox" v-model="esConDocenciaForm" />
            <span class="slider"></span>
          </label>
          <span>Con Docencia</span>
        </div>
      </div>

      <div class="section center" v-if="esConDocenciaForm">
        <div class="switch-container-gestion">
          <span>Fijo</span>
          <label class="switch">
            <input type="checkbox" v-model="esDesdobleForm" />
            <span class="slider"></span>
          </label>
          <span>Desdoble</span>
        </div>
      </div>

      <div class="section" v-if="esConDocenciaForm && !esDesdobleForm">
        <div class="row">
          <label>Grupo:</label>
          <select v-model="grupoSeleccionado" class="custom-select">
            <option disabled value="">Selecciona un grupo</option>
            <option
              v-for="g in grupos"
              :key="g.curso + g.etapa + g.grupo"
              :value="g"
            >
              {{ g.curso }} {{ g.etapa }} {{ g.grupo }}
            </option>
          </select>
        </div>
      </div>

      <div class="section">
        <button type="button" class="btn-primary" @click="crearEspacio">
          Crear / Modificar
        </button>
      </div>
    </div>

    <!-- TABLA DE ESPACIOS -->
    <div class="form-container-table">
      <div class="title-container">
        <h1 class="title">Listado de espacios</h1>
      </div>

      <div class="section center">
        <div class="switch-container-gestion">
          <span>Sin Docencia</span>
          <label class="switch">
            <input type="checkbox" v-model="esConDocenciaLista" />
            <span class="slider"></span>
          </label>
          <span>Con Docencia</span>
        </div>
      </div>

      <div class="section center" v-if="esConDocenciaLista">
        <div class="switch-container-gestion">
          <span>Fijo</span>
          <label class="switch">
            <input type="checkbox" v-model="esDesdobleLista" />
            <span class="slider"></span>
          </label>
          <span>Desdoble</span>
        </div>
      </div>

      <!-- wrapper para scroll horizontal -->
      <div class="table-scroll" v-if="espaciosOrdenados.length > 0">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th v-if="!esDesdobleLista && esConDocenciaLista">Curso</th>
              <th v-if="!esDesdobleLista && esConDocenciaLista">Etapa</th>
              <th v-if="!esDesdobleLista && esConDocenciaLista">Grupo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="e in espaciosOrdenados" :key="e.nombre + e.tipo">
              <td>{{ e.nombre }}</td>
              <td v-if="!esDesdobleLista && esConDocenciaLista">
                {{ e.curso ?? "-" }}
              </td>
              <td v-if="!esDesdobleLista && esConDocenciaLista">
                {{ e.etapa ?? "-" }}
              </td>
              <td v-if="!esDesdobleLista && esConDocenciaLista">
                {{ e.grupo ?? "-" }}
              </td>
              <td>
                <button type="button" class="btn-delete" @click="eliminarEspacio(e)">
                  X
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else>
        <span>No hay espacios creados.</span>
      </div>
    </div>
  </div>

  <!-- TOAST -->
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
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { IonToast } from "@ionic/vue";
import {
  obtenerCursosAcademicos,
  seleccionarCursoAcademico,
  obtenerCursosEtapasGrupos,
  crearCursoEtapaGrupo,
  borrarCursoEtapaGrupo,
  crearEspacioSinDocencia,
  crearEspacioDesdoble,
  crearEspacioFijo,
  obtenerEspaciosSinDocencia,
  obtenerEspaciosDesdoble,
  obtenerEspaciosFijo,
  borrarEspacioSinDocencia,
  borrarEspacioDesdoble,
  borrarEspacioFijo
} from "@/services/schoolBaseServer";

// ====================
// VARIABLES
// ====================
const cursoElegido = ref(null);
const cursos = ref([]);
const cursoGrupo = ref(null);
const etapaGrupo = ref("");
const grupoGrupo = ref("");
const grupos = ref([]);
const grupoSeleccionado = ref(null);
const nombre = ref("");

const esConDocenciaForm = ref(false);
const esDesdobleForm = ref(false);
const esConDocenciaLista = ref(false);
const esDesdobleLista = ref(false);
const espacios = ref([]);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

let inicializandoCurso = true;

// ====================
// TOAST FIABLE
// ====================
const lanzarToast = (color, mensaje) => {
  isToastOpen.value = false;
  setTimeout(() => {
    toastColor.value = color;
    toastMessage.value = mensaje;
    isToastOpen.value = true;
  }, 10);
};

// ====================
// COMPUTED
// ====================
const espaciosOrdenados = computed(() => {
  let filtrados = [...espacios.value];

  if (!esConDocenciaLista.value) {
    filtrados = filtrados.filter(e => e.tipo === "SIN DOCENCIA");
  } else {
    if (!esDesdobleLista.value) {
      filtrados = filtrados.filter(e => e.tipo === "FIJO");
    } else {
      filtrados = filtrados.filter(e => e.tipo === "DESDOBLE");
    }
  }

  return filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// ====================
// WATCH
// ====================
watch(cursoElegido, async (nuevoCurso, cursoAnterior) => {
  if (inicializandoCurso) return;
  if (!nuevoCurso || nuevoCurso === cursoAnterior) return;
  if (nuevo < 0) { cursoGrupo.value = 0; }
  try {
    await seleccionarCursoAcademico(
      toastMessage,
      toastColor,
      isToastOpen,
      nuevoCurso
    );

    await Promise.all([
      cargarGrupos(),
      cargarEspacios()
    ]);
  } catch (error) {
    lanzarToast("danger", error.message);
  }
});

// ====================
// FUNCIONES
// ====================
const cargarGrupos = async () => {
  try {
    const data = await obtenerCursosEtapasGrupos(
      toastMessage,
      toastColor,
      isToastOpen,
      cursoElegido.value
    );

    grupos.value = Array.isArray(data) ? data : [];
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const cargarEspacios = async () => {
  try {
    const [sinDocencia, fijos, desdobles] = await Promise.all([
      obtenerEspaciosSinDocencia(toastMessage, toastColor, isToastOpen, cursoElegido.value),
      obtenerEspaciosFijo(toastMessage, toastColor, isToastOpen, cursoElegido.value),
      obtenerEspaciosDesdoble(toastMessage, toastColor, isToastOpen, cursoElegido.value)
    ]);

    const lista = [];

    sinDocencia.forEach(e => lista.push({ nombre: e.nombre, tipo: "SIN DOCENCIA" }));
    fijos.forEach(e => lista.push({
      nombre: e.nombre,
      tipo: "FIJO",
      curso: e.curso,
      etapa: e.etapa,
      grupo: e.grupo
    }));
    desdobles.forEach(e => lista.push({ nombre: e.nombre, tipo: "DESDOBLE" }));

    espacios.value = lista;

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const obtenerCursosAcademicosVista = async () => {
  try {
    const data = await obtenerCursosAcademicos(
      isToastOpen,
      toastMessage,
      toastColor
    );

    cursos.value = data;

    const cursoSeleccionado = data.find(
      (curso) => curso.seleccionado === true
    );

    if (cursoSeleccionado) {
      await nextTick();
      cursoElegido.value = cursoSeleccionado.cursoAcademico;
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const crearGrupo = async () => {

  if (
    cursoGrupo.value === null ||
    cursoGrupo.value === "" ||
    etapaGrupo.value.trim() === "" ||
    grupoGrupo.value.trim() === ""
  ) {
    lanzarToast("danger", "Rellena todos los campos");
    return;
  }
  if (cursoGrupo.value < 1) {
    lanzarToast("danger", "El curso no puede ser negativo ni cero");
    return;
  }

  const cursoEtapaGrupoDto = {
    curso: cursoGrupo.value,
    etapa: etapaGrupo.value.trim(),
    grupo: grupoGrupo.value.trim()
  };

  try {
    await crearCursoEtapaGrupo(
      toastMessage,
      toastColor,
      isToastOpen,
      cursoEtapaGrupoDto
    );

    lanzarToast("success", "Grupo creado correctamente");

    await cargarGrupos();

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const eliminarGrupo = async (grupo) => {
  try {
    await borrarCursoEtapaGrupo(
      toastMessage,
      toastColor,
      isToastOpen,
      {
        curso: grupo.curso,
        etapa: grupo.etapa,
        grupo: grupo.grupo
      }
    );

    lanzarToast("success", "Grupo eliminado correctamente");

    await Promise.all([
      cargarGrupos(),
      cargarEspacios()
    ]);

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const crearEspacio = async () => {
  if (!nombre.value.trim()) {
    lanzarToast("danger", "Introduce un nombre");
    return;
  }

  try {
    if (!esConDocenciaForm.value) {
      const dto = {
        cursoAcademico: cursoElegido.value,
        nombre: nombre.value.trim()
      };

      await crearEspacioSinDocencia(toastMessage, toastColor, isToastOpen, dto);
    }
    else if (esDesdobleForm.value) {
      const dto = {
        cursoAcademico: cursoElegido.value,
        nombre: nombre.value.trim()
      };

      await crearEspacioDesdoble(toastMessage, toastColor, isToastOpen, dto);
    }
    else {
      if (!grupoSeleccionado.value) {
        lanzarToast("danger", "Selecciona un grupo");
        return;
      }

      const dto = {
        cursoAcademico: cursoElegido.value,
        nombre: nombre.value.trim(),
        curso: grupoSeleccionado.value.curso,
        etapa: grupoSeleccionado.value.etapa,
        grupo: grupoSeleccionado.value.grupo
      };

      await crearEspacioFijo(toastMessage, toastColor, isToastOpen, dto);
    }

    lanzarToast("success", "Espacio creado correctamente");

    await cargarEspacios();

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const eliminarEspacio = async (espacio) => {
  try {
    const dto = {
      cursoAcademico: cursoElegido.value,
      nombre: espacio.nombre
    };

    if (espacio.tipo === "SIN DOCENCIA") {
      await borrarEspacioSinDocencia(toastMessage, toastColor, isToastOpen, dto);
    } else if (espacio.tipo === "FIJO") {
      await borrarEspacioFijo(toastMessage, toastColor, isToastOpen, dto);
    } else {
      await borrarEspacioDesdoble(toastMessage, toastColor, isToastOpen, dto);
    }

    lanzarToast("success", "Espacio eliminado correctamente");

    await cargarEspacios();

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};


onMounted(async () => {
  await obtenerCursosAcademicosVista();
  await Promise.all([
    cargarGrupos(),
    cargarEspacios()
  ]);
  inicializandoCurso = false;
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
  min-width: 700px;
  width: 90%;
  max-width: 900px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  border: 1px solid #444;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 12px 15px;
  margin: auto;
  font-family: "Roboto", sans-serif;
  margin-top: 2%;
}

.form-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

/* TITULOS */
.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
}

.title {
  margin: 0;
  font-size: 24px;
  text-align: center;
}

/* SECCIONES */
.section {
  margin-bottom: 25px;
}

.section.center {
  display: flex;
  justify-content: center;
}

.row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.row label {
  margin-bottom: 10px;
}

/* BOTONES */
.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border-radius: 6px;
  margin-top: 10px;
  text-transform: uppercase;
  border: none;
  color: white;
  cursor: pointer;
}

.btn-delete {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

/* SELECT */
.custom-select {
  width: 80%;
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #000000;
  outline: none;
  cursor: pointer;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

/* TABLAS */
table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  margin-top: 10px;
  border-radius: 5px;
  overflow: hidden;
  font-size: 13px;
}

th,
td {
  border: 2px solid #007bff;
  padding: 6px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
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

/* SCROLL TABLA */
table tbody {
  display: block;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
}

table thead,
table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

/* scroll horizontal */
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

/* Fuerza desbordamiento horizontal cuando haga falta */
.table-scroll table {
  min-width: 700px;
}

/* SWITCHES */
.switch-container-gestion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
}

.switch-container-gestion span {
  font-size: 16px;
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
  inset: 0;
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

input:checked + .slider {
  background-color: #2196f3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* MODO OSCURO */
@media (prefers-color-scheme: dark) {
  .form-container,
  .form-container-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .form-container {
    border: 1px solid #444;
  }

  table {
    font-size: 14px;
  }

  .custom-select {
    width: 100%;
  }
}
</style>
