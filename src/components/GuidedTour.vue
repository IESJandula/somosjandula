<template>
  <div v-if="activo" class="guided-tour" @keydown.esc="terminar">
    <div class="guided-tour-blocker" aria-hidden="true"></div>
    <div class="guided-tour-focus" :style="focusStyle" aria-hidden="true"></div>

    <section
      class="guided-tour-card"
      :style="cardStyle"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guided-tour-title"
      aria-describedby="guided-tour-description">
      <div class="guided-tour-card-header">
        <span class="guided-tour-kicker">RECORRIDO GUIADO</span>
        <button type="button" class="guided-tour-close" aria-label="Cerrar recorrido" @click="terminar">×</button>
      </div>

      <div class="guided-tour-progress" aria-hidden="true">
        <span :style="{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }"></span>
      </div>

      <p class="guided-tour-count">Paso {{ pasoActual + 1 }} de {{ pasos.length }}</p>
      <h2 id="guided-tour-title">{{ paso.titulo }}</h2>
      <p id="guided-tour-description">{{ paso.descripcion }}</p>

      <div class="guided-tour-actions">
        <button v-if="pasoActual > 0" type="button" class="guided-tour-secondary" @click="anterior">
          Anterior
        </button>
        <button type="button" class="guided-tour-primary" @click="siguiente">
          {{ pasoActual === pasos.length - 1 ? 'Finalizar' : 'Siguiente' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { EVENTO_TOUR_ABRIR_PERFIL, EVENTO_TOUR_CERRAR_PERFIL } from '@/utils/guidedTour';

const router = useRouter();
const route = useRoute();
const activo = ref(false);
const pasoActual = ref(0);
const rectObjetivo = ref(null);
const posicionTarjeta = ref({ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' });

const recorridos = {
  completo: [
  {
    ruta: 'Home',
    selector: '[data-tour="home-button"]',
    titulo: 'Vuelta al inicio',
    descripcion: 'Este botón permanece siempre visible y te devuelve a la página principal desde cualquier apartado.',
  },
  {
    ruta: 'Home',
    selector: '[data-tour="profile-button"]',
    accion: 'cerrar-perfil',
    titulo: 'Tu perfil',
    descripcion: 'Desde el botón situado a la derecha puedes consultar tu perfil, cambiar el rol activo si tienes varios y cerrar sesión.',
  },
  {
    ruta: 'Home',
    selector: '[data-tour="profile-menu"]',
    accion: 'abrir-perfil',
    titulo: 'Opciones del perfil',
    descripcion: 'Aquí aparecen tus roles y permisos. Como profesor también puedes ver tus gastos de impresión y la media del instituto.',
  },
  {
    ruta: 'Home',
    selector: '[data-tour="favorites-section"]',
    accion: 'cerrar-perfil',
    titulo: 'Favoritos',
    descripcion: 'Los accesos que más usarás están reunidos aquí para llegar a ellos con un solo clic.',
  },
  {
    ruta: 'Home',
    selector: '[data-tour="favorite-print"]',
    titulo: 'Imprime',
    descripcion: 'Pulsa esta tarjeta cuando quieras enviar un PDF a reprografía.',
  },
  {
    ruta: 'PrintersPrint',
    selector: '[data-tour="print-form"]',
    titulo: 'Formulario de impresión',
    descripcion: 'En esta pantalla preparas el documento y eliges cómo quieres imprimirlo.',
  },
  {
    ruta: 'PrintersPrint',
    selector: '[data-tour="print-upload"]',
    titulo: 'Selecciona el PDF',
    descripcion: 'Arrastra aquí tu documento PDF o pulsa para buscarlo en el equipo.',
  },
  {
    ruta: 'PrintersPrint',
    selector: '[data-tour="print-settings"]',
    titulo: 'Configura la impresión',
    descripcion: 'Elige destino, número de copias, color, orientación y caras antes de enviarla.',
  },
  {
    ruta: 'PrintersPrint',
    selector: '[data-tour="print-submit"]',
    titulo: 'Envía el trabajo',
    descripcion: 'Cuando el PDF y la configuración estén listos, pulsa este botón para mandarlo a imprimir.',
  },
  ],
  menu: [
    {
      ruta: 'Home',
      selector: '[data-tour="home-button"]',
      titulo: 'Vuelta al inicio',
      descripcion: 'Este botón permanece siempre visible y te devuelve a la página principal desde cualquier apartado.',
    },
    {
      ruta: 'Home',
      selector: '[data-tour="profile-button"]',
      accion: 'cerrar-perfil',
      titulo: 'Tu perfil',
      descripcion: 'Desde el botón situado a la derecha puedes consultar tu perfil, cambiar el rol activo si tienes varios y cerrar sesión.',
    },
    {
      ruta: 'Home',
      selector: '[data-tour="profile-menu"]',
      accion: 'abrir-perfil',
      titulo: 'Opciones del perfil',
      descripcion: 'Aquí aparecen tus roles y permisos. Como profesor también puedes ver tus gastos de impresión y la media del instituto.',
    },
    {
      ruta: 'Home',
      selector: '[data-tour="favorites-section"]',
      accion: 'cerrar-perfil',
      titulo: 'Favoritos',
      descripcion: 'Los accesos que más usarás están reunidos aquí para llegar a ellos con un solo clic.',
    },
  ],
  impresion: [
    {
      ruta: 'Home',
      selector: '[data-tour="favorite-print"]',
      titulo: 'Imprime',
      descripcion: 'Pulsa esta tarjeta cuando quieras enviar un PDF a reprografía.',
    },
    {
      ruta: 'PrintersPrint',
      selector: '[data-tour="print-form"]',
      titulo: 'Formulario de impresión',
      descripcion: 'En esta pantalla preparas el documento y eliges cómo quieres imprimirlo.',
    },
    {
      ruta: 'PrintersPrint',
      selector: '[data-tour="print-upload"]',
      titulo: 'Selecciona el PDF',
      descripcion: 'Arrastra aquí tu documento PDF o pulsa para buscarlo en el equipo.',
    },
    {
      ruta: 'PrintersPrint',
      selector: '[data-tour="print-settings"]',
      titulo: 'Configura la impresión',
      descripcion: 'Elige destino, número de copias, color, orientación y caras antes de enviarla.',
    },
    {
      ruta: 'PrintersPrint',
      selector: '[data-tour="print-submit"]',
      titulo: 'Envía el trabajo',
      descripcion: 'Cuando el PDF y la configuración estén listos, pulsa este botón para mandarlo a imprimir.',
    },
  ],
};

const tipoRecorrido = ref('completo');
const pasos = computed(() => recorridos[tipoRecorrido.value] || recorridos.completo);
const paso = computed(() => pasos.value[pasoActual.value]);

const focusStyle = computed(() => {
  if (!rectObjetivo.value) {
    return { display: 'none' };
  }

  const { top, left, width, height } = rectObjetivo.value;
  return {
    top: `${top - 6}px`,
    left: `${left - 6}px`,
    width: `${width + 12}px`,
    height: `${height + 12}px`,
  };
});

const cardStyle = computed(() => posicionTarjeta.value);

const esperarFotograma = () => new Promise((resolve) => requestAnimationFrame(resolve));
const esperar = (milisegundos) => new Promise((resolve) => setTimeout(resolve, milisegundos));

const buscarObjetivoVisible = async (selector) => {
  for (let intento = 0; intento < 12; intento += 1) {
    const objetivo = document.querySelector(selector);
    if (objetivo) {
      const rect = objetivo.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return objetivo;
      }
    }
    await esperar(50);
  }

  return null;
};

const colocarTarjeta = (rect) => {
  const anchoTarjeta = Math.min(360, window.innerWidth - 24);
  const altoEstimado = 250;
  const margen = 12;
  const izquierdaCentrada = rect.left + (rect.width / 2) - (anchoTarjeta / 2);
  const left = Math.min(Math.max(izquierdaCentrada, margen), window.innerWidth - anchoTarjeta - margen);
  const cabeDebajo = rect.bottom + 16 + altoEstimado <= window.innerHeight - margen;
  const top = cabeDebajo
    ? Math.max(rect.bottom + 16, margen)
    : Math.max(rect.top - altoEstimado - 16, margen);

  posicionTarjeta.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${anchoTarjeta}px`,
  };
};

const actualizarPosicion = () => {
  if (!activo.value || !paso.value?.selector) {
    return;
  }

  const objetivo = document.querySelector(paso.value.selector);
  if (!objetivo) {
    rectObjetivo.value = null;
    return;
  }

  const rect = objetivo.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    rectObjetivo.value = null;
    return;
  }

  rectObjetivo.value = rect;
  colocarTarjeta(rect);
};

const prepararPaso = async () => {
  const pasoEnCurso = paso.value;

  if (route.name !== pasoEnCurso.ruta) {
    await router.push({ name: pasoEnCurso.ruta });
  }

  if (pasoEnCurso.accion === 'abrir-perfil') {
    window.dispatchEvent(new Event(EVENTO_TOUR_ABRIR_PERFIL));
  } else if (pasoEnCurso.accion === 'cerrar-perfil') {
    window.dispatchEvent(new Event(EVENTO_TOUR_CERRAR_PERFIL));
  }

  await nextTick();
  await esperarFotograma();

  const objetivo = await buscarObjetivoVisible(pasoEnCurso.selector);
  if (!objetivo) {
    rectObjetivo.value = null;
    posicionTarjeta.value = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    return;
  }

  objetivo.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  await esperar(250);
  actualizarPosicion();
};

const iniciar = async (tipo = 'completo') => {
  tipoRecorrido.value = recorridos[tipo] ? tipo : 'completo';
  pasoActual.value = 0;
  activo.value = true;
  document.body.classList.add('tour-activo');
  await prepararPaso();
};

const siguiente = async () => {
  if (pasoActual.value === pasos.value.length - 1) {
    terminar();
    return;
  }

  pasoActual.value += 1;
  await prepararPaso();
};

const anterior = async () => {
  if (pasoActual.value === 0) {
    return;
  }

  pasoActual.value -= 1;
  await prepararPaso();
};

const terminar = () => {
  activo.value = false;
  rectObjetivo.value = null;
  document.body.classList.remove('tour-activo');
  window.dispatchEvent(new Event(EVENTO_TOUR_CERRAR_PERFIL));
};

onMounted(() => {
  window.addEventListener('resize', actualizarPosicion);
  window.addEventListener('scroll', actualizarPosicion, true);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', actualizarPosicion);
  window.removeEventListener('scroll', actualizarPosicion, true);
  document.body.classList.remove('tour-activo');
});

defineExpose({ iniciar });
</script>

<style scoped>
.guided-tour {
  position: fixed;
  inset: 0;
  z-index: 100100;
}

.guided-tour-blocker {
  position: fixed;
  inset: 0;
}

.guided-tour-focus {
  position: fixed;
  z-index: 1;
  box-sizing: border-box;
  border: 3px solid #66a7ff;
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(4, 10, 20, 0.72), 0 0 22px rgba(102, 167, 255, 0.95);
  pointer-events: none;
  transition: top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease;
}

.guided-tour-card {
  position: fixed;
  z-index: 2;
  box-sizing: border-box;
  padding: 1rem;
  color: #e8edf5;
  background: #182230;
  border: 1px solid #4c8dff;
  border-radius: 12px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45);
}

.guided-tour-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.guided-tour-kicker,
.guided-tour-count {
  margin: 0;
  color: #9cc5ff;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.guided-tour-close {
  width: 28px;
  height: 28px;
  padding: 0;
  color: #e8edf5;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}

.guided-tour-close:hover,
.guided-tour-close:focus-visible {
  background: rgba(255, 255, 255, 0.12);
}

.guided-tour-progress {
  height: 4px;
  margin: 0.7rem 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.guided-tour-progress span {
  display: block;
  height: 100%;
  background: #66a7ff;
  border-radius: inherit;
  transition: width 0.2s ease;
}

.guided-tour-card h2 {
  margin: 0.3rem 0 0.45rem;
  color: #ffffff;
  font-size: 1.1rem;
}

.guided-tour-card > p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
}

.guided-tour-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
}

.guided-tour-primary,
.guided-tour-secondary {
  padding: 0.5rem 0.8rem;
  border-radius: 7px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.guided-tour-primary {
  color: #ffffff;
  background: #2878df;
  border: 1px solid #2878df;
}

.guided-tour-primary:hover,
.guided-tour-primary:focus-visible {
  background: #1766c9;
}

.guided-tour-secondary {
  color: #e8edf5;
  background: transparent;
  border: 1px solid #718096;
}

.guided-tour-secondary:hover,
.guided-tour-secondary:focus-visible {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 480px) {
  .guided-tour-card {
    padding: 0.85rem;
  }
}
</style>
