<template>
  <div class="stats-page">
    <!-- Título principal -->
    <h1 class="stats-title">ESTADÍSTICAS GENERALES</h1>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="stats-loading">
      Cargando estadísticas...
    </div>

    <!-- Sin datos -->
    <div v-else-if="!hayDatosGlobales" class="stats-empty">
      No hay datos registrados para mostrar estadísticas.
    </div>

    <div v-else>
      <!-- Estadísticas de INCIDENCIAS -->
      <h2 class="section-title">Incidencias</h2>
      <div class="stats-row mb-20">
        <div class="chart-container">
          <PieChart :title="'Por categoría'" :data="datosIncidCategoria" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Por estado'" :data="datosIncidEstado" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Por ubicación'" :data="datosIncidUbicacion" />
        </div>
      </div>

      <!-- Estadísticas de RESERVAS -->
      <h2 class="section-title">Reservas de Recursos</h2>
      <div class="stats-row mb-20">
        <div class="chart-container">
          <PieChart :title="'Recurso más reservado'" :data="datosPorRecurso" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Tramo horario más reservado'" :data="datosPorTramo" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Día de la semana más reservado'" :data="datosPorDia" />
        </div>
      </div>

      <!-- Estadísticas de IMPRESIONES -->
      <h2 class="section-title">Impresiones</h2>
      <div class="stats-row mb-20">
        <div class="chart-container">
          <PieChart :title="'Hojas impresas por tipo de color'" :data="datosHojasPorColor" />
        </div>
        <div class="chart-container">
          <PieChart :title="'Impresiones por estado'" :data="datosImpresionesPorEstado" />
        </div>
      </div>

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
          <PieChart :title="'Microservicio más usado'" :data="datosPeticionesPorMicroservicio" />
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

// Importar servicios de incidencias y recursos
import {
  obtenerEstadisticasPorCategoria,
  obtenerEstadisticasPorEstado,
  obtenerEstadisticasPorUbicacion
} from "@/services/issues";

import {
  obtenerRecursoMasReservado,
  obtenerTramoHorarioMasReservado,
  obtenerDiaSemanaMasReservado
} from "@/services/statistics";

import {
  obtenerHojasPorColor,
  obtenerImpresionesPorEstado
} from "@/services/printersStatistics";

import {
  obtenerPeticionesPorDiaSemana,
  obtenerPeticionesPorTramoHorario,
  obtenerPeticionesPorMicroservicio
} from "@/services/auditStatistics";

// ====== ESTADO GENERAL ======
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>("success");

// ====== DATOS DE INCIDENCIAS ======
const incidCat = ref<Array<{ nombreCategoria: string; cantidad: number }>>([]);
const incidEst = ref<Array<{ estado: string; cantidad: number }>>([]);
const incidUbi = ref<Array<{ nombreUbicacion: string; cantidad: number }>>([]);

// ====== DATOS DE RESERVAS ======
const recursos = ref<Array<{ recurso: string; totalReservas: number }>>([]);
const tramos = ref<Array<{ tramoHorario: string; totalReservas: number }>>([]);
const dias = ref<Array<{ diaSemana: string; totalReservas: number }>>([]);

// ====== DATOS DE IMPRESIONES ======
const hojasPorColor = ref<Array<{ color: string; totalHojas: number }>>([]);
const impresionesPorEstado = ref<Array<{ estado: string; totalImpresiones: number }>>([]);

// ====== DATOS DE AUDITORÍA ======
const peticionesPorDiaSemana = ref<Array<{ diaSemana: string; totalPeticiones: number }>>([]);
const peticionesPorTramoHorario = ref<Array<{ tramoHorario: string; totalPeticiones: number }>>([]);
const peticionesPorMicroservicio = ref<Array<{ microservicio: string; totalPeticiones: number }>>([]);

// ====== COMPUTED: Mapeo a formato ECharts ======
// Incidencias
const datosIncidCategoria = computed(() =>
  incidCat.value.map(item => ({ name: item.nombreCategoria, value: item.cantidad }))
);
const datosIncidEstado = computed(() =>
  incidEst.value.map(item => ({ name: item.estado, value: item.cantidad }))
);
const datosIncidUbicacion = computed(() =>
  incidUbi.value.map(item => ({ name: item.nombreUbicacion, value: item.cantidad }))
);

// Reservas
const datosPorRecurso = computed(() =>
  recursos.value.map(item => ({ name: item.recurso, value: item.totalReservas }))
);
const datosPorTramo = computed(() =>
  tramos.value.map(item => ({ name: item.tramoHorario, value: item.totalReservas }))
);
const datosPorDia = computed(() =>
  dias.value.map(item => ({ name: item.diaSemana, value: item.totalReservas }))
);

// Impresiones
const datosHojasPorColor = computed(() =>
  hojasPorColor.value.map(item => ({ name: item.color, value: item.totalHojas }))
);
const datosImpresionesPorEstado = computed(() =>
  impresionesPorEstado.value.map(item => ({ name: item.estado, value: item.totalImpresiones }))
);

// Auditoría
const datosPeticionesPorDiaSemana = computed(() =>
  peticionesPorDiaSemana.value.map(item => ({ name: item.diaSemana, value: item.totalPeticiones }))
);
const datosPeticionesPorTramoHorario = computed(() =>
  peticionesPorTramoHorario.value.map(item => ({ name: item.tramoHorario, value: item.totalPeticiones }))
);
const datosPeticionesPorMicroservicio = computed(() =>
  peticionesPorMicroservicio.value.map(item => ({ name: item.microservicio, value: item.totalPeticiones }))
);

// Verificar si hay algún dato para mostrar
const hayDatosGlobales = computed(() =>
  datosIncidCategoria.value.length > 0 ||
  datosIncidEstado.value.length > 0 ||
  datosIncidUbicacion.value.length > 0 ||
  datosPorRecurso.value.length > 0 ||
  datosPorTramo.value.length > 0 ||
  datosPorDia.value.length > 0 ||
  datosHojasPorColor.value.length > 0 ||
  datosImpresionesPorEstado.value.length > 0 ||
  datosPeticionesPorDiaSemana.value.length > 0 ||
  datosPeticionesPorTramoHorario.value.length > 0 ||
  datosPeticionesPorMicroservicio.value.length > 0
);

// ====== CARGA DE DATOS ======
async function cargarTodo() {
  try {
    isLoading.value = true;

    // Cargamos estadísticas de incidencias, reservas, impresiones y auditoría en paralelo
    const [iCat, iEst, iUbi, rRec, rTra, rDia, pCol, pEst, aDia, aTra, aMic] = await Promise.all([
      obtenerEstadisticasPorCategoria(toastMessage, toastColor, isToastOpen),
      obtenerEstadisticasPorEstado(toastMessage, toastColor, isToastOpen),
      obtenerEstadisticasPorUbicacion(toastMessage, toastColor, isToastOpen),
      obtenerRecursoMasReservado(toastMessage, toastColor, isToastOpen),
      obtenerTramoHorarioMasReservado(toastMessage, toastColor, isToastOpen),
      obtenerDiaSemanaMasReservado(toastMessage, toastColor, isToastOpen),
      obtenerHojasPorColor(toastMessage, toastColor, isToastOpen),
      obtenerImpresionesPorEstado(toastMessage, toastColor, isToastOpen),
      obtenerPeticionesPorDiaSemana(toastMessage, toastColor, isToastOpen),
      obtenerPeticionesPorTramoHorario(toastMessage, toastColor, isToastOpen),
      obtenerPeticionesPorMicroservicio(toastMessage, toastColor, isToastOpen)
    ]);

    // Asignar datos de incidencias
    incidCat.value = iCat;
    incidEst.value = iEst;
    incidUbi.value = iUbi;

    // Asignar datos de reservas
    recursos.value = rRec;
    tramos.value = rTra;
    dias.value = rDia;

    // Asignar datos de impresiones
    hojasPorColor.value = pCol;
    impresionesPorEstado.value = pEst;

    // Asignar datos de auditoría
    peticionesPorDiaSemana.value = aDia;
    peticionesPorTramoHorario.value = aTra;
    peticionesPorMicroservicio.value = aMic;

  } catch (error: any) {
    console.error("Error al cargar estadísticas:", error);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      error?.message || "Error al cargar las estadísticas"
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
.mb-20 { margin-bottom: 3rem; }
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