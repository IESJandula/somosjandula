<template>
  <div class="main-container">

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
    <div class="top-container">
      <!-- HUELGAS -->
      <div class="card">
        <h2 class="window-title">HISTÓRICO DE HUELGAS</h2>
        <div class="title-line"></div>
        <table class="events-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="h in huelgas"
              :key="h.titulo"
              @click="seleccionarHuelga(h)"
              :class="['fila-click', { seleccionada: huelgaSeleccionada?.titulo === h.titulo }]"
            >
              <td>{{ h.titulo }}</td>
              <td>{{ h.estado }}</td>
            </tr>
            <tr v-if="huelgas.length === 0">
              <td colspan="2">No hay huelgas</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- FILTROS -->
      <div class="card">
        <h2 class="window-title">CURSO</h2>
        <div class="title-line"></div>
        <div class="filters">
          <div class="form-row">
          <label>Curso:</label>
          <select v-model="filtro.curso">
            <option value="Todos">Todos</option>
            <option v-for="c in cursos" :key="c">{{ c }}</option>
          </select>
        </div>

        <div class="form-row">
          <label>Etapa:</label>
          <select v-model="filtro.etapa">
            <option value="Todos">Todos</option>
            <option v-for="e in etapas" :key="e">{{ e }}</option>
          </select>
        </div>

        <div class="form-row">
          <label>Grupo:</label>
          <select v-model="filtro.grupo">
            <option value="Todos">Todos</option>
            <option v-for="g in grupos" :key="g">{{ g }}</option>
          </select>
        </div>
          <div class="form-row">
            <label>Filtro:</label>
            <select v-model="tipoFiltro">
              <option value="TODOS">Todos</option>
              <option value="SI">Solo SI</option>
              <option value="NO">Solo NO</option>
              <option value="NS">?</option>
            </select>
          </div>
          <button class="btn-admin" @click="consultarAlumnos">
            CONSULTAR
          </button>
        </div>
      </div>
    </div>

    <!-- ================= RESULTADOS ================= -->
    <div class="card results-card">
      <h2 class="window-title">RESULTADOS</h2>
      <div class="title-line"></div>
      <table class="events-table centered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in alumnos" :key="a.nombre + a.apellidos">
            <td>{{ a.nombre }}</td>
            <td>{{ a.apellidos }}</td>
            <td>
              <span :class="estadoClass(a.estado)">
                {{ mostrarEstado(a.estado) }}
              </span>
            </td>
          </tr>
          <tr v-if="alumnos.length === 0">
            <td colspan="3">No hay resultados</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from "vue";
import { obtenerHuelgas, obtenerAlumnosHuelga, obtenerCursos} from "@/services/strikes.js";

const loading = ref(false);

const huelgas = ref<any[]>([]);
const huelgaSeleccionada = ref<any>(null);

const cursos = ref<string[]>([]);
const etapas = ref<string[]>([]);
const grupos = ref<string[]>([]);

const filtro = ref({
  curso: "Todos",
  etapa: "Todos",
  grupo: "Todos"
});

const tipoFiltro = ref("TODOS");

const alumnos = ref<any[]>([]);

/* TOAST */
const toastMessage = ref("");
const toastColor = ref("success");
const isToastOpen = ref(false);

onMounted(() => {
  cargarHuelgas();
  cargarFiltros();
});

async function cargarHuelgas() {
  loading.value = true;

  try {
    const data = await obtenerHuelgas(
      toastMessage,
      toastColor,
      isToastOpen,
      0,
      20
    );

    huelgas.value = data?.content || [];

  } finally {
    loading.value = false;
  }
}

function seleccionarHuelga(h: any) {
  huelgaSeleccionada.value = h;
  alumnos.value = [];
}

async function consultarAlumnos() {

  if (!huelgaSeleccionada.value) {
    alert("Selecciona una huelga");
    return;
  }
  loading.value = true;
  try {
    const cursoEnviar =
      filtro.value.curso === "Todos"
        ? ""
        : filtro.value.curso;

    const etapaEnviar =
      filtro.value.etapa === "Todos"
        ? ""
        : filtro.value.etapa;

    const grupoEnviar =
      filtro.value.grupo === "Todos"
        ? ""
        : filtro.value.grupo;

    alumnos.value = await obtenerAlumnosHuelga(
      toastMessage,
      toastColor,
      isToastOpen,
      huelgaSeleccionada.value.titulo,
      cursoEnviar,
      etapaEnviar,
      grupoEnviar,
      tipoFiltro.value
    )

  } finally {
    loading.value = false;
  }
}

async function cargarFiltros()
{
  const datos: any[] = await obtenerCursos(toastMessage, toastColor, isToastOpen);
  cursos.value = [
    "Todos",
    ...new Set(datos.map(d => d.curso))
  ];

  etapas.value = [
    "Todos",
    ...new Set(datos.map(d => d.etapa))
  ];

  grupos.value = [
    "Todos",
    ...new Set(datos.map(d => d.grupo))
  ];

  console.log("CURSOS:", cursos.value);
  console.log("ETAPAS:", etapas.value);
  console.log("GRUPOS:", grupos.value);
}

/* UTIL */

function mostrarEstado(estado: string) {
  if (estado === "SI") return "SI";
  if (estado === "NO") return "NO";
  return "?";
}

function estadoClass(estado: string) {
  if (estado === "SI") return "estado-si";
  if (estado === "NO") return "estado-no";
  return "estado-ns";
}

</script>

<style>
  .main-container {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .top-container {
    display: flex;
    gap: 20px;
  }

  /* TARJETAS */
  .card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    width: 100%;
  }

  /* RESULTADOS MÁS CENTRADO */
  .results-card {
    width: 70%;
    margin: 0 auto;
  }

  /* TITULO */
  .window-title {
    margin: 0;
  }

  .title-line {
    height: 3px;
    background: #1976d2;
    margin: 8px 0 20px 0;
  }

  /* FILTROS */
  .filters {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 10px;
  }

  /* BOTÓN */
  .btn-admin {
    margin-top: 10px;
    background: #1976d2;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }

  .btn-admin:hover {
    background: #125ea2;
  }

  /* TABLAS */
  .events-table {
    width: 100%;
    border-collapse: collapse;
  }

  .events-table th {
    background: #1976d2;
    color: white;
    padding: 10px;
    border: 1px solid #1976d2;
  }

  .events-table td {
    padding: 10px;
    border: 1px solid #ccc;
  }

  select {
    width: 100%;
    padding: 6px;
  }

  /* TABLA RESULTADOS */
  .centered {
    width: 80%;
    margin: 0 auto;
  }

  /* FILAS */
  .fila-click:hover {
    background: #f1f1f1;
    cursor: pointer;
  }

  .seleccionada {
    background: #d0e7ff;
  }

  /* ESTADOS */
  .estado-si {
    color: green;
    font-weight: bold;
  }

  .estado-no {
    color: red;
    font-weight: bold;
  }

  .estado-ns {
    color: orange;
    font-weight: bold;
  }

  /* LOADING */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 6px solid rgba(255,255,255,0.3);
    border-top: 6px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
</style>