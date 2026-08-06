import type { Ref } from 'vue';

export type EstadoEvento = 'ACTIVO' | 'PENDIENTE' | 'INACTIVO';

export interface Evento {
  titulo: string;
  fechaInicio: number;
  fechaFin: number;
  nombreCategoria: string;
  descripcionCategoria?: string;
  imagenCategoriaUrl?: string;
  nombreUsuario?: string;
  apellidosUsuario?: string;
  estadoEvento?: EstadoEvento;
}

export interface Categoria {
  nombre: string;
  color: string;
  descripcion: string;
}

export declare function obtenerEventos(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
): Promise<Evento[] | undefined>;

export declare function obtenerEventosAdministracion(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
): Promise<Evento[]>;

export declare function tieneSolicitudEventoPendiente(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
): Promise<boolean>;

export declare function crearSolicitudEvento(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  titulo: string,
  fechaInicio: number,
  fechaFin: number,
  nombreCategoria: string,
): Promise<void>;

export declare function actualizarEstadoEvento(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  titulo: string,
  fechaInicio: number,
  estadoEvento: EstadoEvento,
): Promise<void>;

export declare function obtenerImagenCategoriaEvento(
  imagenCategoriaUrl: string,
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
): Promise<Blob | null>;

export declare function crearEvento(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  titulo: string,
  fechaInicio: number,
  fechaFin: number,
  nombreCategoria: string,
): Promise<void>;

export declare function borrarEvento(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  titulo: string,
  fechaInicio: number,
): Promise<void>;

export declare function obtenerCategorias(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
): Promise<Categoria[] | undefined>;
