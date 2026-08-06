<template>
  <div class="page-admin-events">
    <header class="page-header">
      <h1 class="t-1">Administración de eventos</h1>
      <p class="page-subtitle">
        Gestión de los eventos del calendario escolar.
      </p>
    </header>

    <main class="main-panel">
      <section class="panel-section">
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h2 class="card-title card-title-inline">Eventos</h2>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoEventos"
                title="Refrescar eventos"
                aria-label="Refrescar eventos"
                @click="cargarEventos">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoEventos }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                v-model="busquedaEventos"
                type="search"
                class="search-input"
                placeholder="Buscar..."
                aria-label="Buscar eventos">
            </div>
          </div>

          <div v-if="cargandoEventos" class="table-loading" aria-label="Cargando eventos">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos tabla-eventos">
              <thead>
                <tr>
                  <th class="col-accion">Acciones</th>
                  <th>Título</th>
                  <th>Creado por</th>
                  <th>Categoría</th>
                  <th>Fecha inicio</th>
                  <th>Fecha fin</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="evento in eventosMostrados" :key="evento._uid">
                  <td class="col-accion">
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn-save-icon"
                        :disabled="evento._procesando"
                        :aria-label="`Guardar evento ${evento.titulo || 'nuevo'}`"
                        title="Guardar evento"
                        @click="guardarEventoFila(evento)">
                        <ion-icon :icon="saveOutline" />
                      </button>
                      <button
                        v-if="evento._persistido"
                        type="button"
                        class="btn-delete"
                        :disabled="evento._procesando"
                        :aria-label="`Eliminar evento ${evento.titulo}`"
                        title="Borrar evento"
                        @click="borrarEventoFila(evento)">
                        X
                      </button>
                      <span v-else class="action-placeholder" aria-hidden="true"></span>
                    </div>
                  </td>
                  <td>
                    <input
                      v-model="evento.titulo"
                      type="text"
                      class="cell-input cell-title"
                      :disabled="evento._persistido || evento._procesando"
                      placeholder="Título del evento">
                  </td>
                  <td class="cell-requester">
                    {{ nombreCompletoSolicitante(evento) }}
                  </td>
                  <td>
                    <select
                      v-model="evento.nombreCategoria"
                      class="cell-input cell-category"
                      :disabled="evento._persistido || evento._procesando"
                      aria-label="Categoría del evento">
                      <option value="">Selecciona una categoría</option>
                      <option
                        v-for="nombre in opcionesCategoria(evento.nombreCategoria)"
                        :key="nombre"
                        :value="nombre">
                        {{ nombre }}
                      </option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model="evento.fechaInicio"
                      type="date"
                      class="cell-input cell-date"
                      :disabled="evento._persistido || evento._procesando">
                  </td>
                  <td>
                    <input
                      v-model="evento.fechaFin"
                      type="date"
                      class="cell-input cell-date"
                      :disabled="evento._persistido || evento._procesando">
                  </td>
                  <td>
                    <select
                      v-model="evento.estado"
                      class="cell-input cell-state"
                      :disabled="evento._procesando"
                      aria-label="Estado del evento">
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="INACTIVO">INACTIVO</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="!hayEventos && !cargandoEventos" class="empty-state">
            No hay eventos cargados. Usa la última fila para añadir uno nuevo.
          </p>
        </article>
      </section>
    </main>

    <ion-toast
      :is-open="isToastOpen"
      :message="toastMessage"
      :color="toastColor"
      duration="2500"
      position="top"
      @did-dismiss="isToastOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { IonIcon, IonToast } from '@ionic/vue';
import { refreshOutline, saveOutline } from 'ionicons/icons';
import {
  actualizarEstadoEvento,
  borrarEvento,
  crearEvento,
  obtenerCategorias,
  obtenerEventosAdministracion,
} from '@/services/events.js';
import { crearToast } from '@/utils/toast.js';

interface CategoriaApi {
  nombre: string;
  color: string;
  descripcion: string;
}

interface EventoApi {
  titulo: string;
  fechaInicio: number;
  fechaFin: number;
  nombreCategoria: string;
  nombreUsuario?: string;
  apellidosUsuario?: string;
  estadoEvento?: EstadoEvento;
}

type EstadoEvento = 'ACTIVO' | 'PENDIENTE' | 'INACTIVO';

interface FilaEvento {
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  nombreCategoria: string;
  nombreUsuario: string;
  apellidosUsuario: string;
  estado: EstadoEvento;
  _fechaInicioOriginal: number | null;
  _persistido: boolean;
  _procesando: boolean;
  _uid: number;
}

const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const categorias = ref<CategoriaApi[]>([]);
const eventos = ref<FilaEvento[]>([]);
const busquedaEventos = ref('');
const cargandoEventos = ref(false);

let uidCounter = 0;
const nextUid = () => ++uidCounter;

const filaEventoVacia = (): FilaEvento => ({
  titulo: '',
  nombreCategoria: '',
  nombreUsuario: '',
  apellidosUsuario: '',
  estado: 'ACTIVO',
  fechaInicio: '',
  fechaFin: '',
  _fechaInicioOriginal: null,
  _persistido: false,
  _procesando: false,
  _uid: nextUid(),
});

const eventoEstaVacio = (evento: FilaEvento) =>
  !evento.titulo.trim()
  && !evento.nombreCategoria
  && !evento.fechaInicio
  && !evento.fechaFin;

const asegurarFilaVaciaEventos = () => {
  const ultimo = eventos.value[eventos.value.length - 1];
  if (!ultimo || ultimo._persistido || !eventoEstaVacio(ultimo)) {
    eventos.value.push(filaEventoVacia());
  }
};

watch(eventos, asegurarFilaVaciaEventos, { deep: true });

const normalizarTexto = (valor: unknown) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const filtrarConBorradores = <T extends { _persistido: boolean }>(
  filas: T[],
  busqueda: string,
  campos: Array<keyof T>,
) => {
  const consulta = normalizarTexto(busqueda).trim();
  const persistidas = filas.filter((fila) => fila._persistido);
  const borradores = filas.filter((fila) => !fila._persistido);
  const visibles = consulta
    ? persistidas.filter((fila) =>
        campos.some((campo) => normalizarTexto(fila[campo]).includes(consulta)))
    : persistidas;

  return [...visibles, ...borradores];
};

const eventosMostrados = computed(() =>
  filtrarConBorradores(
    eventos.value,
    busquedaEventos.value,
    ['titulo', 'nombreCategoria', 'nombreUsuario', 'apellidosUsuario', 'estado', 'fechaInicio', 'fechaFin'],
  ));

const hayEventos = computed(() => eventos.value.some((evento) => evento._persistido));

const nombreCompletoSolicitante = (evento: FilaEvento) => {
  if (!evento._persistido) return 'Administrador';
  return [evento.nombreUsuario, evento.apellidosUsuario].filter(Boolean).join(' ') || 'Sin datos';
};

const opcionesCategoria = (categoriaActual: string) => {
  const nombres = categorias.value
    .map((categoria) => categoria.nombre);

  if (categoriaActual && !nombres.includes(categoriaActual)) {
    nombres.unshift(categoriaActual);
  }
  return nombres;
};

const timestampAFechaInput = (timestamp: number) => {
  const fecha = new Date(timestamp);
  if (Number.isNaN(fecha.getTime())) return '';
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const fechaInputATimestamp = (fechaInput: string) => {
  const partes = fechaInput.split('-').map(Number);
  if (partes.length !== 3 || partes.some((parte) => !Number.isFinite(parte))) return NaN;
  const [anio, mes, dia] = partes;
  const fecha = new Date(anio, mes - 1, dia);
  if (
    fecha.getFullYear() !== anio
    || fecha.getMonth() !== mes - 1
    || fecha.getDate() !== dia
  ) return NaN;
  return fecha.getTime();
};

const cargarCategorias = async () => {
  const respuesta = await obtenerCategorias(toastMessage, toastColor, isToastOpen);
  categorias.value = Array.isArray(respuesta) ? respuesta as CategoriaApi[] : [];
};

const cargarEventos = async () => {
  cargandoEventos.value = true;
  try {
    const respuesta = await obtenerEventosAdministracion(toastMessage, toastColor, isToastOpen);
    const datos = Array.isArray(respuesta) ? respuesta as EventoApi[] : [];
    eventos.value = datos.map((evento) => ({
      titulo: evento.titulo,
      nombreCategoria: evento.nombreCategoria,
      nombreUsuario: evento.nombreUsuario ?? '',
      apellidosUsuario: evento.apellidosUsuario ?? '',
      estado: evento.estadoEvento ?? 'ACTIVO',
      fechaInicio: timestampAFechaInput(evento.fechaInicio),
      fechaFin: timestampAFechaInput(evento.fechaFin),
      _fechaInicioOriginal: evento.fechaInicio,
      _persistido: true,
      _procesando: false,
      _uid: nextUid(),
    }));
    asegurarFilaVaciaEventos();
  } finally {
    cargandoEventos.value = false;
  }
};

const guardarEventoFila = async (evento: FilaEvento) => {
  if (evento._persistido) {
    if (evento._fechaInicioOriginal === null) return;

    evento._procesando = true;
    try {
      await actualizarEstadoEvento(
        toastMessage,
        toastColor,
        isToastOpen,
        evento.titulo,
        evento._fechaInicioOriginal,
        evento.estado,
      );
      await cargarEventos();
    } catch (error) {
      console.error(error);
    } finally {
      evento._procesando = false;
    }
    return;
  }

  const titulo = evento.titulo.trim();
  const fechaInicio = fechaInputATimestamp(evento.fechaInicio);
  const fechaFin = fechaInputATimestamp(evento.fechaFin);

  if (!titulo || !evento.nombreCategoria || !evento.fechaInicio || !evento.fechaFin) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Debes completar todos los campos del evento');
    return;
  }
  if (!Number.isFinite(fechaInicio) || !Number.isFinite(fechaFin)) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Las fechas del evento no son válidas');
    return;
  }
  if (fechaFin < fechaInicio) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'La fecha fin no puede ser anterior a la fecha de inicio');
    return;
  }

  const duplicado = eventos.value.some((otro) =>
    otro !== evento
    && otro._persistido
    && normalizarTexto(otro.titulo) === normalizarTexto(titulo)
    && otro._fechaInicioOriginal === fechaInicio);
  if (!evento._persistido && duplicado) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Ya existe un evento con ese título y fecha de inicio');
    return;
  }

  evento._procesando = true;
  try {
    await crearEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      titulo,
      fechaInicio,
      fechaFin,
      evento.nombreCategoria,
    );
    await cargarEventos();
  } catch (error) {
    console.error(error);
  } finally {
    evento._procesando = false;
  }
};

const borrarEventoFila = async (evento: FilaEvento) => {
  if (!evento._persistido || evento._fechaInicioOriginal === null) return;
  if (!window.confirm(`¿Borrar el evento "${evento.titulo}"? Esta acción no se puede deshacer.`)) return;

  evento._procesando = true;
  try {
    await borrarEvento(
      toastMessage,
      toastColor,
      isToastOpen,
      evento.titulo,
      evento._fechaInicioOriginal,
    );
    await cargarEventos();
  } catch (error) {
    console.error(error);
  } finally {
    evento._procesando = false;
  }
};

onMounted(async () => {
  await Promise.all([cargarCategorias(), cargarEventos()]);
});
</script>

<style scoped>
.page-admin-events {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: "Roboto", sans-serif;
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

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.action-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  box-sizing: border-box;
  padding: 1.25rem 1rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
}

.table-card {
  width: 100%;
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}

.title-with-refresh,
.table-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.35;
}

.card-title-inline {
  text-align: left;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: #1a3c6e;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background-color: #e2e8f0;
  border: 1px solid #b6c2d4;
  border-radius: 6px;
}

.btn-refresh:hover {
  background-color: #cbd5e1;
}

.btn-refresh:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

.search-input {
  box-sizing: border-box;
  max-width: 220px;
  padding: 7px 10px;
  color: #000;
  font-size: 13px;
  background-color: #fff;
  border: 2px solid #007bff;
  border-radius: 6px;
  outline: none;
}

.search-input:hover,
.search-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.table-loading {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0;
}

.circulo {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f3f3;
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

.table-scroll {
  width: 100%;
  max-height: 420px;
  overflow: auto;
}

table.tabla-datos {
  width: 100%;
  color: #1a1a1a;
  font-size: 13px;
  text-align: center;
  background-color: #f8f9fa;
  border: 2px solid #007bff;
  border-collapse: collapse;
}

.tabla-eventos {
  min-width: 1120px;
}

.tabla-datos th,
.tabla-datos td {
  padding: 8px 6px;
  border: 2px solid #007bff;
}

.tabla-datos th {
  position: sticky;
  top: 0;
  z-index: 2;
  color: #fff;
  font-weight: 700;
  white-space: nowrap;
  background-color: #007bff;
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

.tabla-datos td {
  height: 38px;
  background-color: #e9f5ff;
}

.tabla-datos tr:hover td {
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
  font: inherit;
  text-align: center;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.cell-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.15);
}

.cell-input:disabled {
  color: #555;
  cursor: not-allowed;
  background: #eef1f4;
}

.cell-title {
  min-width: 190px;
}

.cell-category {
  min-width: 160px;
}

.cell-date {
  min-width: 135px;
}

.cell-requester {
  min-width: 170px;
  font-weight: 600;
}

.cell-state {
  min-width: 120px;
  font-weight: 700;
}

.action-buttons {
  display: grid;
  grid-template-columns: 30px 30px;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-save-icon,
.action-buttons .btn-delete,
.action-placeholder {
  width: 30px;
  height: 30px;
}

.btn-save-icon,
.action-buttons .btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-save-icon {
  background-color: #2196f3;
}

.btn-save-icon:hover {
  background-color: #1565c0;
}

.btn-save-icon:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.btn-save-icon ion-icon {
  font-size: 17px;
}

.action-buttons .btn-delete {
  font-weight: 700;
}

.action-placeholder {
  display: block;
}

.btn-primary,
.btn-delete {
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 700;
}

.btn-primary {
  width: auto;
  margin: 0;
  padding: 6px 12px;
  color: #fff;
  font-size: 13px;
  text-transform: uppercase;
  white-space: nowrap;
  background-color: #2196f3;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-delete {
  padding: 5px 10px;
  color: #fff;
  background-color: #dc3545;
}

.btn-delete:hover {
  background-color: #b02a37;
}

.btn-primary:disabled,
.btn-delete:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.empty-state {
  margin: 0.75rem 0 0;
  padding: 0.85rem;
  color: #666;
  font-size: 0.85rem;
  text-align: center;
  background-color: #f8f9fa;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    border-color: #444;
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
  }

  .page-subtitle {
    color: #c8c8c8;
  }

  .action-card {
    background-color: #2a302b;
    border-color: #555;
  }

  .card-title {
    color: var(--text-color-dark);
  }

  .btn-refresh {
    color: #e6ebf1;
    background-color: #3a4048;
    border-color: #5a616b;
  }

  .btn-refresh:hover {
    background-color: #474e57;
  }

  .search-input,
  .cell-input {
    color: #e6ebf1;
    background-color: #1f2937;
  }

  .search-input {
    border-color: #3b82f6;
  }

  .cell-input:disabled {
    color: #b8c0ca;
    background-color: #343b45;
  }

  .tabla-datos td {
    color: var(--text-color-dark);
    background-color: #34495e;
  }

  .tabla-datos tr:hover td {
    background-color: #3a506b;
  }

  .empty-state {
    color: #c8c8c8;
    background-color: #2a302b;
    border-color: #555;
  }
}

@media (max-width: 768px) {
  .page-admin-events {
    padding: 1rem 0.75rem 2rem;
  }

  .page-header {
    margin-bottom: 1.25rem;
  }

  .t-1 {
    font-size: 1.75rem;
  }

  .main-panel {
    padding: 1rem;
  }

  .action-card {
    padding: 1rem 0.75rem 0.75rem;
  }

  .table-card-header,
  .table-actions {
    align-items: stretch;
    width: 100%;
  }

  .table-actions,
  .search-input {
    max-width: none;
    flex: 1 1 100%;
  }

  .tabla-datos {
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .page-admin-events {
    padding-inline: 0.5rem;
  }

  .main-panel {
    padding: 0.65rem;
    border-radius: 9px;
  }

  .action-card {
    padding-inline: 0.55rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }
}
</style>
