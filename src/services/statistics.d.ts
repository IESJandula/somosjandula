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

// ===== RESERVAS FIJAS =====

export declare function obtenerRecursoMasReservadoFija(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaRecurso[]>;

// ===== RESERVAS TEMPORALES =====

export declare function obtenerRecursoMasReservadoTemporal(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaRecurso[]>;

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