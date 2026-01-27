<template>
  <div class="calendar-header-top">
    <!-- TÍTULO -->
    <h1 class="year-title">Calendario escolar</h1>
    
    <!-- CONTROLES -->
    <div class="year-controls">
      <button @click="prevYear">◀</button>
      <span class="year-label">{{ schoolYearStart }} / {{ schoolYearEnd }}</span>
      <button @click="nextYear">▶</button>
    </div>

     <!-- LEYENDA AGRUPADA POR COLOR-->
    <div class="calendar-legend">
    <div
      v-for="(nombres, color) in categoriasPorColor"
      :key="color"
      class="legend-group"
      >
        <span
          class="legend-color"
          :style="{ backgroundColor: color }"
        ></span>
        <span class="legend-text">
          {{ nombres.join(', ') }}
        </span>
      </div>
    </div>
  </div>
  <!-- GRID DE MESES -->
  <div class="months-grid">
    <template v-for="(month, index) in months" :key="month.name">
      <div class="month-card">
        <h2 class="month-title">{{ month.name }}</h2>

        <div class="weekdays">
          <span v-for="d in weekDays" :key="d">{{ d }}</span>
        </div>

        <div class="days-grid">
          <span
            v-for="n in getFirstDayOffset(month.month, month.year)"
            :key="'e-' + n"
            class="empty-day"
          >
          </span>

          <div
            v-for="day in getDaysInMonth(month.month, month.year)"
            :key="day"
            class="day-cell"
            @click="onDayClick(month.month, month.year, day)"
          >
            <!-- CAPAS DE EVENTOS -->
            <div
              v-for="(event, idx) in getEventsForDay(month.month, month.year, day)"
              :key="event.titulo + idx"
              class="event-layer"
              :style="getEventLayerStyle(event.color, idx)"
            >
            </div>

            <!-- NÚMERO DEL DÍA -->
            <span
              class="day-number"
              :style="getDayNumberStyle(month.month, month.year, day)"
            >
              {{ day }}
            </span>

            <!-- TOOLTIP -->
            <div
              v-if="getEventsForDay(month.month, month.year, day).length"
              class="tooltip"
            >
              <div
                v-for="event in getEventsForDay(month.month, month.year, day)"
                :key="event.titulo"
                class="tooltip-item"
                :style="{ color: isLightColor(event.color) ? '#000' : '#fff' }"
              >
                <strong>{{ event.titulo }}</strong><br />
                <span>{{ event.categoria }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

    <!-- MODAL -->
    <div
      v-if="isDayModalOpen"
      class="day-modal-overlay"
      @click.self="isDayModalOpen = false"
    >
      <div class="day-modal">
        <h3>Eventos del {{ selectedDayLabel }}</h3>

        <div
          v-for="event in selectedDayEvents"
            :key="event.titulo"
            class="day-modal-event"
            :style="{
              backgroundColor: event.color,
              color: isLightColor(event.color) ? '#000' : '#fff'
            }"
          >
            <div class="day-modal-event-content">
              <strong>{{ event.titulo }}</strong><br />
              <small>{{ event.categoria }}</small><br />
              <small class="event-dates">
                {{ getEventDateLabel(event) }}
              </small>
          </div>
        </div>

        <button class="close-btn" @click="isDayModalOpen = false">
          Cerrar
        </button>
      </div>
          <!-- TOAST -->
          <ion-toast
            :is-open="isToastOpen"
            :message="toastMessage"
            :color="toastColor"
            duration="2000"
            position="top"
            @did-dismiss="isToastOpen = false"
          />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { IonToast } from "@ionic/vue";
import { obtenerEventos, obtenerCategorias } from "@/services/events";

/* ===== TIPOS ===== */
interface Evento {
  titulo: string;
  nombre: string;
  fechaInicio: number;
  fechaFin: number;
}

interface Categoria {
  nombre: string;
  color: string;
}

interface EventoCalendario {
  titulo: string;
  categoria: string;
  color: string;
  fechaInicio: number;
  fechaFin: number;
}

/* ===== TOAST ===== */
const toastMessage = ref("");
const toastColor = ref("success");
const isToastOpen = ref(false);

/* ===== ESTADO ===== */
const eventos = ref<Evento[]>([]);
const categorias = ref<Categoria[]>([]);
const eventosCalendario = ref<EventoCalendario[]>([]);

/* ===== AÑO ESCOLAR ===== */
const today = new Date();
const schoolYearStart = ref(
  today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1
);
const schoolYearEnd = computed(() => schoolYearStart.value + 1);

const prevYear = () => schoolYearStart.value--;
const nextYear = () => schoolYearStart.value++;

/* ===== MESES ===== */
const months = computed(() => [
  { name: "Septiembre", month: 8, year: schoolYearStart.value },
  { name: "Octubre", month: 9, year: schoolYearStart.value },
  { name: "Noviembre", month: 10, year: schoolYearStart.value },
  { name: "Diciembre", month: 11, year: schoolYearStart.value },
  { name: "Enero", month: 0, year: schoolYearEnd.value },
  { name: "Febrero", month: 1, year: schoolYearEnd.value },
  { name: "Marzo", month: 2, year: schoolYearEnd.value },
  { name: "Abril", month: 3, year: schoolYearEnd.value },
  { name: "Mayo", month: 4, year: schoolYearEnd.value },
  { name: "Junio", month: 5, year: schoolYearEnd.value },
]);

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

/* ===== FECHAS ===== */
const getDaysInMonth = (m: number, y: number) =>
  new Date(y, m + 1, 0).getDate();

const getFirstDayOffset = (m: number, y: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

/* ===== EVENTOS ===== */
const getEventsForDay = (m: number, y: number, d: number) => {
  const date = new Date(y, m, d).getTime();
  return eventosCalendario.value.filter(
    e => date >= e.fechaInicio && date <= e.fechaFin
  );
};

const isLightColor = (hex: string) => {
  if (!hex.startsWith("#")) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
};

const getEventLayerStyle = (color: string, index: number) => {
  const offset = Math.min(index, 4) * 4;
  return {
    backgroundColor: color,
    top: `${offset}px`,
    left: `${offset}px`,
    right: `${offset}px`,
    bottom: `${offset}px`,
  };
};
function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("es-ES");
}

function getEventDateLabel(event: EventoCalendario): string {
 const inicio = formatDate(event.fechaInicio);

  // No hay fecha fin
  if (!event.fechaFin) {
    return ` ${inicio}`;
  }

  const fin = formatDate(event.fechaFin);

  // Finaliza el mismo día
  if (event.fechaFin === event.fechaInicio) {
    return ` ${inicio} (finaliza el mismo día)`;
  }

  // Rango de fechas
  return ` ${inicio} – ${fin}`;
}


/* ===== MODAL ===== */
const selectedDayEvents = ref<EventoCalendario[]>([]);
const selectedDayLabel = ref("");
const isDayModalOpen = ref(false);

const onDayClick = (m: number, y: number, d: number) => {
  const events = getEventsForDay(m, y, d);
  if (!events.length) return;
  selectedDayEvents.value = events;
  selectedDayLabel.value = `${d}/${m + 1}/${y}`;
  isDayModalOpen.value = true;
};

/* ===== DATOS ===== */
const cargarCategorias = async () => {
  categorias.value = (await obtenerCategorias(
    toastMessage,
    toastColor,
    isToastOpen
  )) || [];
};

const cargarEventos = async () => {
  eventos.value = (await obtenerEventos(
    toastMessage,
    toastColor,
    isToastOpen
  )) || [];
};

const mapearEventos = () => {
  const map: Record<string, string> = {};
  categorias.value.forEach(c => (map[c.nombre] = c.color));
  eventosCalendario.value = eventos.value.map(e => ({
    titulo: e.titulo,
    categoria: e.nombre,
    color: map[e.nombre] ?? "#666",
    fechaInicio: e.fechaInicio,
    fechaFin: e.fechaFin,
  }));
};

function getDayNumberStyle(month: number, year: number, day: number) {
  const events = getEventsForDay(month, year, day);

  // Si NO hay eventos → negro
  if (!events.length) {
    return { color: "#000" };
  }

  // Si hay algún evento con color claro → negro
  if (events.some(e => isLightColor(e.color))) {
    return { color: "#000" };
  }

  // Si todos los colores son oscuros → blanco
  return { color: "#fff" };
}

const categoriasPorColor = computed(() => {
  const map: Record<string, string[]> = {};

  categorias.value.forEach(cat => {
    if (!map[cat.color]) {
      map[cat.color] = [];
    }
    map[cat.color].push(cat.nombre);
  });

  return map;
});

onMounted(async () => {
  await cargarCategorias();
  await cargarEventos();
  mapearEventos();
});
</script>

<style scoped>
.year-calendar {
  padding: 20px;
}

/* =========================
   TÍTULO PRINCIPAL
========================= */
.calendar-header-top {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
  padding: 12px 0 16px;
  text-align: center;
}
.calendar-legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  width: fit-content;
  margin: 0 auto;           
  padding-left: 0; 
}

.legend-group {
  display: grid;
  grid-template-columns: 18px auto; 
  align-items: center;
  column-gap: 8px;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,.25);
}

.legend-names {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.legend-text {
  font-size: 16px;   
  font-weight: 500;
  white-space: nowrap;
}

/* =========================
   CONTROLES DE AÑO 
========================= */
.year-controls {
  display: grid;
  grid-template-columns: auto 1fr auto; 
  align-items: center;
  column-gap: 30px;
  justify-content: center;
  margin: 20px auto 8px;
  width: fit-content;
}


.year-controls button {
  font-size: 22px;
  font-weight: bold;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: #e0e0e0;
}

.year-controls button:hover {
  background-color: #d0d0d0;
}

.year-label {
  font-size: 24px;
  font-weight: bold;
}

/* =========================
   GRID DE MESES
========================= */
.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.month-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
}

/* =========================
   TÍTULO DEL MES 
========================= */
.month-title {
  text-align: center;
  font-weight: bold;
  padding: 10px 0;
  margin-bottom: 6px;
  background-color: #89a8f0;
  border-radius: 8px;
}

/* =========================
   CABECERA DÍAS SEMANA 
========================= */
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  padding: 6px 0;
  margin-bottom: 8px;
  background-color: #b7c9f1;
  border-radius: 8px;
}

.weekdays span {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* =========================
   GRID DE DÍAS
========================= */
.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

/* =========================
   CELDA DE DÍA
========================= */
.day-cell {
  position: relative;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell:hover .event-layer {
  filter: brightness(1.25);
} 
/* Capas de colores de eventos */
.event-layer {
  position: absolute;
  border-radius: 6px;
  z-index: 1;
  pointer-events: none;
}

/* Número del día*/
.day-number {
  position: relative;
  z-index: 2;
  font-size: 13px;
  font-weight: bold;
  color: #000;
}

/* =========================
   TOOLTIP
========================= */
.tooltip {
  display: none;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 8px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,.4);
}

.day-cell:hover .tooltip {
  display: block;
}


/* =========================
   MODAL DE EVENTOS
========================= */
.day-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.75);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.day-modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 420px;
  box-shadow: 0 10px 30px rgba(0,0,0,.4);
}

.day-modal-event {
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 10px;
  font-size: 30px;
}

.day-modal-event-content {
  line-height: 1.3;
}

.day-cell:hover {
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.45);
  transform: scale(1.05);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

/* =========================
   MODO OSCURO 
========================= */
@media (prefers-color-scheme: dark) {

  .calendar-header-top {
    background: #1f2933;        
    border-bottom: 1px solid #374151;
  }

  .calendar-header-top h1,
  .calendar-header-top,
  .calendar-header-top span {
    color: #f3f4f6;             
  }

  .calendar-legend {
    background: transparent;    
  }

  .legend-text {
    color: #e5e7eb;             
  }

  .legend-color {
    border: 1px solid rgba(255,255,255,.4);
  }

  .month-card {
    background-color: var(--form-bg-dark);
    border: 1px solid #444;
    box-shadow: rgba(255,255,255,0.08) 0px 5px 15px;
  }

  .month-title {
    background-color: #34495e;
    color: #ecf0f1;;
  }

  .weekdays {
    background-color: #2c3e50;
    color: #f5f6fa;
  }

  .day-number {
    color: var(--text-color-dark);
  }

  .tooltip {
    background-color: #2c3e50;
    color: var(--text-color-dark);
    box-shadow: rgba(255,255,255,0.15) 0px 4px 12px;
  }

  .year-separator {
    background-color: #34495e;
    color: #f5f6fa;;
  }

  .day-modal {
    background-color: var(--form-bg-dark);
    color: #f5f6fa;;
    box-shadow: rgba(255,255,255,0.15) 0px 8px 25px;
  }

  .day-modal-event small {
    color: #bbb;
  }
  .day-cell:hover {
  box-shadow: 0 0 0 2px rgba(173, 216, 230, 0.7);
  }

  .day-cell:hover .event-layer {
    filter: brightness(1.35);
  }
}

@media (max-width: 480px) {

/* ===== CONTENEDOR STICKY DEL HEADER ===== */
  .calendar-header-top {
    position: sticky;
    top: 0;
    z-index: 30;
    background: #1e2a36;
    padding: 6px 7px 7px;
  }

  /* ===== TÍTULO ===== */
  .calendar-title {
    font-size: 8px;
    text-align: center;
    margin-bottom: 3px;
    color: #ffffff;
  }

  /* ===== CONTROLES DEL AÑO ===== */
  .year-controls button {
    font-size: 10px;
    font-weight: bold;
    padding: 6px 8px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background-color: #e0e0e0;
  }

  .year-controls button:hover {
    background-color: #d0d0d0;
  }
  .year-title{
    font-size: 15px;
  }
  .year-label {
    font-size: 10px;
    font-weight: 600;
    color: #ffffff;
  }

  /* ===== LEYENDA ===== */
  .calendar-legend {
    width: max-content;
    margin: 0 auto;
    gap: 4px;
  }

  .legend-group {
    display: grid;
    grid-template-columns: 5px auto;
    column-gap: 5px;
  }

  .legend-color {
    width: 8px;
    height: 8px;
    border-radius: 3px;
  }

  .legend-text {
    font-size: 10px;
    line-height: 1.1;
    font-weight: 500;
    color: #e6e6e6;
  }

  /* ===== SCROLL INTERNO DEL CALENDARIO ===== */
  .calendar-scroll-container {
    overflow-x: auto;
    overflow-y: auto;
    max-height: calc(100vh - 150px);
  }

  /* ===== SCROLLBAR FINO ===== */
  .calendar-scroll-container::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  .calendar-scroll-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.35);
    border-radius: 2px;
  }
    /* CONTENEDOR GENERAL DEL CALENDARIO */
  .year-calendar {
    height: calc(100vh - 60px); 
    overflow: hidden;
  }

  /* GRID DE MESES */
  .months-grid {
    height: 100%;
    overflow-x: auto;      
    overflow-y: auto;     
    -webkit-overflow-scrolling: touch;
    grid-template-columns: repeat(3, minmax(240px, 1fr));
  }


}
</style>
