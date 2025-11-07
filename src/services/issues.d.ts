import type { Ref } from "vue";

/**
 * Tipo que representa una incidencia TIC
 */
export interface Incidencia {
  ubicacion?: string;
  descripcionIncidencia?: string;
  estadoIncidencia?: string;
  correoDocente?: string;
  correoDestinatario?: string;
  fechaIncidencia?: string; 
}

// Tipo que representa una ubicación para incidencias

export interface Ubicacion {
  id?: number;
  nombre: string;
}

// Tipo que representa una categoría de incidencia
export interface CategoriaIncidencia {
  id?: number;
  tipo: string;               // "TIC", "DIRECCION", etc.
  nombreResponsable: string;
  correoResponsable: string;
}


/**
 * Crear una nueva incidencia
 */
export declare function crearIncidencia(
  incidencia?: Incidencia,
  toastMessage?: Ref<string>,
  toastColor?: Ref<string>,
  isToastOpen?: Ref<boolean>
): Promise<any>;

/**
 * Listar incidencias ordenadas por fecha
 */
export declare function listarIncidencias(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Incidencia[]>;

/**
 * Borrar una incidencia.
 * El backend la identifica por ubicacion + correoDocente + fechaIncidencia.
 */
export declare function borrarIncidencia(
  incidencia: Incidencia,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/**
 * Modificar una incidencia (por ejemplo el estado)
 */
export declare function modificarIncidencia(
  incidencia?: Incidencia,
  toastMessage?: Ref<string>,
  toastColor?: Ref<string>,
  isToastOpen?: Ref<boolean>
): Promise<any>;

// Listar ubicaciones disponibles para incidencias
export declare function listarUbicaciones(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Ubicacion[]>;

// Crear una nueva ubicación para incidencias
export declare function crearUbicacion(
  nombre: string,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/**
 * Borrar una ubicación
 */
export declare function borrarUbicacion(
  id: number,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

// Listar categorías de incidencias
export declare function listarCategorias(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<CategoriaIncidencia[]>;


// Crear una nueva categoría de incidencia
export declare function crearCategoria(
  categoria: CategoriaIncidencia,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<CategoriaIncidencia>;


// Borrar una categoría de incidencia
export declare function borrarCategoria(
  id: number,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;