<template>
  <div class="stats-page">
    <!-- Título de la página -->
    <h1 class="stats-title">Estadísticas de incidencias</h1>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="stats-loading">
      Cargando estadísticas...
    </div>

    <!-- Sin incidencias -->
    <div v-else-if="!incidenciasNormalizadas.length" class="stats-empty">
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
import { listarIncidencias } from "@/services/issues";

interface Incidencia {
  ubicacion?: string;
  email?: string;
  fecha?: string;
  problema?: string;
  estado?: string;
  solucion?: string;
  categoria?: string;
  emailResponsable?: string;
}

interface PieDatum {
  name: string;
  value: number;
}

const incidencias = ref<Incidencia[]>([]);
const isLoading = ref<boolean>(false);

// Toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>(
  "success"
);

// ---------- Helpers ----------

function contarPor<T extends Record<string, any>>(
  lista: T[],
  campo: keyof T | ((item: T) => string | undefined | null)
): PieDatum[] {
  const mapa = new Map<string, number>();

  lista.forEach((item) => {
    let clave: string | undefined | null;

    if (typeof campo === "function") {
      clave = campo(item);
    } else {
      clave = item[campo] as string | undefined | null;
    }

    if (!clave || clave.toString().trim() === "") {
      clave = "Sin datos";
    }

    const actual = mapa.get(clave) || 0;
    mapa.set(clave, actual + 1);
  });

  return Array.from(mapa.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

// Normalizar datos de incidencias
const incidenciasNormalizadas = computed<Incidencia[]>(() =>
  incidencias.value.map((i) => {
    const nombreCategoria = i.categoria || "";
    return {
      ...i,
      nombreCategoria,
    };
  })
);

// Datos para cada gráfico
const datosPorCategoria = computed<PieDatum[]>(() =>
  contarPor(incidenciasNormalizadas.value, (i) => i.categoria)
);

const datosPorEstado = computed<PieDatum[]>(() =>
  contarPor(incidenciasNormalizadas.value, (i) => i.estado)
);

const datosPorUbicacion = computed<PieDatum[]>(() =>
  contarPor(incidenciasNormalizadas.value, (i) => i.ubicacion)
);

// ---------- Carga de datos ----------

async function cargarIncidencias() {
  try {
    isLoading.value = true;
    const lista = await listarIncidencias(toastMessage, toastColor, isToastOpen);
    incidencias.value = lista as Incidencia[];
  } catch (error: any) {
    console.error("Error al cargar incidencias:", error);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      error?.message || "Error al cargar las incidencias"
    );
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  cargarIncidencias();
});
</script>

<style scoped>
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

/* Modo oscuro  */
@media (prefers-color-scheme: dark) {
  .stats-title {
    color: #e5e7eb;
  }

  .stats-loading,
  .stats-empty {
    color: #9ca3af;
  }
}
</style>
