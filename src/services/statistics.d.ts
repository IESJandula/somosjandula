import type { Ref } from "vue";

/**
 * Representa una estadística del recurso más reservado.
 */
export interface EstadisticaRecurso {
    recurso: string;
    totalReservas: number;
}

/**
 * Representa una estadística del DÍA de la semana más reservado.
 */
export interface EstadisticaDia {
    diaSemana: string;
    totalReservas: number;
}

/**
 * Representa una estadística del TRAMO HORARIO más reservado.
 */
export interface EstadisticaTramo {
    diaSemana: string;
    tramoHorario: string;
    totalReservas: number;
}

/**
 * Obtiene el recurso más reservado según las reservas reales (FIJAS + TEMPORALES).
 * Las reservas fijas se ponderan por semanas restantes hasta fin de curso.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns Lista de objetos con recurso y totalReservas.
 */
export declare function obtenerRecursoMasReservado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaRecurso[]>;

/**
 * Obtiene el tramo horario más reservado según las reservas reales (FIJAS + TEMPORALES).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns Lista de objetos con tramoHorario y totalReservas.
 */
export declare function obtenerTramoHorarioMasReservado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaTramo[]>;

/**
 * Obtiene el día de la semana más reservado según las reservas reales (FIJAS + TEMPORALES).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns Lista de objetos con diaSemana y totalReservas.
 */
export declare function obtenerDiaSemanaMasReservado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaDia[]>;

// ===== ESTADÍSTICAS COMBINADAS =====

export declare function obtenerDiaMasReservado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaDia[]>;

export declare function obtenerTramoMasReservado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaTramo[]>;