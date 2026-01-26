import type { Ref } from 'vue'

export type VistaPajaroResponseDto = {
  mapaActuadores: Record<string, any[]>
  mapaSensoresBooleanos: Record<string, any[]>
  mapaSensoresNumericos: Record<string, any[]>
}

export declare function obtenerDispositivos(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<VistaPajaroResponseDto>


export declare function obtenerCursosAcademicos(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>
): Promise<any[]>

export declare function obtenerEspaciosFijo(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  cursoAcademico: string
): Promise<any[]>

export declare function obtenerEspaciosDesdoble(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  cursoAcademico: string
): Promise<any[]>

export declare function obtenerEspaciosSinDocencia(
  toastMessage: Ref<string>,
  toastColor: Ref<string>,
  isToastOpen: Ref<boolean>,
  cursoAcademico: string
): Promise<any[]>
