<template>
  <div class="page-admin-firebase">
    <header class="page-header">
      <h1 class="t-1">Administración del sistema</h1>
      <p class="page-subtitle">
        Inserta usuarios y aplicaciones de forma masiva mediante ficheros, consulta y edita los listados y gestiona
        las constantes de configuración de los microservicios.
      </p>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Inserciones masivas y listados</h2>

        <!-- 1) Arriba: las dos tarjetas de inserción masiva (usuarios y apps) -->
        <div class="import-grid">
          <!-- Inserción masiva de usuarios -->
          <article class="action-card">
            <h3 class="card-title">Inserción masiva de usuarios</h3>
            <div class="card-body">
              <div class="field">
                <label>Adjunta el fichero de usuarios</label>
                <FileUpload ref="fileUploadUsersRef" @file-selected="onArchivoUsuariosSeleccionado" />
                <span class="field-hint">Arrastra el fichero o haz clic para buscarlo en disco.</span>
              </div>

              <button
                type="button"
                class="btn-primary"
                :disabled="!archivoUsuarios || cargandoUsuarios"
                @click="uploadUsers">
                Crear usuarios
              </button>
            </div>
          </article>

          <!-- Inserción masiva de apps -->
          <article class="action-card">
            <h3 class="card-title">Inserción masiva de apps</h3>
            <div class="card-body">
              <div class="field">
                <label>Adjunta el fichero de aplicaciones</label>
                <FileUpload ref="fileUploadAppsRef" @file-selected="onArchivoAppsSeleccionado" />
                <span class="field-hint">Arrastra el fichero o haz clic para buscarlo en disco.</span>
              </div>

              <button
                type="button"
                class="btn-primary"
                :disabled="!archivoApps || cargandoApps"
                @click="uploadApps">
                Crear aplicaciones
              </button>
            </div>
          </article>
        </div>

        <!-- 2) Debajo: tabla de usuarios a ancho completo -->
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Usuarios del sistema</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaUsuarios"
                title="Refrescar usuarios"
                @click="cargarUsuarios">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaUsuarios }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaUsuarios"
                class="search-input"
                placeholder="Buscar...">
              <button
                type="button"
                class="btn-delete btn-mini"
                :disabled="!hayUsuarios"
                @click="borrarTodosUsuarios">
                Borrar todos
              </button>
              <button
                type="button"
                class="btn-secondary btn-mini"
                :disabled="!hayUsuarios"
                @click="exportarUsuariosCsv">
                Exportar CSV
              </button>
            </div>
          </div>

          <div v-if="cargandoTablaUsuarios" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th class="col-accion">Eliminar</th>
                  <th class="sortable" @click="ordenarUsuarios('email')">Email<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'email') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('nombre')">Nombre<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'nombre') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('apellidos')">Apellidos<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'apellidos') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('departamento')">Departamento<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'departamento') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('fechaNacimiento')">Fecha nac.<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'fechaNacimiento') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('roles')">Roles<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'roles') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('estado')">Estado<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'estado') }}</span></th>
                  <th class="sortable" @click="ordenarUsuarios('ultimaConexion')">Última conexión<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'ultimaConexion') }}</span></th>
                  <th class="col-accion">Guardar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuariosMostrados" :key="usuario._uid">
                  <td class="col-accion">
                    <button
                      v-if="usuario._persistido"
                      type="button"
                      class="btn-delete"
                      title="Borrar usuario"
                      @click="borrarUsuarioFila(usuario)">X</button>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="usuario.email"
                      class="cell-input"
                      :disabled="usuario._persistido"
                      placeholder="email@dominio">
                  </td>
                  <td><input type="text" v-model="usuario.nombre" class="cell-input"></td>
                  <td><input type="text" v-model="usuario.apellidos" class="cell-input"></td>
                  <td>
                    <select v-model="usuario.departamento" class="cell-input">
                      <option value="">—</option>
                      <option v-for="dep in opcionesDepartamento(usuario.departamento)" :key="dep" :value="dep">{{ dep }}</option>
                    </select>
                  </td>
                  <td><input type="text" v-model="usuario.fechaNacimiento" class="cell-input" placeholder="dd/mm/aaaa"></td>
                  <td><input type="text" v-model="usuario.roles" class="cell-input" placeholder="ROL1, ROL2"></td>
                  <td>
                    <select v-model="usuario.estado" class="cell-input">
                      <option v-for="opcion in ESTADOS_USUARIO" :key="opcion.valor" :value="opcion.valor">{{ opcion.etiqueta }}</option>
                    </select>
                  </td>
                  <td class="col-conexion">
                    <span class="conexion-text" :title="formatearFechaExacta(usuario.ultimaConexion)">{{ formatearUltimaConexion(usuario.ultimaConexion) }}</span>
                  </td>
                  <td class="col-accion">
                    <button type="button" class="btn-primary btn-mini" @click="guardarUsuarioFila(usuario)">Guardar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!hayUsuarios && !cargandoTablaUsuarios" class="empty-state">
            No hay usuarios cargados. Usa la última fila para añadir uno nuevo.
          </p>
        </article>

        <!-- 3) Debajo: tabla de aplicaciones a ancho completo -->
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Aplicaciones registradas</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaApps"
                title="Refrescar aplicaciones"
                @click="cargarApps">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaApps }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaApps"
                class="search-input"
                placeholder="Buscar...">
              <button
                type="button"
                class="btn-delete btn-mini"
                :disabled="!hayApps"
                @click="borrarTodasApps">
                Borrar todos
              </button>
              <button
                type="button"
                class="btn-secondary btn-mini"
                :disabled="!hayApps"
                @click="exportarAppsCsv">
                Exportar CSV
              </button>
            </div>
          </div>

          <div v-if="cargandoTablaApps" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th class="col-accion">Eliminar</th>
                  <th class="sortable" @click="ordenarApps('clientId')">Client ID<span class="sort-ind">{{ indicadorOrden(ordenApps, 'clientId') }}</span></th>
                  <th class="sortable" @click="ordenarApps('nombre')">Nombre<span class="sort-ind">{{ indicadorOrden(ordenApps, 'nombre') }}</span></th>
                  <th class="sortable" @click="ordenarApps('roles')">Roles<span class="sort-ind">{{ indicadorOrden(ordenApps, 'roles') }}</span></th>
                  <th class="col-notif">Calendar (hoy/max)</th>
                  <th class="col-notif">Email (hoy/max)</th>
                  <th class="col-notif">Web (hoy/max)</th>
                  <th class="sortable" @click="ordenarApps('ultimaConexion')">Última conexión<span class="sort-ind">{{ indicadorOrden(ordenApps, 'ultimaConexion') }}</span></th>
                  <th class="col-accion">Guardar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in appsMostradas" :key="app._uid">
                  <td class="col-accion">
                    <button
                      v-if="app._persistido"
                      type="button"
                      class="btn-delete"
                      title="Borrar aplicación"
                      @click="borrarAppFila(app)">X</button>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="app.clientId"
                      class="cell-input"
                      :disabled="app._persistido"
                      placeholder="clientId">
                  </td>
                  <td><input type="text" v-model="app.nombre" class="cell-input"></td>
                  <td><input type="text" v-model="app.roles" class="cell-input" placeholder="ROL1, ROL2"></td>
                  <td class="col-notif">
                    <div
                      v-if="app._persistido && notifsDe(app)"
                      class="notif-cell"
                      :title="notifsDe(app).fechaUltimaNotificacionCalendar ? ('Última notificación: ' + notifsDe(app).fechaUltimaNotificacionCalendar) : ''">
                      <span class="notif-hoy">{{ notifsDe(app).notifHoyCalendar }}</span>
                      <span class="notif-sep">/</span>
                      <input type="number" min="0" class="notif-max" :value="notifsDe(app).notifMaxCalendar" @change="actualizarMaxCalendar(app, $event.target.value)">
                    </div>
                    <span v-else class="notif-vacio">—</span>
                  </td>
                  <td class="col-notif">
                    <div
                      v-if="app._persistido && notifsDe(app)"
                      class="notif-cell"
                      :title="notifsDe(app).fechaUltimaNotificacionEmail ? ('Última notificación: ' + notifsDe(app).fechaUltimaNotificacionEmail) : ''">
                      <span class="notif-hoy">{{ notifsDe(app).notifHoyEmail }}</span>
                      <span class="notif-sep">/</span>
                      <input type="number" min="0" class="notif-max" :value="notifsDe(app).notifMaxEmail" @change="actualizarMaxEmail(app, $event.target.value)">
                    </div>
                    <span v-else class="notif-vacio">—</span>
                  </td>
                  <td class="col-notif">
                    <div
                      v-if="app._persistido && notifsDe(app)"
                      class="notif-cell"
                      :title="notifsDe(app).fechaUltimaNotificacionWeb ? ('Última notificación: ' + notifsDe(app).fechaUltimaNotificacionWeb) : ''">
                      <span class="notif-hoy">{{ notifsDe(app).notifHoyWeb }}</span>
                      <span class="notif-sep">/</span>
                      <input type="number" min="0" class="notif-max" :value="notifsDe(app).notifMaxWeb" @change="actualizarMaxWeb(app, $event.target.value)">
                    </div>
                    <span v-else class="notif-vacio">—</span>
                  </td>
                  <td class="col-conexion">
                    <span class="conexion-text" :title="formatearFechaExacta(app.ultimaConexion)">{{ formatearUltimaConexion(app.ultimaConexion) }}</span>
                  </td>
                  <td class="col-accion">
                    <button type="button" class="btn-primary btn-mini" @click="guardarAppFila(app)">Guardar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!hayApps && !cargandoTablaApps" class="empty-state">
            No hay aplicaciones cargadas. Usa la última fila para añadir una nueva.
          </p>
        </article>

        <!-- 3b) Debajo de la tabla de apps: configuración de Gmail (unificada desde /notifications/admin) -->
        <article class="action-card gmail-card">
          <h3 class="card-title card-title-inline">Configuración de Gmail</h3>
          <div class="card-body">
            <ion-button expand="block" @click="autorizarGmailOAuthHandler">Autorizar Gmail OAuth</ion-button>
          </div>
        </article>

        <div v-if="cargandoUsuarios || cargandoApps" class="fondo-gris">
          <div class="circulo"></div>
        </div>
      </section>

      <div class="panel-divider" aria-hidden="true"></div>

      <!-- 4) Al final: gestión de constantes -->
      <section class="panel-section">
        <h2 class="section-title">Gestión de constantes</h2>

        <div class="constantes-card">
          <div class="constantes-grid">
            <div class="field">
              <label for="proyecto-select">Proyecto</label>
              <select
                id="proyecto-select"
                v-model="proyectoSeleccionado"
                class="custom-select"
                @change="filtrarPorProyecto">
                <option :value="''">Todos</option>
                <option v-for="proyecto in proyectos" :key="proyecto" :value="proyecto">
                  {{ proyecto }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="clave-select">Clave de la constante</label>
              <select id="clave-select" v-model="selectedConstante" class="custom-select">
                <option disabled :value="null">Selecciona una constante</option>
                <option v-for="constante in constantesFiltradas" :key="constante.proyecto + '::' + constante.clave" :value="constante">
                  {{ constante.clave }}
                </option>
              </select>
            </div>

            <div class="field" v-if="selectedConstante">
              <label for="valor-input">Valor</label>
              <input id="valor-input" type="text" v-model="selectedConstante.valor" />
            </div>
          </div>

          <button
            type="button"
            class="btn-primary"
            :disabled="!selectedConstante"
            @click="actualizarConstanteSeleccionada">
            Actualizar constante
          </button>
        </div>
      </section>
    </div>

    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
  </div>
</template>

<script setup>
  import { IonToast, IonIcon, IonButton } from '@ionic/vue';
  import { refreshOutline } from 'ionicons/icons';
  import { ref, computed, onMounted, watch } from 'vue';
  import FileUpload from '@/components/printers/FileUpload.vue';
  import {
    importarUsuarios,
    importarAplicaciones,
    obtenerConstantes,
    actualizarConstante,
    obtenerInfoUsuarios,
    obtenerInfoApps,
    guardarUsuario,
    guardarApp,
    borrarUsuario,
    borrarApp,
    borrarTodosLosUsuarios,
    borrarTodasLasApps,
    obtenerDepartamentos,
  } from '@/services/adminService';
  import {
    listarAplicaciones,
    actualizarNotificacionesMaximasCalendar,
    actualizarNotificacionesMaximasEmail,
    actualizarNotificacionesMaximasWeb,
    autorizarGmailOAuth,
  } from '@/services/notifications';
  import { crearToast } from '@/utils/toast.js';

  const toastMessage = ref('');
  const toastColor = ref('success');
  const isToastOpen = ref(false);

  // Ficheros seleccionados (por arrastre o selección en disco) mediante el componente FileUpload
  const fileUploadUsersRef = ref(null);
  const fileUploadAppsRef = ref(null);
  const archivoUsuarios = ref(null);
  const archivoApps = ref(null);
  const cargandoUsuarios = ref(false);
  const cargandoApps = ref(false);

  // Tablas editables de usuarios y aplicaciones
  const usuarios = ref([]);
  const apps = ref([]);
  const cargandoTablaUsuarios = ref(false);
  const cargandoTablaApps = ref(false);

  // Contadores de notificaciones (NotificationsServer) indexados por NOMBRE de aplicación. Cada entrada trae
  // notifHoy/notifMax (Calendar/Email/Web) y la fecha de la última notificación. Se casan con las filas de apps por
  // su campo 'nombre', igual que hacía la vista /notifications/admin.
  const notifsPorNombre = ref({});

  // Departamentos disponibles para el desplegable de la tabla de usuarios
  const departamentos = ref([]);

  // Búsqueda (filtro global en cliente) por tabla
  const busquedaUsuarios = ref('');
  const busquedaApps = ref('');

  // Estado de ordenación por columna, independiente por tabla ({ campo, dir: 'asc' | 'desc' | null }).
  // Por defecto se ordena por última conexión descendente (más reciente primero; los "Nunca" al final).
  const ordenUsuarios = ref({ campo: 'ultimaConexion', dir: 'desc' });
  const ordenApps = ref({ campo: 'ultimaConexion', dir: 'desc' });

  // Identificador estable por fila (para :key), de modo que la ordenación/filtrado no reutilice inputs por error
  let uidCounter = 0;
  const nextUid = () => ++uidCounter;

  // Gestión de constantes: todas las constantes (todos los proyectos) y filtrado por proyecto
  const constantes = ref([]);
  const selectedConstante = ref(null);
  const proyectoSeleccionado = ref('');

  // Lista única de proyectos disponibles a partir de las constantes cargadas
  const proyectos = computed(() => [...new Set(constantes.value.map((c) => c.proyecto))].sort());

  // Constantes visibles según el proyecto seleccionado (o todas si no hay filtro)
  const constantesFiltradas = computed(() =>
    proyectoSeleccionado.value
      ? constantes.value.filter((c) => c.proyecto === proyectoSeleccionado.value)
      : constantes.value
  );

  // Hay datos reales (excluyendo la fila vacía final) si alguna fila está persistida
  const hayUsuarios = computed(() => usuarios.value.some((u) => u._persistido));
  const hayApps = computed(() => apps.value.some((a) => a._persistido));

  // Opciones del desplegable de estado (valor canónico que espera el backend + etiqueta mostrada)
  const ESTADOS_USUARIO = [
    { valor: 'ACTIVO', etiqueta: 'Activo' },
    { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
    { valor: 'INACTIVO', etiqueta: 'Inactivo' },
  ];

  // Normaliza el estado recibido del backend: null/vacío se trata como ACTIVO (usuarios existentes sin estado)
  const normalizarEstado = (estado) => {
    const valor = (estado || '').toString().trim().toUpperCase();
    return ESTADOS_USUARIO.some((e) => e.valor === valor) ? valor : 'ACTIVO';
  };

  // Devuelve la etiqueta legible (Activo/Pendiente/Inactivo) de un estado canónico, para el CSV
  const etiquetaEstado = (estado) => {
    const valor = normalizarEstado(estado);
    const opcion = ESTADOS_USUARIO.find((e) => e.valor === valor);
    return opcion ? opcion.etiqueta : valor;
  };

  // ---- Helpers de filas y roles ----
  const filaUsuarioVacia = () => ({
    email: '',
    nombre: '',
    apellidos: '',
    departamento: '',
    fechaNacimiento: '',
    roles: '',
    estado: 'ACTIVO',
    cursoAcademico: '',
    ultimaConexion: null,
    _persistido: false,
    _uid: nextUid(),
  });

  const filaAppVacia = () => ({
    clientId: '',
    nombre: '',
    roles: '',
    cursoAcademico: '',
    ultimaConexion: null,
    _persistido: false,
    _uid: nextUid(),
  });

  // Convierte el texto de roles (separado por comas o barras) en un array limpio
  const parsearRoles = (texto) =>
    (texto || '')
      .split(/[|,]/)
      .map((r) => r.trim())
      .filter(Boolean);

  // Convierte un array de roles del backend en texto editable
  const rolesATexto = (roles) => (Array.isArray(roles) ? roles.join(', ') : (roles || ''));

  // Garantiza que SIEMPRE exista una fila vacía al final para permitir añadir nuevos elementos.
  // Al escribir en la fila vacía (rellenando su clave), se genera otra fila vacía al final.
  const asegurarFilaVaciaUsuarios = () => {
    const arr = usuarios.value;
    const ultima = arr[arr.length - 1];
    if (!ultima || (ultima.email && ultima.email.trim() !== '')) {
      arr.push(filaUsuarioVacia());
    }
  };

  const asegurarFilaVaciaApps = () => {
    const arr = apps.value;
    const ultima = arr[arr.length - 1];
    if (!ultima || (ultima.clientId && ultima.clientId.trim() !== '')) {
      arr.push(filaAppVacia());
    }
  };

  watch(usuarios, asegurarFilaVaciaUsuarios, { deep: true });
  watch(apps, asegurarFilaVaciaApps, { deep: true });

  // ---- Búsqueda + ordenación (en cliente) ----
  // Normaliza texto: minúsculas y sin acentos, para búsqueda/orden insensibles
  const normalizarTexto = (valor) =>
    String(valor == null ? '' : valor)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  // Parsea una fecha dd/mm/aaaa (o dd-mm-aaaa) a timestamp; NaN si no aplica
  const parsearFecha = (valor) => {
    if (!valor) return NaN;
    const m = String(valor).trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!m) return NaN;
    const dia = +m[1];
    const mes = +m[2] - 1;
    const anio = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return new Date(anio, mes, dia).getTime();
  };

  // ---- Última conexión: parseo, formato relativo y formato exacto ----
  // La última conexión puede llegar del backend como:
  //   (a) ARRAY de Java LocalDateTime: [año, mes(1-12), día, hora, minuto, segundo, nanos]
  //   (b) string ISO-8601 (si en el futuro se serializa como texto)
  //   (c) null/undefined/array vacío -> sin fecha (NaN -> "Nunca")
  const parsearUltimaConexionMs = (valor) => {
    if (valor == null) return NaN;

    // Caso (a): array de LocalDateTime
    if (Array.isArray(valor)) {
      if (valor.length < 3) return NaN;
      const [anio, mes, dia, hora, minuto, segundo, nanos] = valor;
      const fecha = new Date(
        anio,
        (mes || 1) - 1,
        dia,
        hora || 0,
        minuto || 0,
        segundo || 0,
        nanos ? Math.floor(nanos / 1e6) : 0
      );
      const ms = fecha.getTime();
      return isNaN(ms) ? NaN : ms;
    }

    // Caso (b): string ISO-8601 (u otro parseable por Date)
    const ms = Date.parse(valor);
    return isNaN(ms) ? NaN : ms;
  };

  const dos = (n) => String(n).padStart(2, '0');

  // Formato exacto para el tooltip y el CSV: "DD/MM/YYYY HH:MM:SS"
  const formatearFechaExacta = (valor) => {
    const ms = parsearUltimaConexionMs(valor);
    if (isNaN(ms)) return '';
    const f = new Date(ms);
    return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}:${dos(f.getSeconds())}`;
  };

  // Formato relativo tipo "Ahora", "Hace 3 minutos", "Hace 1 hora y 21 minutos", "Hace 2 días", "Hace 1 semana"...
  const formatearUltimaConexion = (valor) => {
    const ms = parsearUltimaConexionMs(valor);
    if (isNaN(ms)) return 'Nunca';

    let diff = Date.now() - ms;
    if (diff < 0) diff = 0;

    const segundos = Math.floor(diff / 1000);
    if (segundos < 60) return 'Ahora';

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      const minsRestantes = minutos % 60;
      const parteHoras = `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
      if (minsRestantes > 0) {
        return `Hace ${parteHoras} y ${minsRestantes} ${minsRestantes === 1 ? 'minuto' : 'minutos'}`;
      }
      return `Hace ${parteHoras}`;
    }

    const dias = Math.floor(horas / 24);
    if (dias < 7) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

    const semanas = Math.floor(dias / 7);
    if (dias < 30) return `Hace ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;

    const meses = Math.floor(dias / 30);
    if (dias < 365) return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;

    const anios = Math.floor(dias / 365);
    return `Hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
  };

  const compararCampo = (a, b, campo, dir) => {
    // La última conexión se ordena por su valor real de fecha; los "Nunca" (null) SIEMPRE al final
    if (campo === 'ultimaConexion') {
      const ma = parsearUltimaConexionMs(a[campo]);
      const mb = parsearUltimaConexionMs(b[campo]);
      const aNulo = isNaN(ma);
      const bNulo = isNaN(mb);
      if (aNulo && bNulo) return 0;
      if (aNulo) return 1;
      if (bNulo) return -1;
      return dir === 'desc' ? mb - ma : ma - mb;
    }

    let res;
    if (campo === 'fechaNacimiento') {
      const fa = parsearFecha(a[campo]);
      const fb = parsearFecha(b[campo]);
      if (!isNaN(fa) && !isNaN(fb)) {
        res = fa - fb;
      } else {
        res = normalizarTexto(a[campo]).localeCompare(normalizarTexto(b[campo]));
      }
    } else {
      res = normalizarTexto(a[campo]).localeCompare(normalizarTexto(b[campo]));
    }
    return dir === 'desc' ? -res : res;
  };

  // Devuelve el texto buscable de un campo (para 'ultimaConexion' el texto relativo; para 'estado' su etiqueta)
  const valorBusqueda = (fila, campo) => {
    if (campo === 'ultimaConexion') return formatearUltimaConexion(fila[campo]);
    if (campo === 'estado') return etiquetaEstado(fila[campo]);
    return fila[campo];
  };

  // Aplica filtro (búsqueda global) + orden a las filas persistidas, y añade SIEMPRE las no persistidas al final
  // (incluida la fila vacía para dar de alta), de modo que nunca se mezclan con la ordenación.
  const construirFilasMostradas = (filas, campos, busqueda, orden) => {
    const persistidos = filas.filter((f) => f._persistido);
    const noPersistidos = filas.filter((f) => !f._persistido);

    const q = normalizarTexto(busqueda).trim();
    let visibles = q
      ? persistidos.filter((f) => campos.some((campo) => normalizarTexto(valorBusqueda(f, campo)).includes(q)))
      : persistidos;

    if (orden.campo && orden.dir) {
      visibles = [...visibles].sort((a, b) => compararCampo(a, b, orden.campo, orden.dir));
    }

    return [...visibles, ...noPersistidos];
  };

  const CAMPOS_USUARIOS = ['email', 'nombre', 'apellidos', 'departamento', 'fechaNacimiento', 'roles', 'estado', 'ultimaConexion'];
  const CAMPOS_APPS = ['clientId', 'nombre', 'roles', 'ultimaConexion'];

  const usuariosMostrados = computed(() =>
    construirFilasMostradas(usuarios.value, CAMPOS_USUARIOS, busquedaUsuarios.value, ordenUsuarios.value)
  );

  const appsMostradas = computed(() =>
    construirFilasMostradas(apps.value, CAMPOS_APPS, busquedaApps.value, ordenApps.value)
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

  const ordenarUsuarios = (campo) => cambiarOrden(ordenUsuarios, campo);
  const ordenarApps = (campo) => cambiarOrden(ordenApps, campo);

  const indicadorOrden = (orden, campo) =>
    orden.campo === campo ? (orden.dir === 'asc' ? ' ▲' : ' ▼') : '';

  // Opciones del desplegable de departamento: la lista disponible + el valor actual si no estuviera en ella
  const opcionesDepartamento = (actual) => {
    const base = departamentos.value;
    if (actual && !base.includes(actual)) {
      return [actual, ...base];
    }
    return base;
  };

  // ---- Inserciones masivas (ficheros CSV) ----
  const onArchivoUsuariosSeleccionado = (archivo) => {
    archivoUsuarios.value = archivo || null;
  };

  const onArchivoAppsSeleccionado = (archivo) => {
    archivoApps.value = archivo || null;
  };

  const uploadUsers = async () => {
    if (!archivoUsuarios.value) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Selecciona un fichero de usuarios');
      return;
    }

    cargandoUsuarios.value = true;
    try {
      await importarUsuarios(toastMessage, toastColor, isToastOpen, archivoUsuarios.value);
      archivoUsuarios.value = null;
      fileUploadUsersRef.value?.fileClear();
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
    } finally {
      cargandoUsuarios.value = false;
    }
  };

  const uploadApps = async () => {
    if (!archivoApps.value) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Selecciona un fichero de aplicaciones');
      return;
    }

    cargandoApps.value = true;
    try {
      await importarAplicaciones(toastMessage, toastColor, isToastOpen, archivoApps.value);
      archivoApps.value = null;
      fileUploadAppsRef.value?.fileClear();
      await cargarApps();
    } catch (error) {
      console.error(error);
    } finally {
      cargandoApps.value = false;
    }
  };

  // ---- Carga de las tablas ----
  const cargarDepartamentos = async () => {
    try {
      departamentos.value = (await obtenerDepartamentos(toastMessage, toastColor, isToastOpen)) || [];
    } catch (error) {
      console.error(error);
      departamentos.value = [];
    }
  };

  const cargarUsuarios = async () => {
    cargandoTablaUsuarios.value = true;
    try {
      const data = (await obtenerInfoUsuarios(toastMessage, toastColor, isToastOpen)) || [];
      usuarios.value = data.map((u) => ({
        email: u.email || '',
        nombre: u.nombre || '',
        apellidos: u.apellidos || '',
        departamento: u.departamento || '',
        fechaNacimiento: u.fechaNacimiento || '',
        roles: rolesATexto(u.roles),
        estado: normalizarEstado(u.estado),
        cursoAcademico: u.cursoAcademico || '',
        ultimaConexion: u.ultimaConexion || null,
        _persistido: true,
        _uid: nextUid(),
      }));
      asegurarFilaVaciaUsuarios();
      // Refrescamos la lista de departamentos disponibles
      await cargarDepartamentos();
    } catch (error) {
      console.error(error);
      usuarios.value = [];
      asegurarFilaVaciaUsuarios();
    } finally {
      cargandoTablaUsuarios.value = false;
    }
  };

  const cargarApps = async () => {
    cargandoTablaApps.value = true;
    try {
      const data = (await obtenerInfoApps(toastMessage, toastColor, isToastOpen)) || [];
      apps.value = data.map((a) => ({
        clientId: a.clientId || '',
        nombre: a.nombre || '',
        roles: rolesATexto(a.roles),
        cursoAcademico: a.cursoAcademico || '',
        ultimaConexion: a.ultimaConexion || null,
        _persistido: true,
        _uid: nextUid(),
      }));
      asegurarFilaVaciaApps();
      // Refrescamos los contadores de notificaciones (NotificationsServer) para casarlos por nombre
      await cargarNotificaciones();
    } catch (error) {
      console.error(error);
      apps.value = [];
      asegurarFilaVaciaApps();
    } finally {
      cargandoTablaApps.value = false;
    }
  };

  // ---- Notificaciones (NotificationsServer): carga de contadores por nombre y actualización en vivo del "max" ----
  const cargarNotificaciones = async () => {
    try {
      // Pedimos una página amplia para traer todas las aplicaciones con sus contadores
      const lista = (await listarAplicaciones(toastMessage, toastColor, isToastOpen, 1, 1000)) || [];
      const mapa = {};
      lista.forEach((a) => {
        if (a && a.nombre) {
          mapa[a.nombre] = a;
        }
      });
      notifsPorNombre.value = mapa;
    } catch (error) {
      console.error(error);
      notifsPorNombre.value = {};
    }
  };

  // Devuelve los contadores de notificaciones de una app (casados por nombre) o undefined si no existen
  const notifsDe = (app) => (app && app.nombre ? notifsPorNombre.value[app.nombre] : undefined);

  // Valida que el nuevo valor de "max" sea un número entero >= 0
  const validarMaxNotificaciones = (valor) => {
    const numero = parseInt(valor, 10);
    const valido = !isNaN(numero) && numero >= 0;
    if (!valido) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El valor debe ser un número positivo');
    }
    return valido;
  };

  // Actualiza EN VIVO el máximo de notificaciones de calendario para la app (persiste y refleja el nuevo valor)
  const actualizarMaxCalendar = async (app, valor) => {
    if (!app._persistido || !validarMaxNotificaciones(valor)) {
      return;
    }
    try {
      await actualizarNotificacionesMaximasCalendar(toastMessage, toastColor, isToastOpen, app.nombre, valor);
      if (notifsPorNombre.value[app.nombre]) {
        notifsPorNombre.value[app.nombre].notifMaxCalendar = parseInt(valor, 10);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Actualiza EN VIVO el máximo de notificaciones de email para la app
  const actualizarMaxEmail = async (app, valor) => {
    if (!app._persistido || !validarMaxNotificaciones(valor)) {
      return;
    }
    try {
      await actualizarNotificacionesMaximasEmail(toastMessage, toastColor, isToastOpen, app.nombre, valor);
      if (notifsPorNombre.value[app.nombre]) {
        notifsPorNombre.value[app.nombre].notifMaxEmail = parseInt(valor, 10);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Actualiza EN VIVO el máximo de notificaciones de web para la app
  const actualizarMaxWeb = async (app, valor) => {
    if (!app._persistido || !validarMaxNotificaciones(valor)) {
      return;
    }
    try {
      await actualizarNotificacionesMaximasWeb(toastMessage, toastColor, isToastOpen, app.nombre, valor);
      if (notifsPorNombre.value[app.nombre]) {
        notifsPorNombre.value[app.nombre].notifMaxWeb = parseInt(valor, 10);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Autoriza el OAuth de Gmail (reutiliza el servicio de NotificationsServer)
  const autorizarGmailOAuthHandler = async () => {
    try {
      await autorizarGmailOAuth(toastMessage, toastColor, isToastOpen);
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Guardado (upsert) por fila ----
  const guardarUsuarioFila = async (usuario) => {
    if (!usuario.email || usuario.email.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El email es obligatorio para guardar el usuario');
      return;
    }

    try {
      // SEGURIDAD: no se envía cursoAcademico; el servidor lo resuelve desde la constante del curso actual
      await guardarUsuario(toastMessage, toastColor, isToastOpen, {
        email: usuario.email.trim(),
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        departamento: usuario.departamento,
        fechaNacimiento: usuario.fechaNacimiento,
        roles: parsearRoles(usuario.roles),
        estado: normalizarEstado(usuario.estado),
      });
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Usuario guardado con éxito');
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const guardarAppFila = async (app) => {
    if (!app.clientId || app.clientId.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El clientId es obligatorio para guardar la aplicación');
      return;
    }

    try {
      // SEGURIDAD: no se envía cursoAcademico; el servidor lo resuelve desde la constante del curso actual
      await guardarApp(toastMessage, toastColor, isToastOpen, {
        clientId: app.clientId.trim(),
        nombre: app.nombre,
        roles: parsearRoles(app.roles),
      });
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Aplicación guardada con éxito');
      await cargarApps();
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Borrado por fila ----
  const borrarUsuarioFila = async (usuario) => {
    if (!usuario._persistido) {
      return;
    }

    if (!window.confirm(`¿Borrar el usuario "${usuario.email}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await borrarUsuario(toastMessage, toastColor, isToastOpen, usuario.email);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Usuario borrado con éxito');
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const borrarAppFila = async (app) => {
    if (!app._persistido) {
      return;
    }

    if (!window.confirm(`¿Borrar la aplicación "${app.clientId}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await borrarApp(toastMessage, toastColor, isToastOpen, app.clientId);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Aplicación borrada con éxito');
      await cargarApps();
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Borrado masivo ----
  const borrarTodosUsuarios = async () => {
    if (!hayUsuarios.value) {
      return;
    }

    if (!window.confirm('Se borrarán todos los usuarios excepto los que tengan rol ADMINISTRADOR. ¿Continuar?')) {
      return;
    }

    try {
      const borrados = await borrarTodosLosUsuarios(toastMessage, toastColor, isToastOpen);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', `Usuarios borrados: ${borrados}`);
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
    }
  };

  const borrarTodasApps = async () => {
    if (!hayApps.value) {
      return;
    }

    if (!window.confirm('Se borrarán TODAS las aplicaciones. ¿Continuar?')) {
      return;
    }

    try {
      const borradas = await borrarTodasLasApps(toastMessage, toastColor, isToastOpen);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', `Aplicaciones borradas: ${borradas}`);
      await cargarApps();
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Exportación a CSV (genera el CSV a partir de lo actualmente mostrado: filtrado + ordenado) ----
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

  const exportarUsuariosCsv = () => {
    const cabeceras = ['Email', 'Nombre', 'Apellidos', 'Departamento', 'Fecha nacimiento', 'Roles', 'Estado', 'Curso académico', 'Última conexión'];
    const filas = usuariosMostrados.value
      .filter((u) => u._persistido)
      .map((u) => [u.email, u.nombre, u.apellidos, u.departamento, u.fechaNacimiento, u.roles, etiquetaEstado(u.estado), u.cursoAcademico, formatearFechaExacta(u.ultimaConexion) || 'Nunca']);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay usuarios para exportar');
      return;
    }

    descargarCsv('usuarios.csv', cabeceras, filas);
  };

  // Devuelve "hoy/max" de un tipo de notificación para el CSV, o '' si la app no tiene contadores
  const notifCsv = (app, tipo) => {
    const n = notifsDe(app);
    if (!n) return '';
    return `${n['notifHoy' + tipo] ?? 0}/${n['notifMax' + tipo] ?? 0}`;
  };

  const exportarAppsCsv = () => {
    const cabeceras = ['Client ID', 'Nombre', 'Roles', 'Calendar (hoy/max)', 'Email (hoy/max)', 'Web (hoy/max)', 'Curso académico', 'Última conexión'];
    const filas = appsMostradas.value
      .filter((a) => a._persistido)
      .map((a) => [a.clientId, a.nombre, a.roles, notifCsv(a, 'Calendar'), notifCsv(a, 'Email'), notifCsv(a, 'Web'), a.cursoAcademico, formatearFechaExacta(a.ultimaConexion) || 'Nunca']);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay aplicaciones para exportar');
      return;
    }

    descargarCsv('aplicaciones.csv', cabeceras, filas);
  };

  /**
   * Carga TODAS las constantes de TODOS los proyectos (GET sin cabeceras).
   */
  const cargarConstantes = async () => {
    try {
      constantes.value = await obtenerConstantes(toastMessage, toastColor, isToastOpen);
    } catch (error) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
    }
  };

  /**
   * Al cambiar de proyecto, si la constante seleccionada ya no pertenece al filtro, se deselecciona.
   */
  const filtrarPorProyecto = () => {
    if (selectedConstante.value && proyectoSeleccionado.value &&
        selectedConstante.value.proyecto !== proyectoSeleccionado.value) {
      selectedConstante.value = null;
    }
  };

  /**
   * Actualiza (POST) la constante seleccionada de una en una. El backend recibe un ÚNICO objeto
   * { proyecto, clave, valor } y hace upsert por proyecto + clave.
   */
  const actualizarConstanteSeleccionada = async () => {
    if (!selectedConstante.value) {
      return;
    }

    try {
      await actualizarConstante(toastMessage, toastColor, isToastOpen, {
        proyecto: selectedConstante.value.proyecto,
        clave: selectedConstante.value.clave,
        valor: selectedConstante.value.valor,
      });
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Constante actualizada con éxito');

      // Recargamos para reflejar el valor persistido
      await cargarConstantes();
    } catch (error) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
    }
  };

  onMounted(async () => {
    await Promise.all([cargarUsuarios(), cargarApps(), cargarConstantes()]);
  });
</script>

<style scoped>
.page-admin-firebase {
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

/* Rejilla superior: las dos tarjetas de inserción masiva, una al lado de la otra en pantallas anchas */
.import-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: start;
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

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.field-hint {
  font-size: 0.8rem;
  color: #666;
}

.field input,
.custom-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  font-size: 15px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background-color: white;
  color: #000;
  outline: none;
}

.custom-select {
  cursor: pointer;
}

.custom-select:hover,
.field input:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.constantes-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  padding: 1.25rem 1rem 1rem;
  box-sizing: border-box;
}

.constantes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  align-items: end;
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

/* ---- Tablas de datos (estilo /school_manager/cargaMatriculas), a ancho completo ---- */
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

.col-conexion {
  white-space: nowrap;
  min-width: 120px;
}

/* ---- Celdas de notificaciones (Calendar/Email/Web) unificadas desde /notifications/admin ---- */
.col-notif {
  min-width: 120px;
  white-space: nowrap;
}

.notif-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.notif-hoy {
  font-weight: 600;
}

.notif-sep {
  margin: 0 2px;
}

.notif-max {
  width: 58px;
  box-sizing: border-box;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  background: #fff;
  color: #000;
  font: inherit;
  outline: none;
}

.notif-max:focus {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.notif-vacio {
  opacity: 0.6;
}

/* Tarjeta de configuración de Gmail bajo la tabla de aplicaciones */
.gmail-card {
  margin-top: 1.25rem;
  max-width: 420px;
}

.conexion-text {
  cursor: default;
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

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cfd8e3 15%, #cfd8e3 85%, transparent);
  margin: 1.75rem 0;
}

.fondo-gris {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circulo {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  z-index: 9999;
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
  .page-subtitle, .field-hint { color: #c8c8c8; }
  .action-card, .constantes-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label { color: var(--text-color-dark); }
  .empty-state { background-color: #2a302b; border-color: #555; color: #c8c8c8; }
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
  .notif-max {
    background-color: #1f2937;
    color: #e6ebf1;
    border-color: #555;
  }
  .notif-max:focus {
    border-color: #64b5f6;
    box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
  }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

@media (max-width: 1024px) {
  .import-grid {
    grid-template-columns: 1fr;
  }
  .constantes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-admin-firebase { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .constantes-grid { grid-template-columns: 1fr; }
  .tabla-datos { font-size: 14px; }
  .search-input { max-width: 100%; flex: 1 1 100%; }
}
</style>
