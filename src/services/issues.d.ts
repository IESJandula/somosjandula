import type { Ref } from "vue";

/*************************************************/
/*************** Tipos Comunes *******************/
/*************************************************/

/**
 * Tipo que representa una ubicación para incidencias
 */
export interface Ubicacion {
  id?: number;
  nombre: string;
}

/**
 * Tipo que representa una categoría de incidencia
 */
export interface Categoria {
  nombre: string;
  imprimirInforme: boolean;
}

/**
 * Tipo que representa un usuario responsable de una categoría
 */
export interface UsuarioCategoria {
  nombreCategoria: string;
  nombreResponsable: string;
  emailResponsable: string;
}

export interface Incidencia {
  id?: number;
  ubicacion: string;
  email: string;
  nombre: string;
  apellidos: string;
  fecha: string;
  problema: string;
  estado: string;
  solucion: string;
  emailResponsable: string;
  nombreResponsable: string;
  categoria: string;
}

/*************************************************/
/**************** Ubicaciones ********************/
/*************************************************/

/** Listar ubicaciones */
export declare function listarUbicaciones(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<Ubicacion[]>;

/** Crear ubicación */
export declare function crearUbicacion(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombre: string): Promise<any>;

/** Borrar ubicación */
export declare function borrarUbicacion(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombre: string): Promise<any>;

/*************************************************/
/**************** Categorías *********************/
/*************************************************/

/** Listar categorías */
export declare function listarCategorias(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<Categoria[]>;

/** Crear categoría */
export declare function crearCategoria(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombre: string, imprimirInforme: boolean): Promise<any>;

/** Borrar categoría */
export declare function borrarCategoria(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombre: string): Promise<any>;

/*************************************************/
/************ Usuarios Categoría *****************/
/*************************************************/

/** Listar responsables */
export declare function listarUsuariosCategoria(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<UsuarioCategoria[]>;

/** Crear responsable */
export declare function crearUsuarioCategoria(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombreCategoria: string, nombreResponsable: string, emailResponsable: string): Promise<any>;

/** Borrar responsable */
export declare function borrarUsuarioCategoria(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombreCategoria: string, nombreResponsable: string, emailResponsable: string): Promise<any>;

/*************************************************/
/**************** Incidencias ********************/
/*************************************************/

/** Crear incidencia */
export declare function crearIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, ubicacion: string, descripcion: string, nombreCategoria: string): Promise<any>;

/** Actualizar categoría de incidencia */
export declare function actualizarCategoriaIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, nombreCategoria: string): Promise<any>;

/** Actualizar estado de incidencia */
export declare function actualizarEstadoIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, estado: string): Promise<any>;

/** Actualizar solución de incidencia */
export declare function actualizarSolucionIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, solucion: string): Promise<any>;

/** Actualizar responsable de incidencia */
export declare function actualizarResponsableIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, nombreCategoria: string, emailResponsable: string): Promise<any>;

/** Borrar incidencia */
export declare function borrarIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number): Promise<any>;

/** Listar estados posibles de incidencias */
export declare function listarEstados(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<string[]>;

/** Listar incidencias ordenadas */
export declare function listarIncidencias(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<Incidencia[]>;

/*************************************************/
/********** Estadísticas de Incidencias **********/
/*************************************************/

/**
 * Representa una estadística agrupada por categoría
 */
export interface EstadisticasCategoriaDto {
    nombreCategoria: string;
    cantidad: number;
}

/**
 * Representa una estadística agrupada por estado
 */
export interface EstadisticasEstadoDto {
    estado: string;
    cantidad: number;
}

/**
 * Representa una estadística agrupada por ubicación
 */
export interface EstadisticasUbicacionDto {
    nombreUbicacion: string;
    cantidad: number;
}

/**
 * Obtiene las estadísticas de incidencias agrupadas por categoría.
 * Endpoint: GET /issues/estadisticas/por-categoria
 * @param toastMessage - Ref para el mensaje del toast
 * @param toastColor - Ref para el color del toast
 * @param isToastOpen - Ref para controlar la visibilidad del toast
 * @returns Promise con array de EstadisticasCategoriaDto
 */
export declare function obtenerEstadisticasPorCategoria(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticasCategoriaDto[]>;

/**
 * Obtiene las estadísticas de incidencias agrupadas por estado.
 * Endpoint: GET /issues/estadisticas/por-estado
 */
export declare function obtenerEstadisticasPorEstado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticasEstadoDto[]>;

/**
 * Obtiene las estadísticas de incidencias agrupadas por ubicación.
 * Endpoint: GET /issues/estadisticas/por-ubicacion
 */
export declare function obtenerEstadisticasPorUbicacion(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticasUbicacionDto[]>;