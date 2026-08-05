<template>
  <div class="page-bookings-admin">
    <header class="page-header">
      <h1 class="t-1">Administración de reservas</h1>
      <p class="page-subtitle">
        Gestión de los recursos reservables, borrado de sus reservas asociadas y consulta del registro de actividad.
      </p>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Recursos</h2>

        <!-- Tabla única de recursos (compartidos y no compartidos), con alta/edición inline en la última fila -->
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Recursos reservables</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaRecursos"
                title="Refrescar recursos"
                @click="cargarRecursos">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaRecursos }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaRecursos"
                class="search-input"
                placeholder="Buscar...">
              <button
                type="button"
                class="btn-secondary btn-mini"
                :disabled="!hayRecursos"
                @click="exportarRecursosCsv">
                Exportar CSV
              </button>
            </div>
          </div>

          <div v-if="cargandoTablaRecursos" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th class="col-accion">Acciones</th>
                  <th class="sortable" @click="ordenarRecursos('recurso')">Recurso<span class="sort-ind">{{ indicadorOrden(ordenRecursos, 'recurso') }}</span></th>
                  <th class="sortable" @click="ordenarRecursos('cantidad')">Cantidad<span class="sort-ind">{{ indicadorOrden(ordenRecursos, 'cantidad') }}</span></th>
                  <th class="sortable" @click="ordenarRecursos('esCompartible')">Compartido<span class="sort-ind">{{ indicadorOrden(ordenRecursos, 'esCompartible') }}</span></th>
                  <th class="sortable" @click="ordenarRecursos('bloqueado')">Bloqueado<span class="sort-ind">{{ indicadorOrden(ordenRecursos, 'bloqueado') }}</span></th>
                  <th class="col-reservas">Reservas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="fila in recursosMostrados" :key="fila._uid">
                  <td class="col-accion">
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn-save-icon"
                        title="Guardar recurso"
                        aria-label="Guardar recurso"
                        @click="guardarRecursoFila(fila)">
                        <ion-icon :icon="saveOutline" />
                      </button>
                      <button
                        v-if="fila._persistido"
                        type="button"
                        class="btn-delete"
                        title="Borrar recurso"
                        aria-label="Borrar recurso"
                        @click="borrarRecursoFila(fila)">X</button>
                      <span v-else class="action-placeholder" aria-hidden="true"></span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="fila.recurso"
                      class="cell-input"
                      :disabled="fila._persistido"
                      placeholder="Carrito 1, Aula 101...">
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      v-model.number="fila.cantidad"
                      class="cell-input cell-input-num"
                      :title="tituloCantidad(fila)">
                  </td>
                  <td>
                    <input type="checkbox" v-model="fila.esCompartible" class="cell-checkbox">
                  </td>
                  <td>
                    <input type="checkbox" v-model="fila.bloqueado" class="cell-checkbox">
                  </td>
                  <td class="col-reservas">
                    <button
                      v-if="fila._persistido"
                      type="button"
                      class="btn-delete btn-mini"
                      :disabled="!tieneReservas(fila.recurso)"
                      :title="tieneReservas(fila.recurso)
                        ? 'Borrar todas las reservas (fijas y puntuales) de este recurso'
                        : 'Este recurso no tiene reservas'"
                      @click="borrarReservasDeRecurso(fila)">
                      Borrar reservas
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!hayRecursos && !cargandoTablaRecursos" class="empty-state">
            No hay recursos cargados. Usa la última fila para añadir uno nuevo.
          </p>
        </article>

        <div class="panel-divider"></div>

        <h2 class="section-title">Actividad</h2>

        <!-- Registro de actividad: la paginación la sirve el backend y la búsqueda/orden actúan sobre la página cargada -->
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Logs de recursos</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaLogs"
                title="Refrescar logs"
                @click="paginarLogs(paginaActual)">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaLogs }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaLogs"
                class="search-input"
                placeholder="Buscar..."
                title="Filtra los registros de la página cargada">
            </div>
          </div>

          <div v-if="cargandoTablaLogs" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th class="sortable" @click="ordenarLogs('fecha')">Fecha<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'fecha') }}</span></th>
                  <th class="sortable" @click="ordenarLogs('usuario')">Usuario<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'usuario') }}</span></th>
                  <th class="sortable" @click="ordenarLogs('accion')">Acción<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'accion') }}</span></th>
                  <th class="sortable" @click="ordenarLogs('tipo')">Tipo<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'tipo') }}</span></th>
                  <th class="sortable" @click="ordenarLogs('recurso')">Recurso<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'recurso') }}</span></th>
                  <th class="sortable" @click="ordenarLogs('reserva')">Reserva<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'reserva') }}</span></th>
                  <th class="sortable" @click="ordenarLogs('superusuario')">Superusuario<span class="sort-ind">{{ indicadorOrden(ordenLogs, 'superusuario') }}</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in logsMostrados" :key="log._uid">
                  <td class="col-fecha">{{ log.fecha }}</td>
                  <td>{{ log.usuario }}</td>
                  <td>{{ log.accion }}</td>
                  <td>{{ log.tipo }}</td>
                  <td>{{ log.recurso }}</td>
                  <td>{{ log.reserva }}</td>
                  <td>{{ log.superusuario }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="logs.length === 0 && !cargandoTablaLogs" class="empty-state">
            No hay registros de actividad en esta página.
          </p>

          <div class="table-footer">
            <button
              type="button"
              class="btn-secondary btn-mini"
              :disabled="paginaActual === 0 || cargandoTablaLogs"
              @click="irPaginaAnterior">
              Anterior
            </button>
            <span class="pagina-actual">Página {{ paginaActual + 1 }}</span>
            <button
              type="button"
              class="btn-secondary btn-mini"
              :disabled="!hayPaginaSiguiente || cargandoTablaLogs"
              @click="irPaginaSiguiente">
              Siguiente
            </button>
          </div>
        </article>
      </section>
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
  import { ref, computed, watch, onMounted } from 'vue';
  import { IonToast, IonIcon } from '@ionic/vue';
  import { refreshOutline, saveOutline } from 'ionicons/icons';
  import { crearToast } from '@/utils/toast.js';
  import {
    postRecurso,
    getRecursosCompartible,
    comprobarEliminacion,
    deleteRecurso,
    getCantMaxResource,
    deleteRecursoReserva,
    modifyResourceLock,
    getPaginatedLogs,
  } from '@/services/bookings';

  const TAMANIO_PAGINA_LOGS = 20;

  // Toast
  const isToastOpen = ref(false);
  const toastMessage = ref('');
  const toastColor = ref('success');

  // Tabla editable de recursos (compartidos y no compartidos en una sola tabla)
  const recursos = ref([]);
  const cargandoTablaRecursos = ref(false);
  const busquedaRecursos = ref('');
  const ordenRecursos = ref({ campo: 'recurso', dir: 'asc' });

  // Cantidad máxima ya reservada de cada recurso, indexada por su nombre. Marca el mínimo al que se puede
  // bajar su cantidad y también qué recursos tienen reservas que se pueden borrar.
  const cantidadesReservadas = ref({});

  // Registro de actividad (paginado en el backend)
  const logs = ref([]);
  const cargandoTablaLogs = ref(false);
  const busquedaLogs = ref('');
  const ordenLogs = ref({ campo: 'fecha', dir: 'desc' });
  const paginaActual = ref(0);
  const hayPaginaSiguiente = ref(false);

  // Identificador estable por fila (para :key), de modo que la ordenación/filtrado no reutilice inputs por error
  let uidCounter = 0;
  const nextUid = () => ++uidCounter;

  // Hay datos reales (excluyendo la fila vacía final) si alguna fila está persistida
  const hayRecursos = computed(() => recursos.value.some((r) => r._persistido));

  // ---- Helpers de filas ----
  const filaRecursoVacia = () => ({
    recurso: '',
    cantidad: 1,
    esCompartible: false,
    bloqueado: false,
    _cantidadOriginal: null,
    _compartibleOriginal: false,
    _bloqueadoOriginal: false,
    _persistido: false,
    _uid: nextUid(),
  });

  // Garantiza que SIEMPRE exista una fila vacía al final para permitir añadir nuevos recursos.
  // Al escribir en la fila vacía (rellenando su nombre), se genera otra fila vacía al final.
  const asegurarFilaVaciaRecursos = () => {
    const arr = recursos.value;
    const ultima = arr[arr.length - 1];
    if (!ultima || (ultima.recurso && ultima.recurso.trim() !== '')) {
      arr.push(filaRecursoVacia());
    }
  };

  watch(recursos, asegurarFilaVaciaRecursos, { deep: true });

  // ---- Búsqueda + ordenación (en cliente) ----
  // Normaliza texto: minúsculas y sin acentos, para búsqueda/orden insensibles
  const normalizarTexto = (valor) =>
    String(valor == null ? '' : valor)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const compararCampo = (a, b, campo, dir) => {
    let res;
    if (campo === 'fecha') {
      // Los logs se ordenan por el instante real, no por su texto formateado
      res = (a._fechaMs || 0) - (b._fechaMs || 0);
    } else if (typeof a[campo] === 'boolean' || typeof b[campo] === 'boolean') {
      res = (a[campo] ? 1 : 0) - (b[campo] ? 1 : 0);
    } else if (typeof a[campo] === 'number' && typeof b[campo] === 'number') {
      res = a[campo] - b[campo];
    } else {
      res = normalizarTexto(a[campo]).localeCompare(normalizarTexto(b[campo]));
    }
    return dir === 'desc' ? -res : res;
  };

  // Devuelve el texto buscable de un campo (los booleanos se buscan por su etiqueta Sí/No)
  const valorBusqueda = (fila, campo) => {
    const valor = fila[campo];
    return typeof valor === 'boolean' ? (valor ? 'Sí' : 'No') : valor;
  };

  const filtrarYOrdenar = (filas, campos, busqueda, orden) => {
    const q = normalizarTexto(busqueda).trim();
    let visibles = q
      ? filas.filter((f) => campos.some((campo) => normalizarTexto(valorBusqueda(f, campo)).includes(q)))
      : filas;

    if (orden.campo && orden.dir) {
      visibles = [...visibles].sort((a, b) => compararCampo(a, b, orden.campo, orden.dir));
    }

    return visibles;
  };

  const CAMPOS_RECURSOS = ['recurso', 'cantidad', 'esCompartible', 'bloqueado'];
  const CAMPOS_LOGS = ['fecha', 'usuario', 'accion', 'tipo', 'recurso', 'reserva', 'superusuario'];

  // Las filas no persistidas (incluida la fila vacía de alta) van SIEMPRE al final, sin filtrar ni ordenar
  const recursosMostrados = computed(() => {
    const persistidos = recursos.value.filter((r) => r._persistido);
    const nuevos = recursos.value.filter((r) => !r._persistido);
    return [
      ...filtrarYOrdenar(persistidos, CAMPOS_RECURSOS, busquedaRecursos.value, ordenRecursos.value),
      ...nuevos,
    ];
  });

  const logsMostrados = computed(() =>
    filtrarYOrdenar(logs.value, CAMPOS_LOGS, busquedaLogs.value, ordenLogs.value)
  );

  // Alterna el orden de una columna: asc -> desc -> sin orden
  const cambiarOrden = (ordenRef, campo) => {
    const actual = ordenRef.value;
    if (actual.campo !== campo) {
      ordenRef.value = { campo, dir: 'asc' };
    } else if (actual.dir === 'asc') {
      ordenRef.value = { campo, dir: 'desc' };
    } else {
      ordenRef.value = { campo: null, dir: null };
    }
  };

  const ordenarRecursos = (campo) => cambiarOrden(ordenRecursos, campo);
  const ordenarLogs = (campo) => cambiarOrden(ordenLogs, campo);

  const indicadorOrden = (orden, campo) =>
    orden.campo === campo ? (orden.dir === 'asc' ? ' ▲' : ' ▼') : '';

  // ---- Cantidades ya reservadas ----
  const cantidadReservada = (nombre) => {
    const valor = cantidadesReservadas.value[nombre];
    return valor == null ? null : Number(valor);
  };

  const tieneReservas = (nombre) => cantidadReservada(nombre) != null;

  const tituloCantidad = (fila) => {
    const reservada = cantidadReservada(fila.recurso);
    return reservada == null
      ? 'Unidades disponibles del recurso'
      : `Hay ${reservada} unidades reservadas: la cantidad no puede ser menor`;
  };

  // ---- Carga de datos ----
  const cargarCantidadesReservadas = async () => {
    try {
      cantidadesReservadas.value = (await getCantMaxResource(toastMessage, toastColor, isToastOpen)) || {};
    } catch (error) {
      console.error(error);
      cantidadesReservadas.value = {};
    }
  };

  const mapearRecurso = (item) => ({
    recurso: item.id || '',
    cantidad: Number(item.cantidad) || 0,
    esCompartible: item.esCompartible === true,
    bloqueado: item.bloqueado === true,
    _cantidadOriginal: Number(item.cantidad) || 0,
    _compartibleOriginal: item.esCompartible === true,
    _bloqueadoOriginal: item.bloqueado === true,
    _persistido: true,
    _uid: nextUid(),
  });

  // El backend sirve los recursos por separado según sean compartibles o no, así que se piden las dos listas
  // y se unifican en la única tabla de la vista, donde "Compartido" es una columna más.
  const cargarRecursos = async () => {
    cargandoTablaRecursos.value = true;
    try {
      await cargarCantidadesReservadas();

      const [noCompartidos, compartidos] = await Promise.all([
        getRecursosCompartible(toastMessage, toastColor, isToastOpen, false),
        getRecursosCompartible(toastMessage, toastColor, isToastOpen, true),
      ]);

      recursos.value = [...(noCompartidos || []), ...(compartidos || [])].map(mapearRecurso);
    } catch (error) {
      console.error(error);
      recursos.value = [];
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudieron cargar los recursos');
    } finally {
      asegurarFilaVaciaRecursos();
      cargandoTablaRecursos.value = false;
    }
  };

  const formatearFecha = (fecha) => {
    const ms = Date.parse(fecha);
    if (isNaN(ms)) {
      return { texto: '', ms: 0 };
    }

    const f = new Date(ms);
    const dos = (n) => String(n).padStart(2, '0');
    return {
      texto: `${dos(f.getDate())}-${dos(f.getMonth() + 1)}-${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}`,
      ms,
    };
  };

  const paginarLogs = async (pagina) => {
    cargandoTablaLogs.value = true;
    try {
      const pageData = await getPaginatedLogs(toastMessage, toastColor, isToastOpen, pagina, TAMANIO_PAGINA_LOGS);
      const contenido = (pageData && pageData.content) || [];

      logs.value = contenido.map((item) => {
        const fecha = formatearFecha(item.fechaReserva);
        return {
          fecha: fecha.texto,
          usuario: item.usuario || '',
          accion: item.accion || '',
          tipo: item.tipo || '',
          recurso: item.recurso || '',
          reserva: `${item.diaSemana || ''} ${item.tramoHorario || ''}`.trim(),
          superusuario: item.superUsuario ?? '-',
          _fechaMs: fecha.ms,
          _uid: nextUid(),
        };
      });

      paginaActual.value = pagina;
      hayPaginaSiguiente.value = contenido.length > 0 && pageData.last !== true;
    } catch (error) {
      console.error(error);
      logs.value = [];
      hayPaginaSiguiente.value = false;
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudieron cargar los logs');
    } finally {
      cargandoTablaLogs.value = false;
    }
  };

  const irPaginaAnterior = () => {
    if (paginaActual.value > 0) {
      paginarLogs(paginaActual.value - 1);
    }
  };

  const irPaginaSiguiente = () => {
    if (hayPaginaSiguiente.value) {
      paginarLogs(paginaActual.value + 1);
    }
  };

  // ---- Recursos: alta/edición y borrado ----
  // El POST del backend hace upsert por nombre (su clave), de modo que el nombre no es editable una vez dado
  // de alta: cambiarlo crearía otro recurso. Además ese POST deja el recurso desbloqueado, por lo que el
  // bloqueo se reenvía después con su propio PUT.
  const guardarRecursoFila = async (fila) => {
    const nombre = (fila.recurso || '').trim();
    if (!nombre) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El nombre del recurso es obligatorio');
      return;
    }

    const cantidad = Number(fila.cantidad);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'La cantidad debe ser un número entero mayor que 0');
      return;
    }

    const reservada = cantidadReservada(nombre);
    if (reservada != null && cantidad < reservada) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger',
        `El recurso "${nombre}" tiene ${reservada} unidades reservadas: la cantidad no puede ser menor`);
      return;
    }

    // Al dar de alta uno nuevo evitamos duplicados que sobreescribirían al existente sin avisar
    if (!fila._persistido && recursos.value.some((r) => r._persistido && r.recurso.toLowerCase() === nombre.toLowerCase())) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Ya existe el recurso "${nombre}"`);
      return;
    }

    const cambianDatos = !fila._persistido
      || cantidad !== fila._cantidadOriginal
      || fila.esCompartible !== fila._compartibleOriginal;
    const cambiaBloqueo = fila.bloqueado !== fila._bloqueadoOriginal;

    if (!cambianDatos && !cambiaBloqueo) {
      crearToast(toastMessage, toastColor, isToastOpen, 'warning', 'No hay cambios que guardar en ese recurso');
      return;
    }

    try {
      if (cambianDatos) {
        await postRecurso(toastMessage, toastColor, isToastOpen, nombre, cantidad, fila.esCompartible === true);
      }

      // El alta/edición deja el recurso desbloqueado, así que se reenvía el bloqueo cuando debe quedar activo
      if (cambiaBloqueo || (cambianDatos && fila.bloqueado === true)) {
        await modifyResourceLock(toastMessage, toastColor, isToastOpen, nombre, fila.bloqueado === true);
      }

      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Recurso guardado con éxito');
      await cargarRecursos();
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo guardar el recurso');
    }
  };

  const borrarRecursoFila = async (fila) => {
    if (!fila._persistido) {
      return;
    }

    if (!window.confirm(`¿Borrar el recurso "${fila.recurso}"?`)) {
      return;
    }

    try {
      // Un recurso con reservas asociadas no se puede borrar: primero hay que borrar sus reservas
      const sePuedeBorrar = await comprobarEliminacion(toastMessage, toastColor, isToastOpen, fila.recurso);
      if (!sePuedeBorrar) {
        crearToast(toastMessage, toastColor, isToastOpen, 'danger',
          'No se puede borrar el recurso porque tiene reservas asociadas. Borra primero sus reservas.');
        return;
      }

      await deleteRecurso(toastMessage, toastColor, isToastOpen, fila.recurso);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Recurso borrado con éxito');
      await cargarRecursos();
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo borrar el recurso');
    }
  };

  const borrarReservasDeRecurso = async (fila) => {
    if (!fila._persistido) {
      return;
    }

    if (!window.confirm(`¿Borrar todas las reservas (fijas y puntuales) del recurso "${fila.recurso}"?`)) {
      return;
    }

    try {
      await deleteRecursoReserva(toastMessage, toastColor, isToastOpen, fila.recurso);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Reservas del recurso borradas con éxito');

      // El borrado libera unidades reservadas y genera nuevos logs, así que se refrescan ambas tablas
      await cargarRecursos();
      await paginarLogs(0);
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudieron borrar las reservas');
    }
  };

  // ---- Exportación a CSV (genera el CSV de lo actualmente mostrado: filtrado + ordenado) ----
  const escaparCampoCsv = (valor) => {
    const texto = valor == null ? '' : String(valor);
    // Entrecomillamos si el campo contiene comas, comillas o saltos de línea (RFC 4180)
    if (/[",\n\r]/.test(texto)) {
      return '"' + texto.replace(/"/g, '""') + '"';
    }
    return texto;
  };

  const descargarCsv = (nombreFichero, cabeceras, filas) => {
    const lineas = [cabeceras.map(escaparCampoCsv).join(',')];
    filas.forEach((fila) => {
      lineas.push(fila.map(escaparCampoCsv).join(','));
    });

    // BOM para que Excel interprete correctamente los acentos (UTF-8)
    const contenido = '\uFEFF' + lineas.join('\r\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.setAttribute('download', nombreFichero);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  const exportarRecursosCsv = () => {
    const cabeceras = ['recurso', 'cantidad', 'esCompartible', 'bloqueado'];
    const filas = recursosMostrados.value
      .filter((r) => r._persistido)
      .map((r) => [r.recurso, r.cantidad, r.esCompartible ? 'true' : 'false', r.bloqueado ? 'true' : 'false']);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay recursos para exportar');
      return;
    }

    descargarCsv('recursos.csv', cabeceras, filas);
  };

  onMounted(async () => {
    await cargarRecursos();
    await paginarLogs(0);
  });
</script>

<style scoped>
.page-bookings-admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: "Roboto", sans-serif;
}

.page-header {
  margin-bottom: 1.75rem;
  width: 100%;
}

.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  text-align: center;
}

.page-subtitle {
  margin: 0;
  text-align: center;
}

.main-panel {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 8px 24px;
  padding: 1.5rem;
}

.panel-section {
  width: 100%;
}

.section-title {
  margin: 0 0 1.25rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-color-light);
}

.action-card {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  padding: 1.25rem 1rem 1rem;
  box-sizing: border-box;
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

.search-input {
  box-sizing: border-box;
  padding: 7px 10px;
  font-size: 13px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background-color: #fff;
  color: #000;
  outline: none;
  max-width: 220px;
}

.search-input:hover,
.search-input:focus {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.btn-primary {
  width: 100%;
  margin-top: auto;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border-radius: 6px;
  text-transform: uppercase;
  border: none;
  color: white;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-primary:disabled {
  background-color: #7fa9f4;
  cursor: not-allowed;
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

.btn-delete {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-delete:hover {
  background-color: #b02a37;
}

.btn-delete.btn-mini {
  text-transform: uppercase;
  font-size: 13px;
}

.btn-delete:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-delete:disabled:hover {
  background-color: #dc3545;
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

/* ---- Tablas de datos (mismo estilo que /admin), a ancho completo ---- */
.table-card {
  min-width: 0;
  width: 100%;
  margin-top: 1.25rem;
}

.table-scroll {
  width: 100%;
  max-height: 420px;
  overflow: auto;
}

table.tabla-datos {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 13px;
}

.tabla-datos th,
.tabla-datos td {
  border: 2px solid #007bff;
  padding: 8px 6px;
}

.tabla-datos th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
  white-space: nowrap;
  /* Con border-collapse el borde se desplaza al hacer scroll; el box-shadow
     mantiene la línea de separación visible bajo la cabecera fija. */
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

.tabla-datos th.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-ind {
  font-size: 0.85em;
}

.tabla-datos td {
  background-color: #e9f5ff;
  height: 38px;
}

.tabla-datos tr:hover td {
  background-color: #d0eaff;
}

.col-accion {
  width: 90px;
  min-width: 80px;
}

.col-reservas {
  width: 150px;
  min-width: 140px;
}

.col-fecha {
  white-space: nowrap;
}

.cell-input {
  width: 100%;
  min-width: 90px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  padding: 4px 6px;
  outline: none;
  color: #000;
  font: inherit;
}

.cell-input:disabled {
  background: #eef1f4;
  color: #555;
  cursor: not-allowed;
}

.cell-input-num {
  max-width: 90px;
  min-width: 70px;
}

.cell-checkbox {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #007bff;
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

/* ---- Paginación del registro de actividad ---- */
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

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cfd8e3 15%, #cfd8e3 85%, transparent);
  margin: 1.75rem 0;
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

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .section-title { color: var(--text-color-dark); }
  .page-subtitle { color: #c8c8c8; }
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title { color: var(--text-color-dark); }
  .empty-state { background-color: #2a302b; border-color: #555; color: #c8c8c8; }
  .pagina-actual { color: var(--text-color-dark); }
  .btn-secondary {
    background-color: #3a4048;
    color: #e6ebf1;
    border-color: #5a616b;
  }
  .btn-secondary:hover { background-color: #474e57; }
  .btn-refresh {
    background-color: #3a4048;
    color: #e6ebf1;
    border-color: #5a616b;
  }
  .btn-refresh:hover { background-color: #474e57; }
  .search-input {
    background-color: #1f2937;
    color: #e6ebf1;
    border-color: #3b82f6;
  }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

@media (max-width: 768px) {
  .page-bookings-admin { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .tabla-datos { font-size: 14px; }
  .search-input { max-width: 100%; flex: 1 1 100%; }
}
</style>
