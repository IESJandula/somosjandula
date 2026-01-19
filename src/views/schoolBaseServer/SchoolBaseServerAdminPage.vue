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
          <input type="number" v-model.number="cursoGrupo" />
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

      <table v-if="grupos.length > 0">
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
            <option v-for="curso in cursos" :key="curso.cursoAcademico" :value="curso.cursoAcademico">
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
            <option v-for="g in grupos" :key="g.curso + g.etapa + g.grupo" :value="g">
              {{ g.curso }} {{ g.etapa }} {{ g.grupo }}
            </option>
          </select>
        </div>
      </div>


      <div class="section">
        <button type="button" class="btn-primary" @click="crearEspacio">
          Crear
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

      <table v-if="espaciosOrdenados.length > 0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th v-if="!esDesdobleLista && esConDocenciaLista">Curso</th>
            <th v-if="!esDesdobleLista && esConDocenciaLista">Etapa</th>
            <th v-if="!esDesdobleLista && esConDocenciaLista">Grupo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="e in espaciosOrdenados" :key="e.nombre + e.tipo">
            <td>{{ e.nombre }}</td>
            <td>{{ e.tipo }}</td>
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

      <div v-else>
        <span>No hay espacios creados.</span>
      </div>

    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";

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
// booleanos para los botones de CREAR
const esConDocenciaForm = ref(false);
const esDesdobleForm = ref(false);
// booleanos para los botones de LISTAR
const esConDocenciaLista = ref(false);
const esDesdobleLista = ref(false);
const espacios = ref([]);

// Ordenar espacios por nombre alfabéticamente.
const espaciosOrdenados = computed(() => {
  let filtrados = [...espacios.value];

  // SIN DOCENCIA
  if (!esConDocenciaLista.value) {
    filtrados = filtrados.filter(e => e.tipo === "SIN DOCENCIA");
  }
  // CON DOCENCIA
  else {
    if (!esDesdobleLista.value) {
      // FIJO
      filtrados = filtrados.filter(e => e.tipo === "FIJO");
    } else {
      // DESDOBLE
      filtrados = filtrados.filter(e => e.tipo === "DESDOBLE");
    }
  }

  return filtrados.sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
});

// Toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

let inicializandoCurso = true;

// ====================
// WATCH
// ====================
watch(cursoElegido, async (nuevoCurso, cursoAnterior) => {
  if (inicializandoCurso) return;
  if (!nuevoCurso || nuevoCurso === cursoAnterior) return;

  try {
    await seleccionarCursoAcademico(
      toastMessage,
      toastColor,
      isToastOpen,
      nuevoCurso
    );

    await cargarGrupos();
    await cargarEspacios();
  } catch (error) {
    console.error("Error al seleccionar curso académico:", error);
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
    console.error("Error cargando grupos:", error);
  }
};

const obtenerCursosAcademicosVista = async () => {
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
};

const crearGrupo = async () => {
  if (
    cursoGrupo.value === null ||
    etapaGrupo.value.trim() === "" ||
    grupoGrupo.value.trim() === ""
  ) {
    toastMessage.value = "Rellena todos los campos";
    toastColor.value = "danger";
    isToastOpen.value = true;
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

    toastMessage.value = "Grupo creado correctamente";
    toastColor.value = "success";
    isToastOpen.value = true;

    await cargarGrupos();
    await cargarEspacios();

    cursoGrupo.value = null;
    etapaGrupo.value = "";
    grupoGrupo.value = "";

  } catch (error) {
    toastMessage.value = error.message || "Error al crear el grupo";
    toastColor.value = "danger";
    isToastOpen.value = true;
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

    toastMessage.value = "Grupo eliminado correctamente";
    toastColor.value = "success";
    isToastOpen.value = true;

    await cargarGrupos();
    await cargarEspacios();

  } catch (error) {
    toastMessage.value = error.message;
    toastColor.value = "danger";
    isToastOpen.value = true;
  }
};

const crearEspacio = async () => {
  if (!nombre.value.trim()) return;

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
      // 🔥 FIJO → aquí va el grupo
      if (!grupoSeleccionado.value) {
        toastMessage.value = "Selecciona un grupo";
        toastColor.value = "danger";
        isToastOpen.value = true;
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

    toastMessage.value = "Espacio creado correctamente";
    toastColor.value = "success";
    isToastOpen.value = true;

    await cargarEspacios();

  } catch (error) {
    console.error(error);
  }
};


const cargarEspacios = async () => {
  try {
    const sinDocencia = await obtenerEspaciosSinDocencia(toastMessage, toastColor, isToastOpen, cursoElegido.value);
    const fijos = await obtenerEspaciosFijo(toastMessage, toastColor, isToastOpen, cursoElegido.value);
    const desdobles = await obtenerEspaciosDesdoble(toastMessage, toastColor, isToastOpen, cursoElegido.value);

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

    espacios.value = [...lista];

    await cargarGrupos();
    await cargarEspacios();

  } catch (error) {
    console.error("Error cargando espacios", error);
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

    await cargarGrupos();
    await cargarEspacios();

  } catch (error) {
    console.error(error);
  }
};


// ====================
// ON MOUNT
// ====================
onMounted(async () => {
  await obtenerCursosAcademicosVista();
  await cargarGrupos();
  await cargarEspacios();
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
  min-width: 1200px;
  width: fit-content;
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


.form-container-table-logs {
  overflow-x: auto;
  max-width: 83%;
  overflow-y: auto;
  display: block;
  white-space: nowrap;
}

.sticky-column {
  position: sticky;
  left: 0;
  background: white;
  z-index: 2;
}

.decrementar-button {
  background-color: #dc3545;
  float: left;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
}

.incrementar-button {
  background-color: #007bff;
  color: white;
  border: none;
  float: right;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
}

.numPagina {
  display: flex;
  align-items: center;
  justify-content: block;
}

.pagina-container {
  display: flex;
  padding-top: 2%;
  justify-content: space-between;
  width: 100%;
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
  color: #000000;
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

.row label {
  display: block;
  margin-bottom: 10px;
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
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  width: 100%;
  padding: 20px;
}

.title {
  margin: 0;
  font-size: 24px;
}

.title {
  text-align: center;
  width: 100%;
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
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
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

.btn-modify-lock {
  color: white;
  border: none;
  margin-left: 15px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-modify-unlock {
  background-color: #025ec0;
  color: white;
  border: none;
  margin-left: 15px;
  border-radius: 5px;
  cursor: pointer;
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

  .form-container-table-logs {
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

  .form-container-table-logs table {
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

/* ===== SECCIONES (RESPIRACIÓN TIPO IONIC) ===== */
.section {
  margin-bottom: 25px;
}

.section.center {
  display: flex;
  justify-content: center;
}

.section .row {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* centra horizontalmente */
}

/* Filas más limpias */
.row {
  margin-bottom: 15px;
}

/* Botón principal */
.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border-radius: 6px;
  margin-top: 10px;
  text-transform: uppercase;
}

/* Centrar switches */
.switch-container-gestion {
  margin-left: 0;
  justify-content: center;
}

/* Título más aireado */
.title-container {
  padding-bottom: 10px;
}
</style>
