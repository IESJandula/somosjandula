<template>
  <div class="page-admin-firebase">
    <header class="page-header">
      <h1 class="t-1">Administración del sistema</h1>
      <p class="page-subtitle">
        Gestión de usuarios, resolutores, aplicaciones y dispositivos domóticos.
      </p>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Usuarios</h2>

        <!-- 1) Tabla de usuarios a ancho completo (importación masiva compactada en su barra de acciones) -->
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
              <div class="import-inline" title="Importa usuarios: arrastra el fichero o haz clic para buscarlo en disco">
                <FileUpload
                  ref="fileUploadUsersRef"
                  idleText="Importar usuarios"
                  @file-selected="onArchivoUsuariosSeleccionado" />
              </div>
              <button type="button" class="btn-secondary btn-mini btn-with-icon" @click="abrirNuevoUsuario">
                <ion-icon :icon="addOutline" aria-hidden="true" />
                Nuevo usuario
              </button>
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

          <div class="table-scroll user-summary-scroll">
            <table class="tabla-datos user-summary-table">
              <thead>
                <tr>
                  <th class="col-accion user-col-actions">Acciones</th>
                  <th class="sortable user-col-identity" @click="ordenarUsuarios('nombre')">Usuario<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'nombre') }}</span></th>
                  <th class="sortable user-col-department" @click="ordenarUsuarios('departamento')">Departamento<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'departamento') }}</span></th>
                  <th class="sortable user-col-access" @click="ordenarUsuarios('roles')">Roles y permisos<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'roles') }}</span></th>
                  <th class="sortable user-col-status" @click="ordenarUsuarios('estado')">Estado<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'estado') }}</span></th>
                  <th class="sortable user-col-activity" @click="ordenarUsuarios('ultimaConexion')">Actividad<span class="sort-ind">{{ indicadorOrden(ordenUsuarios, 'ultimaConexion') }}</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuariosResumen" :key="usuario._uid" class="user-summary-row">
                  <td class="col-accion user-col-actions">
                    <div class="action-buttons user-summary-actions">
                      <button type="button" class="btn-save-icon" title="Ver o editar usuario" aria-label="Ver o editar usuario" @click="abrirEditorUsuario(usuario)">
                        <ion-icon :icon="createOutline" />
                      </button>
                      <button type="button" class="btn-delete btn-delete-icon" title="Borrar usuario" aria-label="Borrar usuario" @click="borrarUsuarioFila(usuario)">
                        <ion-icon :icon="trashOutline" />
                      </button>
                    </div>
                  </td>
                  <td class="user-col-identity">
                    <div class="user-identity">
                      <strong>{{ nombreCompletoUsuario(usuario) }}</strong>
                      <span>{{ usuario.email }}</span>
                    </div>
                  </td>
                  <td class="user-col-department">{{ usuario.departamento || 'Sin departamento' }}</td>
                  <td class="user-col-access">
                    <div class="user-access-summary">
                      <div class="user-role-list">
                        <span v-for="rol in rolesUsuario(usuario)" :key="`rol-${rol}`" class="user-role-chip">{{ rol }}</span>
                        <span
                          v-for="resolutor in usuario.resolutores"
                          :key="`resolutor-${resolutor}`"
                          class="user-permission-chip">
                          Resolutor: {{ resolutor }}
                        </span>
                        <span v-if="!rolesUsuario(usuario).length && !usuario.resolutores.length" class="user-muted">Sin roles ni permisos</span>
                      </div>
                    </div>
                  </td>
                  <td class="user-col-status">
                    <span class="user-status" :class="claseEstadoUsuario(usuario.estado)">{{ etiquetaEstado(usuario.estado) }}</span>
                  </td>
                  <td class="user-col-activity">
                    <div class="user-activity">
                      <span :title="formatearFechaExacta(usuario.ultimaConexion)">{{ formatearUltimaConexion(usuario.ultimaConexion) }}</span>
                      <small>{{ formatearEuros(usuario.costeImpresion, '0,00 €') }} gastados</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!hayUsuarios && !cargandoTablaUsuarios" class="empty-state">
            No hay usuarios cargados. Pulsa «Nuevo usuario» para añadir uno.
          </p>
        </article>

        <teleport to="body">
          <div v-if="usuarioEditor" class="user-drawer-backdrop" @click.self="cerrarEditorUsuario">
            <aside class="user-drawer" role="dialog" aria-modal="true" aria-labelledby="user-drawer-title">
              <header class="user-drawer-header">
                <div>
                  <p>{{ usuarioEditor._persistido ? 'Ficha de usuario' : 'Nuevo usuario' }}</p>
                  <h3 id="user-drawer-title">
                    {{ usuarioEditor._persistido ? nombreCompletoUsuario(usuarioEditor) : 'Alta de usuario' }}
                  </h3>
                  <span v-if="usuarioEditor._persistido">{{ usuarioEditor.email }}</span>
                </div>
                <button class="user-drawer-close" type="button" aria-label="Cerrar panel" title="Cerrar" @click="cerrarEditorUsuario">
                  <ion-icon :icon="closeOutline" />
                </button>
              </header>

              <form class="user-drawer-form" @submit.prevent="guardarUsuarioEditor">
                <div class="user-drawer-content">
                  <section class="user-form-section">
                    <div class="user-form-section-heading">
                      <h4>Datos personales</h4>
                      <span>Identidad y contacto</span>
                    </div>
                    <div class="user-form-grid">
                      <label class="user-form-field user-form-field-wide">
                        <span>Email</span>
                        <input v-model.trim="usuarioEditor.email" type="email" :disabled="usuarioEditor._persistido" required>
                      </label>
                      <label class="user-form-field">
                        <span>Nombre</span>
                        <input v-model="usuarioEditor.nombre" type="text">
                      </label>
                      <label class="user-form-field">
                        <span>Apellidos</span>
                        <input v-model="usuarioEditor.apellidos" type="text">
                      </label>
                      <label class="user-form-field">
                        <span>Departamento</span>
                        <select v-model="usuarioEditor.departamento">
                          <option value="">Sin departamento</option>
                          <option v-for="dep in opcionesDepartamento(usuarioEditor.departamento)" :key="dep" :value="dep">{{ dep }}</option>
                        </select>
                      </label>
                      <label class="user-form-field">
                        <span>Fecha de nacimiento</span>
                        <input v-model="usuarioEditor.fechaNacimiento" type="text" placeholder="dd/mm/aaaa">
                      </label>
                    </div>
                  </section>

                  <section class="user-form-section">
                    <div class="user-form-section-heading">
                      <h4>Acceso y permisos</h4>
                      <span>Roles, estado y resolución</span>
                    </div>
                    <div class="user-form-grid">
                      <label class="user-form-field">
                        <span>Roles</span>
                        <input v-model="usuarioEditor.roles" type="text" placeholder="ADMIN, USER">
                      </label>
                      <label class="user-form-field">
                        <span>Estado</span>
                        <select v-model="usuarioEditor.estado">
                          <option v-for="opcion in ESTADOS_USUARIO" :key="opcion.valor" :value="opcion.valor">{{ opcion.etiqueta }}</option>
                        </select>
                      </label>
                    </div>
                    <div class="user-resolvers-editor">
                      <span class="user-resolvers-label">Resolutores asignados</span>
                      <div v-if="resolutoresDisponibles.length" class="user-resolvers-grid">
                        <label v-for="nombreResolutor in resolutoresDisponibles" :key="nombreResolutor" class="user-resolver-option">
                          <input
                            type="checkbox"
                            :checked="usuarioEditor.resolutores.includes(nombreResolutor)"
                            @change="alternarResolutorDeUsuario(usuarioEditor, nombreResolutor)">
                          <span>{{ nombreResolutor }}</span>
                        </label>
                      </div>
                      <span v-else class="resolver-empty">No hay resolutores disponibles.</span>
                    </div>
                  </section>

                  <section v-if="usuarioEditor._persistido" class="user-form-section">
                    <div class="user-form-section-heading">
                      <h4>Actividad</h4>
                      <span>Información de solo lectura</span>
                    </div>
                    <dl class="user-metrics">
                      <div>
                        <dt>Última conexión</dt>
                        <dd>{{ formatearUltimaConexion(usuarioEditor.ultimaConexion) }}</dd>
                      </div>
                      <div>
                        <dt>Gasto en euros</dt>
                        <dd>{{ formatearEuros(usuarioEditor.costeImpresion, '0,00 €') }}</dd>
                      </div>
                      <div>
                        <dt>Curso académico</dt>
                        <dd>{{ usuarioEditor.cursoAcademico || '—' }}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                <footer class="user-drawer-footer">
                  <button
                    v-if="usuarioEditor._persistido"
                    class="btn-delete user-drawer-delete"
                    type="button"
                    :disabled="guardandoUsuarioEditor"
                    @click="borrarUsuarioDesdeEditor">
                    Borrar usuario
                  </button>
                  <span class="user-drawer-footer-spacer"></span>
                  <button class="btn-secondary" type="button" :disabled="guardandoUsuarioEditor" @click="cerrarEditorUsuario">Cancelar</button>
                  <button class="btn-primary user-drawer-save" type="submit" :disabled="guardandoUsuarioEditor">
                    <ion-icon :icon="saveOutline" aria-hidden="true" />
                    {{ guardandoUsuarioEditor ? 'Guardando…' : 'Guardar cambios' }}
                  </button>
                </footer>
              </form>
            </aside>
          </div>
        </teleport>

        <!-- 2) Resolutores: catálogo de resolutores de incidencias, migrado desde /issues/admin -->
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Resolutor</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaResolutores"
                title="Refrescar resolutores"
                @click="cargarResolutores">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaResolutores }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaResolutores"
                class="search-input"
                placeholder="Buscar...">
              <div class="import-inline" title="Importa resolutores: arrastra el fichero o haz clic para buscarlo en disco">
                <FileUpload
                  ref="fileUploadResolutoresRef"
                  idleText="Importar resolutores"
                  @file-selected="onArchivoResolutoresSeleccionado" />
              </div>
              <button
                type="button"
                class="btn-delete btn-mini"
                :disabled="!hayResolutores"
                @click="borrarTodosResolutores">
                Borrar todos
              </button>
              <button
                type="button"
                class="btn-secondary btn-mini"
                :disabled="!hayResolutores"
                @click="exportarResolutoresCsv">
                Exportar CSV
              </button>
            </div>
          </div>

          <div v-if="cargandoTablaResolutores" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th class="col-accion">Acciones</th>
                  <th class="sortable" @click="ordenarResolutores('nombre')">Resolutor<span class="sort-ind">{{ indicadorOrden(ordenResolutores, 'nombre') }}</span></th>
                  <th class="sortable" @click="ordenarResolutores('imprimirInforme')">Imprimir informe<span class="sort-ind">{{ indicadorOrden(ordenResolutores, 'imprimirInforme') }}</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="resolutor in resolutoresMostrados" :key="resolutor._uid">
                  <td class="col-accion">
                    <div class="action-buttons">
                      <button
                        type="button"
                        class="btn-save-icon"
                        title="Guardar resolutor"
                        aria-label="Guardar resolutor"
                        @click="guardarResolutorFila(resolutor)">
                        <ion-icon :icon="saveOutline" />
                      </button>
                      <button
                        v-if="resolutor._persistido"
                        type="button"
                        class="btn-delete"
                        title="Borrar resolutor"
                        aria-label="Borrar resolutor"
                        @click="borrarResolutorFila(resolutor)">X</button>
                      <span v-else class="action-placeholder" aria-hidden="true"></span>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="resolutor.nombre"
                      class="cell-input"
                      :disabled="resolutor._persistido"
                      placeholder="TIC, DIRECCIÓN...">
                  </td>
                  <td>
                    <input type="checkbox" v-model="resolutor.imprimirInforme" class="cell-checkbox">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!hayResolutores && !cargandoTablaResolutores" class="empty-state">
            No hay resolutores cargados. Usa la última fila para añadir uno nuevo.
          </p>
        </article>

        <!-- 3) Debajo: tabla de aplicaciones a ancho completo -->
        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Aplicaciones</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaApps"
                title="Refrescar aplicaciones"
                @click="cargarApps">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaApps }" />
              </button>
              <button
                type="button"
                class="btn-refresh btn-gmail-oauth"
                title="Autorizar GMAIL OAuth"
                aria-label="Autorizar GMAIL OAuth"
                @click="autorizarGmailOAuthHandler">
                <ion-icon :icon="mailOutline" />
              </button>
              <button
                type="button"
                class="btn-refresh btn-client-id-visibility"
                :class="{ 'is-active': mostrarClientIds }"
                :title="mostrarClientIds ? 'Ocultar Client ID' : 'Mostrar Client ID'"
                :aria-label="mostrarClientIds ? 'Ocultar todos los Client ID' : 'Mostrar todos los Client ID'"
                :aria-pressed="mostrarClientIds"
                @click="mostrarClientIds = !mostrarClientIds">
                <ion-icon :icon="mostrarClientIds ? eyeOutline : eyeOffOutline" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaApps"
                class="search-input"
                placeholder="Buscar...">
              <div class="import-inline" title="Importa aplicaciones: arrastra el fichero o haz clic para buscarlo en disco">
                <FileUpload
                  ref="fileUploadAppsRef"
                  idleText="Importar apps"
                  @file-selected="onArchivoAppsSeleccionado" />
              </div>
              <button type="button" class="btn-secondary btn-mini btn-with-icon" @click="abrirNuevaApp">
                <ion-icon :icon="addOutline" aria-hidden="true" />
                Nueva aplicación
              </button>
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

          <div class="table-scroll app-summary-scroll">
            <table class="tabla-datos app-summary-table">
              <thead>
                <tr>
                  <th class="col-accion app-col-actions">Acciones</th>
                  <th class="sortable app-col-identity" @click="ordenarApps('nombre')">Aplicación<span class="sort-ind">{{ indicadorOrden(ordenApps, 'nombre') }}</span></th>
                  <th class="sortable app-col-access" @click="ordenarApps('roles')">Roles y permisos<span class="sort-ind">{{ indicadorOrden(ordenApps, 'roles') }}</span></th>
                  <th class="app-col-notifications">Notificaciones (hoy / máximo)</th>
                  <th class="sortable app-col-activity" @click="ordenarApps('ultimaConexion')">Actividad<span class="sort-ind">{{ indicadorOrden(ordenApps, 'ultimaConexion') }}</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in appsResumen" :key="app._uid" class="app-summary-row">
                  <td class="col-accion app-col-actions">
                    <div class="action-buttons user-summary-actions">
                      <button type="button" class="btn-save-icon" title="Ver o editar aplicación" aria-label="Ver o editar aplicación" @click="abrirEditorApp(app)">
                        <ion-icon :icon="createOutline" />
                      </button>
                      <button type="button" class="btn-delete btn-delete-icon" title="Borrar aplicación" aria-label="Borrar aplicación" @click="borrarAppFila(app)">
                        <ion-icon :icon="trashOutline" />
                      </button>
                    </div>
                  </td>
                  <td class="app-col-identity">
                    <div class="app-identity">
                      <strong>{{ app.nombre || 'Aplicación sin nombre' }}</strong>
                      <span class="app-client-id" :class="{ 'is-masked': !mostrarClientIds }">{{ textoClientId(app) }}</span>
                    </div>
                  </td>
                  <td class="app-col-access">
                    <div class="app-role-list">
                      <span v-for="rol in rolesUsuario(app)" :key="rol" class="user-role-chip">{{ rol }}</span>
                      <span v-if="!rolesUsuario(app).length" class="user-muted">Sin roles ni permisos</span>
                    </div>
                  </td>
                  <td class="app-col-notifications">
                    <div class="app-notification-list">
                      <span v-for="tipo in TIPOS_NOTIFICACION" :key="tipo.valor" class="app-notification-chip">
                        <strong>{{ tipo.etiqueta }}</strong>
                        {{ notifHoyTexto(app, tipo.valor) }} / {{ app[`_max${tipo.valor}`] }}
                      </span>
                    </div>
                  </td>
                  <td class="app-col-activity">
                    <div class="user-activity">
                      <span :title="formatearFechaExacta(app.ultimaConexion)">{{ formatearUltimaConexion(app.ultimaConexion) }}</span>
                      <small>{{ app.cursoAcademico || 'Sin curso' }}</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!hayApps && !cargandoTablaApps" class="empty-state">
            No hay aplicaciones cargadas. Pulsa «Nueva aplicación» para añadir una.
          </p>
        </article>

        <teleport to="body">
          <div v-if="appEditor" class="user-drawer-backdrop" @click.self="cerrarEditorApp">
            <aside class="user-drawer" role="dialog" aria-modal="true" aria-labelledby="app-drawer-title">
              <header class="user-drawer-header">
                <div>
                  <p>{{ appEditor._persistido ? 'Ficha de aplicación' : 'Nueva aplicación' }}</p>
                  <h3 id="app-drawer-title">{{ appEditor._persistido ? (appEditor.nombre || 'Aplicación sin nombre') : 'Alta de aplicación' }}</h3>
                  <span v-if="appEditor._persistido" class="app-client-id" :class="{ 'is-masked': !mostrarClientIds }">{{ textoClientId(appEditor) }}</span>
                </div>
                <button class="user-drawer-close" type="button" aria-label="Cerrar panel" title="Cerrar" @click="cerrarEditorApp">
                  <ion-icon :icon="closeOutline" />
                </button>
              </header>

              <form class="user-drawer-form" @submit.prevent="guardarAppEditor">
                <div class="user-drawer-content">
                  <section class="user-form-section">
                    <div class="user-form-section-heading">
                      <h4>Datos de la aplicación</h4>
                      <span>Identidad y acceso</span>
                    </div>
                    <div class="user-form-grid">
                      <label class="user-form-field user-form-field-wide">
                        <span>Client ID</span>
                        <input
                          v-model.trim="appEditor.clientId"
                          :type="mostrarClientIds ? 'text' : 'password'"
                          :disabled="appEditor._persistido"
                          autocomplete="off"
                          required>
                      </label>
                      <label class="user-form-field user-form-field-wide">
                        <span>Nombre</span>
                        <input v-model="appEditor.nombre" type="text">
                      </label>
                      <label class="user-form-field user-form-field-wide">
                        <span>Roles y permisos</span>
                        <input v-model="appEditor.roles" type="text" placeholder="ROL1, ROL2">
                      </label>
                    </div>
                  </section>

                  <section class="user-form-section">
                    <div class="user-form-section-heading">
                      <h4>Notificaciones</h4>
                      <span>Uso de hoy y máximo permitido</span>
                    </div>
                    <div class="app-notification-editor">
                      <div v-for="tipo in TIPOS_NOTIFICACION" :key="tipo.valor" class="app-notification-editor-row">
                        <div>
                          <strong>{{ tipo.etiqueta }}</strong>
                          <span>Hoy: {{ notifHoyTexto(appEditor, tipo.valor) }}</span>
                        </div>
                        <div v-if="puedeEditarNotificaciones(appEditor)" class="notif-stepper">
                          <button type="button" class="stepper-btn" title="Disminuir" @click="cambiarMax(appEditor, tipo.valor, -1)">−</button>
                          <span class="stepper-val">{{ appEditor[`_max${tipo.valor}`] }}</span>
                          <button type="button" class="stepper-btn" title="Incrementar" @click="cambiarMax(appEditor, tipo.valor, 1)">+</button>
                        </div>
                        <span v-else class="app-notification-max">Máximo: {{ appEditor[`_max${tipo.valor}`] }}</span>
                      </div>
                    </div>
                    <p v-if="!puedeEditarNotificaciones(appEditor)" class="app-notification-hint">
                      Para modificar los máximos, la aplicación debe tener el rol APLICACION_NOTIFICACIONES.
                    </p>
                  </section>

                  <section v-if="appEditor._persistido" class="user-form-section">
                    <div class="user-form-section-heading">
                      <h4>Actividad</h4>
                      <span>Información de solo lectura</span>
                    </div>
                    <dl class="user-metrics app-metrics">
                      <div>
                        <dt>Última conexión</dt>
                        <dd>{{ formatearUltimaConexion(appEditor.ultimaConexion) }}</dd>
                      </div>
                      <div>
                        <dt>Curso académico</dt>
                        <dd>{{ appEditor.cursoAcademico || '—' }}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                <footer class="user-drawer-footer">
                  <button v-if="appEditor._persistido" class="btn-delete user-drawer-delete" type="button" :disabled="guardandoAppEditor" @click="borrarAppDesdeEditor">
                    Borrar aplicación
                  </button>
                  <span class="user-drawer-footer-spacer"></span>
                  <button class="btn-secondary" type="button" :disabled="guardandoAppEditor" @click="cerrarEditorApp">Cancelar</button>
                  <button class="btn-primary user-drawer-save" type="submit" :disabled="guardandoAppEditor">
                    <ion-icon :icon="saveOutline" aria-hidden="true" />
                    {{ guardandoAppEditor ? 'Guardando…' : 'Guardar cambios' }}
                  </button>
                </footer>
              </form>
            </aside>
          </div>
        </teleport>

        <div v-if="cargandoUsuarios || cargandoApps" class="fondo-gris">
          <div class="circulo"></div>
        </div>
      </section>

      <div class="panel-divider" aria-hidden="true"></div>

      <!-- 3) Domótica: dispositivos (actuadores/sensores) y sus comandos, migrados desde /automations/admin -->
      <section class="panel-section">
        <h2 class="section-title">Domótica</h2>

        <article class="action-card table-card">
          <div class="table-card-header">
            <div class="title-with-refresh">
              <h3 class="card-title card-title-inline">Dispositivos</h3>
              <button
                type="button"
                class="btn-refresh"
                :disabled="cargandoTablaDispositivos"
                title="Refrescar dispositivos"
                @click="cargarDispositivos">
                <ion-icon :icon="refreshOutline" :class="{ girando: cargandoTablaDispositivos }" />
              </button>
            </div>
            <div class="table-actions">
              <input
                type="text"
                v-model="busquedaDispositivos"
                class="search-input"
                placeholder="Buscar...">
              <button
                type="button"
                class="btn-delete btn-mini"
                :disabled="!hayDispositivos"
                @click="borrarTodosDispositivos">
                Borrar todos
              </button>
              <button
                type="button"
                class="btn-secondary btn-mini"
                :disabled="!hayDispositivos"
                @click="exportarDispositivosCsv">
                Exportar CSV
              </button>
            </div>
          </div>

          <div v-if="cargandoTablaDispositivos" class="table-loading">
            <div class="circulo"></div>
          </div>

          <div class="table-scroll">
            <table class="tabla-datos">
              <thead>
                <tr>
                  <th class="col-accion">Detalles</th>
                  <th class="col-accion">Acciones</th>
                  <th class="sortable" @click="ordenarDispositivos('mac')">MAC<span class="sort-ind">{{ indicadorOrden(ordenDispositivos, 'mac') }}</span></th>
                  <th class="sortable" @click="ordenarDispositivos('nombreUbicacion')">Ubicación<span class="sort-ind">{{ indicadorOrden(ordenDispositivos, 'nombreUbicacion') }}</span></th>
                  <th class="sortable" @click="ordenarDispositivos('clase')">Clase<span class="sort-ind">{{ indicadorOrden(ordenDispositivos, 'clase') }}</span></th>
                  <th class="sortable" @click="ordenarDispositivos('tipo')">Tipo<span class="sort-ind">{{ indicadorOrden(ordenDispositivos, 'tipo') }}</span></th>
                  <th>Configuración</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="dispositivo in dispositivosMostrados" :key="dispositivo._uid">
                  <tr>
                    <td class="col-accion">
                      <button
                        v-if="dispositivo._persistido && dispositivo.clase === 'ACTUADOR'"
                        type="button"
                        class="btn-secondary btn-detalles"
                        :title="dispositivo._detallesAbiertos ? 'Ocultar comandos' : 'Ver comandos'"
                        @click="alternarDetalles(dispositivo)">{{ dispositivo._detallesAbiertos ? '−' : '+' }}</button>
                    </td>
                    <td class="col-accion">
                      <div class="action-buttons">
                        <button
                          type="button"
                          class="btn-save-icon"
                          title="Guardar dispositivo"
                          aria-label="Guardar dispositivo"
                          @click="guardarDispositivoFila(dispositivo)">
                          <ion-icon :icon="saveOutline" />
                        </button>
                        <button
                          v-if="dispositivo._persistido"
                          type="button"
                          class="btn-delete"
                          title="Borrar dispositivo"
                          aria-label="Borrar dispositivo"
                          @click="borrarDispositivoFila(dispositivo)">X</button>
                        <span v-else class="action-placeholder" aria-hidden="true"></span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="dispositivo.mac"
                        class="cell-input"
                        :disabled="dispositivo._persistido"
                        placeholder="AA:BB:CC:DD:EE:FF">
                    </td>
                    <td>
                      <select v-model="dispositivo.nombreUbicacion" class="cell-input">
                        <option value="">—</option>
                        <option v-for="u in opcionesUbicacion(dispositivo.nombreUbicacion)" :key="u" :value="u">{{ u }}</option>
                      </select>
                    </td>
                    <td>
                      <select
                        v-model="dispositivo.clase"
                        class="cell-input"
                        :disabled="dispositivo._persistido"
                        @change="onCambioClase(dispositivo)">
                        <option value="ACTUADOR">Actuador</option>
                        <option value="SENSOR">Sensor</option>
                      </select>
                    </td>
                    <td>
                      <select v-model="dispositivo.tipo" class="cell-input" :disabled="dispositivo._persistido">
                        <option value="">—</option>
                        <option v-for="t in tiposDeClase(dispositivo.clase)" :key="t" :value="t">{{ t }}</option>
                      </select>
                    </td>
                    <td class="col-config">
                      <div v-if="dispositivo.clase === 'ACTUADOR' && esTipoPuertaVal(dispositivo.tipo)" class="config-cell">
                        <label class="config-label">Nº relés</label>
                        <input type="number" min="1" v-model="dispositivo.numeroReles" class="cell-input cell-input-num">
                      </div>
                      <div v-else-if="dispositivo.clase === 'ACTUADOR' && esTipoProyectorVal(dispositivo.tipo)" class="config-cell">
                        <label class="config-label">Comando estado</label>
                        <input type="text" v-model="dispositivo.comandoEstado" class="cell-input">
                      </div>
                      <div v-else-if="dispositivo.clase === 'SENSOR'" class="config-cell config-cell-sensor">
                        <select v-model="dispositivo.naturaleza" class="cell-input cell-input-nat" :disabled="dispositivo._persistido">
                          <option value="BOOLEANO">Booleano</option>
                          <option value="NUMERICO">Numérico</option>
                        </select>
                        <input type="number" v-model="dispositivo.umbralMinimo" class="cell-input cell-input-num" placeholder="Mín" title="Umbral mínimo">
                        <input type="number" v-model="dispositivo.umbralMaximo" class="cell-input cell-input-num" placeholder="Máx" title="Umbral máximo">
                      </div>
                      <span v-else class="config-empty">—</span>
                    </td>
                  </tr>

                  <tr
                    v-if="dispositivo._persistido && dispositivo.clase === 'ACTUADOR' && dispositivo._detallesAbiertos"
                    class="fila-detalles">
                    <td :colspan="8" class="celda-detalles">
                      <div class="detalles-wrap">
                        <div class="detalles-header">
                          <h4 class="detalles-title">Comandos de «{{ dispositivo.mac }}»</h4>
                          <button
                            type="button"
                            class="btn-refresh btn-refresh-sm"
                            :disabled="dispositivo._cargandoComandos"
                            title="Refrescar comandos"
                            @click="cargarComandosDispositivo(dispositivo)">
                            <ion-icon :icon="refreshOutline" :class="{ girando: dispositivo._cargandoComandos }" />
                          </button>
                        </div>

                        <div class="table-scroll">
                          <table class="tabla-datos tabla-sub">
                            <thead>
                              <tr>
                                <th class="col-accion">Acciones</th>
                                <th>Keyword</th>
                                <th>Comando</th>
                                <th>Texto OK</th>
                                <th v-if="esTipoPuertaVal(dispositivo.tipo)">Relé</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="cmd in dispositivo._comandos" :key="cmd._uid">
                                <td class="col-accion">
                                  <div class="action-buttons">
                                    <button
                                      type="button"
                                      class="btn-save-icon"
                                      title="Guardar comando"
                                      aria-label="Guardar comando"
                                      @click="guardarComandoFila(dispositivo, cmd)">
                                      <ion-icon :icon="saveOutline" />
                                    </button>
                                    <button
                                      v-if="cmd._persistido"
                                      type="button"
                                      class="btn-delete"
                                      title="Borrar comando"
                                      aria-label="Borrar comando"
                                      @click="borrarComandoFila(dispositivo, cmd)">X</button>
                                    <span v-else class="action-placeholder" aria-hidden="true"></span>
                                  </div>
                                </td>
                                <td>
                                  <input type="text" v-model="cmd.keyword" class="cell-input" :disabled="cmd._persistido" placeholder="keyword">
                                </td>
                                <td><input type="text" v-model="cmd.comandos" class="cell-input" placeholder="comando"></td>
                                <td><input type="text" v-model="cmd.textoOk" class="cell-input" placeholder="texto OK"></td>
                                <td v-if="esTipoPuertaVal(dispositivo.tipo)">
                                  <select v-model="cmd.indiceRele" class="cell-input" :disabled="cmd._persistido">
                                    <option :value="null">—</option>
                                    <option v-for="r in relesDisponiblesComando(dispositivo, cmd)" :key="r" :value="r">{{ r }}</option>
                                  </select>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p v-if="sinComandosPersistidos(dispositivo) && !dispositivo._cargandoComandos" class="empty-state">
                          No hay comandos. Usa la última fila para añadir uno nuevo.
                        </p>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <p v-if="!hayDispositivos && !cargandoTablaDispositivos" class="empty-state">
            No hay dispositivos cargados. Usa la última fila para añadir uno nuevo.
          </p>
        </article>
      </section>

    </div>

    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
  </div>
</template>

<script setup>
  import { IonToast, IonIcon } from '@ionic/vue';
  import {
    addOutline,
    closeOutline,
    createOutline,
    eyeOffOutline,
    eyeOutline,
    mailOutline,
    refreshOutline,
    saveOutline,
    trashOutline,
  } from 'ionicons/icons';
  import { ref, computed, onMounted, watch } from 'vue';
  import FileUpload from '@/components/printers/FileUpload.vue';
  import {
    importarUsuarios,
    importarAplicaciones,
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
    listarResolutores,
    guardarResolutor,
    importarResolutores,
    borrarResolutor,
    borrarTodosLosResolutores,
    listarUsuariosResolutor,
    crearUsuarioResolutor,
    borrarUsuarioResolutor,
  } from '@/services/issues';
  import {
    listarAplicaciones,
    actualizarNotificacionesMaximasCalendar,
    actualizarNotificacionesMaximasEmail,
    actualizarNotificacionesMaximasWeb,
    crearAplicacion,
    borrarAplicacion,
    borrarTodasLasAplicaciones,
    autorizarGmailOAuth,
  } from '@/services/notifications';
  import {
    obtenerActuadores,
    obtenerSensorBooleano,
    obtenerSensorNumerico,
    obtenerTiposActuador,
    obtenerTiposSensores,
    crearActuador,
    crearActuadorPuerta,
    crearActuadorProyector,
    crearSensorBooleano,
    crearSensorNumerico,
    eliminarActuador,
    eliminarActuadorPuerta,
    eliminarActuadorProyector,
    eliminarSensorBooleano,
    eliminarSensorNumerico,
    crearComandoActuador,
    crearComandoActuadorPuerta,
    obtenerComandosActuador,
    obtenerComandosActuadorPuerta,
    eliminarComandoActuador,
    eliminarComandoActuadorPuerta,
  } from '@/services/automations';
  import {
    obtenerCursosAcademicos,
    obtenerEspaciosFijo,
    obtenerEspaciosDesdoble,
    obtenerEspaciosSinDocencia,
  } from '@/services/schoolManager';
  import { crearToast } from '@/utils/toast.js';
  import { formatearEuros } from '@/utils/currency';

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
  const mostrarClientIds = ref(false);
  const usuarioEditor = ref(null);
  const guardandoUsuarioEditor = ref(false);
  const appEditor = ref(null);
  const guardandoAppEditor = ref(false);

  // Tabla editable de resolutores (IssuesServer) y su importación masiva
  const resolutores = ref([]);
  const cargandoTablaResolutores = ref(false);
  const fileUploadResolutoresRef = ref(null);
  const archivoResolutores = ref(null);

  // Resolutores asignados a cada usuario, indexados por email en minúsculas. Es el estado persistido con el
  // que se compara el borrador de la columna "Resolutor" de la tabla de usuarios al guardar cada fila.
  const asignacionesResolutorPorEmail = ref({});

  // Contadores de notificaciones (NotificationsServer) indexados por NOMBRE de aplicación. Cada entrada trae
  // notifHoy/notifMax (Calendar/Email/Web) y la fecha de la última notificación. Se casan con las filas de apps por
  // su campo 'nombre', igual que hacía la vista /notifications/admin.
  const notifsPorNombre = ref({});

  // Departamentos disponibles para el desplegable de la tabla de usuarios
  const departamentos = ref([]);

  // Búsqueda (filtro global en cliente) por tabla
  const busquedaUsuarios = ref('');
  const busquedaApps = ref('');
  const busquedaResolutores = ref('');

  // Estado de ordenación por columna, independiente por tabla ({ campo, dir: 'asc' | 'desc' | null }).
  // Por defecto se ordena por última conexión descendente (más reciente primero; los "Nunca" al final).
  const ordenUsuarios = ref({ campo: 'ultimaConexion', dir: 'desc' });
  const ordenApps = ref({ campo: 'ultimaConexion', dir: 'desc' });
  const ordenResolutores = ref({ campo: 'nombre', dir: 'asc' });

  // Identificador estable por fila (para :key), de modo que la ordenación/filtrado no reutilice inputs por error
  let uidCounter = 0;
  const nextUid = () => ++uidCounter;

  // Hay datos reales (excluyendo la fila vacía final) si alguna fila está persistida
  const hayUsuarios = computed(() => usuarios.value.some((u) => u._persistido));
  const hayApps = computed(() => apps.value.some((a) => a._persistido));
  const hayResolutores = computed(() => resolutores.value.some((r) => r._persistido));

  // Nombres de los resolutores dados de alta, que son las opciones del desplegable de la columna "Resolutor"
  const resolutoresDisponibles = computed(() =>
    resolutores.value.filter((r) => r._persistido).map((r) => r.nombre)
  );

  // Opciones del desplegable de estado (valor canónico que espera el backend + etiqueta mostrada)
  const ESTADOS_USUARIO = [
    { valor: 'ACTIVO', etiqueta: 'Activo' },
    { valor: 'PENDIENTE', etiqueta: 'Pendiente' },
    { valor: 'INACTIVO', etiqueta: 'Inactivo' },
  ];

  const TIPOS_NOTIFICACION = [
    { valor: 'Calendar', etiqueta: 'Calendar' },
    { valor: 'Email', etiqueta: 'Email' },
    { valor: 'Web', etiqueta: 'Web' },
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
    // Gasto de impresión del curso: solo lectura, lo calcula el backend
    costeImpresion: null,
    // Borrador de los resolutores asignados al usuario (0, 1 o varios). Solo se persiste al pulsar GUARDAR,
    // comparándolo con _resolutoresOriginales para saber qué asignaciones crear y cuáles borrar.
    resolutores: [],
    _resolutoresOriginales: [],
    _resolutoresAbierto: false,
    _persistido: false,
    _uid: nextUid(),
  });

  const filaResolutorVacia = () => ({
    nombre: '',
    imprimirInforme: false,
    _persistido: false,
    _uid: nextUid(),
  });

  const filaAppVacia = () => ({
    clientId: '',
    nombre: '',
    roles: '',
    cursoAcademico: '',
    ultimaConexion: null,
    // Borrador local de los máximos de notificaciones (Calendar/Email/Web). Para una fila nueva empiezan a 0
    // y solo se persisten cuando se pulsa GUARDAR.
    _maxCalendar: 0,
    _maxEmail: 0,
    _maxWeb: 0,
    _persistido: false,
    _uid: nextUid(),
  });

  // Convierte el texto de roles (separado por comas o barras) en un array limpio
  const parsearRoles = (texto) =>
    (texto || '')
      .split(/[|,]/)
      .map((r) => r.trim())
      .filter(Boolean);

  const rolesUsuario = (usuario) => parsearRoles(usuario && usuario.roles);

  const nombreCompletoUsuario = (usuario) => {
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim();
    return nombreCompleto || usuario.email || 'Usuario sin nombre';
  };

  const claseEstadoUsuario = (estado) => `user-status--${normalizarEstado(estado).toLowerCase()}`;

  const textoClientId = (app) => {
    const clientId = (app && app.clientId) || '';
    return mostrarClientIds.value ? clientId : '••••••••••••';
  };

  // Convierte un array de roles del backend en texto editable
  const rolesATexto = (roles) => (Array.isArray(roles) ? roles.join(', ') : (roles || ''));

  // Normaliza los roles para la EXPORTACIÓN CSV: acepta array o texto (separado por comas o barras) y
  // SIEMPRE los devuelve unidos por '|', que es lo que el importador del backend espera (roles.split("\\|")).
  const rolesAPipe = (roles) => {
    const texto = Array.isArray(roles) ? roles.join('|') : (roles || '');
    return parsearRoles(texto).join('|');
  };

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

  const asegurarFilaVaciaResolutores = () => {
    const arr = resolutores.value;
    const ultima = arr[arr.length - 1];
    if (!ultima || (ultima.nombre && ultima.nombre.trim() !== '')) {
      arr.push(filaResolutorVacia());
    }
  };

  watch(usuarios, asegurarFilaVaciaUsuarios, { deep: true });
  watch(apps, asegurarFilaVaciaApps, { deep: true });
  watch(resolutores, asegurarFilaVaciaResolutores, { deep: true });

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

    // El gasto de impresión se ordena por su valor numérico; sin gasto equivale a 0
    if (campo === 'costeImpresion') {
      const res = (Number(a[campo]) || 0) - (Number(b[campo]) || 0);
      return dir === 'desc' ? -res : res;
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
    if (campo === 'costeImpresion') return formatearEuros(fila[campo], '0,00 €');
    if (campo === 'resolutores') return (fila[campo] || []).join(', ');
    if (campo === 'imprimirInforme') return fila[campo] ? 'Sí' : 'No';
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

  const CAMPOS_USUARIOS = ['email', 'nombre', 'apellidos', 'departamento', 'fechaNacimiento', 'roles', 'resolutores', 'estado', 'ultimaConexion', 'costeImpresion'];
  const CAMPOS_APPS = ['clientId', 'nombre', 'roles', 'ultimaConexion'];
  const CAMPOS_RESOLUTORES = ['nombre', 'imprimirInforme'];

  const usuariosMostrados = computed(() =>
    construirFilasMostradas(usuarios.value, CAMPOS_USUARIOS, busquedaUsuarios.value, ordenUsuarios.value)
  );

  // La tabla resumen solo representa usuarios reales. La fila vacía se conserva internamente para no alterar
  // el flujo de carga/importación existente, pero las altas se realizan desde el panel lateral.
  const usuariosResumen = computed(() => usuariosMostrados.value.filter((usuario) => usuario._persistido));

  const appsMostradas = computed(() =>
    construirFilasMostradas(apps.value, CAMPOS_APPS, busquedaApps.value, ordenApps.value)
  );

  const appsResumen = computed(() => appsMostradas.value.filter((app) => app._persistido));

  const resolutoresMostrados = computed(() =>
    construirFilasMostradas(resolutores.value, CAMPOS_RESOLUTORES, busquedaResolutores.value, ordenResolutores.value)
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
  const ordenarResolutores = (campo) => cambiarOrden(ordenResolutores, campo);

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
  // Al arrastrar/seleccionar el fichero desde la barra de acciones se dispara la importación automáticamente
  // (el control compacto sustituye a la antigua tarjeta grande con su botón "Crear"). uploadUsers/uploadApps
  // se encargan de limpiar el fichero y refrescar la tabla, además del feedback vía toast.
  const onArchivoUsuariosSeleccionado = async (archivo) => {
    archivoUsuarios.value = archivo || null;
    if (archivoUsuarios.value) {
      await uploadUsers();
    }
  };

  const onArchivoAppsSeleccionado = async (archivo) => {
    archivoApps.value = archivo || null;
    if (archivoApps.value) {
      await uploadApps();
    }
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

  const onArchivoResolutoresSeleccionado = async (archivo) => {
    archivoResolutores.value = archivo || null;
    if (archivoResolutores.value) {
      await uploadResolutores();
    }
  };

  const uploadResolutores = async () => {
    if (!archivoResolutores.value) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Selecciona un fichero de resolutores');
      return;
    }

    cargandoTablaResolutores.value = true;
    try {
      const importados = await importarResolutores(toastMessage, toastColor, isToastOpen, archivoResolutores.value);

      crearToast(toastMessage, toastColor, isToastOpen, 'success', `Resolutores importados: ${importados}`);
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo importar el fichero de resolutores');
    } finally {
      archivoResolutores.value = null;
      fileUploadResolutoresRef.value?.fileClear();
      cargandoTablaResolutores.value = false;
      await cargarResolutores();
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

  // Carga el catálogo de resolutores (IssuesServer)
  const cargarResolutores = async () => {
    cargandoTablaResolutores.value = true;
    try {
      const data = (await listarResolutores(toastMessage, toastColor, isToastOpen)) || [];
      resolutores.value = data.map((r) => ({
        nombre: r.nombre || '',
        imprimirInforme: r.imprimirInforme === true,
        _persistido: true,
        _uid: nextUid(),
      }));
      asegurarFilaVaciaResolutores();
    } catch (error) {
      console.error(error);
      resolutores.value = [];
      asegurarFilaVaciaResolutores();
    } finally {
      cargandoTablaResolutores.value = false;
    }
  };

  // Carga las asignaciones usuario -> resolutor y las agrupa por email (en minúsculas), ya que un mismo
  // usuario puede ser responsable de varios resolutores.
  const cargarAsignacionesResolutor = async () => {
    try {
      const asignaciones = (await listarUsuariosResolutor(toastMessage, toastColor, isToastOpen)) || [];
      const mapa = {};
      asignaciones.forEach((asignacion) => {
        const email = (asignacion.emailResponsable || '').trim().toLowerCase();
        if (!email) {
          return;
        }
        if (!mapa[email]) {
          mapa[email] = [];
        }
        mapa[email].push(asignacion.nombreResolutor);
      });
      asignacionesResolutorPorEmail.value = mapa;
    } catch (error) {
      console.error(error);
      asignacionesResolutorPorEmail.value = {};
    }
  };

  const cargarUsuarios = async () => {
    cargandoTablaUsuarios.value = true;
    try {
      // Las asignaciones de resolutores alimentan la columna "Resolutor", por lo que se cargan antes de las filas
      await cargarAsignacionesResolutor();

      const data = (await obtenerInfoUsuarios(toastMessage, toastColor, isToastOpen)) || [];
      usuarios.value = data.map((u) => {
        const asignados = [...(asignacionesResolutorPorEmail.value[(u.email || '').trim().toLowerCase()] || [])];

        return {
          email: u.email || '',
          nombre: u.nombre || '',
          apellidos: u.apellidos || '',
          departamento: u.departamento || '',
          fechaNacimiento: u.fechaNacimiento || '',
          roles: rolesATexto(u.roles),
          estado: normalizarEstado(u.estado),
          cursoAcademico: u.cursoAcademico || '',
          ultimaConexion: u.ultimaConexion || null,
          costeImpresion: u.costeImpresion ?? null,
          resolutores: [...asignados],
          _resolutoresOriginales: [...asignados],
          _resolutoresAbierto: false,
          _persistido: true,
          _uid: nextUid(),
        };
      });
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
        // Borrador de los máximos; se sincroniza con los contadores reales tras cargarNotificaciones()
        _maxCalendar: 0,
        _maxEmail: 0,
        _maxWeb: 0,
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
      // Sincronizamos el borrador de máximos de cada fila con los contadores reales recién cargados
      sincronizarBorradorMax();
    } catch (error) {
      console.error(error);
      notifsPorNombre.value = {};
    }
  };

  // Devuelve los contadores de notificaciones de una app (casados por nombre) o undefined si no existen
  const notifsDe = (app) => (app && app.nombre ? notifsPorNombre.value[app.nombre] : undefined);

  // Texto de "hoy" (solo lectura) para un tipo de notificación: el valor real si la app existe en notifications,
  // o "—" si todavía no tiene contadores (p. ej. una app recién creada aún sin persistir en notifications).
  const notifHoyTexto = (app, tipo) => {
    const n = notifsDe(app);
    if (!n) return '—';
    return n['notifHoy' + tipo] ?? 0;
  };

  // Copia los máximos reales (de notifications) al borrador local de cada fila. Las filas sin contadores
  // (nuevas o aún no dadas de alta en notifications) quedan a 0.
  const sincronizarBorradorMax = () => {
    apps.value.forEach((app) => {
      const n = app.nombre ? notifsPorNombre.value[app.nombre] : undefined;
      app._maxCalendar = n ? (n.notifMaxCalendar ?? 0) : 0;
      app._maxEmail = n ? (n.notifMaxEmail ?? 0) : 0;
      app._maxWeb = n ? (n.notifMaxWeb ?? 0) : 0;
    });
  };

  // Modifica el borrador local del máximo (Calendar/Email/Web) de una fila. NO persiste: el guardado real
  // ocurre al pulsar GUARDAR en la fila. Nunca baja de 0.
  const cambiarMax = (app, tipo, delta) => {
    const key = '_max' + tipo;
    const actual = parseInt(app[key], 10) || 0;
    app[key] = Math.max(0, actual + delta);
  };

  // Rol necesario para poder editar los máximos de notificaciones de una aplicación
  const ROL_NOTIFICACIONES = 'APLICACION_NOTIFICACIONES';

  // Indica si una fila de aplicación puede editar sus máximos de notificaciones: solo si entre sus roles
  // figura EXACTAMENTE APLICACION_NOTIFICACIONES (no como subcadena). Reutiliza parsearRoles para separar
  // por el mismo delimitador que el resto del componente, de modo que refleja también el borrador en edición inline.
  const puedeEditarNotificaciones = (app) =>
    parsearRoles(app && app.roles).includes(ROL_NOTIFICACIONES);

  // Autoriza el OAuth de Gmail (reutiliza el servicio de NotificationsServer)
  const autorizarGmailOAuthHandler = async () => {
    try {
      await autorizarGmailOAuth(toastMessage, toastColor, isToastOpen);
    } catch (error) {
      console.error(error);
    }
  };

  // Marca o desmarca un resolutor en el borrador del usuario. NO persiste hasta guardar la ficha lateral.
  const alternarResolutorDeUsuario = (usuario, nombreResolutor) => {
    const asignados = usuario.resolutores || [];
    const indice = asignados.indexOf(nombreResolutor);
    if (indice === -1) {
      asignados.push(nombreResolutor);
    } else {
      asignados.splice(indice, 1);
    }
    usuario.resolutores = asignados;
  };

  // El nombre del responsable que se registra en la asignación es el del propio usuario (o su email si no lo tuviese)
  const nombreResponsableDe = (usuario) => {
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellidos || ''}`.trim();
    return nombreCompleto || usuario.email;
  };

  // Persiste el borrador de la columna "Resolutor": da de alta las asignaciones nuevas y borra las eliminadas.
  const sincronizarResolutoresUsuario = async (usuario) => {
    const email = usuario.email.trim();
    const nombreResponsable = nombreResponsableDe(usuario);
    const deseados = usuario.resolutores || [];
    const originales = usuario._resolutoresOriginales || [];

    for (const nombreResolutor of deseados.filter((r) => !originales.includes(r))) {
      await crearUsuarioResolutor(toastMessage, toastColor, isToastOpen, nombreResolutor, nombreResponsable, email);
    }

    for (const nombreResolutor of originales.filter((r) => !deseados.includes(r))) {
      await borrarUsuarioResolutor(toastMessage, toastColor, isToastOpen, nombreResolutor, nombreResponsable, email);
    }
  };

  // ---- Guardado (upsert) por fila ----
  const guardarUsuarioFila = async (usuario) => {
    if (!usuario.email || usuario.email.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El email es obligatorio para guardar el usuario');
      return false;
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

      // Persistimos los resolutores asignados (columna "Resolutor") en el microservicio issues
      await sincronizarResolutoresUsuario(usuario);

      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Usuario guardado con éxito');
      await cargarUsuarios();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const guardarAppFila = async (app) => {
    if (!app.clientId || app.clientId.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El clientId es obligatorio para guardar la aplicación');
      return false;
    }

    try {
      // SEGURIDAD: no se envía cursoAcademico; el servidor lo resuelve desde la constante del curso actual
      await guardarApp(toastMessage, toastColor, isToastOpen, {
        clientId: app.clientId.trim(),
        nombre: app.nombre,
        roles: parsearRoles(app.roles),
      });

      // Persistimos los máximos de notificaciones (borrador editado con los steppers) en el microservicio
      // notifications. Solo si la app tiene nombre (los contadores se indexan por NOMBRE de aplicación).
      await guardarMaximosNotificaciones(app);

      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Aplicación guardada con éxito');
      await cargarApps();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // Persiste los máximos (Calendar/Email/Web) del borrador de una fila en el microservicio notifications.
  // - Si la app YA tiene contadores (existe en notifications), se actualizan con los PUT actualizarNotificacionesMaximas*.
  // - Si NO existe todavía (app recién creada), se INSERTA con crearAplicacion, ya que los PUT del backend son
  //   UPDATE puros (WHERE nombre = ...) y no dan de alta filas nuevas.
  const guardarMaximosNotificaciones = async (app) => {
    const nombre = (app.nombre || '').trim();
    if (!nombre) {
      return;
    }

    const maxCalendar = parseInt(app._maxCalendar, 10) || 0;
    const maxEmail = parseInt(app._maxEmail, 10) || 0;
    const maxWeb = parseInt(app._maxWeb, 10) || 0;

    if (notifsPorNombre.value[nombre]) {
      await actualizarNotificacionesMaximasCalendar(toastMessage, toastColor, isToastOpen, nombre, maxCalendar);
      await actualizarNotificacionesMaximasEmail(toastMessage, toastColor, isToastOpen, nombre, maxEmail);
      await actualizarNotificacionesMaximasWeb(toastMessage, toastColor, isToastOpen, nombre, maxWeb);
    } else {
      await crearAplicacion(toastMessage, toastColor, isToastOpen, nombre, maxCalendar, maxEmail, maxWeb);
    }
  };

  // ---- Borrado por fila ----
  const borrarUsuarioFila = async (usuario) => {
    if (!usuario._persistido) {
      return false;
    }

    if (!window.confirm(`¿Borrar el usuario "${usuario.email}"? Esta acción no se puede deshacer.`)) {
      return false;
    }

    try {
      await borrarUsuario(toastMessage, toastColor, isToastOpen, usuario.email);

      // También retiramos sus asignaciones de resolutores en el microservicio issues. Es tolerante a errores:
      // una asignación con incidencias asociadas no se puede borrar y no debe romper la UX del borrado principal.
      for (const nombreResolutor of (usuario._resolutoresOriginales || [])) {
        try {
          await borrarUsuarioResolutor(toastMessage, toastColor, isToastOpen, nombreResolutor, nombreResponsableDe(usuario), usuario.email.trim());
        } catch (errorResolutor) {
          console.error(errorResolutor);
        }
      }

      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Usuario borrado con éxito');
      await cargarUsuarios();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // El editor trabaja sobre una copia para que cerrar o cancelar nunca deje cambios parciales en la tabla.
  const clonarUsuarioParaEditor = (usuario) => ({
    ...usuario,
    resolutores: [...(usuario.resolutores || [])],
    _resolutoresOriginales: [...(usuario._resolutoresOriginales || [])],
    _resolutoresAbierto: false,
  });

  const abrirEditorUsuario = (usuario) => {
    usuarioEditor.value = clonarUsuarioParaEditor(usuario);
  };

  const abrirNuevoUsuario = () => {
    usuarioEditor.value = filaUsuarioVacia();
  };

  const cerrarEditorUsuario = () => {
    if (!guardandoUsuarioEditor.value) {
      usuarioEditor.value = null;
    }
  };

  const guardarUsuarioEditor = async () => {
    if (!usuarioEditor.value || guardandoUsuarioEditor.value) {
      return;
    }

    guardandoUsuarioEditor.value = true;
    try {
      const guardado = await guardarUsuarioFila(usuarioEditor.value);
      if (guardado) {
        usuarioEditor.value = null;
      }
    } finally {
      guardandoUsuarioEditor.value = false;
    }
  };

  const borrarUsuarioDesdeEditor = async () => {
    if (!usuarioEditor.value || guardandoUsuarioEditor.value) {
      return;
    }

    guardandoUsuarioEditor.value = true;
    try {
      const borrado = await borrarUsuarioFila(usuarioEditor.value);
      if (borrado) {
        usuarioEditor.value = null;
      }
    } finally {
      guardandoUsuarioEditor.value = false;
    }
  };

  const borrarAppFila = async (app) => {
    if (!app._persistido) {
      return false;
    }

    if (!window.confirm(`¿Borrar la aplicación "${app.clientId}"? Esta acción no se puede deshacer.`)) {
      return false;
    }

    try {
      await borrarApp(toastMessage, toastColor, isToastOpen, app.clientId);
      // También eliminamos el registro en NotificationsServer (identificado por NOMBRE).
      // Si la app no existe allí, el fallo es tolerable y no debe romper la UX.
      if (app.nombre) {
        try {
          await borrarAplicacion(toastMessage, toastColor, isToastOpen, app.nombre);
        } catch (errorNotifications) {
          console.error(errorNotifications);
        }
      }
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Aplicación borrada con éxito');
      await cargarApps();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const abrirEditorApp = (app) => {
    appEditor.value = { ...app };
  };

  const abrirNuevaApp = () => {
    appEditor.value = filaAppVacia();
  };

  const cerrarEditorApp = () => {
    if (!guardandoAppEditor.value) {
      appEditor.value = null;
    }
  };

  const guardarAppEditor = async () => {
    if (!appEditor.value || guardandoAppEditor.value) {
      return;
    }

    guardandoAppEditor.value = true;
    try {
      const guardada = await guardarAppFila(appEditor.value);
      if (guardada) {
        appEditor.value = null;
      }
    } finally {
      guardandoAppEditor.value = false;
    }
  };

  const borrarAppDesdeEditor = async () => {
    if (!appEditor.value || guardandoAppEditor.value) {
      return;
    }

    guardandoAppEditor.value = true;
    try {
      const borrada = await borrarAppFila(appEditor.value);
      if (borrada) {
        appEditor.value = null;
      }
    } finally {
      guardandoAppEditor.value = false;
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

      // También eliminamos todas las aplicaciones en NotificationsServer con una única llamada.
      // Es tolerante a errores: si falla, no debe romper la UX del borrado principal.
      try {
        await borrarTodasLasAplicaciones(toastMessage, toastColor, isToastOpen);
      } catch (errorNotifications) {
        console.error(errorNotifications);
      }

      crearToast(toastMessage, toastColor, isToastOpen, 'success', `Aplicaciones borradas: ${borradas}`);
      await cargarApps();
    } catch (error) {
      console.error(error);
    }
  };

  // ---- Resolutores: alta/edición y borrado ----
  // El POST del backend hace upsert por nombre (su clave), de modo que una fila ya persistida solo actualiza
  // su flag de imprimir informe: por eso el nombre no es editable una vez dado de alta.
  const guardarResolutorFila = async (resolutor) => {
    if (!resolutor.nombre || resolutor.nombre.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El nombre del resolutor es obligatorio');
      return;
    }

    const nombre = resolutor.nombre.trim();

    // Al dar de alta uno nuevo evitamos duplicados que sobreescribirían al existente sin avisar
    if (!resolutor._persistido && resolutores.value.some((r) => r._persistido && r.nombre.toLowerCase() === nombre.toLowerCase())) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Ya existe el resolutor "${nombre}"`);
      return;
    }

    try {
      await guardarResolutor(toastMessage, toastColor, isToastOpen, nombre, resolutor.imprimirInforme === true);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Resolutor guardado con éxito');
      await cargarResolutores();
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo guardar el resolutor');
    }
  };

  const borrarResolutorFila = async (resolutor) => {
    if (!resolutor._persistido) {
      return;
    }

    if (!window.confirm(`¿Borrar el resolutor "${resolutor.nombre}"? También se borrarán los usuarios asignados a él.`)) {
      return;
    }

    try {
      await borrarResolutor(toastMessage, toastColor, isToastOpen, resolutor.nombre);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Resolutor borrado con éxito');
      await cargarResolutores();

      // Los usuarios asignados a ese resolutor pierden la asignación, así que refrescamos su tabla
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo borrar el resolutor');
    }
  };

  const borrarTodosResolutores = async () => {
    if (!hayResolutores.value) {
      return;
    }

    if (!window.confirm('Se borrarán todos los resolutores que no tengan incidencias asociadas, junto con sus usuarios asignados. ¿Continuar?')) {
      return;
    }

    try {
      const total = resolutores.value.filter((r) => r._persistido).length;
      const borrados = await borrarTodosLosResolutores(toastMessage, toastColor, isToastOpen);

      // Los resolutores con incidencias asociadas no se pueden borrar, así que avisamos si alguno ha quedado
      const color = borrados < total ? 'danger' : 'success';
      const mensaje = borrados < total
        ? `Resolutores borrados: ${borrados} de ${total}. El resto tiene incidencias asociadas.`
        : `Resolutores borrados: ${borrados}`;

      crearToast(toastMessage, toastColor, isToastOpen, color, mensaje);
      await cargarResolutores();
      await cargarUsuarios();
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

  // Exporta EXACTAMENTE el formato que el importador del backend puede volver a leer
  // (ImportsManager#importarUsuariosProcesarCsvProcesarLinea): 6 columnas separadas por coma en el orden
  // email, nombre, apellidos, departamento, fechaNacimiento, roles (roles unidos por '|'). El importador
  // SALTA SIEMPRE la primera línea, por lo que incluimos una fila de cabecera (imprescindible para no perder
  // el primer usuario al reimportar). Se exportan solo las filas persistidas (nunca la fila vacía de alta),
  // respetando el filtro/orden actualmente mostrado.
  const exportarUsuariosCsv = () => {
    const cabeceras = ['email', 'nombre', 'apellidos', 'departamento', 'fechaNacimiento', 'roles'];
    const filas = usuariosMostrados.value
      .filter((u) => u._persistido)
      .map((u) => [u.email, u.nombre, u.apellidos, u.departamento, u.fechaNacimiento, rolesAPipe(u.roles)]);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay usuarios para exportar');
      return;
    }

    descargarCsv('usuarios.csv', cabeceras, filas);
  };

  // Exporta EXACTAMENTE el formato que el importador del backend puede volver a leer
  // (ImportsManager#importarAppsProcesarCsvProcesarLinea): 3 columnas separadas por coma en el orden
  // clientId, nombre, roles (roles unidos por '|'). El importador SALTA SIEMPRE la primera línea, por lo que
  // incluimos una fila de cabecera. Se exportan solo las filas persistidas (nunca la fila vacía de alta),
  // respetando el filtro/orden actualmente mostrado.
  const exportarAppsCsv = () => {
    const cabeceras = ['clientId', 'nombre', 'roles'];
    const filas = appsMostradas.value
      .filter((a) => a._persistido)
      .map((a) => [a.clientId, a.nombre, rolesAPipe(a.roles)]);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay aplicaciones para exportar');
      return;
    }

    descargarCsv('aplicaciones.csv', cabeceras, filas);
  };

  // Exporta los resolutores en el mismo formato que lee el importador de esta vista: 2 columnas separadas por
  // coma (resolutor, imprimirInforme) con una fila de cabecera, que el importador salta siempre.
  const exportarResolutoresCsv = () => {
    const cabeceras = ['resolutor', 'imprimirInforme'];
    const filas = resolutoresMostrados.value
      .filter((r) => r._persistido)
      .map((r) => [r.nombre, r.imprimirInforme ? 'true' : 'false']);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay resolutores para exportar');
      return;
    }

    descargarCsv('resolutores.csv', cabeceras, filas);
  };

  // ===================== DOMÓTICA (migrada desde /automations/admin) =====================
  // Tabla unificada de dispositivos (actuadores y sensores) con alta/edición inline y una subtabla de
  // comandos por actuador. Reutiliza los servicios de @/services/automations y las ubicaciones de
  // schoolManager (espacios del curso académico activo), igual que hacía la vista original.
  const dispositivos = ref([]);
  const cargandoTablaDispositivos = ref(false);
  const busquedaDispositivos = ref('');
  const ordenDispositivos = ref({ campo: 'mac', dir: 'asc' });
  const ubicaciones = ref([]);
  const tiposActuador = ref([]);
  const tiposSensor = ref([]);

  const hayDispositivos = computed(() => dispositivos.value.some((d) => d._persistido));

  const esTipoPuertaVal = (tipo) => String(tipo ?? '').trim().toLowerCase() === 'puerta';
  const esTipoProyectorVal = (tipo) => String(tipo ?? '').trim().toLowerCase() === 'proyector';

  const tiposDeClase = (clase) => (clase === 'SENSOR' ? tiposSensor.value : tiposActuador.value);

  // Opciones del desplegable de ubicación: la lista disponible + el valor actual si no estuviera en ella
  const opcionesUbicacion = (actual) => {
    const base = ubicaciones.value;
    if (actual && !base.includes(actual)) {
      return [actual, ...base];
    }
    return base;
  };

  const filaComandoVacia = () => ({
    keyword: '',
    comandos: '',
    textoOk: '',
    indiceRele: null,
    _persistido: false,
    _uid: nextUid(),
  });

  const filaDispositivoVacia = () => ({
    mac: '',
    nombreUbicacion: '',
    clase: 'ACTUADOR',
    tipo: '',
    estado: 'indefinido',
    numeroReles: 1,
    comandoEstado: '',
    estadoProyector: '',
    naturaleza: 'BOOLEANO',
    umbralMinimo: 0,
    umbralMaximo: 0,
    valorActual: null,
    ultimaActualizacion: null,
    _persistido: false,
    _detallesAbiertos: false,
    _comandos: [],
    _cargandoComandos: false,
    _uid: nextUid(),
  });

  const asegurarFilaVaciaDispositivos = () => {
    const arr = dispositivos.value;
    const ultima = arr[arr.length - 1];
    if (!ultima || (ultima.mac && ultima.mac.trim() !== '')) {
      arr.push(filaDispositivoVacia());
    }
  };

  const asegurarFilaVaciaComandos = (dispositivo) => {
    const arr = dispositivo._comandos;
    if (!Array.isArray(arr)) {
      return;
    }
    const ultima = arr[arr.length - 1];
    if (!ultima || (ultima.keyword && ultima.keyword.trim() !== '')) {
      arr.push(filaComandoVacia());
    }
  };

  // Garantiza una fila vacía al final de la tabla de dispositivos y de cada subtabla de comandos abierta.
  watch(dispositivos, () => {
    asegurarFilaVaciaDispositivos();
    dispositivos.value.forEach((d) => {
      if (d._detallesAbiertos) {
        asegurarFilaVaciaComandos(d);
      }
    });
  }, { deep: true });

  const CAMPOS_DISPOSITIVOS = ['mac', 'nombreUbicacion', 'clase', 'tipo'];
  const dispositivosMostrados = computed(() =>
    construirFilasMostradas(dispositivos.value, CAMPOS_DISPOSITIVOS, busquedaDispositivos.value, ordenDispositivos.value)
  );
  const ordenarDispositivos = (campo) => cambiarOrden(ordenDispositivos, campo);

  const sinComandosPersistidos = (dispositivo) =>
    !(dispositivo._comandos || []).some((c) => c._persistido);

  // Relés disponibles para una fila de comando de una puerta: los no usados por OTRAS filas, más el propio si ya tiene.
  const relesDisponiblesComando = (dispositivo, cmd) => {
    const total = Number(dispositivo.numeroReles ?? 0);
    if (!esTipoPuertaVal(dispositivo.tipo) || total <= 0) {
      return [];
    }
    const usados = new Set(
      (dispositivo._comandos ?? [])
        .filter((c) => c !== cmd && c.indiceRele != null && c.indiceRele !== '')
        .map((c) => Number(c.indiceRele))
    );
    const disponibles = [];
    for (let i = 0; i < total; i++) {
      if (!usados.has(i)) {
        disponibles.push(i);
      }
    }
    if (cmd.indiceRele != null && cmd.indiceRele !== '' && !disponibles.includes(Number(cmd.indiceRele))) {
      disponibles.unshift(Number(cmd.indiceRele));
    }
    return disponibles;
  };

  // ---- Carga de catálogos (tipos y ubicaciones) ----
  const cargarTiposDispositivos = async () => {
    try {
      const [ta, ts] = await Promise.all([
        obtenerTiposActuador(toastMessage, toastColor, isToastOpen),
        obtenerTiposSensores(toastMessage, toastColor, isToastOpen),
      ]);
      const normalizar = (raw) =>
        (raw ?? [])
          .map((t) => (typeof t === 'string' ? t : (t?.tipo ?? t?.nombreTipo ?? '')))
          .filter((t) => String(t).trim() !== '');
      tiposActuador.value = normalizar(ta);
      tiposSensor.value = normalizar(ts);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarUbicaciones = async () => {
    try {
      const cursos = await obtenerCursosAcademicos(toastMessage, toastColor, isToastOpen);
      const curso = cursos?.[0]?.cursoAcademico ?? cursos?.[0] ?? '';
      if (!curso) {
        ubicaciones.value = [];
        return;
      }

      const [fijos, desdobles, sinDocencia] = await Promise.all([
        obtenerEspaciosFijo(toastMessage, toastColor, isToastOpen, curso),
        obtenerEspaciosDesdoble(toastMessage, toastColor, isToastOpen, curso),
        obtenerEspaciosSinDocencia(toastMessage, toastColor, isToastOpen, curso),
      ]);

      const normalizar = (arr) =>
        (arr ?? [])
          .map((e) =>
            e?.nombreEspacio ?? e?.nombreUbicacion ?? e?.aula ?? e?.nombre ?? e?.descripcion ?? e?.id ?? ''
          )
          .filter((x) => String(x).trim() !== '');

      const mezcla = [...normalizar(fijos), ...normalizar(desdobles), ...normalizar(sinDocencia)];
      ubicaciones.value = Array.from(new Set(mezcla)).sort((a, b) => a.localeCompare(b, 'es'));
    } catch (error) {
      console.error(error);
      ubicaciones.value = [];
    }
  };

  // ---- Carga de la tabla de dispositivos (une actuadores + sensores booleanos + numéricos) ----
  const cargarDispositivos = async () => {
    cargandoTablaDispositivos.value = true;
    try {
      const [actuadores, sensBool, sensNum] = await Promise.all([
        obtenerActuadores(toastMessage, toastColor, isToastOpen),
        obtenerSensorBooleano(toastMessage, toastColor, isToastOpen),
        obtenerSensorNumerico(toastMessage, toastColor, isToastOpen),
      ]);

      const mapaActuador = (a) => ({
        mac: a.mac || '',
        nombreUbicacion: a.nombreUbicacion || '',
        clase: 'ACTUADOR',
        tipo: a.tipo || '',
        estado: a.estado || 'indefinido',
        numeroReles: a.numeroReles ?? 1,
        comandoEstado: a.comandoEstado ?? '',
        estadoProyector: a.estadoProyector ?? '',
        naturaleza: 'BOOLEANO',
        umbralMinimo: 0,
        umbralMaximo: 0,
        valorActual: null,
        ultimaActualizacion: a.ultimaActualizacion ?? null,
        _persistido: true,
        _detallesAbiertos: false,
        _comandos: [],
        _cargandoComandos: false,
        _uid: nextUid(),
      });

      const mapaSensor = (s, naturaleza) => ({
        mac: s.mac || '',
        nombreUbicacion: s.nombreUbicacion || '',
        clase: 'SENSOR',
        tipo: s.tipo || '',
        estado: s.estado || 'indefinido',
        numeroReles: 1,
        comandoEstado: '',
        estadoProyector: '',
        naturaleza,
        umbralMinimo: s.umbralMinimo ?? 0,
        umbralMaximo: s.umbralMaximo ?? 0,
        valorActual: s.valorActual ?? null,
        ultimaActualizacion: s.ultimaActualizacion ?? null,
        _persistido: true,
        _detallesAbiertos: false,
        _comandos: [],
        _cargandoComandos: false,
        _uid: nextUid(),
      });

      dispositivos.value = [
        ...((actuadores ?? []).map(mapaActuador)),
        ...((sensBool ?? []).map((s) => mapaSensor(s, 'BOOLEANO'))),
        ...((sensNum ?? []).map((s) => mapaSensor(s, 'NUMERICO'))),
      ];
      asegurarFilaVaciaDispositivos();
    } catch (error) {
      console.error(error);
      dispositivos.value = [];
      asegurarFilaVaciaDispositivos();
    } finally {
      cargandoTablaDispositivos.value = false;
    }
  };

  // Al cambiar la clase (Actuador/Sensor) de una fila nueva, reseteamos los campos condicionales
  const onCambioClase = (dispositivo) => {
    dispositivo.tipo = '';
    dispositivo.numeroReles = 1;
    dispositivo.comandoEstado = '';
    dispositivo.naturaleza = 'BOOLEANO';
    dispositivo.umbralMinimo = 0;
    dispositivo.umbralMaximo = 0;
  };

  // ---- Guardado (upsert) de un dispositivo ----
  const guardarDispositivoFila = async (dispositivo) => {
    const mac = (dispositivo.mac || '').trim();
    if (!mac) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'La MAC es obligatoria para guardar el dispositivo');
      return;
    }
    if (!dispositivo.nombreUbicacion) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Selecciona una ubicación');
      return;
    }
    if (!dispositivo.tipo) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Selecciona un tipo');
      return;
    }

    try {
      if (dispositivo.clase === 'ACTUADOR') {
        if (esTipoPuertaVal(dispositivo.tipo)) {
          const nReles = Number(dispositivo.numeroReles);
          if (!(nReles >= 1)) {
            crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El número de relés debe ser mayor o igual que 1');
            return;
          }
          await crearActuadorPuerta(toastMessage, toastColor, isToastOpen, mac, dispositivo.estado, dispositivo.nombreUbicacion, dispositivo.tipo, nReles);
        } else if (esTipoProyectorVal(dispositivo.tipo)) {
          if (!(dispositivo.comandoEstado || '').trim()) {
            crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Indica el comando de estado del proyector');
            return;
          }
          await crearActuadorProyector(toastMessage, toastColor, isToastOpen, mac, dispositivo.estado, dispositivo.nombreUbicacion, dispositivo.tipo, dispositivo.comandoEstado);
        } else {
          await crearActuador(toastMessage, toastColor, isToastOpen, mac, dispositivo.estado, dispositivo.nombreUbicacion, dispositivo.tipo);
        }
      } else {
        const min = Number(dispositivo.umbralMinimo);
        const max = Number(dispositivo.umbralMaximo);
        if (!(min < max)) {
          crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El umbral mínimo debe ser menor que el máximo');
          return;
        }
        if (dispositivo.naturaleza === 'NUMERICO') {
          await crearSensorNumerico(toastMessage, toastColor, isToastOpen, mac, dispositivo.estado, dispositivo.nombreUbicacion, dispositivo.tipo, min, max);
        } else {
          await crearSensorBooleano(toastMessage, toastColor, isToastOpen, mac, dispositivo.estado, dispositivo.nombreUbicacion, dispositivo.tipo, min, max);
        }
      }

      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Dispositivo guardado con éxito');
      await cargarDispositivos();
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo guardar el dispositivo');
    }
  };

  // ---- Borrado de un dispositivo (según su clase/tipo) ----
  const borrarDispositivoBackend = async (dispositivo) => {
    if (dispositivo.clase === 'ACTUADOR') {
      if (esTipoPuertaVal(dispositivo.tipo)) {
        await eliminarActuadorPuerta(toastMessage, toastColor, isToastOpen, dispositivo.mac);
      } else if (esTipoProyectorVal(dispositivo.tipo)) {
        await eliminarActuadorProyector(toastMessage, toastColor, isToastOpen, dispositivo.mac);
      } else {
        await eliminarActuador(toastMessage, toastColor, isToastOpen, dispositivo.mac);
      }
    } else if (dispositivo.naturaleza === 'NUMERICO') {
      await eliminarSensorNumerico(toastMessage, toastColor, isToastOpen, dispositivo.mac);
    } else {
      await eliminarSensorBooleano(toastMessage, toastColor, isToastOpen, dispositivo.mac);
    }
  };

  const borrarDispositivoFila = async (dispositivo) => {
    if (!dispositivo._persistido) {
      return;
    }
    if (!window.confirm(`¿Borrar el dispositivo "${dispositivo.mac}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await borrarDispositivoBackend(dispositivo);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Dispositivo borrado con éxito');
      await cargarDispositivos();
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo borrar el dispositivo');
    }
  };

  // Borra TODOS los dispositivos iterando en cliente (el backend no expone un "borrar todos" para domótica).
  const borrarTodosDispositivos = async () => {
    if (!hayDispositivos.value) {
      return;
    }
    if (!window.confirm('Se borrarán TODOS los dispositivos de domótica. ¿Continuar?')) {
      return;
    }
    cargandoTablaDispositivos.value = true;
    try {
      const persistidos = dispositivos.value.filter((d) => d._persistido);
      let borrados = 0;
      for (const d of persistidos) {
        try {
          await borrarDispositivoBackend(d);
          borrados++;
        } catch (error) {
          console.error(error);
        }
      }
      crearToast(toastMessage, toastColor, isToastOpen, 'success', `Dispositivos borrados: ${borrados}`);
      await cargarDispositivos();
    } finally {
      cargandoTablaDispositivos.value = false;
    }
  };

  // ---- Subtabla de comandos (ComandoActuador / ComandoActuadorPuerta) ----
  const alternarDetalles = async (dispositivo) => {
    dispositivo._detallesAbiertos = !dispositivo._detallesAbiertos;
    if (dispositivo._detallesAbiertos) {
      await cargarComandosDispositivo(dispositivo);
    }
  };

  const cargarComandosDispositivo = async (dispositivo) => {
    dispositivo._cargandoComandos = true;
    try {
      const [resp, relaciones] = await Promise.all([
        obtenerComandosActuador(toastMessage, toastColor, isToastOpen, 0, 1000),
        obtenerComandosActuadorPuerta(toastMessage, toastColor, isToastOpen),
      ]);

      const mapaReles = new Map();
      for (const rel of (relaciones ?? [])) {
        const m = rel?.comandoActuadorMac ?? rel?.mac ?? '';
        const k = rel?.comandoActuadorKeyword ?? rel?.keyword ?? '';
        const idx = rel?.indiceRele ?? null;
        mapaReles.set(`${m}__${k}`, idx);
      }

      const contenido = (resp?.content ?? (Array.isArray(resp) ? resp : []))
        .filter((c) => c.mac === dispositivo.mac);

      dispositivo._comandos = contenido.map((c) => ({
        keyword: c.keyword || '',
        comandos: c.comandos || '',
        textoOk: c.textoOk || '',
        indiceRele: mapaReles.get(`${c.mac}__${c.keyword}`) ?? null,
        _persistido: true,
        _uid: nextUid(),
      }));
      asegurarFilaVaciaComandos(dispositivo);
    } catch (error) {
      console.error(error);
      dispositivo._comandos = [];
      asegurarFilaVaciaComandos(dispositivo);
    } finally {
      dispositivo._cargandoComandos = false;
    }
  };

  const guardarComandoFila = async (dispositivo, cmd) => {
    if (!cmd.keyword || cmd.keyword.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'La keyword es obligatoria');
      return;
    }
    if (!cmd.comandos || cmd.comandos.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El comando es obligatorio');
      return;
    }
    if (!cmd.textoOk || cmd.textoOk.trim() === '') {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'El texto OK es obligatorio');
      return;
    }
    if (esTipoPuertaVal(dispositivo.tipo) && (cmd.indiceRele === null || cmd.indiceRele === undefined || cmd.indiceRele === '')) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Selecciona el número de relé');
      return;
    }

    try {
      await crearComandoActuador(toastMessage, toastColor, isToastOpen, dispositivo.mac, cmd.keyword, cmd.comandos, cmd.textoOk);
      if (esTipoPuertaVal(dispositivo.tipo)) {
        await crearComandoActuadorPuerta(toastMessage, toastColor, isToastOpen, dispositivo.mac, cmd.keyword, Number(cmd.indiceRele));
      }
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Comando guardado con éxito');
      await cargarComandosDispositivo(dispositivo);
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo guardar el comando');
    }
  };

  const borrarComandoFila = async (dispositivo, cmd) => {
    if (!cmd._persistido) {
      return;
    }
    if (!window.confirm(`¿Borrar el comando "${cmd.keyword}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      if (cmd.indiceRele !== null && cmd.indiceRele !== undefined && cmd.indiceRele !== '') {
        await eliminarComandoActuadorPuerta(toastMessage, toastColor, isToastOpen, dispositivo.mac, cmd.keyword, cmd.indiceRele);
      }
      await eliminarComandoActuador(toastMessage, toastColor, isToastOpen, dispositivo.mac, cmd.keyword);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Comando borrado con éxito');
      await cargarComandosDispositivo(dispositivo);
    } catch (error) {
      console.error(error);
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'No se pudo borrar el comando');
    }
  };

  // ---- Exportación a CSV de los dispositivos mostrados (filtrados + ordenados) ----
  const exportarDispositivosCsv = () => {
    const cabeceras = ['MAC', 'Ubicación', 'Clase', 'Tipo', 'Naturaleza', 'Nº relés', 'Comando estado', 'Umbral mínimo', 'Umbral máximo', 'Estado'];
    const filas = dispositivosMostrados.value
      .filter((d) => d._persistido)
      .map((d) => [
        d.mac,
        d.nombreUbicacion,
        d.clase === 'SENSOR' ? 'Sensor' : 'Actuador',
        d.tipo,
        d.clase === 'SENSOR' ? (d.naturaleza === 'NUMERICO' ? 'Numérico' : 'Booleano') : '',
        d.clase === 'ACTUADOR' && esTipoPuertaVal(d.tipo) ? d.numeroReles : '',
        d.clase === 'ACTUADOR' && esTipoProyectorVal(d.tipo) ? d.comandoEstado : '',
        d.clase === 'SENSOR' ? d.umbralMinimo : '',
        d.clase === 'SENSOR' ? d.umbralMaximo : '',
        d.estado,
      ]);

    if (filas.length === 0) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'No hay dispositivos para exportar');
      return;
    }

    descargarCsv('dispositivos.csv', cabeceras, filas);
  };

  onMounted(async () => {
    await Promise.all([
      cargarUsuarios(),
      cargarApps(),
      cargarResolutores(),
      cargarTiposDispositivos(),
      cargarUbicaciones(),
      cargarDispositivos(),
    ]);
  });
</script>

<style scoped>
.page-admin-firebase {
  max-width: 1400px;
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

.col-gasto {
  white-space: nowrap;
  min-width: 90px;
  text-align: center;
}

/* ---- Usuarios: tabla de resumen + ficha lateral de edición ---- */
.btn-with-icon,
.user-drawer-save {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-with-icon ion-icon,
.user-drawer-save ion-icon {
  font-size: 17px;
}

.user-summary-scroll {
  max-height: 520px;
}

table.user-summary-table {
  min-width: 900px;
  table-layout: fixed;
}

.user-summary-table th,
.user-summary-table td {
  text-align: center;
}

.user-summary-table .user-col-identity {
  width: 235px;
  min-width: 235px;
}

.user-summary-table .user-col-department {
  width: 145px;
  min-width: 145px;
}

.user-summary-table .user-col-access {
  min-width: 260px;
}

.user-summary-table .user-col-status {
  width: 94px;
  min-width: 94px;
}

.user-summary-table .user-col-activity {
  width: 190px;
  min-width: 190px;
}

.user-summary-table .user-col-actions {
  width: 82px;
  min-width: 82px;
}

.user-summary-table td {
  padding-block: 11px;
  vertical-align: middle;
}

.user-identity,
.user-access-summary,
.user-activity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  align-items: center;
}

.user-identity strong,
.user-identity span,
.user-activity span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-identity strong {
  font-size: 0.92rem;
}

.user-identity span,
.user-access-summary small,
.user-activity small,
.user-muted {
  color: #5c6773;
  font-size: 0.76rem;
}

.user-role-list {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.user-role-chip,
.user-permission-chip {
  display: inline-block;
  padding: 3px 7px;
  border: 1px solid #9ac8f1;
  border-radius: 999px;
  background: #dceeff;
  color: #164f82;
  font-size: 0.69rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
}

.user-permission-chip {
  border-color: #b7a1e6;
  background: #eee8ff;
  color: #573b8f;
}

.user-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.user-status--activo {
  background: #d9f5e5;
  color: #17653a;
}

.user-status--pendiente {
  background: #fff0ca;
  color: #805b00;
}

.user-status--inactivo {
  background: #e4e7eb;
  color: #4b5563;
}

.user-summary-actions {
  grid-template-columns: repeat(2, 32px);
}

.user-summary-actions .btn-delete-icon ion-icon {
  font-size: 16px;
}

.app-summary-scroll {
  max-height: 520px;
}

table.app-summary-table {
  min-width: 900px;
  table-layout: fixed;
}

.app-summary-table th,
.app-summary-table td {
  text-align: center;
}

.app-summary-table .app-col-actions {
  width: 82px;
  min-width: 82px;
}

.app-summary-table .app-col-identity {
  width: 245px;
  min-width: 245px;
}

.app-summary-table .app-col-access {
  min-width: 255px;
}

.app-summary-table .app-col-notifications {
  width: 315px;
  min-width: 315px;
}

.app-summary-table .app-col-activity {
  width: 190px;
  min-width: 190px;
}

.app-summary-table td {
  padding-block: 11px;
  vertical-align: middle;
}

.app-identity {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.app-identity strong,
.app-client-id {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-identity strong {
  font-size: 0.92rem;
}

.app-client-id {
  color: #5c6773;
  font-size: 0.76rem;
}

.app-client-id.is-masked {
  letter-spacing: 0.12em;
}

.app-role-list,
.app-notification-list {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

.app-notification-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border: 1px solid #9bc7ae;
  border-radius: 6px;
  background: #e5f5eb;
  color: #225c39;
  font-size: 0.7rem;
  white-space: nowrap;
}

.app-notification-chip strong {
  font-weight: 800;
}

.user-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.46);
  backdrop-filter: blur(2px);
}

.user-drawer {
  display: flex;
  flex-direction: column;
  width: min(570px, 100%);
  height: 100vh;
  height: 100dvh;
  background: #f7f9fc;
  color: #1f2937;
  box-shadow: -18px 0 40px rgba(15, 23, 42, 0.24);
}

.user-drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.5rem 1.2rem;
  border-bottom: 1px solid #d8e0ea;
  background: #fff;
}

.user-drawer-header p,
.user-drawer-header h3,
.user-drawer-header span {
  margin: 0;
}

.user-drawer-header p {
  margin-bottom: 4px;
  color: #1976c9;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.user-drawer-header h3 {
  color: #172033;
  font-size: 1.35rem;
  line-height: 1.25;
}

.user-drawer-header span {
  display: block;
  margin-top: 5px;
  color: #667085;
  font-size: 0.84rem;
}

.user-drawer-close {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f1f5f9;
  color: #334155;
  cursor: pointer;
}

.user-drawer-close:hover {
  background: #e2e8f0;
}

.user-drawer-close ion-icon {
  font-size: 21px;
}

.user-drawer-form {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.user-drawer-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  padding: 1.15rem 1.5rem 1.5rem;
  overflow-y: auto;
}

.user-form-section {
  padding: 1rem;
  border: 1px solid #d8e0ea;
  border-radius: 10px;
  background: #fff;
}

.user-form-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.user-form-section-heading h4 {
  margin: 0;
  color: #172033;
  font-size: 0.95rem;
}

.user-form-section-heading span {
  color: #7a8494;
  font-size: 0.72rem;
}

.user-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.user-form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.user-form-field-wide {
  grid-column: 1 / -1;
}

.user-form-field > span,
.user-resolvers-label {
  color: #475467;
  font-size: 0.75rem;
  font-weight: 700;
}

.user-form-field input,
.user-form-field select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 9px 10px;
  border: 1px solid #aebccc;
  border-radius: 6px;
  background: #fff;
  color: #111827;
  font: inherit;
  font-size: 0.85rem;
  outline: none;
}

.user-form-field input:focus,
.user-form-field select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.user-form-field input:disabled {
  background: #eef2f6;
  color: #64748b;
}

.user-resolvers-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 0.9rem;
}

.user-resolvers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.user-resolver-option {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid #d8e0ea;
  border-radius: 6px;
  background: #f8fafc;
  color: #344054;
  cursor: pointer;
  font-size: 0.78rem;
}

.user-resolver-option input {
  flex: none;
  accent-color: #1976d2;
}

.user-resolver-option span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.user-metrics > div {
  min-width: 0;
  padding: 9px;
  border-radius: 7px;
  background: #f2f6fa;
}

.user-metrics dt {
  color: #667085;
  font-size: 0.68rem;
}

.user-metrics dd {
  margin: 4px 0 0;
  overflow: hidden;
  color: #1d2939;
  font-size: 0.78rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-drawer-footer {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.5rem;
  border-top: 1px solid #d8e0ea;
  background: #fff;
}

.user-drawer-footer-spacer {
  flex: 1;
}

.user-drawer-delete {
  padding: 8px 12px;
}

.user-drawer-save {
  width: auto;
  margin-top: 0;
  padding: 9px 14px;
  font-size: 12px;
}

.app-notification-editor {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.app-notification-editor-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 9px 10px;
  border: 1px solid #d8e0ea;
  border-radius: 7px;
  background: #f8fafc;
}

.app-notification-editor-row > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.app-notification-editor-row strong {
  color: #26364a;
  font-size: 0.8rem;
}

.app-notification-editor-row span,
.app-notification-max {
  color: #667085;
  font-size: 0.74rem;
}

.app-notification-hint {
  margin: 9px 0 0;
  color: #667085;
  font-size: 0.72rem;
  line-height: 1.4;
}

.app-metrics {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* ---- Cabecera agrupada "Notificaciones" (dos filas de <thead> en la tabla de aplicaciones) ---- */
/* La primera fila de cabecera queda pegada arriba (top: 0) y la segunda (subcabeceras Calendar/Email/Web)
   se pega justo debajo. Al ser todas las celdas de cabecera del mismo azul, un desfase mínimo del offset
   resulta imperceptible y no rompe el scroll horizontal ni la ordenación. */
/* La primera fila del thead (grupo) se pega arriba con una altura fija y determinista, de modo que
   la segunda fila (subcabeceras Calendar/Email/Web) pueda pegarse EXACTAMENTE debajo sin dejar
   sliver del cuerpo ni solaparse. */
.thead-apps tr.fila-grupo th {
  top: 0;
  height: 34px;
  padding-top: 6px;
  padding-bottom: 6px;
  box-sizing: border-box;
}

.thead-apps tr.fila-subcabecera th {
  top: 34px;
}

.col-notif-grupo {
  text-align: center;
  min-width: 360px;
  letter-spacing: 0.02em;
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

/* Stepper (− valor +) para editar el "max" de notificaciones sin persistir en vivo */
.notif-stepper {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stepper-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #b6c2d4;
  border-radius: 4px;
  background-color: #e2e8f0;
  color: #1a3c6e;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.stepper-btn:hover {
  background-color: #cbd5e1;
}

.stepper-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #e2e8f0;
}

.stepper-val {
  min-width: 26px;
  text-align: center;
  font-weight: 600;
}

/* Valor "max" en modo solo lectura (apps sin el rol APLICACION_NOTIFICACIONES: sin controles +/−) */
.notif-max-ro {
  min-width: 26px;
  text-align: center;
  font-weight: 600;
}

.notif-vacio {
  opacity: 0.6;
}

/* Botón de autorización de Gmail OAuth (icono de correo), junto al botón refrescar de
   Aplicaciones registradas. Reutiliza el chrome de .btn-refresh; solo tinta el icono con el
   rojo característico de Gmail para diferenciarlo del refrescar. */
.btn-gmail-oauth {
  color: #d93025;
}

.btn-gmail-oauth ion-icon {
  font-size: 18px;
}

.btn-client-id-visibility {
  color: #475569;
}

.btn-client-id-visibility.is-active {
  color: #075985;
  border-color: #60a5fa;
  background-color: #dbeafe;
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

.cell-checkbox {
  width: 17px;
  height: 17px;
  cursor: pointer;
  accent-color: #007bff;
}

/* ---- Columna "Resolutor" de la tabla de usuarios: desplegable de selección múltiple ---- */
/* El panel se despliega EN FLUJO (no absoluto) porque .table-scroll recorta con overflow su contenido,
   de modo que la fila crece al abrirlo en lugar de quedar el panel oculto tras el borde de la tabla. */
.col-resolutores {
  min-width: 150px;
}

.multi-select {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}

.multi-select-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 6px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #000;
  font: inherit;
  cursor: pointer;
}

.multi-select-toggle:hover {
  border-color: #007bff;
}

.multi-select-texto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-select-flecha {
  font-size: 11px;
  line-height: 1;
}

.multi-select-panel {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 132px;
  overflow-y: auto;
  padding: 5px 6px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: left;
}

.multi-select-opcion {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.multi-select-opcion input {
  cursor: pointer;
  accent-color: #007bff;
}

.multi-select-vacio {
  margin: 0;
  color: #666;
  font-size: 12px;
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

/* ---- Control de importación compacto (FileUpload) integrado en la barra de acciones de la tabla ---- */
/* Reutiliza el componente FileUpload (drag & drop + selección en disco) pero comprimido al tamaño de
   los botones de la barra (algo más ancho). Se estiliza vía :deep porque FileUpload usa estilos scoped. */
.import-inline {
  display: inline-flex;
  align-items: stretch;
  max-width: 210px;
}

.import-inline :deep(.file-drop-area) {
  min-height: 0;
  width: 100%;
  padding: 6px 14px;
  border-width: 2px;
  border-radius: 6px;
  background-color: #e2e8f0;
  border-color: #b6c2d4;
  color: #1a3c6e;
}

.import-inline :deep(.file-drop-area.dragging) {
  border-color: #1a3c6e;
  background-color: #cbd5e1;
}

.import-inline :deep(.file-drop-area p) {
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- Domótica: celda de configuración condicional y subtabla de comandos ---- */
.btn-detalles {
  width: 30px;
  min-width: 30px;
  padding: 5px 0;
  font-size: 16px;
  line-height: 1;
  text-transform: none;
}

.col-config {
  min-width: 210px;
}

.config-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.config-cell-sensor {
  flex-wrap: wrap;
}

.config-label {
  font-size: 11px;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.cell-input-num {
  max-width: 78px;
  min-width: 58px;
}

.cell-input-nat {
  max-width: 108px;
  min-width: 90px;
}

.config-empty {
  opacity: 0.6;
}

.fila-detalles > .celda-detalles {
  padding: 0;
  background-color: #dceafe;
}

.detalles-wrap {
  padding: 10px 14px 14px;
}

.detalles-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.detalles-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-refresh-sm {
  width: 26px;
  height: 26px;
  font-size: 15px;
}

.tabla-sub {
  font-size: 12px;
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
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label { color: var(--text-color-dark); }
  .empty-state { background-color: #2a302b; border-color: #555; color: #c8c8c8; }
  .import-inline :deep(.file-drop-area) {
    background-color: #3a4048;
    color: #e6ebf1;
    border-color: #5a616b;
  }
  .import-inline :deep(.file-drop-area.dragging) {
    background-color: #474e57;
    border-color: #e6ebf1;
  }
  .config-label { color: #c8c8c8; }
  .fila-detalles > .celda-detalles { background-color: #20262e; }
  .detalles-title { color: var(--text-color-dark); }
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
  .btn-gmail-oauth { color: #f28b82; }
  .btn-client-id-visibility { color: #cbd5e1; }
  .btn-client-id-visibility.is-active {
    color: #bae6fd;
    border-color: #0284c7;
    background-color: #0c4a6e;
  }
  .search-input {
    background-color: #1f2937;
    color: #e6ebf1;
    border-color: #3b82f6;
  }
  .stepper-btn {
    background-color: #3a4048;
    color: #e6ebf1;
    border-color: #5a616b;
  }
  .stepper-btn:hover { background-color: #474e57; }
  .stepper-btn:disabled,
  .stepper-btn:disabled:hover { background-color: #3a4048; }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
  .user-identity span,
  .user-access-summary small,
  .user-activity small,
  .user-muted { color: #aeb8c6; }
  .user-role-chip { background: #173f63; border-color: #2f6692; color: #d9efff; }
  .user-permission-chip { background: #3d315c; border-color: #75649e; color: #eee8ff; }
  .app-client-id { color: #aeb8c6; }
  .app-notification-chip { background: #1e4831; border-color: #397252; color: #d8f3e2; }
  .user-status--activo { background: #174b31; color: #baf2d1; }
  .user-status--pendiente { background: #5e470e; color: #ffe29a; }
  .user-status--inactivo { background: #454b54; color: #e1e5ea; }
  .user-drawer { background: #171c24; color: #e5eaf0; }
  .user-drawer-header,
  .user-form-section,
  .user-drawer-footer { background: #232a34; border-color: #3f4a58; }
  .user-drawer-header h3,
  .user-form-section-heading h4 { color: #f2f5f8; }
  .user-drawer-header span,
  .user-form-section-heading span { color: #aab5c3; }
  .user-drawer-close { background: #303946; border-color: #526071; color: #e5eaf0; }
  .user-drawer-close:hover { background: #3c4654; }
  .user-form-field > span,
  .user-resolvers-label { color: #c4ceda; }
  .user-form-field input,
  .user-form-field select { background: #171c24; border-color: #596779; color: #f1f5f9; }
  .user-form-field input:disabled { background: #303946; color: #abb6c4; }
  .user-resolver-option { background: #1b222c; border-color: #465364; color: #e0e6ed; }
  .app-notification-editor-row { background: #1b222c; border-color: #465364; }
  .app-notification-editor-row strong { color: #e0e6ed; }
  .app-notification-editor-row span,
  .app-notification-max,
  .app-notification-hint { color: #aab5c3; }
  .user-metrics > div { background: #1b222c; }
  .user-metrics dt { color: #aab5c3; }
  .user-metrics dd { color: #f1f5f9; }
}

@media (max-width: 1024px) {
  .import-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-admin-firebase { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .tabla-datos { font-size: 14px; }
  .search-input { max-width: 100%; flex: 1 1 100%; }
  table.user-summary-table,
  table.app-summary-table { min-width: 950px; font-size: 13px; }
  .user-drawer-header { padding: 1.1rem; }
  .user-drawer-content { padding: 1rem; }
  .user-drawer-footer { padding: 0.85rem 1rem; }
}

@media (max-width: 540px) {
  .user-form-grid,
  .user-resolvers-grid,
  .user-metrics { grid-template-columns: 1fr; }
  .user-form-field-wide { grid-column: auto; }
  .user-form-section-heading { align-items: flex-start; flex-direction: column; gap: 3px; }
  .user-drawer-footer { flex-wrap: wrap; }
  .user-drawer-delete { order: 3; width: 100%; }
  .user-drawer-footer-spacer { display: none; }
  .user-drawer-footer .btn-secondary,
  .user-drawer-save { flex: 1; }
}
</style>
