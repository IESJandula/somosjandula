<template>
  <div class="page-printers-management">
    <header class="page-header">
      <h1 class="t-1">Reprografía</h1>
      <p class="page-subtitle">
        Consulta y gestiona los trabajos de reprografía del centro.
      </p>
    </header>

    <main class="main-panel">
      <article class="action-card table-card">
        <div class="table-card-header">
          <div class="title-with-refresh">
            <h2 class="card-title">Consultar impresión</h2>
            <button
              type="button"
              class="btn-refresh"
              :disabled="cargandoImpresiones"
              title="Refrescar impresiones"
              @click="consultar(paginaActual)">
              <ion-icon :icon="refreshOutline" :class="{ girando: cargandoImpresiones }" />
            </button>
          </div>
          <div class="table-actions">
            <input
              v-model="busqueda"
              type="text"
              class="search-input"
              placeholder="Buscar..."
              title="Busca el texto en cualquier campo de la impresión: usuario, impresora, estado, fichero, color...">
            <label class="filtro-fecha">
              <span>Desde</span>
              <input v-model="fechaInicio" type="date" class="date-input">
            </label>
            <label class="filtro-fecha">
              <span>Hasta</span>
              <input v-model="fechaFin" type="date" class="date-input">
            </label>
            <button
              type="button"
              class="btn-secondary btn-mini"
              :disabled="!hayFiltros"
              @click="limpiarFiltros">
              Limpiar
            </button>
          </div>
        </div>

        <div v-if="cargandoImpresiones" class="table-loading">
          <div class="circulo"></div>
        </div>

        <div class="table-scroll">
          <div class="table-scroll-inner">
            <PrintInfoTable :info="impresiones" :admin-role="true" @actualizar-tabla="() => consultar(paginaActual)" />
          </div>
        </div>

        <p v-if="impresiones.length === 0 && !cargandoImpresiones" class="empty-state">
          {{ hayFiltros ? 'Ninguna impresión coincide con los filtros aplicados.' : 'Todavía no hay impresiones registradas.' }}
        </p>

        <div class="table-footer">
          <button
            type="button"
            class="btn-secondary btn-mini"
            :disabled="paginaActual === 0 || cargandoImpresiones"
            @click="irPaginaAnterior">
            Anterior
          </button>
          <span class="pagina-actual">Página {{ paginaActual + 1 }}</span>
          <button
            type="button"
            class="btn-secondary btn-mini"
            :disabled="!hayPaginaSiguiente || cargandoImpresiones"
            @click="irPaginaSiguiente">
            Siguiente
          </button>
        </div>
      </article>
    </main>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2000"
      position="top"
      @did-dismiss="() => (isToastOpen = false)" />
  </div>
</template>

<script setup>
import { IonIcon, IonToast } from '@ionic/vue';
import { refreshOutline } from 'ionicons/icons';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import PrintInfoTable from '@/components/printers/PrintInfoTable.vue';
import { filtrarDatosPaginado } from '@/services/printers';
import { crearToast } from '@/utils/toast.js';

const TAMANIO_PAGINA = 20;
const MS_ESPERA_BUSQUEDA = 400;

const busqueda = ref('');
const fechaInicio = ref('');
const fechaFin = ref('');
const impresiones = ref([]);
const paginaActual = ref(0);
const hayPaginaSiguiente = ref(false);
const cargandoImpresiones = ref(false);

const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const hayFiltros = computed(() =>
  busqueda.value.trim() !== '' || fechaInicio.value !== '' || fechaFin.value !== ''
);

const fechaParaConsulta = (valor) => {
  if (!valor) {
    return null;
  }

  const [anio, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${anio}`;
};

const consultar = async (pagina = 0) => {
  if (fechaInicio.value && fechaFin.value && fechaInicio.value > fechaFin.value) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'La fecha de inicio no puede ser posterior a la de fin');
    return;
  }

  cargandoImpresiones.value = true;
  try {
    const filtroBusquedaRequest = {
      user: null,
      printer: null,
      status: null,
      startDate: fechaParaConsulta(fechaInicio.value),
      endDate: fechaParaConsulta(fechaFin.value),
      busqueda: busqueda.value.trim() || null,
    };

    const response = await filtrarDatosPaginado(
      toastMessage,
      toastColor,
      isToastOpen,
      filtroBusquedaRequest,
      pagina,
      TAMANIO_PAGINA
    );

    if (!response.ok) {
      throw new Error('No se pudieron obtener las impresiones');
    }

    const pageData = await response.json();
    const contenido = (pageData && pageData.content) || [];

    impresiones.value = contenido;
    paginaActual.value = pageData.number ?? pagina;
    hayPaginaSiguiente.value = contenido.length > 0 && pageData.last !== true;
  } catch (error) {
    console.error(error);
    impresiones.value = [];
    hayPaginaSiguiente.value = false;
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
  } finally {
    cargandoImpresiones.value = false;
  }
};

let temporizadorBusqueda = null;
let filtrosSuspendidos = false;

watch(busqueda, () => {
  if (filtrosSuspendidos) {
    return;
  }

  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(() => consultar(0), MS_ESPERA_BUSQUEDA);
});

watch([fechaInicio, fechaFin], () => {
  if (!filtrosSuspendidos) {
    consultar(0);
  }
});

const limpiarFiltros = async () => {
  clearTimeout(temporizadorBusqueda);
  filtrosSuspendidos = true;
  busqueda.value = '';
  fechaInicio.value = '';
  fechaFin.value = '';

  await nextTick();
  filtrosSuspendidos = false;
  await consultar(0);
};

const irPaginaAnterior = () => {
  if (paginaActual.value > 0) {
    consultar(paginaActual.value - 1);
  }
};

const irPaginaSiguiente = () => {
  if (hayPaginaSiguiente.value) {
    consultar(paginaActual.value + 1);
  }
};

onMounted(() => consultar(0));
onBeforeUnmount(() => clearTimeout(temporizadorBusqueda));
</script>

<style scoped>
.page-printers-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: 'Roboto', sans-serif;
}

.page-header {
  margin-bottom: 1.75rem;
  width: 100%;
}

.t-1 {
  margin: 0 0 0.75rem;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
}

.page-subtitle {
  margin: 0;
  text-align: center;
}

.main-panel {
  padding: 1.5rem;
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 8px 24px;
}

.action-card {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 1.25rem 1rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
}

.table-card-header,
.table-actions,
.title-with-refresh,
.table-footer {
  display: flex;
  align-items: center;
}

.table-card-header {
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.table-actions {
  gap: 0.6rem;
  flex-wrap: wrap;
}

.title-with-refresh {
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
}

.btn-refresh,
.btn-secondary {
  color: #1a3c6e;
  background-color: #e2e8f0;
  border: 1px solid #b6c2d4;
  border-radius: 6px;
  cursor: pointer;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 18px;
  line-height: 1;
}

.btn-secondary {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
}

.btn-refresh:hover,
.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-refresh:disabled,
.btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-refresh ion-icon {
  font-size: 18px;
}

.btn-mini {
  width: auto;
  margin-top: 0;
  padding: 6px 12px;
  white-space: nowrap;
}

.search-input,
.date-input {
  box-sizing: border-box;
  padding: 7px 10px;
  color: #000;
  background-color: #fff;
  border: 2px solid #007bff;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
}

.search-input {
  max-width: 240px;
}

.search-input:hover,
.search-input:focus,
.date-input:hover,
.date-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.filtro-fecha {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #333;
  font-size: 13px;
  font-weight: 600;
}

.table-scroll {
  width: 100%;
  max-height: 420px;
  overflow: auto;
}

.table-scroll-inner {
  width: 100%;
  min-width: 1400px;
}

.table-scroll :deep(table) {
  width: 100%;
  color: #1a1a1a;
  background-color: #f8f9fa;
  border: 2px solid #007bff;
  border-collapse: collapse;
  font-size: 13px;
}

.table-scroll :deep(th) {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 8px 6px;
  color: #fff;
  background-color: #007bff;
  border: 2px solid #007bff;
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

.table-scroll :deep(td) {
  height: 38px;
  padding: 8px 6px;
  background-color: #e9f5ff;
  border: 2px solid #007bff;
}

.table-scroll :deep(tr:hover td) {
  background-color: #d0eaff;
}

.table-loading {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0;
}

.empty-state {
  margin: 0.75rem 0 0;
  padding: 0.85rem;
  color: #666;
  background-color: #f8f9fa;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
  text-align: center;
  font-size: 0.85rem;
}

.table-footer {
  justify-content: center;
  gap: 0.85rem;
  margin-top: 0.85rem;
}

.pagina-actual {
  color: #1a1a1a;
  font-size: 0.9rem;
  font-weight: 600;
}

.circulo {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.girando {
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-input {
    flex: 1 1 100%;
    max-width: 100%;
  }
}

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
  }

  .action-card,
  .empty-state {
    background-color: #2a302b;
    border-color: #555;
  }

  .card-title,
  .pagina-actual {
    color: var(--text-color-dark);
  }

  .page-subtitle,
  .filtro-fecha,
  .empty-state {
    color: #c8c8c8;
  }

  .btn-secondary,
  .btn-refresh {
    color: #e6ebf1;
    background-color: #3a4048;
    border-color: #5a616b;
  }

  .btn-secondary:hover,
  .btn-refresh:hover {
    background-color: #474e57;
  }

  .search-input,
  .date-input {
    color: #e6ebf1;
    background-color: #1f2937;
    border-color: #3b82f6;
  }
}
</style>
