<template>
  <div class="page-infrastructure-admin">
    <header class="page-header">
      <h1 class="t-1">Infraestructura</h1>
      <p class="page-subtitle">
        Consulta el estado y configura las impresoras del centro.
      </p>
    </header>

    <main class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Impresoras</h2>

        <article class="action-card table-card card-estrecha">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Estado de las impresoras</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoImpresoras"
                title="Refrescar impresoras"
                @click="refrescarImpresoras">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoImpresoras }" />
              </button>
            </div>
          </div>

          <div v-if="cargandoImpresoras" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Cola</th>
                  <th>Actualización</th>
                  <th>Bloqueada</th>
                  <th>Precio hoja</th>
                  <th class="col-accion">Guardar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="printer in printers" :key="printer.name">
                  <td>{{ printer.name }}</td>
                  <td>{{ printer.status }}</td>
                  <td>{{ printer.printingQueue }}</td>
                  <td>{{ formatDate(printer.lastUpdate) }}</td>
                  <td>
                    <input
                      v-model="printer.bloqueada"
                      type="checkbox"
                      class="cell-checkbox"
                      title="Una impresora bloqueada no permite imprimir">
                  </td>
                  <td>
                    <input
                      v-model.number="printer.precioHoja"
                      type="number"
                      min="0"
                      step="0.001"
                      class="cell-input cell-input-num"
                      title="Precio en euros de cada hoja impresa">
                  </td>
                  <td class="col-accion">
                    <button type="button" class="btn-primary btn-mini" @click="guardarConfiguracionImpresora(printer)">
                      Guardar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="printers.length === 0 && !cargandoImpresoras" class="empty-state">
            No hay impresoras registradas.
          </p>
        </article>
      </section>
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
import { onMounted, ref } from 'vue';
import { crearToast } from '@/utils/toast.js';
import { actualizarConfiguracionImpresora, obtenerImpresoras } from '@/services/printers';

const printers = ref([]);
const cargandoImpresoras = ref(false);

const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const cargarImpresoras = async (avisar = false) => {
  cargandoImpresoras.value = true;
  try {
    const data = (await obtenerImpresoras(toastMessage, toastColor, isToastOpen)) || [];

    printers.value = data.map((printer) => ({
      ...printer,
      bloqueada: printer.bloqueada === true,
      precioHoja: printer.precioHoja ?? 0,
    }));

    if (avisar) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Impresoras actualizadas');
    }
  } catch (error) {
    console.error(error);
    printers.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al obtener el estado de las impresoras');
  } finally {
    cargandoImpresoras.value = false;
  }
};

const refrescarImpresoras = () => cargarImpresoras(true);

const guardarConfiguracionImpresora = async (printer) => {
  const precioHoja = Number(printer.precioHoja);

  if (!Number.isFinite(precioHoja) || precioHoja < 0) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El precio por hoja debe ser un número mayor o igual que 0');
    return;
  }

  try {
    await actualizarConfiguracionImpresora(toastMessage, toastColor, isToastOpen, printer.name, printer.bloqueada, precioHoja);
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Configuración de la impresora guardada con éxito');
    await cargarImpresoras();
  } catch (error) {
    console.error(error);
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al guardar la configuración de la impresora');
  }
};

onMounted(() => cargarImpresoras());
</script>

<style scoped>
.page-infrastructure-admin {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: 'Roboto', sans-serif;
}

.page-header {
  width: 100%;
  margin-bottom: 1.75rem;
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

.section-title {
  margin: 0 0 1.25rem;
  color: var(--text-color-light);
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
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

.card-estrecha {
  max-width: 980px;
  margin: 0 auto;
}

.table-card-header,
.title-with-refresh,
.table-loading {
  display: flex;
  align-items: center;
}

.table-card-header {
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
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
.btn-primary {
  cursor: pointer;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #1a3c6e;
  background-color: #e2e8f0;
  border: 1px solid #b6c2d4;
  border-radius: 6px;
  font-size: 18px;
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

.btn-primary {
  width: 100%;
  margin-top: auto;
  padding: 12px;
  color: white;
  background-color: #2196f3;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
}

.btn-primary:hover {
  background-color: #1565c0;
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

.table-scroll table {
  width: 100%;
  color: #1a1a1a;
  background-color: #f8f9fa;
  border: 2px solid #007bff;
  border-collapse: collapse;
  font-size: 13px;
}

.table-scroll th {
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

.table-scroll td {
  height: 38px;
  padding: 8px 6px;
  background-color: #e9f5ff;
  border: 2px solid #007bff;
}

.table-scroll tr:hover td {
  background-color: #d0eaff;
}

.col-accion {
  width: 90px;
  min-width: 80px;
}

.cell-input {
  box-sizing: border-box;
  width: 100%;
  min-width: 90px;
  padding: 4px 6px;
  color: #000;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  text-align: center;
  font: inherit;
}

.cell-input-num {
  min-width: 70px;
  max-width: 90px;
}

.cell-checkbox {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #007bff;
}

.table-loading {
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

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
  }

  .section-title,
  .card-title {
    color: var(--text-color-dark);
  }

  .page-subtitle,
  .empty-state {
    color: #c8c8c8;
  }

  .action-card,
  .empty-state {
    background-color: #2a302b;
    border-color: #555;
  }

  .btn-refresh {
    color: #e6ebf1;
    background-color: #3a4048;
    border-color: #5a616b;
  }

  .btn-refresh:hover {
    background-color: #474e57;
  }
}
</style>
