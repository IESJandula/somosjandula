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
          <div
            class="weekly-event-image-frame"
            :style="estiloMarcoImagen(eventoActual.imagenCategoria || IMAGEN_EVENTO_FALLBACK)"
          >
            <img
              class="weekly-event-image"
              :src="eventoActual.imagenCategoria || IMAGEN_EVENTO_FALLBACK"
              :alt="eventoActual.categoria
                ? `Ilustración de la categoría ${eventoActual.categoria}`
                : `Ilustración del evento ${eventoActual.titulo}`"
            />
          </div>

          <div class="weekly-event-copy">
            <div class="weekly-event-date-row">
              <button
                type="button"
                class="weekly-events-arrow"
                :disabled="eventosSemana.length < 2"
                aria-label="Mostrar el evento anterior"
                @click="mostrarAnterior"
              >
                <ion-icon :icon="chevronBackOutline" aria-hidden="true" />
              </button>

              <p class="weekly-event-date">{{ etiquetaFecha(eventoActual) }}</p>

              <button
                type="button"
                class="weekly-events-arrow"
                :disabled="eventosSemana.length < 2"
                aria-label="Mostrar el evento siguiente"
                @click="mostrarSiguiente"
              >
                <ion-icon :icon="chevronForwardOutline" aria-hidden="true" />
              </button>
            </div>
            <h3 class="weekly-event-name">{{ eventoActual.titulo }}</h3>
          </div>
        </article>
      </transition>
    </div>

    <div v-else class="weekly-events-empty" aria-live="polite">
      <div
        class="weekly-event-image-frame"
        :style="estiloMarcoImagen(IMAGEN_EVENTO_FALLBACK)"
      >
        <img
          class="weekly-event-image"
          :src="IMAGEN_EVENTO_FALLBACK"
          alt="Ilustración temporal del calendario semanal"
        />
      </div>
      <p>No hay eventos desde hoy hasta el domingo.</p>
    </div>

    <div class="weekly-event-request" aria-live="polite">
      <p v-if="solicitudPendiente" class="weekly-event-request-status">
        A la espera de validar el último evento por el administrador
      </p>

      <button
        v-else-if="!comprobandoSolicitud && !formularioVisible"
        type="button"
        class="weekly-event-request-open"
        @click="formularioVisible = true"
      >
        Crea un evento
      </button>

      <form
        v-else-if="formularioVisible"
        class="weekly-event-request-form"
        @submit.prevent="enviarSolicitudEvento"
      >
        <label class="sr-only" for="weekly-event-title-input">Título</label>
        <input
          id="weekly-event-title-input"
          v-model="formulario.titulo"
          class="weekly-event-request-input weekly-event-request-title"
          type="text"
          placeholder="Título"
          maxlength="255"
          required
        />

        <label class="sr-only" for="weekly-event-category-input">Categoría</label>
        <select
          id="weekly-event-category-input"
          v-model="formulario.nombreCategoria"
          class="weekly-event-request-input weekly-event-request-category"
          required
        >
          <option value="" disabled>Categoría</option>
          <option v-for="categoria in categorias" :key="categoria.nombre" :value="categoria.nombre">
            {{ categoria.nombre }}
          </option>
        </select>

        <label class="sr-only" for="weekly-event-start-input">Fecha inicio</label>
        <input
          id="weekly-event-start-input"
          v-model="formulario.fechaInicio"
          class="weekly-event-request-input weekly-event-request-date"
          type="date"
          aria-label="Fecha inicio"
          required
        />

        <label class="sr-only" for="weekly-event-end-input">Fecha fin</label>
        <input
          id="weekly-event-end-input"
          v-model="formulario.fechaFin"
          class="weekly-event-request-input weekly-event-request-date"
          type="date"
          aria-label="Fecha fin"
          required
        />

        <button type="submit" class="weekly-event-request-submit" :disabled="creandoSolicitud">
          {{ creandoSolicitud ? "Creando…" : "Crear" }}
        </button>
      </form>
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
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { IonIcon, IonToast } from "@ionic/vue";
import {
  calendarNumberOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import {
  crearSolicitudEvento,
  obtenerEventos,
  obtenerImagenCategoriaEvento,
  tieneSolicitudEventoPendiente,
} from "@/services/events";
import { EVENT_CATEGORIES } from "@/constants/eventCategories";
import { crearToast } from "@/utils/toast";

const ROTACION_MS = 6500;
const IMAGEN_EVENTO_FALLBACK = "/img/home/eventos-semana-placeholder.webp";
const estiloMarcoImagen = (url) => ({ "--weekly-event-image": `url(${url})` });

const cargando = ref(true);
const eventosSemana = ref([]);
const indiceActual = ref(0);
const toastMessage = ref("");
const toastColor = ref("");
const isToastOpen = ref(false);
const categorias = ref([...EVENT_CATEGORIES]);
const comprobandoSolicitud = ref(true);
const solicitudPendiente = ref(false);
const formularioVisible = ref(false);
const creandoSolicitud = ref(false);
const formulario = reactive({
  titulo: "",
  nombreCategoria: "",
  fechaInicio: "",
  fechaFin: "",
});

let intervaloRotacion = null;
let temporizadorMedianoche = null;
const urlsObjetoImagenes = new Set();

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
        imagenCategoriaUrl: evento.imagenCategoriaUrl || "",
        imagenCategoria: null,
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

const liberarImagenesCategorias = () => {
  urlsObjetoImagenes.forEach((url) => URL.revokeObjectURL(url));
  urlsObjetoImagenes.clear();
};

const cargarImagenesCategorias = async () => {
  const imagenesPorUrl = new Map();

  await Promise.all(eventosSemana.value.map(async (evento) => {
    if (!evento.imagenCategoriaUrl) return;

    if (!imagenesPorUrl.has(evento.imagenCategoriaUrl)) {
      const promesaImagen = obtenerImagenCategoriaEvento(
        evento.imagenCategoriaUrl,
        toastMessage,
        toastColor,
        isToastOpen,
      )
        .then((blob) => {
          if (!blob) return null;

          const urlObjeto = URL.createObjectURL(blob);
          urlsObjetoImagenes.add(urlObjeto);
          return urlObjeto;
        })
        .catch(() => null);

      imagenesPorUrl.set(evento.imagenCategoriaUrl, promesaImagen);
    }

    evento.imagenCategoria = await imagenesPorUrl.get(evento.imagenCategoriaUrl);
  }));
};

const cargarEventosSemana = async () => {
  cargando.value = true;
  try {
    const eventos = await obtenerEventos(toastMessage, toastColor, isToastOpen);
    liberarImagenesCategorias();
    eventosSemana.value = normalizarEventosSemana(Array.isArray(eventos) ? eventos : []);
    indiceActual.value = 0;
    await cargarImagenesCategorias();
  } finally {
    cargando.value = false;
  }
};

const fechaInputATimestamp = (valor) => {
  const partes = valor.split("-").map(Number);
  if (partes.length !== 3 || partes.some((parte) => !Number.isFinite(parte))) return NaN;
  const [anio, mes, dia] = partes;
  return new Date(anio, mes - 1, dia).getTime();
};

const cargarDatosSolicitud = async () => {
  comprobandoSolicitud.value = true;
  try {
    solicitudPendiente.value = await tieneSolicitudEventoPendiente(
      toastMessage,
      toastColor,
      isToastOpen,
    );
  } catch {
    solicitudPendiente.value = false;
  } finally {
    comprobandoSolicitud.value = false;
  }
};

const enviarSolicitudEvento = async () => {
  const titulo = formulario.titulo.trim();
  const fechaInicio = fechaInputATimestamp(formulario.fechaInicio);
  const fechaFin = fechaInputATimestamp(formulario.fechaFin);

  if (!titulo || !formulario.nombreCategoria || !Number.isFinite(fechaInicio) || !Number.isFinite(fechaFin)) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Debes completar todos los campos del evento");
    return;
  }
  if (fechaFin < fechaInicio) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "La fecha fin no puede ser anterior a la fecha de inicio");
    return;
  }

  creandoSolicitud.value = true;
  try {
    await crearSolicitudEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      titulo,
      fechaInicio,
      fechaFin,
      formulario.nombreCategoria,
    );
    solicitudPendiente.value = true;
    formularioVisible.value = false;
    Object.assign(formulario, { titulo: "", nombreCategoria: "", fechaInicio: "", fechaFin: "" });
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Pendiente de validar por el administrador");
  } catch {
    // El servicio ya muestra el detalle devuelto por el servidor.
  } finally {
    creandoSolicitud.value = false;
  }
};

const detenerRecargaMedianoche = () => {
  if (temporizadorMedianoche) {
    window.clearTimeout(temporizadorMedianoche);
    temporizadorMedianoche = null;
  }
};

const programarRecargaMedianoche = () => {
  detenerRecargaMedianoche();

  const ahora = new Date();
  const proximaMedianoche = new Date(ahora);
  proximaMedianoche.setDate(proximaMedianoche.getDate() + 1);
  proximaMedianoche.setHours(0, 0, 0, 0);

  temporizadorMedianoche = window.setTimeout(async () => {
    try {
      await cargarEventosSemana();
      iniciarRotacion();
    } finally {
      programarRecargaMedianoche();
    }
  }, Math.max(1, proximaMedianoche.getTime() - ahora.getTime()));
};

onMounted(async () => {
  await Promise.all([cargarEventosSemana(), cargarDatosSolicitud()]);
  iniciarRotacion();
  programarRecargaMedianoche();
});

onUnmounted(() => {
  detenerRotacion();
  detenerRecargaMedianoche();
  liberarImagenesCategorias();
});
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

.weekly-event-image-frame {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: clamp(205px, 22vw, 300px);
  overflow: hidden;
  border: 1px solid #dbe4ee;
  border-radius: 9px;
  background-color: #eaf4ff;
}

.weekly-event-image-frame::before {
  position: absolute;
  z-index: 0;
  inset: -20px;
  content: "";
  background-image: var(--weekly-event-image);
  background-position: center;
  background-size: cover;
  filter: blur(16px) saturate(0.9);
  opacity: 0.78;
  transform: scale(1.08);
}

.weekly-event-image-frame::after {
  position: absolute;
  z-index: 1;
  inset: 0;
  content: "";
  background: rgba(15, 23, 42, 0.14);
}

.weekly-event-image {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.weekly-event-copy {
  min-height: 82px;
  padding: 0.75rem 0.2rem 0.45rem;
  text-align: center;
}

.weekly-event-date-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 36px;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.35rem;
}

.weekly-event-date {
  margin: 0;
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

.weekly-events-arrow {
  width: 36px;
  height: 36px;
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

.weekly-event-request {
  width: 100%;
  min-width: 0;
  margin-top: 0.65rem;
}

.weekly-event-request-open,
.weekly-event-request-submit {
  min-height: 38px;
  padding: 0.55rem 1rem;
  color: #fff;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  border: 0;
  border-radius: 7px;
  background-color: #2196f3;
  cursor: pointer;
}

.weekly-event-request-open {
  width: 100%;
}

.weekly-event-request-open:hover,
.weekly-event-request-submit:hover:not(:disabled) {
  background-color: #1976d2;
}

.weekly-event-request-submit:disabled {
  cursor: wait;
  opacity: 0.65;
}

.weekly-event-request-form {
  display: grid;
  grid-template-columns: minmax(120px, 1.5fr) minmax(140px, 1.25fr) minmax(95px, 0.8fr) minmax(95px, 0.8fr) auto;
  gap: 0.45rem;
  min-width: 560px;
}

.weekly-event-request {
  overflow-x: auto;
}

.weekly-event-request-input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 38px;
  padding: 0.45rem 0.6rem;
  color: #243447;
  font: inherit;
  font-size: 0.78rem;
  border: 1px solid #b8c5d2;
  border-radius: 7px;
  background-color: #fff;
}

.weekly-event-request-input:focus {
  border-color: #2196f3;
  outline: 2px solid rgba(33, 150, 243, 0.18);
}

.weekly-event-request-status {
  margin: 0;
  padding: 0.7rem 0.85rem;
  color: #7c5200;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
  border: 1px solid #e8c36c;
  border-radius: 7px;
  background-color: #fff4d6;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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
  .weekly-events-empty p,
  .weekly-events-loading {
    color: #c8c8c8;
  }

  .weekly-event-image-frame {
    border-color: #555;
  }

  .weekly-event-image-frame::after {
    background: rgba(15, 23, 42, 0.28);
  }

  .weekly-event-request-input {
    color: #f3f4f6;
    border-color: #59616c;
    background-color: #1f2937;
  }

  .weekly-event-request-status {
    color: #ffe8a3;
    border-color: #806b32;
    background-color: #42391f;
  }

}

@media (max-width: 1120px) {
  .weekly-event-image-frame {
    height: clamp(220px, 45vw, 420px);
  }
}

@media (max-width: 768px) {
  .weekly-event-request {
    overflow-x: visible;
  }

  .weekly-event-request-form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-width: 0;
  }

  .weekly-event-request-submit {
    grid-column: 1 / -1;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .weekly-events-card {
    padding: 0.85rem;
  }

  .weekly-event-image-frame {
    height: clamp(190px, 58vw, 280px);
  }

  .weekly-event-request-form {
    grid-template-columns: minmax(0, 1fr);
  }

  .weekly-events-title {
    font-size: 0.98rem;
  }

  .weekly-event-copy {
    min-height: 84px;
  }

}

/* Presentacion tipo panel informativo para monitores grandes. */
@media (min-width: 1600px) and (min-height: 900px) {
  .weekly-events-card {
    min-height: calc(100dvh - 56px);
    padding: clamp(2rem, 3vw, 3.5rem) clamp(2.5rem, 4vw, 5rem);
    overflow: hidden;
  }

  .weekly-events-header {
    justify-content: center;
    gap: 1.25rem;
    margin-bottom: clamp(1.5rem, 2.5vh, 2.5rem);
    text-align: center;
  }

  .weekly-events-icon-wrap {
    width: clamp(58px, 4vw, 78px);
    height: clamp(58px, 4vw, 78px);
    flex-basis: clamp(58px, 4vw, 78px);
  }

  .weekly-events-icon {
    font-size: clamp(34px, 2.5vw, 50px);
  }

  .weekly-events-title {
    font-size: clamp(2.25rem, 3.5vw, 4.5rem);
    line-height: 1;
    letter-spacing: 0.045em;
  }

  .weekly-events-range {
    margin-top: 0.55rem;
    font-size: clamp(1rem, 1.25vw, 1.5rem);
  }

  .weekly-events-slideshow {
    min-height: 0;
  }

  .weekly-event-slide {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(420px, 1fr);
    align-items: stretch;
    gap: clamp(2.5rem, 4vw, 5rem);
    overflow: hidden;
  }

  .weekly-event-image-frame {
    height: 100%;
    min-height: 0;
    max-height: none;
    border-radius: 18px;
  }

  .weekly-event-copy {
    min-height: 0;
    align-self: center;
    padding: 1rem 0;
    text-align: left;
  }

  .weekly-event-date {
    font-size: clamp(1.1rem, 1.4vw, 1.65rem);
  }

  .weekly-event-date-row {
    grid-template-columns: 64px minmax(0, 1fr) 64px;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .weekly-event-name {
    -webkit-line-clamp: 4;
    font-size: clamp(2.2rem, 3.25vw, 4.25rem);
    line-height: 1.12;
  }

  .weekly-events-arrow {
    width: 64px;
    height: 64px;
    font-size: 2rem;
  }

  .weekly-events-loading,
  .weekly-events-empty p {
    font-size: clamp(1.15rem, 1.4vw, 1.65rem);
  }

  .weekly-events-empty {
    min-height: 0;
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    justify-items: center;
    gap: 1.5rem;
  }

  .weekly-events-empty .weekly-event-image-frame {
    width: min(72vw, 1100px);
  }

  .weekly-event-request {
    margin-top: clamp(1rem, 1.8vh, 1.75rem);
  }

  .weekly-event-request-open {
    display: none;
  }

  .weekly-event-request-submit,
  .weekly-event-request-input,
  .weekly-event-request-status {
    min-height: 54px;
    font-size: clamp(1rem, 1.1vw, 1.3rem);
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
