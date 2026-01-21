<template>
  <div class="year-calendar">
    <h1 class="year-title">Calendario {{ currentYear }}</h1>

    <div class="months-grid">
      <div
        v-for="(month, monthIndex) in months"
        :key="monthIndex"
        class="month-card"
      >
        <h2 class="month-title">{{ month }}</h2>

        <div class="weekdays">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>

        <div class="days-grid">
          <span
            v-for="n in getFirstDayOffset(monthIndex)"
            :key="'empty-' + n"
            class="empty-day"
          ></span>

          <div
            v-for="day in getDaysInMonth(monthIndex)"
            :key="day"
            class="day-cell"
            :style="getDayStyle(monthIndex, day)"
          >
            <span class="day-number">{{ day }}</span>

            <div
              v-if="getEventsForDay(monthIndex, day).length"
              class="tooltip"
            >
              <div
                v-for="event in getEventsForDay(monthIndex, day)"
                :key="event.titulo"
                class="tooltip-item"
              >
                <strong>{{ event.titulo }}</strong><br />
                <span>{{ event.categoria }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { obtenerNombreYApellidosUsuario } from '@/services/firebaseService';

interface Evento {
  titulo: string;
  categoria: string;
  color: string;
  fechaInicio: number;
  fechaFin: number;
}

const props = defineProps<{
  eventos: Evento[];
}>();

const currentYear = new Date().getFullYear();

const months = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

function getDaysInMonth(month: number): number {
  return new Date(currentYear, month + 1, 0).getDate();
}

function getFirstDayOffset(month: number): number {
  const day = new Date(currentYear, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getEventsForDay(month: number, day: number): Evento[] {
  const date = new Date(currentYear, month, day).getTime();

  return props.eventos.filter(
    e => date >= e.fechaInicio && date <= e.fechaFin
  );
}

function getDayStyle(month: number, day: number) {
  const events = getEventsForDay(month, day);
  if (!events.length) return {};

  return {
    backgroundColor: events[0].color,
    color: "#fff"
  };
}
</script>
<style scoped>
.year-calendar {
  padding: 20px;
}

.year-title {
  text-align: center;
  margin-bottom: 20px;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.month-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
}

.month-title {
  text-align: center;
  margin-bottom: 8px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-size: 11px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 5px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  position: relative;
  height: 28px;
  font-size: 11px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
}

.day-number {
  line-height: 28px;
}

.empty-day {
  height: 28px;
}

.tooltip {
  display: none;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 6px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 10;
}

.day-cell:hover .tooltip {
  display: block;
}

.tooltip-item {
  margin-bottom: 4px;
}
</style>