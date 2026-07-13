<template>
  <div class="page-admin-firebase">
    <header class="page-header">
      <h1 class="t-1">Administración de Firebase</h1>
      <p class="page-subtitle">
        Inserta usuarios y aplicaciones de forma masiva mediante ficheros y gestiona las constantes de
        configuración de los microservicios.
      </p>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Inserciones masivas</h2>

        <div class="actions-grid">
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

        <div v-if="cargandoUsuarios || cargandoApps" class="fondo-gris">
          <div class="circulo"></div>
        </div>
      </section>

      <div class="panel-divider" aria-hidden="true"></div>

      <!-- Gestión de constantes -->
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
  import { IonToast } from '@ionic/vue';
  import { ref, computed, onMounted } from 'vue';
  import FileUpload from '@/components/printers/FileUpload.vue';
  import { importarUsuarios, importarAplicaciones, obtenerConstantes, actualizarConstante } from '@/services/firebaseService';
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
    } catch (error) {
      console.error(error);
    } finally {
      cargandoApps.value = false;
    }
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
    await cargarConstantes();
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

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: stretch;
}

.action-card {
  display: flex;
  flex-direction: column;
  min-height: 100%;
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
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

@media (max-width: 1024px) {
  .constantes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-admin-firebase { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .actions-grid { grid-template-columns: 1fr; }
  .constantes-grid { grid-template-columns: 1fr; }
}
</style>
