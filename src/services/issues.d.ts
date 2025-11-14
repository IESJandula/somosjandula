import type { Ref } from "vue";

/* =========================================================
 * TIPOS COMUNES
 * =======================================================*/

/**
 * Tipo que representa una incidencia TIC
 */
export interface Incidencia {
  ubicacion?: string;
  descripcionIncidencia?: string;
  estadoIncidencia?: string;
  correoDocente?: string;
  fechaIncidencia?: string;
  nombreCategoria?: string;
  comentario?: string;
  correoResponsable?: string;
}

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
  nombreCategoria: string;
}

/**
 * Tipo que representa un usuario responsable de una categoría
 */
export interface UsuarioCategoria {
  nombreCategoria: string;
  nombreResponsable: string;
  correoResponsable: string;
}

/* =========================================================
 * INCIDENCIAS
 * =======================================================*/

/** Crear incidencia */
export declare function crearIncidencia(
  incidencia: Incidencia,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/** Listar incidencias ordenadas */
export declare function listarIncidencias(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Incidencia[]>;

/** Borrar incidencia */
export declare function borrarIncidencia(
  incidencia: Incidencia,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/** Modificar incidencia */
export declare function modificarIncidencia(
  incidencia: Incidencia,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/** Listar estados posibles de incidencias */
export declare function listarEstados(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<string[]>;


/* =========================================================
 * UBICACIONES
 * =======================================================*/

/** Listar ubicaciones */
export declare function listarUbicaciones(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Ubicacion[]>;

/** Crear ubicación */
export declare function crearUbicacion(
  nombre: string,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/** Borrar ubicación */
export declare function borrarUbicacion(
  id: number,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/* =========================================================
 * CATEGORÍAS
 * =======================================================*/

/** Listar categorías */
export declare function listarCategorias(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Categoria[]>;

/** Crear categoría */
export declare function crearCategoria(
  categoria: Categoria,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<Categoria>;

/** Borrar categoría */
export declare function borrarCategoria(
  nombreCategoria: string,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;

/* =========================================================
 * USUARIO–CATEGORÍA (RESPONSABLES)
 * =======================================================*/

/** Listar responsables */
export declare function listarUsuariosCategoria(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<UsuarioCategoria[]>;

/** Crear responsable */
export declare function crearUsuarioCategoria(
  usuarioCategoria: UsuarioCategoria,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<UsuarioCategoria>;

/** Borrar responsable */
export declare function borrarUsuarioCategoria(
  usuarioCategoria: UsuarioCategoria,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any>;
