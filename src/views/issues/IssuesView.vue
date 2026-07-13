<template>
  <h1 class="t-1">Gestión de Incidencias</h1>

  <div class="top-container">
    <div class="top-section admin-layout">
      <!-- Tarjeta para crear incidencia -->
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva incidencia</div>

          <div class="section">
            <label class="t-3">Ubicación</label>
            <select v-model="nuevaIncidenciaUbicacion" class="input">
              <option disabled value="">Selecciona una ubicación</option>
              <option v-for="u in ubicaciones" :key="u.value" :value="u.value">
                {{ u.label }}
              </option>
            </select>

            <label class="t-3">Categoría</label>
            <select v-model="nuevaIncidenciaCategoria" class="input">
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="categoria in categorias" :key="categoria.nombre" :value="categoria.nombre">
                {{categoria.nombre }}
              </option>
            </select>

            <label class="t-3">Problema</label>
            <textarea
              v-model="nuevaIncidenciaProblema"
              class="input textarea-problema"
              placeholder="Describe el problema..."
              rows="4"
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

      <!-- Tarjeta de incidencias existentes con paginación -->
      <div class="card-upload-table card-upload-csv">
        <div class="lista-header">
          <div class="t-2">Listado de incidencias</div>

          <input v-model="filtroTexto" class="filtro-input filtro-derecha" type="text"
            placeholder="Filtrar en página actual (min. 3 letras)..." />

          <!-- Control de tamaño de página -->
          <div class="items-por-pagina">
            <label for="page-size" class="paginacion-label">
              Incidencias por página:
            </label>
            <input id="page-size" type="number" v-model.number="pageSize" min="1" max="100"
              class="input input-page-size" @change="recargarConPaginacion" />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="th">Ubicación</th>
              <th class="th">Categoría</th>
              <th class="th">Problema</th>
              <th class="th th-estado">Estado</th>
              <th class="th">Responsable</th>
              <th class="th">Solución</th>
              <th class="th">Acciones</th>
            </tr>
          </thead>
          <tbody class="t-3">
            <tr v-for="incidencia in incidenciasFiltradas" :key="incidencia.id">
              <td class="th" :title="esAdmin ? (incidencia.nombre + ' ' + incidencia.apellidos) : ''">
                {{ incidencia.ubicacion }}
              </td>
              <td class="th" :title="incidencia.fecha">
                <select v-model="incidencia.categoria" class="input"
                  v-if="puedeEditarIncidencia(incidencia.emailResponsable, incidencia.categoria)"
                  @change="incidencia.id && actualizarCategoriaIncidenciaFunc(incidencia.id, incidencia.categoria)">
                  <option value="" disabled>Sin categoría asignada</option>
                  <option v-for="categoria in categorias" :key="categoria.nombre" :value="categoria.nombre">
                    {{ categoria.nombre }}
                  </option>
                </select>
                <span v-else>
                  {{ incidencia.categoria || '—' }}
                </span>
              </td>

              <!-- Problema -->
              <td class="th th-problema" :title="incidencia.problema">
                <div class="problema-cell">
                  {{ incidencia.problema || 'Sin descripción' }}
                </div>
              </td>

              <!-- Estado -->
              <td class="th th-estado">
                <select v-model="incidencia.estado" class="input"
                  v-if="puedeEditarIncidencia(incidencia.emailResponsable, incidencia.categoria)"
                  @change="incidencia.id && actualizarEstadoIncidenciaFunc(incidencia.id, incidencia.estado)">
                  <option value="" disabled>Selecciona estado</option>
                  <option v-for="estado in estados" :key="estado" :value="estado">
                    {{ estado }}
                  </option>
                </select>
                <span v-else>
                  {{ incidencia.estado || '—' }}
                </span>
              </td>

              <!-- Responsable -->
              <td class="th">
                <select v-model="incidencia.emailResponsable" class="input"
                  v-if="puedeEditarIncidencia(incidencia.emailResponsable, incidencia.categoria)"
                  @change="incidencia.id && actualizarResponsableIncidenciaFunc(incidencia.id, incidencia.categoria, incidencia.emailResponsable)">
                  <option value="" disabled>Sin responsable asignado</option>
                  <option v-for="resp in responsablesDeCategoria(incidencia.categoria)" :key="resp.emailResponsable"
                    :value="resp.emailResponsable">
                    {{ resp.nombreResponsable }}
                  </option>
                </select>
                <span v-else>
                  {{ incidencia.nombreResponsable || '—' }}
                </span>
              </td>

              <!-- Comentario / Solución -->
              <td class="th">
                <textarea
                  v-model="incidencia.solucion"
                  class="input textarea-solucion"
                  placeholder="Describe la solución..."
                  rows="3"
                  v-if="puedeEditarIncidencia(incidencia.emailResponsable, incidencia.categoria)"
                ></textarea>
                <span v-else>
                  {{ incidencia.solucion || '—' }}
                </span>
              </td>

              <td class="th">
                <!-- Botón guardar solución solo para admin o responsable -->
                <button @click="incidencia.id && actualizarSolucionIncidenciaFunc(incidencia.id, incidencia.solucion)"
                  class="actualizarSolucion"
                  v-if="puedeEditarIncidencia(incidencia.emailResponsable, incidencia.categoria)">
                  Actualizar solución
                </button>

                <!-- Botón borrar solo si está PENDIENTE -->
                <button @click="incidencia.id && borrarIncidenciaFunc(incidencia.id)" class="eliminar"
                  v-if="incidencia.estado === 'PENDIENTE'">
                  &times;
                </button>
              </td>
            </tr>

            <!-- Fila si no hay incidencias -->
            <tr v-if="!incidenciasPaginadas.length && !isLoading">
              <td class="th" colspan="7" style="text-align:center; opacity:0.7;">
                No hay incidencias registradas
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="paginacion" v-if="totalPages > 1">
          <button class="pag-btn" :disabled="currentPage === 0" @click="irPagina(currentPage - 1)">
            ‹ Anterior
          </button>

          <span class="paginacion-info">
            Página {{ currentPage + 1 }} de {{ totalPages }} - Mostrando {{ (currentPage * pageSize) + 1
            }}–{{ Math.min((currentPage + 1) * pageSize, totalElements) }} de {{ totalElements }}
          </span>

          <button class="pag-btn" :disabled="currentPage >= totalPages - 1" @click="irPagina(currentPage + 1)">Siguiente›</button>
        </div>
      </div>

    </div>
  </div>

  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top" />
</template>


<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { IonToast } from "@ionic/vue";
import { crearToast } from "@/utils/toast.js";
import {
  Categoria,
  Incidencia,
  UsuarioCategoria,
  crearIncidencia,
  listarIncidencias,
  borrarIncidencia,
  listarCategorias,
  listarUsuariosCategoria,
  actualizarCategoriaIncidencia,
  actualizarEstadoIncidencia,
  actualizarSolucionIncidencia,
  actualizarResponsableIncidencia,
  listarEstados,
} from "@/services/issues.js";

// Las ubicaciones del desplegable provienen ahora del catálogo de espacios/aulas
// del centro gestionado por Reaktor_SchoolManagementServer: unión de los tres tipos
// de espacio (sin docencia, fijo y desdoble).
import {
  obtenerEspaciosSinDocencia,
  obtenerEspaciosFijo,
  obtenerEspaciosDesdoble,
} from "@/services/schoolManager.js";

// Servicio que te da email y roles del usuario logueado.
import { obtenerDatosUsuarioSesion } from "@/services/firebaseService";


// ------------ Estado global de la vista ------------

const categorias = ref<Categoria[]>([]);

// Ubicaciones e incidencias.
// Cada ubicación separa el `value` (nombre del aula, lo que se guarda en la incidencia)
// de la `label` visible (nombre + curso/etapa/grupo cuando el espacio es "fijo").
const ubicaciones = ref<Array<{ value: string; label: string }>>([]);

// Paginación
const incidenciasPaginadas = ref<Incidencia[]>([]);  
const currentPage = ref<number>(0);                  
const pageSize = ref<number>(20);                    
const totalPages = ref<number>(1);                   
const totalElements = ref<number>(0);                

const isLoading = ref(false);

// Toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Estados posibles de incidencia
const estados = ref<string[]>([]);

// Usuarios responsables por categoría
const usuariosCategoria = ref<UsuarioCategoria[]>([]);

// Usuario actual
const emailUsuario = ref<string>("");

// Datos para nueva incidencia
const nuevaIncidenciaUbicacion = ref<string | "">("");
const nuevaIncidenciaCategoria = ref<string | "">("");
const nuevaIncidenciaProblema = ref<string>("");

const filtroTexto = ref<string>("");

const esAdmin = ref<boolean>(false);

/*************************************************/
/*********** Montaje y Carga de datos ************/
/*************************************************/

/**
 * Cargar los datos del usuario, ubicaciones, categorías, estados y usuarios de categoría.
 * @returns void
 */
onMounted(async () => {
  // Cargamos los datos del usuario
  await cargarDatosUsuario();

  // Cargamos las ubicaciones
  await cargarUbicaciones();

  // Cargamos las categorías
  await cargarCategorias();

  // Cargamos los estados
  await cargarEstados();

  // Cargamos los usuarios de categoría
  await cargarUsuariosCategoria();

  // Cargamos las incidencias con paginación
  await cargarIncidencias();
});

/**
 * Cargar los datos del usuario.
 * @returns void
 */
async function cargarDatosUsuario() {
  try {
    // Obtenemos los datos del usuario de la sesión
    const datos = await obtenerDatosUsuarioSesion(toastMessage, toastColor, isToastOpen);

    // Asignamos los datos del usuario a las variables
    emailUsuario.value = datos.email || "";

    esAdmin.value = datos.roles.includes("ADMINISTRADOR") || datos.roles.includes("DIRECCION");
  }
  catch (e: any) {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos el mensaje de error en un toast
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar los datos de sesión del usuario");
  }
}

/**
 * Cargar las incidencias con paginación.
 */
async function cargarIncidencias() {
  try {
    isLoading.value = true;

    // Obtenemos las incidencias paginadas del backend
    const pageResponse = await listarIncidencias(
      toastMessage,
      toastColor,
      isToastOpen,
      currentPage.value,  
      pageSize.value,     
      'fecha,desc'        
    );

    // Extraer datos del objeto Page
    incidenciasPaginadas.value = pageResponse.content || [];
    totalPages.value = pageResponse.totalPages || 1;
    totalElements.value = pageResponse.totalElements || 0;
    
    // Para que si el usuario borra la última incidencia de una página no se quede vacía
    if (currentPage.value > 0 && incidenciasPaginadas.value.length === 0) {
      currentPage.value = Math.max(0, totalPages.value - 1);
      await cargarIncidencias();
      return;
    }    

  }
  catch (e: any) {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar las incidencias");
  }
  finally {
    isLoading.value = false;
  }
}

/**
 * Recargar incidencias al cambiar parámetros de paginación.
 */
function recargarConPaginacion() {
  currentPage.value = 0;  // Reset a primera página al cambiar tamaño
  cargarIncidencias();
}

/**
 * Navegar a una página específica.
 * @param pagina Número de página
 */
function irPagina(pagina: number) {
  if (pagina >= 0 && pagina < totalPages.value) {
    currentPage.value = pagina;
    cargarIncidencias();
  }
}

/**
 * Cargar las ubicaciones (espacios/aulas del centro desde SchoolManagementServer).
 * Se combinan los tres tipos de espacio (sin docencia, fijo y desdoble) y se
 * deduplican por nombre de aula. Cada función devuelve un array de objetos con la
 * forma { cursoAcademico, nombre, ... }; los fijos añaden además { curso, etapa, grupo }.
 *
 * Igual que el "Localizador (zona)" de automations/map, la etiqueta visible añade el
 * curso/etapa/grupo relacionado cuando existe (formato `"<nombre> - <curso> <etapa> <grupo>"`);
 * los espacios sin grupo (sin docencia/desdoble) muestran solo el nombre. El valor guardado
 * en la incidencia sigue siendo el nombre del aula, para no romper el contrato del backend.
 *
 * El curso académico lo resuelven las propias funciones del servicio (cabecera
 * `cursoAcademico` leída de localStorage donde procede).
 */
async function cargarUbicaciones() {
  try {
    // Obtenemos los tres tipos de espacio del centro en paralelo
    const [sinDocencia, fijos, desdobles] = await Promise.all([
      obtenerEspaciosSinDocencia(toastMessage, toastColor, isToastOpen),
      obtenerEspaciosFijo(toastMessage, toastColor, isToastOpen),
      obtenerEspaciosDesdoble(toastMessage, toastColor, isToastOpen),
    ]);

    // Deduplicamos por nombre de aula. Priorizamos la variante "fijo" porque es la única
    // que trae curso/etapa/grupo para enriquecer la etiqueta.
    const opcionesPorNombre = new Map<string, { value: string; label: string }>();

    // 1) Espacios fijos primero: etiqueta con curso/etapa/grupo cuando existe
    for (const espacio of (fijos as any[])) {
      const nombre = espacio?.nombre;
      if (typeof nombre !== "string" || nombre.trim() === "" || opcionesPorNombre.has(nombre)) continue;

      let label = nombre;
      if (espacio.curso && espacio.etapa && espacio.grupo) {
        const grupoInfo = `${espacio.curso} ${espacio.etapa} ${espacio.grupo}`.replace(/\s+/g, " ").trim();
        label = `${nombre} - ${grupoInfo}`;
      }
      opcionesPorNombre.set(nombre, { value: nombre, label });
    }

    // 2) Sin docencia y desdoble: solo nombre, sin sobrescribir la variante con grupo
    for (const espacio of [...(sinDocencia as any[]), ...(desdobles as any[])]) {
      const nombre = espacio?.nombre;
      if (typeof nombre !== "string" || nombre.trim() === "" || opcionesPorNombre.has(nombre)) continue;

      opcionesPorNombre.set(nombre, { value: nombre, label: nombre });
    }

    // Unión deduplicada por nombre de aula, ordenada alfabéticamente por nombre
    ubicaciones.value = Array.from(opcionesPorNombre.values())
      .sort((a, b) => a.value.localeCompare(b.value, "es"));
  }
  catch (e: any) {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar las ubicaciones");
  }
}

/**
 * Cargar las categorías.
 */
async function cargarCategorias() {
  try {
    // Obtenemos las categorías
    categorias.value = await listarCategorias(toastMessage, toastColor, isToastOpen);
  }
  catch (e: any) {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar las categorías");
  }
}

/**
 * Cargar los estados.
 */
async function cargarEstados() {
  try {
    // Obtenemos los estados
    estados.value = await listarEstados(toastMessage, toastColor, isToastOpen);
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar los estados");
  }
}

/**
 * Cargar los usuarios de categoría.
 */
async function cargarUsuariosCategoria() {
  try {
    // Obtenemos los usuarios de categoría
    usuariosCategoria.value = await listarUsuariosCategoria(toastMessage, toastColor, isToastOpen);
  }
  catch (e: any) {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar los usuarios de categoría");
  }
}

/*************************************************/
/*********** Cálculos de permisos ****************/
/*************************************************/

/**
 * Verificar si el usuario es responsable de una categoría.
 * @param emailResponsable - El email del responsable de la categoría a verificar.
 * @param categoria - La categoría a verificar.
 * @returns true si el usuario es responsable de la categoría, false en caso contrario.
 */
function esResponsableDeCategoria(emailResponsable: string, categoria: string): boolean {
  // Creamos una variable para el resultado
  let resultado: boolean = false;

  // Si no hay nombre de categoría o no hay correo del usuario, se devuelve false
  if (emailResponsable && emailUsuario.value) {
    // Se verifica si el usuario es responsable de la categoría
    resultado = usuariosCategoria.value.some(
      (u) => u.nombreCategoria === categoria && emailUsuario.value.toLowerCase() === emailResponsable.toLowerCase()
    );
  }

  // Se devuelve el resultado
  return resultado;
}

/**
 * Verificar si el usuario puede editar una incidencia.
 * @param emailResponsable - El email del responsable de la incidencia a verificar.
 * @param categoria - La categoría de la incidencia a verificar.
 * @returns true si el usuario puede editar la incidencia, false en caso contrario.
 */
function puedeEditarIncidencia(emailResponsable: string, categoria: string): boolean {
  // Validamos si el usuario es administrador o es responsable de la categoría
  return esAdmin.value || esResponsableDeCategoria(emailResponsable, categoria);
}

/*************************************************/
/**************** Filtrado ***********************/
/*************************************************/

/**
 * Filtrar las incidencias de la página actual.
 * @return Las incidencias filtradas.
 */
const incidenciasFiltradas = computed(() => {
  // Creamos una variable para el filtro
  const filtro = filtroTexto.value.trim().toLowerCase();

  // Si el filtro tiene menos de 3 caracteres, mostramos todas las de la página
  if (!filtro || filtro.length < 3) {
    return incidenciasPaginadas.value;
  }

  // Se filtran las incidencias de la página actual
  return incidenciasPaginadas.value
    .filter(i => i.id !== undefined)
    .filter((i) => {
      // Buscamos el responsable para obtener su nombre
      let nombreResponsable = "";

      // Si hay nombre de categoría y email del responsable, se obtiene el nombre del responsable
      if (i.categoria && i.emailResponsable) {
        // Se obtiene el responsable de la categoría
        const responsable = usuariosCategoria.value.find(
          (u) => u.nombreCategoria === i.categoria && u.emailResponsable.toLowerCase() === i.emailResponsable.toLowerCase()
        );

        // Si hay responsable, se obtiene el nombre del responsable
        if (responsable) {
          nombreResponsable = responsable.nombreResponsable ?? "";
        }
      }

      // Se crea el texto a filtrar (solo campos de la incidencia actual)
      const texto = (
        i.ubicacion + " " +
        i.problema + " " +
        i.estado + " " +
        i.solucion + " " +
        i.categoria + " " +
        nombreResponsable
      ).toLowerCase();

      // Se devuelve si el texto incluye el filtro
      return texto.includes(filtro);
    });
});

/*************************************************/
/******************** Acciones *******************/
/*************************************************/

/**
 * Crear una nueva incidencia.
 */
async function crearIncidenciaFunc() {
  try {
    // Muestra un indicador de carga
    isLoading.value = true;

    // Inicializamos el mensaje de error
    let mensaje = "";

    // Si no se ha seleccionado una categoría, no se puede crear la incidencia
    if (!nuevaIncidenciaCategoria.value) {
      // Creamos el mensaje de error
      mensaje = "Selecciona una categoría";
    }
    // Si no se ha seleccionado una ubicación, no se puede crear la incidencia
    else if (!nuevaIncidenciaUbicacion.value) {
      // Creamos el mensaje de error
      mensaje = "Selecciona una ubicación";
    }
    // Si no se ha seleccionado un problema, no se puede crear la incidencia
    else if (!nuevaIncidenciaProblema.value) {
      // Creamos el mensaje de error
      mensaje = "Indica el problema que has encontrado";
    }

    // Si hay mensaje de error, se muestra el mensaje de error
    if (mensaje) {
      // Mostramos el mensaje de error en la consola
      console.error(mensaje);

      // Mostramos el mensaje de error en un toast
      crearToast(toastMessage, toastColor, isToastOpen, "danger", mensaje);
    }
    else // Si no hay mensaje de error, se crea la incidencia
    {
      // Creamos la incidencia
      await crearIncidencia(toastMessage, toastColor, isToastOpen, nuevaIncidenciaUbicacion.value, nuevaIncidenciaProblema.value, nuevaIncidenciaCategoria.value);

      // Si se crea correctamente, mostramos un toast de éxito
      crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia creada correctamente");

      // Reseteamos el formulario de nueva incidencia
      nuevaIncidenciaUbicacion.value = "";
      nuevaIncidenciaCategoria.value = "";
      nuevaIncidenciaProblema.value = "";

      // Recargamos las incidencias (vuelve a página 1)
      currentPage.value = 0;
      await cargarIncidencias();
    }
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al crear incidencia");
  }
  finally {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Borrar una incidencia.
 * @param id - El ID de la incidencia a borrar.
 */
async function borrarIncidenciaFunc(id: number) {
  try {
    // Muestra un indicador de carga
    isLoading.value = true;

    // Si puede borrar la incidencia, tratamos de borrarla
    await borrarIncidencia(toastMessage, toastColor, isToastOpen, id);

    // Si se borra correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia eliminada");

    // Recargamos las incidencias
    await cargarIncidencias();
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Si hay un error, mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al borrar incidencia");
  }
  finally {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar la categoría de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param nombreCategoria - El nombre de la categoría a actualizar.
 */
async function actualizarCategoriaIncidenciaFunc(id: number, nombreCategoria: string) {
  // Muestra un indicador de carga
  isLoading.value = true;

  try {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarCategoriaIncidencia(toastMessage, toastColor, isToastOpen, id, nombreCategoria);

    // Recargamos las incidencias
    await cargarIncidencias();

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría de la incidencia actualizada");
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar la categoría de la incidencia");
  }
  finally {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar el estado de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param estado - El estado de la incidencia a actualizar.
 */
async function actualizarEstadoIncidenciaFunc(id: number, estado: string) {
  // Muestra un indicador de carga
  isLoading.value = true;

  try {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarEstadoIncidencia(toastMessage, toastColor, isToastOpen, id, estado);

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Estado de la incidencia actualizada");
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar el estado de la incidencia");
  }
  finally {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar la solución de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param solucion - La solución de la incidencia a actualizar.
 */
async function actualizarSolucionIncidenciaFunc(id: number, solucion: string) {
  // Muestra un indicador de carga
  isLoading.value = true;

  try {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarSolucionIncidencia(toastMessage, toastColor, isToastOpen, id, solucion);

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Solución de la incidencia actualizada");
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar la solución de la incidencia");
  }
  finally {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar el responsable de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param nombreCategoria - El nombre de la categoría a actualizar.
 * @param emailResponsable - El email del responsable a actualizar.
 */
async function actualizarResponsableIncidenciaFunc(id: number, nombreCategoria: string, emailResponsable: string) {
  // Muestra un indicador de carga
  isLoading.value = true;

  try {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarResponsableIncidencia(toastMessage, toastColor, isToastOpen, id, nombreCategoria, emailResponsable);

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Responsable de la incidencia actualizado");
  }
  catch (e: any) {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar el responsable de la incidencia");
  }
  finally {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/*************************************************/
/******************** Helpers ********************/
/*************************************************/

/**
 * Obtener los responsables de una categoría.
 * @param nombreCategoria - El nombre de la categoría.
 * @return Los responsables de la categoría.
 */
function responsablesDeCategoria(nombreCategoria?: string): UsuarioCategoria[] {
  // Creamos un array de responsables
  let responsables: UsuarioCategoria[] = [];

  // Si hay nombre de categoría, se obtienen los responsables de la categoría
  if (nombreCategoria) {
    // Se obtienen los responsables de la categoría
    responsables = usuariosCategoria.value.filter((u) => u.nombreCategoria === nombreCategoria);
  }

  // Se devuelve los responsables de la categoría
  return responsables;
}

// Watch para recargar si cambian catálogos
watch([categorias, ubicaciones, usuariosCategoria], () => {
  cargarIncidencias();
}, { deep: true });

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
  box-sizing: border-box;
}

textarea.input {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  resize: vertical;
}

.textarea-problema {
  resize: none;
  min-height: 80px;
  overflow: auto;
}

.textarea-solucion {
  resize: none;
  min-height: 60px;
  max-width: 220px;
  overflow: auto;
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

.th-problema {
  max-width: 250px;
  width: 250px;
  text-align: left;
  vertical-align: top;
}

.problema-cell {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
  cursor: help;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.card-upload-table {
  overflow-y: auto;
  max-height: 600px;
  /* Aumentado para mostrar más contenido */
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
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

.actualizarSolucion {
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
    overflow-x: auto;
    width: 100%;
  }
}
</style>