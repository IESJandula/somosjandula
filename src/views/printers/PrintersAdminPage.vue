<template>
  <div class="page-printers-admin">
    <!-- Consulta de impresiones: filtros, resultados y paginación en una única tarjeta -->
    <article class="action-card table-card">
      <div class="table-card-header">
        <div class="title-with-refresh">
          <h3 class="card-title card-title-inline">Consultar impresión</h3>
          <button
            type="button"
            class="btn-refresh"
            :disabled="cargando"
            title="Refrescar impresiones"
            @click="consultar(paginaActual)">
            <ion-icon :icon="refreshOutline" :class="{ girando: cargando }" />
          </button>
        </div>
        <div class="table-actions">
          <input
            type="text"
            v-model="busqueda"
            class="search-input"
            placeholder="Buscar..."
            title="Busca el texto en cualquier campo de la impresión: usuario, impresora, estado, fichero, color...">
          <label class="filtro-fecha">
            <span>Desde</span>
            <input type="date" v-model="fechaInicio" class="date-input">
          </label>
          <label class="filtro-fecha">
            <span>Hasta</span>
            <input type="date" v-model="fechaFin" class="date-input">
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

      <div v-if="cargando" class="table-loading">
        <div class="circulo"></div>
      </div>

      <div class="table-scroll">
        <div class="table-scroll-inner">
          <PrintInfoTable :info="impresiones" :adminRole="true" @actualizar-tabla="() => consultar(paginaActual)" />
        </div>
      </div>

      <p v-if="impresiones.length === 0 && !cargando" class="empty-state">
        {{ hayFiltros ? 'Ninguna impresión coincide con los filtros aplicados.' : 'Todavía no hay impresiones registradas.' }}
      </p>

      <div class="table-footer">
        <button
          type="button"
          class="btn-secondary btn-mini"
          :disabled="paginaActual === 0 || cargando"
          @click="irPaginaAnterior">
          Anterior
        </button>
        <span class="pagina-actual">Página {{ paginaActual + 1 }}</span>
        <button
          type="button"
          class="btn-secondary btn-mini"
          :disabled="!hayPaginaSiguiente || cargando"
          @click="irPaginaSiguiente">
          Siguiente
        </button>
      </div>
    </article>

    <!-- Segunda Fila: Tabla de Estado de las Impresoras -->
    <div class="bottom-section">
      <!-- Estado de las impresoras -->
      <div class="printer-status-table">
        <div class="title-container">
          <h1 class="title">Estado de las Impresoras</h1>
          <ion-button class="refresh-button" fill="solid" color="primary" @click="refrescarImpresoras" shape="round">
            <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </div>
        <ion-grid>
          <ion-row>
            <ion-col>
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Cola</th>
                    <th>Actualización</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="printer in printers" :key="printer.name">
                    <td>{{ printer.name }}</td>
                    <td>{{ printer.status }}</td>
                    <td>{{ printer.printingQueue }}</td>
                    <td>{{ formatDate(printer.lastUpdate) }}</td>
                  </tr>
                </tbody>
              </table>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </div>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2000"
      position="top"
      @did-dismiss="() => (isToastOpen = false)"></ion-toast>
  </div>
</template>


<script setup>
import { IonButton, IonCol, IonGrid, IonIcon, IonRow, IonToast } from '@ionic/vue';
import { refreshOutline } from 'ionicons/icons';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { crearToast } from '@/utils/toast.js';
import PrintInfoTable from '@/components/printers/PrintInfoTable.vue';
import { obtenerImpresoras, filtrarDatosPaginado } from '@/services/printers';

const TAMANIO_PAGINA = 20;
const MS_ESPERA_BUSQUEDA = 400;

// Filtros de la consulta: el texto libre lo resuelve el backend contra cualquier campo de la impresión,
// y las fechas solo se envían cuando se informan (puede ser solo una de las dos, o ambas)
const busqueda = ref('');
const fechaInicio = ref('');
const fechaFin = ref('');

const impresiones = ref([]);
const paginaActual = ref(0);
const hayPaginaSiguiente = ref(false);
const cargando = ref(false);

const printers = ref([]);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const hayFiltros = computed(() =>
  busqueda.value.trim() !== '' || fechaInicio.value !== '' || fechaFin.value !== ''
);

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// El datepicker entrega aaaa-mm-dd y el backend espera dd/mm/aaaa
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

  cargando.value = true;
  try {
    const filtroBusquedaRequest = {
      user: null,
      printer: null,
      status: null,
      startDate: fechaParaConsulta(fechaInicio.value),
      endDate: fechaParaConsulta(fechaFin.value),
      busqueda: busqueda.value.trim() || null,
    };

    const response = await filtrarDatosPaginado(toastMessage, toastColor, isToastOpen, filtroBusquedaRequest, pagina, TAMANIO_PAGINA);

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
    cargando.value = false;
  }
};

// La búsqueda se envía al backend con una pequeña espera para no consultar en cada tecla. Cualquier cambio
// de filtro vuelve a la primera página, ya que el número de resultados cambia.
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
  if (filtrosSuspendidos) {
    return;
  }

  consultar(0);
});

onBeforeUnmount(() => clearTimeout(temporizadorBusqueda));

// Al limpiar se suspenden los watch para lanzar una única consulta en lugar de una por filtro
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

const refrescarImpresoras = async () => {
  try {
    printers.value = await obtenerImpresoras(toastMessage, toastColor, isToastOpen);
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Impresoras actualizadas');
  } catch (error) {
    console.error(error);
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar impresoras');
  }
};

onMounted(async () => {
  try {
    printers.value = await obtenerImpresoras(toastMessage, toastColor, isToastOpen);
  } catch (error) {
    console.error(error);
    printers.value = [];
  }

  await consultar(0);
});
</script>

<style scoped>
.page-printers-admin {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Roboto', sans-serif;
}

/* ---- Tarjeta "Consultar impresión" (mismo formato que las tablas de /admin) ---- */
.action-card {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  padding: 1.25rem 1rem 1rem;
  box-sizing: border-box;
}

.table-card {
  min-width: 0;
  width: 100%;
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.35;
  color: #1a1a1a;
}

.card-title-inline {
  margin: 0;
  text-align: left;
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.title-with-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #b6c2d4;
  border-radius: 6px;
  background-color: #e2e8f0;
  color: #1a3c6e;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.btn-refresh:hover {
  background-color: #cbd5e1;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh ion-icon {
  font-size: 18px;
}

.girando {
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.search-input,
.date-input {
  box-sizing: border-box;
  padding: 7px 10px;
  font-size: 13px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background-color: #fff;
  color: #000;
  outline: none;
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

/* Cada fecha filtra solo cuando se informa, por lo que basta con vaciarla para desactivarla */
.filtro-fecha {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.btn-secondary {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: bold;
  background-color: #e2e8f0;
  color: #1a3c6e;
  border: 1px solid #b6c2d4;
  border-radius: 6px;
  text-transform: uppercase;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-secondary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-mini {
  width: auto;
  margin-top: 0;
  padding: 6px 12px;
  white-space: nowrap;
}

.table-scroll {
  width: 100%;
  max-height: 420px;
  overflow: auto;
}

/* Ancho mínimo para que las doce columnas de la tabla de impresiones no se apelotonen */
.table-scroll-inner {
  min-width: 1400px;
  width: 100%;
}

/* La tabla la pinta PrintInfoTable, que se comparte con la vista del profesorado: se le da aquí el
   aspecto de las tablas de /admin sin tocar el componente. */
.table-scroll :deep(table) {
  border-collapse: collapse;
  width: 100%;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  font-size: 13px;
}

.table-scroll :deep(th) {
  border: 2px solid #007bff;
  padding: 8px 6px;
  background-color: #007bff;
  color: #fff;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
  /* Con border-collapse el borde se desplaza al hacer scroll; el box-shadow
     mantiene la línea de separación visible bajo la cabecera fija. */
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

.table-scroll :deep(td) {
  border: 2px solid #007bff;
  padding: 8px 6px;
  background-color: #e9f5ff;
  height: 38px;
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
  text-align: center;
  color: #666;
  background-color: #f8f9fa;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
  font-size: 0.85rem;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  margin-top: 0.85rem;
}

.pagina-actual {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

.circulo {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ---- Estado de las impresoras ---- */
.bottom-section {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.printer-status-table {
  flex: 1 1 25%;
  min-width: 300px;
  max-width: 600px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  overflow: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.title-container ion-button {
  margin-left: auto;
  margin-top: 0;
}

.printer-status-table .title {
  margin: 0;
  text-align: center;
}

.printer-status-table table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Roboto', sans-serif;
}

.printer-status-table th,
.printer-status-table td {
  border: 1px solid #dddddd;
  text-align: center;
  padding: 8px;
}

.printer-status-table th {
  background-color: #f2f2f2;
  color: #3a7ca5;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.printer-status-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.printer-status-table tr:hover {
  background-color: #e6f7ff;
}

.title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color-light);
}

/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {
  .bottom-section {
    flex-direction: column;
  }

  .printer-status-table {
    flex: 1 1 100%;
    margin-bottom: 20px;
  }

  .search-input {
    max-width: 100%;
    flex: 1 1 100%;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .action-card {
    background-color: #2a302b;
    border-color: #555;
  }

  .card-title,
  .pagina-actual {
    color: var(--text-color-dark);
  }

  .filtro-fecha {
    color: #c8c8c8;
  }

  .empty-state {
    background-color: #2a302b;
    border-color: #555;
    color: #c8c8c8;
  }

  .btn-secondary,
  .btn-refresh {
    background-color: #3a4048;
    color: #e6ebf1;
    border-color: #5a616b;
  }

  .btn-secondary:hover,
  .btn-refresh:hover {
    background-color: #474e57;
  }

  .search-input,
  .date-input {
    background-color: #1f2937;
    color: #e6ebf1;
    border-color: #3b82f6;
  }

  .printer-status-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }

  .printer-status-table th {
    background-color: #3a3a3a;
    color: var(--text-color-dark);
  }

  .printer-status-table tr:nth-child(even) {
    background-color: #2c2c2c;
  }

  .printer-status-table tr:hover {
    background-color: #3e3e3e;
  }
}
</style>
