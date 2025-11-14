<template>
  <h1 class="t-1">Gestión de Incidencias TIC</h1>

  <div class="top-container">
    <div class="top-section" :class="{ 'admin-layout': esAdmin }">
      
      <!-- Tarjeta para crear incidencia -->
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva incidencia</div>

          <div class="section">
            <label class="t-3">Ubicación</label>
            <select v-model="nuevaIncidencia.ubicacion" class="input">
              <option disabled value="">Selecciona una ubicación</option>
              <option v-for="u in ubicaciones" :key="u" :value="u">
                {{ u }}
              </option>
            </select>

            <label class="t-3">Categoría</label>
            <select v-model="categoriaSeleccionadaNombre" class="input">
              <option value="" disabled>Selecciona una categoría</option>
              <option
                v-for="categoria in categorias"
                :key="categoria.nombreCategoria"
                :value="categoria.nombreCategoria"
              >
                {{ categoria.nombreCategoria }}
              </option>
            </select>

            <label class="t-3">Descripción</label>
            <textarea
              v-model="nuevaIncidencia.descripcionIncidencia"
              class="input"
              placeholder="Describe el problema..."
            ></textarea>

            <button @click="crearNuevaIncidencia" class="btn" :disabled="isLoading">
              Crear incidencia
            </button>

            <div v-if="isLoading" class="fondo-gris">
              <div class="circulo"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta de incidencias existentes -->
      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Listado de incidencias</div>
        <table>
          <thead>
            <tr>
              <th class="th">Ubicación</th>
              <th class="th">Categoría</th>
              <th class="th">Descripción</th>
              <th class="th">Estado</th>
              <th class="th">Responsable</th>
              <th class="th">Solución</th>
              <th class="th">Acción</th>
            </tr>
          </thead>
          <tbody class="t-3">
            <tr
              v-for="incidencia in incidencias"
              :key="incidencia.ubicacion + '-' + incidencia.fechaIncidencia"
            >
              <td class="th">{{ incidencia.ubicacion }}</td>
              <td class="th">{{ incidencia.nombreCategoria }}</td>
              <td class="th">{{ incidencia.descripcionIncidencia }}</td>

              <!-- ESTADO -->
             <td class="th">
                <select
                  v-if="puedeEditarIncidencia(incidencia)"
                  v-model="incidencia.estadoIncidencia"
                  class="input"
                >
                  <option value="" disabled>Selecciona estado</option>
                  <option v-for="estado in estados" :key="estado" :value="estado">
                    {{ estado }}
                  </option>
                </select>

                <span v-else>
                  {{ incidencia.estadoIncidencia || '—' }}
                </span>
            </td>


              <!-- RESPONSABLE -->
            <td class="th">
              <select
                v-if="puedeEditarIncidencia(incidencia)"
                v-model="incidencia.correoResponsable"
                class="input"
              >
                <option value="" disabled>Sin responsable asignado</option>
                <option
                  v-for="resp in responsablesDeCategoria(incidencia.nombreCategoria)"
                  :key="resp.correoResponsable"
                  :value="resp.correoResponsable"
                >
                  {{ resp.correoResponsable }}
                </option>
              </select>

              <span v-else>
                {{
                  mostrarNombreResponsable(incidencia.nombreCategoria, incidencia.correoResponsable)
                }}
              </span>
            </td>


              <!-- COMENTARIO -->
              <td class="th">
                <textarea
                  v-if="puedeEditarIncidencia(incidencia)"
                  v-model="incidencia.comentario"
                  class="input"
                  placeholder="Describe la solución..."
                ></textarea>

                <span v-else>
                  {{ incidencia.comentario || '—' }}
                </span>
              </td>


              <!-- BORRAR -->
              <td class="th">
                  <!-- Botón guardar solo para admin o responsable -->
                <button
                  v-if="puedeEditarIncidencia(incidencia)"
                  class="guardar"
                  @click="guardarIncidencia(incidencia)"
                >
                  Guardar
                </button>
                <button @click="borrar(incidencia)" class="eliminar">&times;</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>

  <ion-toast
    :is-open="isToastOpen"
    :message="toastMessage"
    :color="toastColor"
    duration="2000"
    @did-dismiss="() => (isToastOpen = false)"
    position="top"
  />
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { IonToast } from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";
import {
  crearIncidencia,
  listarIncidencias,
  borrarIncidencia,
  listarUbicaciones,
  listarCategorias,
  listarUsuariosCategoria,
  modificarIncidencia,
  listarEstados,
} from "@/services/issues.js";

// Servicio que te da email y roles del usuario logueado.
import { obtenerDatosUsuarioSesion } from "@/services/firebaseService"; 
// por ejemplo: devuelve { email: string, roles: string[] }

// ------------ Tipos locales ------------

interface Incidencia {
  ubicacion?: string;
  descripcionIncidencia?: string;
  estadoIncidencia?: string;
  correoDocente?: string;
  fechaIncidencia?: string;
  nombreCategoria?: string;
  correoResponsable?: string;
  comentario?: string;
}

interface Categoria {
  nombreCategoria: string;
}

interface UsuarioCategoria {
  nombreCategoria: string;
  nombreResponsable: string;
  correoResponsable: string;
}

// ------------ Estado global de la vista ------------

const categorias = ref<Categoria[]>([]);
const categoriaSeleccionadaNombre = ref<string | "">("");

// Ubicaciones e incidencias
const ubicaciones = ref<string[]>([]);
const incidencias = ref<Incidencia[]>([]);
const isLoading = ref(false);
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Estados posibles de incidencia
const estados = ref<string[]>([]);

// Usuarios responsables por categoría
const usuariosCategoria = ref<UsuarioCategoria[]>([]);

// Usuario actual
const correoUsuario = ref<string>("");
const rolesUsuario = ref<string[]>([]);

// Objeto de nueva incidencia
const nuevaIncidencia = ref<Incidencia>({
  ubicacion: "",
  descripcionIncidencia: "",
  nombreCategoria: "",
});

// ------------ Cálculos de permisos ------------

const esAdmin = computed(() => rolesUsuario.value.includes("ADMINISTRADOR"));

function esResponsableDeCategoria(nombreCategoria?: string): boolean {
  if (!nombreCategoria || !correoUsuario.value) return false;
  return usuariosCategoria.value.some(
    (u) =>
      u.nombreCategoria === nombreCategoria &&
      u.correoResponsable.toLowerCase() === correoUsuario.value.toLowerCase()
  );
}

function puedeEditarIncidencia(incidencia: Incidencia): boolean {
  return (
    esAdmin.value ||
    esResponsableDeCategoria(incidencia.nombreCategoria)
  );
}

// ------------ Helpers responsables ------------

function responsablesDeCategoria(nombreCategoria?: string): UsuarioCategoria[] {
  if (!nombreCategoria) return [];
  return usuariosCategoria.value.filter(
    (u) => u.nombreCategoria === nombreCategoria
  );
}

function mostrarNombreResponsable(
  nombreCategoria?: string,
  correoResponsable?: string
): string {
  if (!correoResponsable) return "Sin responsable";
  const resp = usuariosCategoria.value.find(
    (u) =>
      u.nombreCategoria === nombreCategoria &&
      u.correoResponsable.toLowerCase() === correoResponsable.toLowerCase()
  );
  if (!resp) return correoResponsable;
  return `${resp.nombreResponsable} (${resp.correoResponsable})`;
}

// ------------ Cargas iniciales ------------

async function cargarIncidencias() {
  try {
    const lista = await listarIncidencias(toastMessage, toastColor, isToastOpen);
    incidencias.value = lista.map((i: any) => {
      const nombreCategoria =
        i.nombreCategoria ||                
        i.categoria?.nombreCategoria ||    
        i.categoriaIncidencia?.nombreCategoria || 
        "";

      return {
        ...i,
        nombreCategoria,
        comentario: i.comentario ?? "",
        estadoIncidencia: i.estadoIncidencia ?? "",
      } as Incidencia;
    });
  } catch (error: any) {
    console.error("Error al cargar incidencias:", error);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      error?.message || "Error al cargar las incidencias"
    );
  }
}


async function cargarUbicaciones() {
  try {
    const lista = await listarUbicaciones(toastMessage, toastColor, isToastOpen);
    ubicaciones.value = lista.map((u: any) => u.nombre);
  } catch (e) {
    console.error("Error al cargar ubicaciones:", e);
    crearToast(toastMessage, toastColor, isToastOpen, "danger", "Error al cargar ubicaciones");
  }
}

async function cargarCategorias() {
  try {
    categorias.value = await listarCategorias(toastMessage, toastColor, isToastOpen);
  } catch (error: any) {
    console.error("Error al cargar categorías:", error);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      error?.message || "Error al cargar categorías"
    );
  }
}

async function cargarEstados() {
  try {
    const lista = await listarEstados(
      toastMessage,
      toastColor,
      isToastOpen
    );

    if (Array.isArray(lista)) {
      if (typeof lista[0] === "string") {
        estados.value = lista as string[];
      } else {
        estados.value = (lista as any[]).map((e) => e.nombre || e);
      }
    }
  } catch (e: any) {
    console.error("Error al listar estados:", e);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e?.message || "Error al cargar estados de incidencias"
    );
  }
}

async function cargarUsuariosCategoria() {
  try {
    usuariosCategoria.value = await listarUsuariosCategoria(
      toastMessage,
      toastColor,
      isToastOpen
    );
  } catch (e: any) {
    console.error("Error al cargar usuarios de categoría:", e);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e?.message || "Error al cargar usuarios responsables"
    );
  }
}

async function cargarDatosUsuario() {
  try {
    const datos = await obtenerDatosUsuarioSesion(
      toastMessage,
      toastColor,
      isToastOpen
    );

    correoUsuario.value = datos.email || "";
    rolesUsuario.value = datos.roles || [];
  } catch (e) {
    console.error("No se pudieron obtener los datos de sesión del usuario", e);
    correoUsuario.value = "";
    rolesUsuario.value = [];
  }
}


// ------------ Acciones ------------

async function crearNuevaIncidencia() {
  try {
    isLoading.value = true;

    if (!nuevaIncidencia.value.ubicacion || !nuevaIncidencia.value.descripcionIncidencia) {
      crearToast(
        toastMessage,
        toastColor,
        isToastOpen,
        "danger",
        "Ubicación y descripción son obligatorias"
      );
      return;
    }

    if (!categoriaSeleccionadaNombre.value) {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "Selecciona una categoría");
      return;
    }

    nuevaIncidencia.value.nombreCategoria = categoriaSeleccionadaNombre.value;

    await crearIncidencia(
      nuevaIncidencia.value as any,
      toastMessage,
      toastColor,
      isToastOpen
    );

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia creada correctamente");
    await cargarIncidencias();

    // Reset
    nuevaIncidencia.value = {
      ubicacion: "",
      descripcionIncidencia: "",
      nombreCategoria: "",
    };
    categoriaSeleccionadaNombre.value = "";
  } catch (e: any) {
    console.error("Error al crear incidencia:", e);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e?.message || "Error al crear incidencia"
    );
  } finally {
    isLoading.value = false;
  }
}

async function borrar(incidencia: Incidencia) {
  try {
    await borrarIncidencia(incidencia, toastMessage, toastColor, isToastOpen);
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia eliminada");
    await cargarIncidencias();
  } catch (e: any) {
    console.error("Error al borrar incidencia:", e);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e?.message || "Error al eliminar incidencia"
    );
  }
}

/**
 * Guardar cambios de una incidencia (estado, responsable, solución).
 * Se llama cuando cambias el select o sales del textarea de solución.
 */
async function guardarIncidencia(incidencia: Incidencia) {
  if (!puedeEditarIncidencia(incidencia)) {
    return;
  }

  try {
    await modificarIncidencia(
      incidencia,
      toastMessage,
      toastColor,
      isToastOpen
    );
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "success",
      "Incidencia actualizada"
    );
    // Opcional: recargar para asegurar que está sincronizado con backend
    // await cargarIncidencias();
  } catch (e: any) {
    console.error("Error al modificar incidencia:", e);
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      "danger",
      e?.message || "Error al actualizar incidencia"
    );
  }
}

onMounted(async () => {
  await cargarDatosUsuario();      
  await cargarUbicaciones();
  await cargarCategorias();
  await cargarEstados();
  await cargarUsuariosCategoria();
  await cargarIncidencias();
});
</script>


<style scoped>
.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

/* ⭐️⭐️⭐️ NUEVO: Layout especial para ADMIN ⭐️⭐️⭐️ */
.top-section.admin-layout {
  flex-direction: column !important;
  align-items: stretch !important;
}

.top-section.admin-layout .card-upload-csv {
  min-width: 100% !important;
}

.card-upload-csv {
  flex: 1 1 30%;
  min-width: 520px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.t-2 {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.section {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.t-3 {
  margin-top: 1rem;
  font-size: 1.1rem;
  text-align: left;
}

.input {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  width: 100%;
}

.btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: #0054e9;
  color: #fff;
  font-size: 1.1rem;
  margin-top: 1rem;
}

.btn:hover {
  background-color: #1461eb;
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
  border-top: 4px solid #4782eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.card-upload-table {
  overflow-y: auto;
  height: 400px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

.th {
  border: 1px solid currentColor;
  padding: 0.5rem 1rem;
  text-align: center;
}

.eliminar {
  color: #ef4444;
  font-size: 1.6rem;
  background: transparent;
  border: none;
}


.acciones-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.guardar {
  padding: 0.25rem 0.6rem;
  border-radius: 0.375rem;
  border: none;
  background-color: #22c55e; /* verde */
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.guardar:hover {
  background-color: #16a34a;
}

</style>
