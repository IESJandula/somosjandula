<template>
  <div class="stats-page">
    <!-- Título de la página -->
    <h1 class="stats-title">Estadísticas de incidencias</h1>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="stats-loading">
      Cargando estadísticas...
    </div>

    <!-- Sin datos -->
    <div v-else-if="!hayDatos" class="stats-empty">
      No hay incidencias registradas para mostrar estadísticas.
    </div>

    <!-- Gráficos -->
    <div v-else class="stats-column">
      <PieChart
        v-if="datosPorCategoria.length"
        :title="'Incidencias por categoría'"
        :data="datosPorCategoria"
      />

      <PieChart
        v-if="datosPorEstado.length"
        :title="'Incidencias por estado'"
        :data="datosPorEstado"
      />

      <PieChart
        v-if="datosPorUbicacion.length"
        :title="'Incidencias por ubicación'"
        :data="datosPorUbicacion"
      />
    </div>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2000"
      @did-dismiss="() => (isToastOpen = false)"
      position="top"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonToast } from "@ionic/vue";

import PieChart from "@/components/issues/PieChart.vue";
import { crearToast } from "@/utils/toast";
// Importamos los servicios de estadísticas
import {
  obtenerEstadisticasPorCategoria,
  obtenerEstadisticasPorEstado,
  obtenerEstadisticasPorUbicacion,
  EstadisticasCategoriaDto,
  EstadisticasEstadoDto,
  EstadisticasUbicacionDto
} from "@/services/issues";

// Estado de carga y toast
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>("success");

// Datos recibidos del backend
const statsCategoria = ref<EstadisticasCategoriaDto[]>([]);
const statsEstado = ref<EstadisticasEstadoDto[]>([]);
const statsUbicacion = ref<EstadisticasUbicacionDto[]>([]);

// Mapeo a formato ECharts { name, value }
const datosPorCategoria = computed(() =>
  statsCategoria.value.map(item => ({ name: item.nombreCategoria, value: item.cantidad }))
);

const datosPorEstado = computed(() =>
  statsEstado.value.map(item => ({ name: item.estado, value: item.cantidad }))
);

const datosPorUbicacion = computed(() =>
  statsUbicacion.value.map(item => ({ name: item.nombreUbicacion, value: item.cantidad }))
);

// Verificar si hay datos para mostrar
const hayDatos = computed(() =>
  datosPorCategoria.value.length > 0 ||
  datosPorEstado.value.length > 0 ||
  datosPorUbicacion.value.length > 0
);

// Carga de datos desde los endpoints
async function cargarEstadisticas() {
  try {
    isLoading.value = true;
    
    // Llamadas paralelas a los 3 endpoints
    const [cat, est, ubi] = await Promise.all([
      obtenerEstadisticasPorCategoria(toastMessage, toastColor, isToastOpen),
      obtenerEstadisticasPorEstado(toastMessage, toastColor, isToastOpen),
      obtenerEstadisticasPorUbicacion(toastMessage, toastColor, isToastOpen)
    ]);

    statsCategoria.value = cat;
    statsEstado.value = est;
    statsUbicacion.value = ubi;
    
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
  cargarEstadisticas();
});
</script>

<style scoped>

/* CSS */
.stats-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stats-title {
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}
.stats-loading {
  margin-top: 2rem;
  font-size: 1rem;
  opacity: 0.8;
}
.stats-empty {
  margin-top: 2rem;
  text-align: center;
  font-size: 1rem;
  opacity: 0.8;
}
.stats-column {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;
}
@media (prefers-color-scheme: dark) {
  .stats-title { color: #e5e7eb; }
  .stats-loading, .stats-empty { color: #9ca3af; }
}
</style>