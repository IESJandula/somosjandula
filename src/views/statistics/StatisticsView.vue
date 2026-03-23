<template>
    <div class="stats-page">
        <!-- Título principal -->
        <h1 class="stats-title">ESTADÍSTICAS DE RESERVAS</h1>

        <!-- Estado de carga -->
        <div v-if="isLoading" class="stats-loading">
            Cargando estadísticas...
        </div>

        <!-- Sin datos -->
        <div v-else-if="!hayDatos" class="stats-empty">
            No hay datos registrados para mostrar estadísticas.
        </div>

        <!-- 3 GRÁFICAS EN 1 FILA HORIZONTAL -->
        <div v-else class="stats-row">
            <!-- Gráfica 1: Recurso más reservado -->
            <div class="chart-container">
                <PieChart :title="'Recurso más reservado'" :data="datosPorRecurso" />
            </div>

            <!-- Gráfica 2: Tramo horario más reservado -->
            <div class="chart-container">
                <PieChart :title="'Tramo horario más reservado'" :data="datosPorTramo" />
            </div>

            <!-- Gráfica 3: Día de la semana más reservado -->
            <div class="chart-container">
                <PieChart :title="'Día de la semana más reservado'" :data="datosPorDia" />
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
    obtenerRecursoMasReservado,
    obtenerTramoHorarioMasReservado,
    obtenerDiaSemanaMasReservado
} from "@/services/statistics";

// ====== ESTADO GENERAL ======
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref<"success" | "danger" | "warning" | "primary" | string>("success");

// ====== DATOS DE ESTADÍSTICAS ======
const recursos = ref<Array<{ recurso: string; totalReservas: number }>>([]);
const tramos = ref<Array<{ tramoHorario: string; totalReservas: number }>>([]);
const dias = ref<Array<{ diaSemana: string; totalReservas: number }>>([]);

// ====== COMPUTED ======
const datosPorRecurso = computed(() =>
    recursos.value.map(item => ({ name: item.recurso, value: item.totalReservas }))
);

const datosPorTramo = computed(() =>
    tramos.value.map(item => ({ name: item.tramoHorario, value: item.totalReservas }))
);

const datosPorDia = computed(() =>
    dias.value.map(item => ({ name: item.diaSemana, value: item.totalReservas }))
);

const hayDatos = computed(() =>
    recursos.value.length > 0 ||
    tramos.value.length > 0 ||
    dias.value.length > 0
);

// ====== CARGA DE DATOS ======
async function cargarEstadisticas() {
    try {
        isLoading.value = true;

        const [recursosData, tramosData, diasData] = await Promise.all([
            obtenerRecursoMasReservado(toastMessage, toastColor, isToastOpen),
            obtenerTramoHorarioMasReservado(toastMessage, toastColor, isToastOpen),
            obtenerDiaSemanaMasReservado(toastMessage, toastColor, isToastOpen)
        ]);

        recursos.value = recursosData;
        tramos.value = tramosData;
        dias.value = diasData;
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

.stats-loading,
.stats-empty {
    text-align: center;
    margin-top: 2rem;
    font-size: 1rem;
    opacity: 0.8;
}

/* 3 GRÁFICAS EN 1 FILA HORIZONTAL */
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

/* Desktop específico */
@media (min-width: 1401px) {
    .chart-container {
        min-width: 500px;        
        max-width: 750px;
        min-height: 600px;        
    }

    .stats-row {
        gap: 3rem;        
    }
}

/* Móvil: 1 columna */
@media (max-width: 1400px) {
    .stats-row {
        flex-direction: column;
        align-items: center;
    }

    .chart-container {
        min-width: 100%;
        max-width: 100%;
        height: 550px;
    }
}
</style>