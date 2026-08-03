<template>
  <div class="stats-page">
    <!-- Título principal -->
    <h1 class="stats-title">MÉTRICAS</h1>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="stats-loading">
      Cargando métricas...
    </div>

    <!-- Sin datos -->
    <div v-else-if="!hayDatosGlobales" class="stats-empty">
      No hay datos registrados para mostrar métricas.
    </div>

    <div v-else>
      <!-- Estadísticas de AUDITORÍA -->
      <h2 class="section-title">Auditoría</h2>
      <div class="stats-row">
        <div class="chart-container">
          <PieChart :title="'Peticiones por día de la semana'" :data="datosPeticionesPorDiaSemana" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Peticiones por tramo horario'" :data="datosPeticionesPorTramoHorario" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Microservicio más usado (internas)'" :data="datosPeticionesPorMicroservicioInternas" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Microservicio más usado (externas)'" :data="datosPeticionesPorMicroservicioExternas" />
        </div>
      </div>
    </div>

    <!-- Toast -->
    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonToast } from "@ionic/vue";
import PieChart from "@/components/issues/PieChart.vue";
import { crearToast } from "@/utils/toast";

import {
  obtenerPeticionesPorDiaSemana,
  obtenerPeticionesPorTramoHorario,
  obtenerPeticionesPorMicroservicioInternas,
  obtenerPeticionesPorMicroservicioExternas
} from "@/services/auditStatistics";

// ====== ESTADO GENERAL ======
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>("success");

// ====== DATOS DE AUDITORÍA ======
const peticionesPorDiaSemana = ref<Array<{ diaSemana: string; totalPeticiones: number }>>([]);
const peticionesPorTramoHorario = ref<Array<{ tramoHorario: string; totalPeticiones: number }>>([]);
const peticionesPorMicroservicioInternas = ref<Array<{ microservicio: string; totalPeticiones: number }>>([]);
const peticionesPorMicroservicioExternas = ref<Array<{ microservicio: string; totalPeticiones: number }>>([]);

// ====== COMPUTED: Mapeo a formato ECharts ======
const datosPeticionesPorDiaSemana = computed(() =>
  peticionesPorDiaSemana.value.map(item => ({ name: item.diaSemana, value: item.totalPeticiones }))
);
const datosPeticionesPorTramoHorario = computed(() =>
  peticionesPorTramoHorario.value.map(item => ({ name: item.tramoHorario, value: item.totalPeticiones }))
);
const datosPeticionesPorMicroservicioInternas = computed(() =>
  peticionesPorMicroservicioInternas.value.map(item => ({ name: item.microservicio, value: item.totalPeticiones }))
);
const datosPeticionesPorMicroservicioExternas = computed(() =>
  peticionesPorMicroservicioExternas.value.map(item => ({ name: item.microservicio, value: item.totalPeticiones }))
);

// Verificar si hay algún dato para mostrar
const hayDatosGlobales = computed(() =>
  datosPeticionesPorDiaSemana.value.length > 0 ||
  datosPeticionesPorTramoHorario.value.length > 0 ||
  datosPeticionesPorMicroservicioInternas.value.length > 0 ||
  datosPeticionesPorMicroservicioExternas.value.length > 0
);

// ====== CARGA DE DATOS ======
async function cargarTodo() {
  try {
    isLoading.value = true;

    const [aDia, aTra, aMicI, aMicE] = await Promise.all([
      obtenerPeticionesPorDiaSemana(toastMessage, toastColor, isToastOpen),
      obtenerPeticionesPorTramoHorario(toastMessage, toastColor, isToastOpen),
      obtenerPeticionesPorMicroservicioInternas(toastMessage, toastColor, isToastOpen),
      obtenerPeticionesPorMicroservicioExternas(toastMessage, toastColor, isToastOpen)
    ]);

    peticionesPorDiaSemana.value = aDia;
    peticionesPorTramoHorario.value = aTra;
    peticionesPorMicroservicioInternas.value = aMicI;
    peticionesPorMicroservicioExternas.value = aMicE;

  } catch (error: any) {
    console.error("Error al cargar métricas:", error);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      error?.message || "Error al cargar las métricas"
    );
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  cargarTodo();
});
</script>

<style scoped>

/* CSS */
.stats-page {
  max-width: 1800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 120px);
}
.stats-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2.5rem;
}
.stats-loading, .stats-empty {
  text-align: center;
  margin-top: 2rem;
  font-size: 1rem;
  opacity: 0.8;
}
.section-title {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  border-left: 4px solid #2563eb;
  padding-left: 1rem;
  color: var(--text-color, #1f2937);
}
.stats-row {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  justify-content: center;
  align-items: stretch;
  flex-wrap: wrap;
}
.chart-container {
  flex: 1;
  min-width: 450px;
  max-width: 650px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 550px;
}
@media (min-width: 1401px) {
  .chart-container { min-width: 500px; max-width: 750px; min-height: 600px; }
  .stats-row { gap: 3rem; }
}
@media (max-width: 1400px) {
  .stats-row { flex-direction: column; align-items: center; }
  .chart-container { min-width: 100%; max-width: 100%; height: 550px; }
}
@media (prefers-color-scheme: dark) {
  .stats-title, .section-title { color: #e5e7eb; }
  .chart-container { background: #0b1220; border: 1px solid #1f2937; }
}
</style>
