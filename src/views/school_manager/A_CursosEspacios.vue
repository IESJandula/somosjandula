<template>
  <div class="page-cursos-espacios">
    <header class="page-header">
      <h1 class="t-1">Cursos y espacios</h1>
      <p class="page-subtitle">
        Selecciona el curso académico activo, crea espacios sin docencia y gestiona el listado del curso.
      </p>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Acciones</h2>

        <div class="actions-grid">
          <!-- Elección de curso académico -->
          <article class="action-card">
            <h3 class="card-title">Elige curso académico</h3>
            <div class="card-body">
              <div class="field">
                <label for="curso-elegido">Curso académico</label>
                <select id="curso-elegido" v-model="cursoElegido" class="custom-select">
                  <option
                    v-for="curso in cursos"
                    :key="curso.cursoAcademico"
                    :value="curso.cursoAcademico"
                  >
                    {{ curso.cursoAcademico }}
                  </option>
                </select>
              </div>
            </div>
          </article>

          <!-- Creador de espacios -->
          <article class="action-card">
            <h3 class="card-title">Creador de espacios</h3>
            <div class="card-body">
              <div class="field">
                <label for="nombre-espacio">Nombre</label>
                <input id="nombre-espacio" type="text" v-model="nombre" />
              </div>
              <button type="button" class="btn-primary" @click="crearEspacio">
                Crear
              </button>
            </div>
          </article>

          <!-- Copiar espacios -->
          <article class="action-card">
            <h3 class="card-title">Copiar espacios de curso académico</h3>
            <div class="card-body">
              <div class="field">
                <label for="curso-origen">Origen</label>
                <select id="curso-origen" v-model="cursoOrigen" class="custom-select">
                  <option disabled :value="null">Selecciona un curso académico</option>
                  <option
                    v-for="curso in cursos"
                    :key="'origen-' + curso.cursoAcademico"
                    :value="curso.cursoAcademico"
                  >
                    {{ curso.cursoAcademico }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label for="curso-destino">Destino</label>
                <select id="curso-destino" v-model="cursoDestino" class="custom-select">
                  <option disabled :value="null">Selecciona un curso académico</option>
                  <option
                    v-for="curso in cursos"
                    :key="'destino-' + curso.cursoAcademico"
                    :value="curso.cursoAcademico"
                  >
                    {{ curso.cursoAcademico }}
                  </option>
                </select>
              </div>

              <button type="button" class="btn-primary" @click="copiarEspacios">
                Copiar
              </button>
            </div>
          </article>
        </div>
      </section>

      <div class="panel-divider" aria-hidden="true"></div>

      <section class="panel-section listado-section">
        <div class="listado-header">
          <div>
            <h2 class="section-title section-title-inline">Listado de espacios</h2>
            <p v-if="cursoElegido" class="listado-context">
              Curso académico: <strong>{{ cursoElegido }}</strong>
            </p>
          </div>
          <button
            type="button"
            class="btn-delete btn-borrar-todos"
            :disabled="!cursoElegido"
            @click="borrarTodosEspacios"
          >
            Borrar todos de este curso académico
          </button>
        </div>

        <div class="table-scroll" v-if="espaciosOrdenados.length > 0">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="e in espaciosOrdenados" :key="e.nombre">
                <td>{{ e.nombre }}</td>
                <td>
                  <button type="button" class="btn-delete" @click="eliminarEspacio(e)">
                    X
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="empty-state">No hay espacios creados para este curso académico.</p>
      </section>
    </div>
  </div>

  <!-- TOAST -->
  <IonToast
    :is-open="isToastOpen"
    :message="toastMessage"
    :color="toastColor"
    duration="2000"
    position="top"
    @didDismiss="isToastOpen = false"
  />
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { IonToast } from "@ionic/vue";
import {
  obtenerCursosAcademicos,
  seleccionarCursoAcademico,
  crearEspacioSinDocencia,
  obtenerEspaciosSinDocencia,
  borrarEspacioSinDocencia,
  copiarEspaciosCursoAcademico,
  borrarTodosEspaciosCursoAcademico
} from "@/services/schoolManager";

// ====================
// VARIABLES
// ====================
const cursoElegido = ref(null);
const cursos = ref([]);
const nombre = ref("");

const cursoOrigen = ref(null);
const cursoDestino = ref(null);

const espacios = ref([]);

const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

let inicializandoCurso = true;

// ====================
// TOAST FIABLE
// ====================
const lanzarToast = (color, mensaje) => {
  isToastOpen.value = false;
  setTimeout(() => {
    toastColor.value = color;
    toastMessage.value = mensaje;
    isToastOpen.value = true;
  }, 10);
};

// ====================
// COMPUTED
// ====================
const espaciosOrdenados = computed(() => {
  return [...espacios.value].sort((a, b) => a.nombre.localeCompare(b.nombre));
});

// ====================
// WATCH
// ====================
watch(cursoElegido, async (nuevoCurso, cursoAnterior) => {
  if (inicializandoCurso) return;
  if (!nuevoCurso || nuevoCurso === cursoAnterior) return;
  try {
    await seleccionarCursoAcademico(
      toastMessage,
      toastColor,
      isToastOpen,
      nuevoCurso
    );

    // NUEVO: guardar y notificar cambio para otras vistas
    localStorage.setItem("cursoAcademicoSeleccionado", nuevoCurso);
    window.dispatchEvent(
      new CustomEvent("curso-academico-cambiado", {
        detail: { cursoAcademico: nuevoCurso }
      })
    );

    await cargarEspacios();
  } catch (error) {
    lanzarToast("danger", error.message);
  }
});

// ====================
// FUNCIONES
// ====================
const cargarEspacios = async () => {
  try {
    const sinDocencia = await obtenerEspaciosSinDocencia(
      toastMessage,
      toastColor,
      isToastOpen,
      cursoElegido.value
    );

    espacios.value = sinDocencia.map(e => ({ nombre: e.nombre }));

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const obtenerCursosAcademicosVista = async () => {
  try {
    const data = await obtenerCursosAcademicos(
      isToastOpen,
      toastMessage,
      toastColor
    );

    cursos.value = data;

    const cursoSeleccionado = data.find(
      (curso) => curso.seleccionado === true
    );

    if (cursoSeleccionado) {
      await nextTick();
      cursoElegido.value = cursoSeleccionado.cursoAcademico;
      localStorage.setItem("cursoAcademicoSeleccionado", cursoSeleccionado.cursoAcademico);
    }
  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const crearEspacio = async () => {
  if (!nombre.value.trim()) {
    lanzarToast("danger", "Introduce un nombre");
    return;
  }

  try {
    const dto = {
      cursoAcademico: cursoElegido.value,
      nombre: nombre.value.trim()
    };

    await crearEspacioSinDocencia(toastMessage, toastColor, isToastOpen, dto);

    lanzarToast("success", "Espacio creado correctamente");

    await cargarEspacios();

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const eliminarEspacio = async (espacio) => {
  try {
    const dto = {
      cursoAcademico: cursoElegido.value,
      nombre: espacio.nombre
    };

    await borrarEspacioSinDocencia(toastMessage, toastColor, isToastOpen, dto);

    lanzarToast("success", "Espacio eliminado correctamente");

    await cargarEspacios();

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const borrarTodosEspacios = async () => {
  if (!cursoElegido.value) {
    lanzarToast("danger", "Selecciona un curso académico");
    return;
  }

  if (!window.confirm(`¿Borrar TODOS los espacios del curso académico ${cursoElegido.value}? Esta acción no se puede deshacer.`)) {
    return;
  }

  try {
    await borrarTodosEspaciosCursoAcademico(
      toastMessage,
      toastColor,
      isToastOpen,
      cursoElegido.value
    );

    lanzarToast("success", "Espacios borrados correctamente");

    await cargarEspacios();

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

const copiarEspacios = async () => {
  if (!cursoOrigen.value || !cursoDestino.value) {
    lanzarToast("danger", "Selecciona el curso académico de origen y de destino");
    return;
  }

  if (cursoOrigen.value === cursoDestino.value) {
    lanzarToast("danger", "El origen y el destino no pueden ser el mismo curso académico");
    return;
  }

  try {
    await copiarEspaciosCursoAcademico(
      toastMessage,
      toastColor,
      isToastOpen,
      cursoOrigen.value,
      cursoDestino.value
    );

    lanzarToast("success", "Espacios copiados correctamente");

    if (cursoDestino.value === cursoElegido.value) {
      await cargarEspacios();
    }

  } catch (error) {
    lanzarToast("danger", error.message);
  }
};

onMounted(async () => {
  await obtenerCursosAcademicosVista();
  await cargarEspacios();
  inicializandoCurso = false;
});
</script>

<style scoped>
.page-cursos-espacios {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: "Roboto", sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.page-subtitle {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: #555;
  max-width: 640px;
  margin-inline: auto;
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

.section-title-inline {
  text-align: left;
  margin-bottom: 0.35rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cfd8e3 15%, #cfd8e3 85%, transparent);
  margin: 1.75rem 0;
}

.listado-section {
  padding-top: 0.25rem;
}

.listado-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.listado-context {
  margin: 0;
  font-size: 0.95rem;
  color: #555;
}

.empty-state {
  margin: 0;
  padding: 1.25rem;
  text-align: center;
  color: #666;
  background-color: #f8f9fa;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
}

/* BOTONES */
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

.btn-delete {
  padding: 5px 10px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.btn-delete:disabled {
  background-color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-borrar-todos {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

/* TABLA */
table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}

th,
td {
  border: 2px solid #007bff;
  padding: 8px 6px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

td {
  background-color: #e9f5ff;
  height: 38px;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
}

tr:hover td {
  background-color: #d0eaff;
}

table tbody {
  display: block;
  max-height: 280px;
  overflow-y: auto;
  width: 100%;
}

table thead,
table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

/* MODO OSCURO */
@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .section-title {
    color: var(--text-color-dark);
  }

  .page-subtitle,
  .listado-context,
  .empty-state {
    color: #c8c8c8;
  }

  .action-card {
    background-color: #2a302b;
    border-color: #555;
  }

  .card-title,
  .field label {
    color: var(--text-color-dark);
  }

  .empty-state {
    background-color: #2a302b;
    border-color: #555;
  }

  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-card:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .page-cursos-espacios {
    padding-inline: 0.75rem;
  }

  .main-panel {
    padding: 1rem;
  }

  .t-1 {
    font-size: 1.75rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-card:last-child {
    grid-column: auto;
  }

  .listado-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-borrar-todos {
    width: 100%;
    white-space: normal;
  }

  table {
    font-size: 14px;
  }
}
</style>
