import type { Ref } from "vue";

/*************************************************/
/*************** Tipos Comunes *******************/
/*************************************************/

/**
 * Tipo que representa un resolutor de incidencias
 */
export interface Resolutor {
  nombre: string;
  imprimirInforme: boolean;
}

/**
 * Tipo que representa un usuario responsable de un resolutor.
 */
export interface UsuarioResolutor {
  nombreResolutor: string;
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
  resolutor: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/*************************************************/
/**************** Resolutores ********************/
/*************************************************/

/** Listar resolutores */
export declare function listarResolutores(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<Resolutor[]>;

/** Crear un resolutor o actualizarlo si ya existiese */
export declare function guardarResolutor(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombre: string, imprimirInforme: boolean): Promise<any>;

/** Importar un CSV de resolutores, devolviendo cuántos se importaron */
export declare function importarResolutores(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, file: any): Promise<number>;

/** Borrar resolutor */
export declare function borrarResolutor(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombre: string): Promise<any>;

/** Borrar todos los resolutores que no tengan incidencias asociadas, devolviendo cuántos se borraron */
export declare function borrarTodosLosResolutores(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<number>;

/*************************************************/
/*********** Usuarios de un Resolutor ************/
/*************************************************/

/** Listar responsables */
export declare function listarUsuariosResolutor(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<UsuarioResolutor[]>;

/** Asignar un responsable a un resolutor */
export declare function crearUsuarioResolutor(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombreResolutor: string, nombreResponsable: string, emailResponsable: string): Promise<any>;

/** Desasignar un responsable de un resolutor */
export declare function borrarUsuarioResolutor(
  toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, nombreResolutor: string, nombreResponsable: string, emailResponsable: string): Promise<any>;

/*************************************************/
/**************** Incidencias ********************/
/*************************************************/

/** Crear incidencia */
export declare function crearIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, ubicacion: string, descripcion: string, nombreResolutor: string): Promise<any>;

/** Actualizar resolutor de incidencia */
export declare function actualizarResolutorIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, nombreResolutor: string): Promise<any>;

/** Actualizar estado de incidencia */
export declare function actualizarEstadoIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, estado: string): Promise<any>;

/** Actualizar solución de incidencia */
export declare function actualizarSolucionIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, solucion: string): Promise<any>;

/** Actualizar responsable de incidencia */
export declare function actualizarResponsableIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number, nombreResolutor: string, emailResponsable: string): Promise<any>;

/** Borrar incidencia */
export declare function borrarIncidencia(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, id: number): Promise<any>;

/** Listar estados posibles de incidencias */
export declare function listarEstados(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>): Promise<string[]>;

/** Listar incidencias ordenadas */
export declare function listarIncidencias(toastMessage: Ref<string>, toastColor: Ref<string>, isToastOpen: Ref<boolean>, page?: number, size?: number, sort?: string): Promise<PageResponse<Incidencia>>;

/*************************************************/
/********** Estadísticas de Incidencias **********/
/*************************************************/

/**
 * Representa una estadística agrupada por resolutor
 */
export interface EstadisticasResolutorDto {
  nombreResolutor: string;
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
 * Obtiene las estadísticas de incidencias agrupadas por resolutor.
 * Endpoint: GET /issues/estadisticas/por-resolutor
 * @param toastMessage - Ref para el mensaje del toast
 * @param toastColor - Ref para el color del toast
 * @param isToastOpen - Ref para controlar la visibilidad del toast
 * @returns Promise con array de EstadisticasResolutorDto
 */
export declare function obtenerEstadisticasPorResolutor(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<EstadisticasResolutorDto[]>;

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