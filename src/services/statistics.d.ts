import type { Ref } from "vue";

/**
 * Representa una estadística del recurso más reservado.
 */
export interface EstadisticaRecurso {
    recurso: string;
    totalReservas: number;
}

/**
 * Representa una estadística del día y del tramo más reservado.
 */
export interface EstadisticaDiaTramo {
    diaSemana: string;
    tramoHorario: string;
    totalReservas: number;
}

/**
 * Obtiene el recurso más reservado según los logs del sistema.
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
 * Obtiene el día de la semana y tramo horario más reservado según los logs del sistema.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns Lista de objetos con diaSemana, tramoHorario y totalReservas.
 */
export declare function obtenerDiaTramoMasReservado(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaDiaTramo[]>;