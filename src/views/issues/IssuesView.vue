<template>
  <h1 class="t-1">Gestión de Incidencias TIC</h1>

  <div class="top-container">
    <!-- Siempre con layout tipo admin: formulario arriba y tabla debajo -->
    <div class="top-section admin-layout">
      
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
                :key="categoria.nombre"
                :value="categoria.nombre"
              >
                {{ categoria.nombre }}
              </option>
            </select>

            <label class="t-3">Descripción</label>
            <textarea
              v-model="nuevaIncidencia.descripcionIncidencia"
              class="input"
              placeholder="Describe el problema..."
            ></textarea>

            <button @click="crearIncidenciaFunc" class="btn" :disabled="isLoading">
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
        <div class="lista-header">
          <div class="t-2">Listado de incidencias</div>

          <input
            v-model="filtroTexto"
            class="filtro-input filtro-derecha"
            type="text"
            placeholder="Filtrar incidencias (min. 4 letras)..."
          />

          <!-- Control de tamaño de página -->
          <div class="items-por-pagina">
            <label for="page-size" class="paginacion-label">
              Incidencias por página:
            </label>
            <input
              id="page-size"
              type="number"
              v-model.number="pageSize"
              min="1"
              max="20"
              class="input input-page-size"
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="th">Ubicación</th>
              <th class="th">Categoría</th>
              <th class="th">Descripción</th>
              <th class="th th-estado">Estado</th>
              <th class="th">Responsable</th>
              <th class="th">Solución</th>
              <th class="th">Acción</th>
            </tr>
          </thead>
          <tbody class="t-3">
            <tr
              v-for="incidencia in incidenciasPaginadas"
              :key="incidencia.ubicacion + '-' + incidencia.fechaIncidencia"
            >
              <td class="th">{{ incidencia.ubicacion }}</td>
              <td class="th">{{ incidencia.nombreCategoria }}</td>
              <td class="th" :title="formatearFecha(incidencia.fechaIncidencia)">
                {{ incidencia.descripcionIncidencia }}
              </td>

              <!-- ESTADO (celda más grande) -->
              <td class="th th-estado">
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
                <!-- Admin o responsable pueden editar (select con solo nombre) -->
                <select
                  v-if="puedeEditarIncidencia(incidencia)"
                  v-model="incidencia.emailResponsable"
                  class="input"
                >
                  <option value="" disabled>Sin responsable asignado</option>

                  <option
                    v-for="resp in responsablesDeCategoria(incidencia.nombreCategoria)"
                    :key="resp.emailResponsable"
                    :value="resp.emailResponsable"
                  >
                    {{ resp.nombreResponsable }}
                  </option>
                </select>

                <!-- Usuario normal ve solo el nombre del responsable -->
                <span v-else>
                  {{
                    mostrarNombreResponsable(
                      incidencia.nombreCategoria,
                      incidencia.emailResponsable
                    )
                  }}
                </span>
              </td>

              <!-- COMENTARIO / SOLUCIÓN -->
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

              <!-- BORRAR / GUARDAR -->
              <td class="th">
                <!-- Botón guardar solo para admin o responsable -->
                <button
                  v-if="puedeEditarIncidencia(incidencia)"
                  class="guardar"
                  @click="guardarIncidenciaFunc(incidencia)"
                >
                  Guardar
                </button>
                <button @click="borrarIncidenciaFunc(incidencia)" class="eliminar">&times;</button>
              </td>
            </tr>

            <!-- Fila si no hay incidencias -->
            <tr v-if="!incidenciasFiltradas.length">
              <td class="th" colspan="7" style="text-align:center; opacity:0.7;">
                No hay incidencias registradas
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación  -->
        <div
          class="paginacion"
          v-if="incidenciasFiltradas.length > pageSize"
        >
          <button
            class="pag-btn"
            :disabled="currentPage === 1"
            @click="irPagina(currentPage - 1)"
          >
            ‹ Anterior
          </button>

          <span class="paginacion-info">
            Página {{ currentPage }} de {{ totalPaginas }}
            · Mostrando
            {{ rangoInicio }}–{{ rangoFin }}
            de {{ incidenciasFiltradas.length }}
          </span>

          <button
            class="pag-btn"
            :disabled="currentPage === totalPaginas"
            @click="irPagina(currentPage + 1)"
          >
            Siguiente ›
          </button>
        </div>
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
import { ref, onMounted, computed, watch } from "vue";
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

// ------------ Tipos locales ------------

interface Incidencia {
  ubicacion?: string;
  descripcion?: string;
  estado?: string;
  emailDocente?: string;
  fecha?: string;
  nombreCategoria?: string;
  emailResponsable?: string;
  comentario?: string;
}

interface Categoria {
  nombre: string;
}

interface UsuarioCategoria {
  nombreCategoria: string;
  nombreResponsable: string;
  emailResponsable: string;
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
  descripcion: "",
  nombreCategoria: "",
});

const filtroTexto = ref<string>("");

// ------------ Paginación (como en el otro componente) ------------

const pageSize = ref<number>(8);  // incidencias por página (editable 1–20)
const currentPage = ref<number>(1);

// Incidencias filtradas (antes de paginar)
const incidenciasFiltradas = computed(() => {
  const filtro = filtroTexto.value.trim().toLowerCase();

  // Si el filtro tiene menos de 4 caracteres, mostramos todas
  if (!filtro || filtro.length < 4) {
    return incidencias.value;
  }

  return incidencias.value.filter((i) => {
    const ubicacion = i.ubicacion ?? "";
    const desc = i.descripcionIncidencia ?? "";
    const categoria = i.nombreCategoria ?? "";
    const estado = i.estadoIncidencia ?? "";
    const comentario = i.comentario ?? "";
    const emailResp = i.emailResponsable ?? "";

    // Buscamos el responsable para obtener su nombre
    let nombreResp = "";
    if (i.nombreCategoria && i.emailResponsable) {
      const resp = usuariosCategoria.value.find(
        (u) =>
          u.nombreCategoria === i.nombreCategoria &&
          u.emailResponsable.toLowerCase() === i.emailResponsable!.toLowerCase()
      );
      if (resp) {
        nombreResp = resp.nombreResponsable ?? "";
      }
    }

    const texto = (
      ubicacion +
      " " +
      desc +
      " " +
      categoria +
      " " +
      estado +
      " " +
      comentario +
      " " +
      emailResp +
      " " +
      nombreResp
    ).toLowerCase();

    return texto.includes(filtro);
  });
});

// Total de páginas
const totalPaginas = computed(() => {
  if (!incidenciasFiltradas.value.length) return 1;
  return Math.ceil(incidenciasFiltradas.value.length / pageSize.value);
});

// Incidencias de la página actual
const incidenciasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return incidenciasFiltradas.value.slice(start, start + pageSize.value);
});

// Rango mostrado (para el texto "Mostrando X–Y de Z")
const rangoInicio = computed(() => {
  if (!incidenciasFiltradas.value.length) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});

const rangoFin = computed(() => {
  const total = incidenciasFiltradas.value.length;
  const fin = currentPage.value * pageSize.value;
  return fin > total ? total : fin;
});

// Ir a una página concreta
function irPagina(pagina: number) {
  if (pagina < 1 || pagina > totalPaginas.value) return;
  currentPage.value = pagina;
}

// Forzar límites de pageSize (1 a 20)
watch(
  pageSize,
  (nuevo) => {
    if (!nuevo || nuevo < 1) pageSize.value = 1;
    if (nuevo > 20) pageSize.value = 20;
  }
);

// Si cambian filtro, incidencias o pageSize, reseteamos a página 1
watch(
  [filtroTexto, incidencias, pageSize],
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

// ------------ Cálculos de permisos ------------

const esAdmin = computed(() => rolesUsuario.value.includes("ADMINISTRADOR"));

function esResponsableDeCategoria(nombreCategoria?: string): boolean {
  if (!nombreCategoria || !correoUsuario.value) return false;
  return usuariosCategoria.value.some(
    (u) =>
      u.nombreCategoria === nombreCategoria &&
      u.emailResponsable.toLowerCase() === correoUsuario.value.toLowerCase()
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
  emailResponsable?: string
): string {
  if (!emailResponsable) return "Sin responsable";

  const resp = usuariosCategoria.value.find(
    (u) =>
      u.nombreCategoria === nombreCategoria &&
      u.emailResponsable.toLowerCase() === emailResponsable.toLowerCase()
  );

  if (!resp) return "Sin responsable";

  return resp.nombreResponsable;
}

// ------------ Cargas iniciales ------------

async function cargarIncidencias() {
  try {
    const lista = await listarIncidencias(toastMessage, toastColor, isToastOpen);
    incidencias.value = lista.map((i: any) => {
      return {
        ...i,
        nombreCategoria: i.categoria?.nombre ?? "",
        comentario: i.comentario ?? "",
        estado: i.estado ?? "",
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

async function crearIncidenciaFunc() {
  try {
    isLoading.value = true;

    if (!nuevaIncidencia.value.ubicacion || !nuevaIncidencia.value.descripcion) {
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

async function borrarIncidenciaFunc(incidencia: Incidencia) {
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
 */
async function guardarIncidenciaFunc(incidencia: Incidencia) {
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

function formatearFecha(fechaValor: any): string {
  if (!fechaValor) return "";

  let fecha: Date;

  if (Array.isArray(fechaValor)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = fechaValor;
    fecha = new Date(year, month - 1, day, hour, minute, second);
  } else {
    fecha = new Date(fechaValor);
  }

  if (isNaN(fecha.getTime())) {
    return "";
  }

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const año = fecha.getFullYear();

  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
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
  cursor: pointer;
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

.th-estado {
  min-width: 170px;
}

.eliminar {
  color: #ef4444;
  font-size: 1.6rem;
  background: transparent;
  border: none;
  cursor: pointer;
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
  background-color: #22c55e; 
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.guardar:hover {
  background-color: #16a34a;
}

.lista-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1rem;
  gap: 1rem;
}

.filtro-input {
  width: 280px;
  max-width: 320px;
  border: 1px solid #bbb;
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  font-size: 0.95rem;
}

.filtro-input:focus {
  outline: none;
  border-color: #4782eb;
  box-shadow: 0 0 3px #4782eb;
}

.filtro-derecha {
  margin-left: auto;
}


.items-por-pagina {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #475569;
}

.paginacion-label {
  white-space: nowrap;
}

.input-page-size {
  max-width: 70px;
}

/* Paginación inferior */
.paginacion {
  margin-top: 0.75rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: #475569;
}

.paginacion-info {
  white-space: nowrap;
}

.pag-btn {
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  padding: 0.25rem 0.8rem;
  background-color: #e5e7eb;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.pag-btn:hover:not(:disabled) {
  background-color: #d4d4d8;
  transform: translateY(-1px);
}

.pag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .top-container {
    background-color: transparent;
  }

  .card-upload-csv {
    background-color: var(--form-bg-dark, #0b1220); 
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.9);
    border: 1px solid #1f2937;
  }

  .t-1,
  .t-2,
  .t-3 {
    color: var(--text-color-dark, #e5e7eb); 
  }

  table {
    color: var(--text-color-dark, #e5e7eb);
  }

  thead tr {
    background-color: #020617;
  }

  tbody tr:nth-child(even) {
    background-color: rgba(15, 23, 42, 0.7);
  }

  tbody tr:nth-child(odd) {
    background-color: rgba(15, 23, 42, 0.4);
  }

  tbody tr:hover {
    background-color: rgba(37, 99, 235, 0.15);
  }

  .th {
    border-color: #1f2937;
  }

  .input,
  .filtro-input,
  textarea.input {
    background-color: #020617;
    color: var(--text-color-dark, #e5e7eb);
    border-color: #334155;
  }

  .input::placeholder,
  textarea.input::placeholder,
  .filtro-input::placeholder {
    color: #6b7280;
  }

  .filtro-input:focus,
  .input:focus,
  textarea.input:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 1px #60a5fa;
  }

  .btn {
    background-color: #2563eb;
    color: #e5e7eb;
  }

  .btn:hover {
    background-color: #1d4ed8;
  }

  .guardar {
    background-color: #22c55e;
    color: #022c22;
  }

  .guardar:hover {
    background-color: #4ade80;
  }

  .eliminar {
    color: #f97373;
  }

  .eliminar:hover {
    color: #fecaca;
  }

  .fondo-gris {
    background-color: rgba(15, 23, 42, 0.85);
  }

  .circulo {
    border: 4px solid #1f2937;
    border-top: 4px solid #60a5fa;
  }

  .pag-btn {
    background-color: #1f2937;
    border-color: #334155;
  }

  .pag-btn:hover:not(:disabled) {
    background-color: #374151;
  }

  .paginacion {
    color: #9ca3af;
  }

  .paginacion-label {
    color: #9ca3af;
  }
}


@media (max-width: 768px) {
  .card-upload-table {
    overflow-x:auto;
    width: 100%;
  }
}
</style>
