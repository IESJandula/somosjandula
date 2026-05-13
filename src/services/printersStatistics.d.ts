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