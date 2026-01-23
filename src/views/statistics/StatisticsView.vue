<template>
    <div class="stats-page">
        <!-- Título principal -->
        <h1 class="stats-title">ESTADÍSTICAS</h1>

        <!-- Estado de carga -->
        <div v-if="isLoading" class="stats-loading">
            Cargando estadísticas...
        </div>

        <!-- Sin datos -->
        <div v-else-if="!hayDatos" class="stats-empty">
            No hay datos registrados para mostrar estadísticas.
        </div>

        <!-- Layout de dos columnas -->
        <div v-else class="stats-grid">
            <!-- Columna 1: Reservas -->
            <section class="stats-column">
                <h2>Estadísticas de reservas</h2>
                <div class="charts-container">
                    <div v-if="recursos.length" class="chart-item">
                        <PieChart :title="'Recurso más reservado'" :data="datosPorRecurso" :show-percentages="true" />
                    </div>
                    <div v-if="diaTramos.length" class="chart-item">
                        <PieChart :title="'Día y tramo más reservado'" :data="datosPorDiaTramo"
                            :show-percentages="true" />
                    </div>
                </div>
            </section>

            <!-- Columna 2: Incidencias -->
            <section class="stats-column">
                <h2>Estadísticas de incidencias</h2>
                <div class="charts-container">
                    <div v-if="datosPorCategoria.length" class="chart-item">
                        <PieChart :title="'Incidencias por categoría'" :data="datosPorCategoria"
                            :show-percentages="true" />
                    </div>
                    <div v-if="datosPorEstado.length" class="chart-item">
                        <PieChart :title="'Incidencias por estado'" :data="datosPorEstado" :show-percentages="true" />
                    </div>
                    <div v-if="datosPorUbicacion.length" class="chart-item">
                        <PieChart :title="'Incidencias por ubicación'" :data="datosPorUbicacion"
                            :show-percentages="true" />
                    </div>
                </div>
            </section>
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

// Servicios
import { obtenerRecursoMasReservado, obtenerDiaTramoMasReservado } from "@/services/statistics";
import { listarIncidencias } from "@/services/issues";

// ====== ESTADO GENERAL ======
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>("success");

// ====== DATOS DE RESERVAS ======
const recursos = ref<Array<{ recurso: string; totalReservas: number }>>([]);
const diaTramos = ref<Array<{ diaSemana: string; tramoHorario: string; totalReservas: number }>>([]);

// ====== DATOS DE INCIDENCIAS ======
interface Incidencia {
    ubicacion?: string;
    estado?: string;
    categoria?: string;
}
const incidencias = ref<Incidencia[]>([]);

// ====== HELPERS ======
function contarPor<T extends Record<string, any>>(
    lista: T[],
    campo: keyof T | ((item: T) => string | undefined | null)
): Array<{ name: string; value: number }> {
    const mapa = new Map<string, number>();
    lista.forEach((item) => {
        let clave = typeof campo === "function" ? campo(item) : item[campo];

        if (!clave || (typeof clave === 'string' && (clave as string).trim() === '')) {
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

// ====== COMPUTED ======
const datosPorRecurso = computed(() =>
    recursos.value.map(item => ({ name: item.recurso, value: item.totalReservas }))
);

const datosPorDiaTramo = computed(() =>
    diaTramos.value.map(item => ({
        name: `${item.diaSemana} — ${item.tramoHorario}`,
        value: item.totalReservas
    }))
);

const datosPorCategoria = computed(() => contarPor(incidencias.value, (i) => i.categoria));
const datosPorEstado = computed(() => contarPor(incidencias.value, (i) => i.estado));
const datosPorUbicacion = computed(() => contarPor(incidencias.value, (i) => i.ubicacion));

const hayDatos = computed(() =>
    recursos.value.length > 0 ||
    diaTramos.value.length > 0 ||
    incidencias.value.length > 0
);

// ====== CARGA DE DATOS ======
async function cargarEstadisticas() {
    try {
        isLoading.value = true;
        recursos.value = await obtenerRecursoMasReservado(toastMessage, toastColor, isToastOpen);
        diaTramos.value = await obtenerDiaTramoMasReservado(toastMessage, toastColor, isToastOpen);
        const lista = await listarIncidencias(toastMessage, toastColor, isToastOpen);
        incidencias.value = lista as Incidencia[];
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
.stats-page {
    max-width: 1600px;
    margin: 0 auto;
    padding: 1.5rem;
    min-height: calc(100vh - 120px);
}

.stats-title {
    font-size: 1.8rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
}

.stats-loading,
.stats-empty {
    text-align: center;
    margin-top: 2rem;
    font-size: 1rem;
    opacity: 0.8;
}

/* Layout de dos columnas */
.stats-grid {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
}

.stats-column {
    flex: 1;
    min-width: 450px;
    display: flex;
    flex-direction: column;
}

.stats-column h2 {
    font-size: 1.4rem;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
}

.charts-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
}

.chart-item {
    background: white;
    border-radius: 12px;
    padding: 1.8rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-height: 320px;
    display: flex;
    flex-direction: column;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {

    .stats-title,
    .stats-column h2 {
        color: #e5e7eb;
    }

    .stats-loading,
    .stats-empty {
        color: #9ca3af;
    }

    .chart-item {
        background: #1f2937;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
}

/* Móvil: una columna */
@media (max-width: 900px) {
    .stats-grid {
        flex-direction: column;
    }

    .stats-column {
        min-width: 100%;
    }

    .chart-item {
        min-height: 280px;
        padding: 1.5rem;
    }
}
</style>