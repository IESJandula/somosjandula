<template>
  <aside class="weekly-events-card" aria-labelledby="weekly-events-title">
    <header class="weekly-events-header">
      <span class="weekly-events-icon-wrap" aria-hidden="true">
        <ion-icon :icon="calendarNumberOutline" class="weekly-events-icon" />
      </span>
      <div>
        <h2 id="weekly-events-title" class="weekly-events-title">Eventos de la semana</h2>
        <p class="weekly-events-range">{{ intervaloSemana }}</p>
      </div>
    </header>

    <div v-if="cargando" class="weekly-events-loading" aria-live="polite">
      Cargando eventos…
    </div>

    <div v-else-if="eventoActual" class="weekly-events-slideshow">
      <transition name="event-slide" mode="out-in">
        <article :key="eventoActual.clave" class="weekly-event-slide" aria-live="polite">
          <img
            class="weekly-event-image"
            src="/img/home/eventos-semana-placeholder.webp"
            :alt="`Imagen temporal para el evento ${eventoActual.titulo}`"
          />

          <div class="weekly-event-copy">
            <p class="weekly-event-date">{{ etiquetaFecha(eventoActual) }}</p>
            <h3 class="weekly-event-name">{{ eventoActual.titulo }}</h3>
            <p v-if="eventoActual.categoria" class="weekly-event-category">
              {{ eventoActual.categoria }}
            </p>
          </div>
        </article>
      </transition>

      <nav class="weekly-events-controls" aria-label="Controles del carrusel de eventos">
        <button
          type="button"
          class="weekly-events-arrow"
          :disabled="eventosSemana.length < 2"
          aria-label="Mostrar el evento anterior"
          @click="mostrarAnterior"
        >
          <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
        </button>

        <span class="weekly-events-counter" aria-live="polite">
          {{ indiceActual + 1 }} / {{ eventosSemana.length }}
        </span>

        <button
          type="button"
          class="weekly-events-arrow"
          :disabled="eventosSemana.length < 2"
          aria-label="Mostrar el evento siguiente"
          @click="mostrarSiguiente"
        >
          <ion-icon :icon="chevronForwardOutline" aria-hidden="true" />
        </button>
      </nav>
    </div>

    <div v-else class="weekly-events-empty" aria-live="polite">
      <img
        class="weekly-event-image"
        src="/img/home/eventos-semana-placeholder.webp"
        alt="Ilustración temporal del calendario semanal"
      />
      <p>No hay eventos desde hoy hasta el domingo.</p>
    </div>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2000"
      position="top"
      @did-dismiss="isToastOpen = false"
    />
  </aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { IonIcon, IonToast } from "@ionic/vue";
import {
  calendarNumberOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { obtenerEventos } from "@/services/events";

const ROTACION_MS = 6500;

const cargando = ref(true);
const eventosSemana = ref([]);
const indiceActual = ref(0);
const toastMessage = ref("");
const toastColor = ref("");
const isToastOpen = ref(false);

let intervaloRotacion = null;

const inicioHoy = () => {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

const finDomingo = (inicio) => {
  const fecha = new Date(inicio);
  const diasHastaDomingo = (7 - fecha.getDay()) % 7;
  fecha.setDate(fecha.getDate() + diasHastaDomingo);
  fecha.setHours(23, 59, 59, 999);
  return fecha;
};

const convertirTimestamp = (valor) => {
  if (valor === null || valor === undefined || valor === "") return null;

  const numero = Number(valor);
  if (Number.isFinite(numero)) return numero;

  const fecha = Date.parse(valor);
  return Number.isNaN(fecha) ? null : fecha;
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const formatearDia = (timestamp) =>
  capitalizar(new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp)));

const intervaloSemana = computed(() => {
  const inicio = inicioHoy();
  const fin = finDomingo(inicio);

  if (inicio.toDateString() === fin.toDateString()) {
    return `Hoy, ${formatearDia(inicio.getTime())}`;
  }

  return `De hoy, ${formatearDia(inicio.getTime())}, al ${formatearDia(fin.getTime())}`;
});

const eventoActual = computed(() => eventosSemana.value[indiceActual.value] ?? null);

const etiquetaFecha = (evento) => {
  if (new Date(evento.inicio).toDateString() === new Date(evento.fin).toDateString()) {
    return formatearDia(evento.inicio);
  }

  return `${formatearDia(evento.inicio)} — ${formatearDia(evento.fin)}`;
};

const normalizarEventosSemana = (eventos) => {
  const desde = inicioHoy().getTime();
  const hasta = finDomingo(new Date(desde)).getTime();

  return eventos
    .map((evento, index) => {
      const inicio = convertirTimestamp(evento.fechaInicio);
      const fin = convertirTimestamp(evento.fechaFin) ?? inicio;

      return {
        clave: `${evento.titulo ?? "evento"}-${inicio ?? index}-${index}`,
        titulo: evento.titulo?.trim() || "Evento escolar",
        categoria: evento.nombreCategoria ?? evento.nombre ?? "",
        inicio,
        fin,
      };
    })
    .filter((evento) =>
      evento.inicio !== null &&
      evento.fin !== null &&
      evento.inicio <= hasta &&
      evento.fin >= desde
    )
    .sort((a, b) => a.inicio - b.inicio || a.titulo.localeCompare(b.titulo, "es"));
};

const detenerRotacion = () => {
  if (intervaloRotacion) {
    window.clearInterval(intervaloRotacion);
    intervaloRotacion = null;
  }
};

const iniciarRotacion = () => {
  detenerRotacion();
  if (eventosSemana.value.length < 2) return;

  intervaloRotacion = window.setInterval(() => {
    indiceActual.value = (indiceActual.value + 1) % eventosSemana.value.length;
  }, ROTACION_MS);
};

const moverCarrusel = (desplazamiento) => {
  const total = eventosSemana.value.length;
  if (total < 2) return;

  indiceActual.value = (indiceActual.value + desplazamiento + total) % total;
  iniciarRotacion();
};

const mostrarAnterior = () => moverCarrusel(-1);
const mostrarSiguiente = () => moverCarrusel(1);

const cargarEventosSemana = async () => {
  cargando.value = true;
  try {
    const eventos = await obtenerEventos(toastMessage, toastColor, isToastOpen);
    eventosSemana.value = normalizarEventosSemana(Array.isArray(eventos) ? eventos : []);
    indiceActual.value = 0;
  } finally {
    cargando.value = false;
  }
};

onMounted(async () => {
  await cargarEventosSemana();
  iniciarRotacion();
});

onUnmounted(detenerRotacion);
</script>

<style scoped>
.weekly-events-card {
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: var(--form-bg-light);
  border: 1px solid #cfd8e3;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.08) 0 6px 18px;
  padding: 0.9rem 1.1rem 1.1rem;
}

.weekly-events-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.85rem;
}

.weekly-events-icon-wrap {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(33, 150, 243, 0.12);
  color: #2196f3;
}

.weekly-events-icon {
  font-size: 18px;
}

.weekly-events-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-color-light);
}

.weekly-events-range {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  line-height: 1.25;
  color: #64748b;
}

.weekly-events-loading {
  min-height: 220px;
  flex: 1;
  display: grid;
  place-items: center;
  color: #64748b;
}

.weekly-events-slideshow,
.weekly-event-slide,
.weekly-events-empty {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.weekly-event-image {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  max-height: 205px;
  object-fit: cover;
  border: 1px solid #dbe4ee;
  border-radius: 9px;
  background-color: #eaf4ff;
}

.weekly-event-copy {
  min-height: 92px;
  padding: 0.75rem 0.2rem 0.45rem;
  text-align: center;
}

.weekly-event-date {
  margin: 0 0 0.3rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  color: #2196f3;
}

.weekly-event-name {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 1rem;
  line-height: 1.3;
  color: #243447;
}

.weekly-event-category {
  margin: 0.35rem 0 0;
  overflow: hidden;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #64748b;
}

.weekly-events-controls {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.2rem;
}

.weekly-events-arrow {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: #2196f3;
  color: #fff;
  cursor: pointer;
  font-size: 1.25rem;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.weekly-events-arrow:hover:not(:disabled) {
  background-color: #1976d2;
  transform: translateY(-1px);
}

.weekly-events-arrow:focus-visible {
  outline: 3px solid rgba(33, 150, 243, 0.35);
  outline-offset: 2px;
}

.weekly-events-arrow:disabled {
  cursor: default;
  opacity: 0.4;
}

.weekly-events-counter {
  text-align: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
}

.weekly-events-empty {
  gap: 0.8rem;
  text-align: center;
}

.weekly-events-empty p {
  margin: 0;
  padding: 0.25rem 0.5rem;
  font-size: 0.86rem;
  line-height: 1.4;
  color: #64748b;
}

.event-slide-enter-active,
.event-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.event-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.event-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

@media (prefers-color-scheme: dark) {
  .weekly-events-card {
    background-color: var(--form-bg-dark);
    border-color: #444;
    box-shadow: rgba(255, 255, 255, 0.06) 0 6px 18px;
  }

  .weekly-events-title,
  .weekly-event-name {
    color: var(--text-color-dark);
  }

  .weekly-events-range,
  .weekly-event-category,
  .weekly-events-counter,
  .weekly-events-empty p,
  .weekly-events-loading {
    color: #c8c8c8;
  }

  .weekly-event-image {
    border-color: #555;
  }
}

@media (max-width: 900px) {
  .weekly-event-image {
    max-height: none;
  }
}

@media (max-width: 480px) {
  .weekly-events-card {
    padding: 0.85rem;
  }

  .weekly-events-title {
    font-size: 0.98rem;
  }

  .weekly-event-copy {
    min-height: 84px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .event-slide-enter-active,
  .event-slide-leave-active,
  .weekly-events-arrow {
    transition: none;
  }
}
</style>
