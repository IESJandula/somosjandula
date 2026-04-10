<template>
  <div class="main-container">

    <!-- 🔥 OVERLAY LOADING -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-big"></div>
    </div>

    <div class="center-container">

      <div class="form-container-table">

        <h2 class="window-title">CONSULTAR PARTICIPACIÓN EN HUELGA</h2>

        <!-- FILTROS -->
        <div class="form-row">
          <label class="form-label">Huelga:</label>
          <input type="text" v-model="filtro.huelga" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">Curso:</label>
          <input type="text" v-model="filtro.curso" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">Etapa:</label>
          <input type="text" v-model="filtro.etapa" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">Grupo:</label>
          <input type="text" v-model="filtro.grupo" class="form-input" />
        </div>

        <!-- BOTÓN -->
        <div class="button-row">
          <button class="btn-enviar" @click="consultarAlumnos" :disabled="loading">
            CONSULTAR
          </button>
        </div>

        <!-- TABLA -->
        <table class="events-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Participación</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="a in alumnos" :key="a.email">
              <td>{{ a.nombre }}</td>
              <td>{{ a.apellidos }}</td>
              <td>
                <span :class="estadoClass(a.estado)">
                  {{ mostrarEstado(a.estado) }}
                </span>
              </td>
            </tr>

            <tr v-if="alumnos.length === 0">
              <td colspan="3" class="no-data">
                No hay resultados
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref } from "vue";

/* ================= TIPOS ================= */

interface Alumno {
  nombre: string;
  apellidos: string;
  email: string;
  estado: "SI" | "NO" | "NS";
}

/* ================= STATE ================= */

const filtro = ref({
  huelga: "",
  curso: "",
  etapa: "",
  grupo: ""
});

const alumnos = ref<Alumno[]>([]);
const loading = ref(false);

/* ================= MÉTODO ================= */

async function consultarAlumnos() {

  if (!filtro.value.huelga) {
    alert("Debes indicar la huelga");
    return;
  }

  loading.value = true;

  try {

    // 🔥 AQUÍ irá tu endpoint real
    // alumnos.value = await servicio(...)

    // MOCK TEMPORAL
    await new Promise(r => setTimeout(r, 1000));

    alumnos.value = [
      { nombre: "Juan", apellidos: "Pérez", email: "1", estado: "SI" },
      { nombre: "Ana", apellidos: "López", email: "2", estado: "NO" },
      { nombre: "Luis", apellidos: "García", email: "3", estado: "NS" }
    ];

  } catch (error) {
    alert("Error al consultar alumnos");
  } finally {
    loading.value = false;
  }
}

/* ================= UTIL ================= */

function mostrarEstado(estado: string) {
  if (estado === "SI") return "✔";
  if (estado === "NO") return "✖";
  return "?";
}

function estadoClass(estado: string) {
  if (estado === "SI") return "estado-si";
  if (estado === "NO") return "estado-no";
  return "estado-ns";
}

</script>

<style scoped>

/* ====== BASE (igual que tu app) ====== */

.main-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.center-container {
  display: flex;
  gap: 20px;
  max-width: 800px;
  width: 100%;
}

.form-container-table {
  background: #fff;
  border: 1px solid #444;
  border-radius: 10px;
  padding: 25px;
  width: 100%;
}

.window-title {
  border-bottom: 2px solid #007bff;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}

.form-label {
  min-width: 120px;
}

.form-input {
  flex: 1;
  padding: 8px;
}

.button-row {
  display: flex;
  justify-content: flex-end;
}

.btn-enviar {
  background: #007bff;
  color: white;
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-enviar:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.btn-enviar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.events-table th,
.events-table td {
  border: 1px solid #007bff;
  padding: 8px;
}

.events-table th {
  background: #007bff;
  color: white;
}

.no-data {
  text-align: center;
}

/* ====== ESTADOS ====== */

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

/* ====== LOADING OVERLAY ====== */

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
  z-index: 9999;
}

.spinner-big {
  width: 60px;
  height: 60px;
  border: 6px solid #ccc;
  border-top: 6px solid #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>