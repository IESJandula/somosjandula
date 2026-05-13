import type { Ref } from "vue";

/**
 * Representa una estadística de hojas impresas por color.
 */
export interface EstadisticaColorImpresion {
    color: string;
    totalHojas: number;
}

/**
 * Obtiene las hojas impresas agrupadas por color (Blanco y negro / Color).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns Lista de objetos con color y totalHojas.
 */
export declare function obtenerHojasPorColor(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaColorImpresion[]>;

/**
 * Representa una estadística de impresiones por estado.
 */
export interface EstadisticaEstadoImpresion {
    estado: string;
    totalImpresiones: number;
}

/**
 * Obtiene las impresiones agrupadas por estado actual.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns Lista de objetos con estado y totalImpresiones.
 */
export declare function obtenerImpresionesPorEstado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaEstadoImpresion[]>;