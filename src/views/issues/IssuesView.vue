<template>
  <h1 class="t-1">Gestión de Incidencias</h1>

  <div class="top-container">
    <!-- Siempre con layout tipo admin: formulario arriba y tabla debajo -->
    <div class="top-section admin-layout">
      
      <!-- Tarjeta para crear incidencia -->
      <div class="card-upload-csv">
        <div class="container">
          <div class="t-2">Crear nueva incidencia</div>

          <div class="section">
            <label class="t-3">Ubicación</label>
            <select v-model="nuevaIncidenciaUbicacion" class="input">
              <option disabled value="">Selecciona una ubicación</option>
              <option v-for="u in ubicaciones" :key="u" :value="u">
                {{ u }}
              </option>
            </select>

            <label class="t-3">Categoría</label>
            <select v-model="nuevaIncidenciaCategoria" class="input">
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="categoria in categorias" :key="categoria.nombre" :value="categoria.nombre">
                {{ categoria.nombre }}
              </option>
            </select>

            <label class="t-3">Problema</label>
            <textarea v-model="nuevaIncidenciaProblema" class="input" placeholder="Describe el problema..."></textarea>

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

          <input v-model="filtroTexto" class="filtro-input filtro-derecha" type="text" placeholder="Filtrar incidencias (min. 4 letras)..." />

          <!-- Control de tamaño de página -->
          <div class="items-por-pagina">
            <label for="page-size" class="paginacion-label">
              Incidencias por página:
            </label>
            <input id="page-size" type="number" v-model.number="pageSize" min="1" max="20" class="input input-page-size" />
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
            <tr v-for="incidencia in incidenciasPaginadas" :key="incidencia.ubicacion + '-' + incidencia.fecha">
              <td class="th" :title="esAdmin ? (incidencia.nombre + ' ' + incidencia.apellidos) : ''">
                {{ incidencia.ubicacion }}
              </td>
              <td class="th" :title="incidencia.fecha">
                <select v-model="incidencia.categoria" class="input" 
                        v-if="puedeEditarIncidencia(incidencia.emailResponsable!, incidencia.categoria!)"
                        @change="actualizarCategoriaIncidenciaFunc(incidencia.id!, incidencia.categoria!)">
                  <option value="" disabled>Sin categoría asignada</option>
                  <option v-for="categoria in categorias" :key="categoria.nombre" :value="categoria.nombre">
                    {{ categoria.nombre }}
                  </option>
                </select>
                <span v-else>
                  {{ incidencia.categoria || '—' }}
                </span>
              </td>
              <td class="th" :title="esAdmin ? (incidencia.email) : ''">
                {{ incidencia.problema }}
              </td>

              <!-- ESTADO (celda más grande) -->
              <td class="th th-estado">
                <select 
                  v-model="incidencia.estado" 
                  class="input" 
                  v-if="puedeEditarIncidencia(incidencia.emailResponsable!, incidencia.categoria!)"
                  @change="actualizarEstadoIncidenciaFunc(incidencia.id!, incidencia.estado!)"
                >
                  <option value="" disabled>Selecciona estado</option>
                  <option v-for="estado in estados" :key="estado" :value="estado">
                    {{ estado }}
                  </option>
                </select>
                <span v-else>
                  {{ incidencia.estado || '—' }}
                </span>
              </td>

              <!-- RESPONSABLE -->
              <td class="th">
                <!-- Admin o responsable pueden editar (select con solo nombre) -->
                <select v-model="incidencia.emailResponsable" class="input"
                        v-if="puedeEditarIncidencia(incidencia.emailResponsable!, incidencia.categoria!)"
                        @change="actualizarResponsableIncidenciaFunc(incidencia.id!, incidencia.categoria!, incidencia.emailResponsable!)">
                  <option value="" disabled>Sin responsable asignado</option>
                  <option v-for="resp in responsablesDeCategoria(incidencia.categoria!)" :key="resp.emailResponsable" :value="resp.emailResponsable">
                    {{ resp.nombreResponsable }}
                  </option>
                </select>
                <!-- Usuario normal ve solo el nombre del responsable -->
                <span v-else>
                  {{ incidencia.nombreResponsable || '—' }}
                </span>
              </td>

              <!-- COMENTARIO / SOLUCIÓN -->
              <td class="th">
                <textarea v-model="incidencia.solucion" class="input" placeholder="Describe la solución..." v-if="puedeEditarIncidencia(incidencia.emailResponsable!, incidencia.categoria!)">
                  {{ incidencia.solucion || '—' }}
                </textarea>
                <span v-else>
                  {{ incidencia.solucion || '—' }}
                </span>
              </td>

              <!-- BORRAR / GUARDAR -->
              <td class="th">
                <!-- Botón guardar solución solo para admin o responsable -->
                <button @click="actualizarSolucionIncidenciaFunc(incidencia.id!, incidencia.solucion!)" class="actualizarSolucion" v-if="puedeEditarIncidencia(incidencia.emailResponsable!, incidencia.categoria!)">Actualizar solución</button>
                <button @click="borrarIncidenciaFunc(incidencia.id!)" class="eliminar" v-if="incidencia.estado === 'PENDIENTE'">&times;</button>
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
        <div class="paginacion" v-if="incidenciasFiltradas.length > pageSize">
          <button class="pag-btn" :disabled="currentPage === 1" @click="irPagina(currentPage - 1)">
            ‹ Anterior
          </button>

          <span class="paginacion-info">
            Página {{ currentPage }} de {{ totalPaginas }} - Mostrando {{ rangoInicio }}–{{ rangoFin }} de {{ incidenciasFiltradas.length }}
          </span>

          <button class="pag-btn" :disabled="currentPage === totalPaginas" @click="irPagina(currentPage + 1)">Siguiente ›</button>
        </div>
      </div>

    </div>
  </div>

  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000" @did-dismiss="() => (isToastOpen = false)" position="top" />
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
  listarUbicaciones,
  listarCategorias,
  listarUsuariosCategoria,
  actualizarCategoriaIncidencia,
  actualizarEstadoIncidencia,
  actualizarSolucionIncidencia,
  actualizarResponsableIncidencia,
  listarEstados,
} from "@/services/issues.js";

// Servicio que te da email y roles del usuario logueado.
import { obtenerDatosUsuarioSesion } from "@/services/firebaseService"; 


// ------------ Estado global de la vista ------------

const categorias = ref<Categoria[]>([]);

// Ubicaciones e incidencias
const ubicaciones = ref<string[]>([]);
const incidencias = ref<Incidencia[]>([]);
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

const pageSize = ref<number>(8);  // incidencias por página (editable 1–20)
const currentPage = ref<number>(1);

/*************************************************/
/*********** Montaje y Carga de datos ************/
/*************************************************/

/**
 * Cargar los datos del usuario, ubicaciones, categorías, estados y usuarios de categoría.
 * @returns void
 */
 onMounted(async () =>
{
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

  // Cargamos las incidencias
  await cargarIncidencias();
});

/**
 * Cargar los datos del usuario.
 * @returns void
 */
async function cargarDatosUsuario()
{
  try
  {
    // Obtenemos los datos del usuario de la sesión
    const datos = await obtenerDatosUsuarioSesion(toastMessage, toastColor, isToastOpen);

    // Asignamos los datos del usuario a las variables
    emailUsuario.value = datos.email || "";

    esAdmin.value = datos.roles.includes("ADMINISTRADOR") || datos.roles.includes("DIRECCION");
  }
  catch (e: any)
  {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos el mensaje de error en un toast
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar los datos de sesión del usuario");
  }
}

/**
 * Cargar las incidencias.
 */
async function cargarIncidencias()
{
  try
  {
    // Obtenemos las incidencias
    const lista = await listarIncidencias(toastMessage, toastColor, isToastOpen);
    
    // Asignamos las incidencias a las variables
    incidencias.value = lista.map((i: any) => {
            // Asignamos las incidencias a las variables
            return {
                    ...i,
                    categoria: i.categoria ?? "",
                    solucion: i.solucion ?? "",
                    estado: i.estado ?? "",
                    emailResponsable: i.emailResponsable ?? "",
            } as Incidencia;
    });
  }
  catch (e: any)
  {
    // Mostramos el mensaje de error en la consola
    console.error(e);
    
    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar las incidencias");
  }
}

/**
 * Cargar las ubicaciones.
 */
async function cargarUbicaciones()
{
  try
  {
    // Obtenemos las ubicaciones
    const lista = await listarUbicaciones(toastMessage, toastColor, isToastOpen);

    // Asignamos las ubicaciones a las variables
    ubicaciones.value = lista.map((u: any) => u.nombre);
  }
  catch (e: any)
  {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar las ubicaciones");
  }
}

/**
 * Cargar las categorías.
 */
async function cargarCategorias()
{
  try
  {
    // Obtenemos las categorías
    categorias.value = await listarCategorias(toastMessage, toastColor, isToastOpen);
  }
  catch (e: any)
  {
    // Mostramos el mensaje de error en la consola
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar las categorías");
  }
}

/**
 * Cargar los estados.
 */
async function cargarEstados()
{
  try
  {
    // Obtenemos los estados
    estados.value = await listarEstados(toastMessage, toastColor, isToastOpen);
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al cargar los estados");
  }
}

/**
 * Cargar los usuarios de categoría.
 */
async function cargarUsuariosCategoria()
{
  try
  {
    // Obtenemos los usuarios de categoría
    usuariosCategoria.value = await listarUsuariosCategoria(toastMessage, toastColor, isToastOpen);
  }
  catch (e: any)
  {
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
function esResponsableDeCategoria(emailResponsable: string, categoria: string): boolean
{
  // Creamos una variable para el resultado
  let resultado: boolean = false;

  // Si no hay nombre de categoría o no hay correo del usuario, se devuelve false
  if (emailResponsable && emailUsuario.value)
  {
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
function puedeEditarIncidencia(emailResponsable: string, categoria: string): boolean
{
  // Validamos si el usuario es administrador o es responsable de la categoría
  return esAdmin.value || esResponsableDeCategoria(emailResponsable, categoria);
}

/*************************************************/
/**************** Paginación *********************/
/*************************************************/

/**
 * Filtrar las incidencias.
 * @return Las incidencias filtradas.
 */
const incidenciasFiltradas = computed(() =>
{
  // Creamos una variable para el filtro
  const filtro = filtroTexto.value.trim().toLowerCase();

  // Si el filtro tiene menos de 4 caracteres, mostramos todas
  if (!filtro || filtro.length < 4)
  {
    // Se devuelven todas las incidencias
    return incidencias.value;
  }

  // Se filtran las incidencias
  return incidencias.value.filter((i) =>
  {
    // Creamos una variable para la ubicación
    const ubicacion = i.ubicacion ?? "";

    // Creamos una variable para el email
    const email = i.email ?? "";

    // Creamos una variable para el nombre
    const nombre = i.nombre ?? "";

    // Creamos una variable para los apellidos
    const apellidos = i.apellidos ?? "";

    // Creamos una variable para la fecha
    const fecha = i.fecha ?? "";

    // Creamos una variable para el problema
    const problema = i.problema ?? "";

    // Creamos una variable para el estado
    const estado = i.estado ?? "";

    // Creamos una variable para la solución
    const solucion = i.solucion ?? "";
    
    // Creamos una variable para el email del responsable
    const emailResponsable = i.emailResponsable ?? "";
    
    // Creamos una variable para la categoría
    const categoria = i.categoria ?? "";

    // Buscamos el responsable para obtener su nombre
    let nombreResponsable = "";
    
    // Si hay nombre de categoría y email del responsable, se obtiene el nombre del responsable
    if (i.categoria && i.emailResponsable)
    {
      // Se obtiene el responsable de la categoría
      const responsable = usuariosCategoria.value.find(
        (u) => u.nombreCategoria === i.categoria && u.emailResponsable.toLowerCase() === i.emailResponsable!.toLowerCase()
      );

      // Si hay responsable, se obtiene el nombre del responsable
      if (responsable)
      {
        nombreResponsable = responsable.nombreResponsable ?? "";
      }
    }

    // Se crea el texto a filtrar
    const texto = (ubicacion + " " + email + " " + nombre + " " + apellidos + " " + fecha + " " + problema + " " + estado + " " + solucion + " " + emailResponsable + " " + nombreResponsable + " " + categoria).toLowerCase();

    // Se devuelve si el texto incluye el filtro
    return texto.includes(filtro);
  });
});

/**
 * Calcular el total de páginas.
 * @return El total de páginas.
 */
const totalPaginas = computed(() =>
{

  // Creamos una variable para el total de páginas
  let total = 1;

  // Si no hay incidencias filtradas, se devuelve 1
  if (incidenciasFiltradas.value.length)
  {
    // Se calcula el total de páginas
    total = Math.ceil(incidenciasFiltradas.value.length / pageSize.value);
  }

  // Se devuelve el total de páginas
  return total;
});

/**
 * Obtener las incidencias de la página actual.
 * @return Las incidencias de la página actual.
 */
const incidenciasPaginadas = computed(() =>
{
  // Creamos una variable para el inicio
  const start = (currentPage.value - 1) * pageSize.value;

  // Se devuelven las incidencias de la página actual
  return incidenciasFiltradas.value.slice(start, start + pageSize.value);
});

/**
 * Calcular el rango de inicio.
 * @return El rango de inicio.
 */
const rangoInicio = computed(() =>
{
  // Creamos una variable para el rango de inicio
  let inicio = 0;

  // Si no hay incidencias filtradas, se devuelve 0
  if (incidenciasFiltradas.value.length)
  {
    // Se calcula el rango de inicio
    inicio = (currentPage.value - 1) * pageSize.value + 1;
  }

  // Se devuelve el rango de inicio
  return inicio;
});

/**
 * Calcular el rango de fin.
 * @return El rango de fin.
 */
const rangoFin = computed(() =>
{
  // Creamos una variable para el total
  const total = incidenciasFiltradas.value.length;

  // Creamos una variable para el fin
  const fin = currentPage.value * pageSize.value;

  // Se calcula el rango de fin
  return fin > total ? total : fin;
});

/**
 * Ir a una página concreta.
 * @param pagina - La página a ir.
 */
function irPagina(pagina: number)
{
  // Si la página es menor que 1 o mayor que el total de páginas, se devuelve
  if (pagina >= 1 && pagina <= totalPaginas.value)
  {
    // Se cambia la página actual
    currentPage.value = pagina;
  }
}

// Forzar límites de pageSize (1 a 20)
watch(pageSize, (nuevo) =>
{
  // Si el nuevo tamaño de página es menor que 1, se establece a 1
  if (!nuevo || nuevo < 1) pageSize.value = 1;

  // Si el nuevo tamaño de página es mayor que 20, se establece a 20
  if (nuevo > 20) pageSize.value = 20;
});

// Si cambian filtro, incidencias o pageSize, reseteamos a página 1
watch( [filtroTexto, incidencias, pageSize], () =>
{
  // Se cambia la página actual a 1
  currentPage.value = 1;
}, { deep: true });

/*************************************************/
/******************** Acciones *******************/
/*************************************************/

/**
 * Crear una nueva incidencia.
 */
async function crearIncidenciaFunc()
{
  try
  {
    // Muestra un indicador de carga
    isLoading.value = true;

    // Inicializamos el mensaje de error
    let mensaje = "";

    // Si no se ha seleccionado una categoría, no se puede crear la incidencia
    if (!nuevaIncidenciaCategoria.value)
    {
      // Creamos el mensaje de error
      mensaje = "Selecciona una categoría";
    }
    // Si no se ha seleccionado una ubicación, no se puede crear la incidencia
    else if (!nuevaIncidenciaUbicacion.value)
    {
      // Creamos el mensaje de error
      mensaje = "Selecciona una ubicación";
    }
    // Si no se ha seleccionado un problema, no se puede crear la incidencia
    else if (!nuevaIncidenciaProblema.value)
    {
      // Creamos el mensaje de error
      mensaje = "Indica el problema que has encontrado";
    }

    // Si hay mensaje de error, se muestra el mensaje de error
    if (mensaje)
    {
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
      nuevaIncidenciaProblema.value  = "";

      // Cargamos las incidencias nuevamente
      await cargarIncidencias();
    }
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al crear incidencia");
  }
  finally
  {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Borrar una incidencia.
 * @param id - El ID de la incidencia a borrar.
 */
async function borrarIncidenciaFunc(id: number)
{
  try
  {
    // Muestra un indicador de carga
    isLoading.value = true;

    // Si puede borrar la incidencia, tratamos de borrarla
    await borrarIncidencia(toastMessage, toastColor, isToastOpen, id);

    // Si se borra correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Incidencia eliminada");

    // Cargamos las incidencias nuevamente
    await cargarIncidencias();
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Si hay un error, mostramos un toast de error
    crearToast( toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al borrar incidencia");
  }
  finally
  {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar la categoría de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param nombreCategoria - El nombre de la categoría a actualizar.
 */
async function actualizarCategoriaIncidenciaFunc(id: number, nombreCategoria: string)
{
  // Muestra un indicador de carga
  isLoading.value = true;

  try
  {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarCategoriaIncidencia(toastMessage, toastColor, isToastOpen, id, nombreCategoria);

    // Cargamos las incidencias nuevamente
    await cargarIncidencias();

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría de la incidencia actualizada"); 
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar la categoría de la incidencia");
  }
  finally
  {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar el estado de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param estado - El estado de la incidencia a actualizar.
 */
async function actualizarEstadoIncidenciaFunc(id: number, estado: string)
{
  // Muestra un indicador de carga
  isLoading.value = true;

  try
  {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarEstadoIncidencia(toastMessage, toastColor, isToastOpen, id, estado);

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Estado de la incidencia actualizada"); 
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar el estado de la incidencia");
  }
  finally
  {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar la solución de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param solucion - La solución de la incidencia a actualizar.
 */
async function actualizarSolucionIncidenciaFunc(id: number, solucion: string)
{
  // Muestra un indicador de carga
  isLoading.value = true;

  try
  {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarSolucionIncidencia(toastMessage, toastColor, isToastOpen, id, solucion);

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Solución de la incidencia actualizada"); 
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar la solución de la incidencia");
  }
  finally
  {
    // Oculta el indicador de carga
    isLoading.value = false;
  }
}

/**
 * Actualizar el responsable de una incidencia por parte del responsable.
 * @param id - El ID de la incidencia a actualizar.
 * @param nombreResponsable - El nombre del responsable a actualizar.
 * @param emailResponsable - El email del responsable a actualizar.
 */
async function actualizarResponsableIncidenciaFunc(id: number, nombreResponsable: string, emailResponsable: string)
{
  // Muestra un indicador de carga
  isLoading.value = true;

  try
  {
    // Si puede editar la incidencia, tratamos de actualizarla
    await actualizarResponsableIncidencia(toastMessage, toastColor, isToastOpen, id, nombreResponsable, emailResponsable);

    // Si se actualiza correctamente, mostramos un toast de éxito
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Responsable de la incidencia actualizado"); 
  }
  catch (e: any)
  {
    // Creamos el mensaje de error
    console.error(e);

    // Mostramos un toast de error
    crearToast(toastMessage, toastColor, isToastOpen, "danger", e.message || "Error al actualizar el responsable de la incidencia");
  }
  finally
  {
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
function responsablesDeCategoria(nombreCategoria?: string): UsuarioCategoria[]
{
  // Creamos un array de responsables
  let responsables: UsuarioCategoria[] = [];

  // Si hay nombre de categoría, se obtienen los responsables de la categoría
  if (nombreCategoria)
  {
    // Se obtienen los responsables de la categoría
    responsables = usuariosCategoria.value.filter((u) => u.nombreCategoria === nombreCategoria);
  }

  // Se devuelve los responsables de la categoría
  return responsables;
}

/**
 * Mostrar el nombre del responsable de una categoría.
 * @param nombreCategoria - El nombre de la categoría.
 * @param emailResponsable - El email del responsable.
 * @return El nombre del responsable.
 */
function mostrarNombreResponsable(nombreCategoria?: string, emailResponsable?: string): string
{
  // Creamos una variable para el responsable
  let responsable: string = "Sin responsable";

  // Si no hay email del responsable, se devuelve "Sin responsable"
  if (emailResponsable)
  {
    // Se obtiene el responsable de la categoría
    responsable = usuariosCategoria.value.find(
                    (u) => u.nombreCategoria === nombreCategoria && u.emailResponsable.toLowerCase() === emailResponsable.toLowerCase())?.nombreResponsable ?? "Sin responsable";
  }

  // Se devuelve el nombre del responsable
  return responsable;
}

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
    overflow-x:auto;
    width: 100%;
  }
}
</style>
