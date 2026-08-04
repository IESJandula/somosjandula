import type { Ref } from "vue";

/**
 * Representa una estadística de hojas impresas por color.
 */
export interface EstadisticaColorImpresion {
    color: string;
    totalHojas: number;
}

export declare function obtenerImpresoras(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function actualizarConfiguracionImpresora(toastMessage: Ref<string>,
                                                        toastColor: Ref<string>,
                                                        isToastOpen: Ref<boolean>,
                                                        nombre: string,
                                                        bloqueada: boolean,
                                                        precioHoja: number): Promise<Response>;

export declare function obtenerColores(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerEstados(toastMessage: Ref<string>,
                                       toastColor: Ref<string>,
                                       isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerOrientaciones(toastMessage: Ref<string>,
                                             toastColor: Ref<string>,
                                             isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function obtenerCaras(toastMessage: Ref<string>,
                                     toastColor: Ref<string>,
                                     isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function prevalidacionesImpresion(toastMessage: Ref<string>,
                                                 toastColor: Ref<string>,
                                                 isToastOpen: Ref<boolean>): Promise<string[]>;

export declare function filtrarDatos(toastMessage: Ref<string>,
                                     toastColor: Ref<string>,
                                     isToastOpen: Ref<boolean>,
                                     payload: string): Promise<[]>;

export declare function filtrarDatosPaginado(toastMessage: Ref<string>,
                                             toastColor: Ref<string>,
                                             isToastOpen: Ref<boolean>,
                                             payload: string,
                                             pagina: number,
                                             size?: number): Promise<Response>;

export declare function imprimir(toastMessage: Ref<string>,
                                 toastColor: Ref<string>,
                                 isToastOpen: Ref<boolean>,
                                 payload: string): Promise<Void>;

export declare function cancelarImpresion(toastMessage: Ref<string>,
                                          toastColor: Ref<string>,
                                          isToastOpen: Ref<boolean>,
                                          id: number): Promise<Void>;

/**
 * Gasto de impresión de una impresora concreta dentro del desglose del usuario.
 */
export interface DetalleCosteImpresion {
    printer: string;
    hojas: number;
    coste: number;
}

/**
 * Gasto de impresión acumulado por el usuario en el curso académico actual.
 */
export interface CosteImpresion {
    total: number;
    detalle: DetalleCosteImpresion[];
}

/**
 * Obtiene el gasto de impresión del usuario autenticado en el curso académico actual.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns El total gastado y su desglose por impresora.
 */
export declare function obtenerCosteImpresion(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<CosteImpresion>;

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