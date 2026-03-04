<template>
    <div class="stats-page">
        <h1 class="stats-title">📊 ESTADÍSTICAS</h1>

        <div v-if="isLoading" class="stats-loading">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
            <p>Cargando estadísticas...</p>
        </div>

        <div v-else-if="error" class="stats-error">
            <ion-icon :icon="alertCircleOutline" color="danger"></ion-icon>
            <p>{{ error }}</p>
            <ion-button @click="cargarEstadisticas" color="primary" fill="outline">
                <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
                Reintentar
            </ion-button>
        </div>

        <div v-else class="stats-grid">
            <!-- FILA 1: Recursos más reservados -->
            <div class="stats-row">
                <!-- Recursos Fijas -->
                <section class="stats-column">
                    <h2>🏆 Recursos más reservados (Fijas)</h2>
                    <div class="chart-item">
                        <div v-if="recursosFijos.length">
                            <PieChart :title="''" :data="datosPorRecursoFijo" :show-percentages="true" />
                        </div>
                        <p v-else class="no-data">Sin reservas fijas</p>
                    </div>
                </section>

                <!-- Recursos Temporales -->
                <section class="stats-column">
                    <h2>⏰ Recursos más reservados (Temporales)</h2>
                    <div class="chart-item">
                        <div v-if="recursosTemporales.length">
                            <PieChart :title="''" :data="datosPorRecursoTemporal" :show-percentages="true" />
                        </div>
                        <p v-else class="no-data">Sin reservas temporales</p>
                    </div>
                </section>
            </div>

            <!-- FILA 2: Días y Tramos más reservados -->
            <div class="stats-row">
                <!-- Día más reservado -->
                <section class="stats-column">
                    <h2>📅 Día más reservado (Total)</h2>
                    <div class="chart-item">
                        <p class="chart-info">Suma de reservas fijas y temporales</p>
                        <div v-if="diasMasReservados.length">
                            <PieChart :title="''" :data="datosPorDia" :show-percentages="true" />
                        </div>
                        <p v-else class="no-data">Sin datos de días</p>
                    </div>
                </section>

                <!-- Tramo más reservado -->
                <section class="stats-column">
                    <h2>🕒 Tramo horario más reservado (Total)</h2>
                    <div class="chart-item">
                        <p class="chart-info">Suma de reservas fijas y temporales</p>
                        <div v-if="tramosMasReservados.length">
                            <PieChart :title="''" :data="datosPorTramo" :show-percentages="true" />
                        </div>
                        <p v-else class="no-data">Sin datos de tramos</p>
                    </div>
                </section>
            </div>

            <!-- FILA 3: Incidencias -->
            <div class="stats-row">
                <section class="stats-column">
                    <h2>🔧 Estadísticas de incidencias</h2>
                    <div class="charts-container">
                        <div v-if="datosPorCategoria.length" class="chart-item">
                            <PieChart :title="'Por categoría'" :data="datosPorCategoria" :show-percentages="true" />
                        </div>
                        <div v-if="datosPorEstado.length" class="chart-item">
                            <PieChart :title="'Por estado'" :data="datosPorEstado" :show-percentages="true" />
                        </div>
                        <div v-if="datosPorUbicacion.length" class="chart-item">
                            <PieChart :title="'Por ubicación'" :data="datosPorUbicacion" :show-percentages="true" />
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
            @did-dismiss="() => (isToastOpen = false)" position="top" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonToast, IonSpinner, IonButton, IonIcon } from "@ionic/vue";
import { alertCircleOutline, refreshOutline } from "ionicons/icons";
import PieChart from "@/components/issues/PieChart.vue";
import { crearToast } from "@/utils/toast";

import {
    obtenerRecursoMasReservadoFija,
    obtenerRecursoMasReservadoTemporal,
    obtenerDiaMasReservado,
    obtenerTramoMasReservado
} from "@/services/statistics";
import { listarIncidencias } from "@/services/issues";

const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>("success");
const error = ref<string | null>(null);

// ===== DATOS DE RESERVAS =====
const recursosFijos = ref<Array<{ recurso: string; totalReservas: number }>>([]);
const recursosTemporales = ref<Array<{ recurso: string; totalReservas: number }>>([]);
const diasMasReservados = ref<Array<{ diaSemana: string; totalReservas: number }>>([]);
const tramosMasReservados = ref<Array<{ diaSemana: string; tramoHorario: string; totalReservas: number }>>([]);

// ===== DATOS DE INCIDENCIAS =====
interface Incidencia {
    ubicacion?: string;
    estado?: string;
    categoria?: string;
}
const incidencias = ref<Incidencia[]>([]);

// ===== HELPERS =====
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
        const actual = mapa.get(clave as string) || 0;
        mapa.set(clave as string, actual + 1);
    });
    return Array.from(mapa.entries()).map(([name, value]) => ({ name, value }));
}

// ===== COMPUTED PARA GRÁFICAS =====
const datosPorRecursoFijo = computed(() =>
    recursosFijos.value.slice(0, 5).map(item => ({ name: item.recurso, value: item.totalReservas }))
);

const datosPorRecursoTemporal = computed(() =>
    recursosTemporales.value.slice(0, 5).map(item => ({ name: item.recurso, value: item.totalReservas }))
);

const datosPorDia = computed(() =>
    diasMasReservados.value.slice(0, 5).map(item => ({ name: item.diaSemana, value: item.totalReservas }))
);

const datosPorTramo = computed(() =>
    tramosMasReservados.value.slice(0, 5).map(item => ({ name: item.tramoHorario, value: item.totalReservas }))
);

const datosPorCategoria = computed(() => contarPor(incidencias.value, (i) => i.categoria));
const datosPorEstado = computed(() => contarPor(incidencias.value, (i) => i.estado));
const datosPorUbicacion = computed(() => contarPor(incidencias.value, (i) => i.ubicacion));

// ===== CARGA DE DATOS =====
async function cargarEstadisticas() {
    try {
        isLoading.value = true;
        error.value = null;

        const [
            fijosRecurso,
            temporalesRecurso,
            dias,
            tramos,
            listaIncidencias
        ] = await Promise.all([
            obtenerRecursoMasReservadoFija(toastMessage, toastColor, isToastOpen),
            obtenerRecursoMasReservadoTemporal(toastMessage, toastColor, isToastOpen),
            obtenerDiaMasReservado(toastMessage, toastColor, isToastOpen),
            obtenerTramoMasReservado(toastMessage, toastColor, isToastOpen),
            listarIncidencias(toastMessage, toastColor, isToastOpen)
        ]);

        recursosFijos.value = fijosRecurso;
        recursosTemporales.value = temporalesRecurso;
        diasMasReservados.value = dias;
        tramosMasReservados.value = tramos;
        incidencias.value = listaIncidencias as Incidencia[];

    } catch (err: any) {
        console.error("Error al cargar estadísticas:", err);
        error.value = err.message || "Error al conectar con el servidor";
        crearToast(toastMessage, toastColor, isToastOpen, "danger", error.value || "Error al cargar estadísticas");
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
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--ion-color-primary);
}

.stats-loading {
    text-align: center;
    margin-top: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.stats-loading ion-spinner {
    width: 40px;
    height: 40px;
}

.stats-error {
    text-align: center;
    margin: 3rem auto;
    max-width: 500px;
    padding: 2rem;
    background: var(--ion-color-danger-contrast);
    border-radius: 12px;
    border: 2px solid var(--ion-color-danger);
}

.stats-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.stats-row {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
}

.stats-column {
    flex: 1;
    min-width: 450px;
}

.stats-column h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #333;
    border-left: 4px solid var(--ion-color-primary);
    padding-left: 12px;
}

.chart-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
    min-height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.chart-info {
    font-size: 0.9rem;
    color: var(--ion-color-medium);
    margin-bottom: 1rem;
    font-style: italic;
    text-align: center;
}

.no-data {
    text-align: center;
    color: var(--ion-color-medium);
    padding: 1rem;
    font-style: italic;
}

@media (max-width: 1200px) {
    .stats-column {
        min-width: 100%;
    }
}

@media (prefers-color-scheme: dark) {
    .stats-title,
    .stats-column h2 {
        color: #e5e7eb;
    }

    .chart-item {
        background: #1f2937;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
}
</style>