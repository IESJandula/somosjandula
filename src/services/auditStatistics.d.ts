import { Ref } from 'vue';

export interface EstadisticaDiaSemana {
    diaSemana: string;
    totalPeticiones: number;
}

export interface EstadisticaTramoHorario {
    tramoHorario: string;
    totalPeticiones: number;
}

export interface EstadisticaMicroservicio {
    microservicio: string;
    totalPeticiones: number;
}

export declare function obtenerPeticionesPorDiaSemana(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaDiaSemana[]>;

export declare function obtenerPeticionesPorTramoHorario(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaTramoHorario[]>;

export declare function obtenerPeticionesPorMicroservicio(
    toastMessage: Ref<string>,
    toastColor: Ref<string>,
    isToastOpen: Ref<boolean>
): Promise<EstadisticaMicroservicio[]>;