import { auditApiUrl } from "@/environment/apiUrls";
import { obtenerTokenJWTValido } from "@/services/firebaseService";

/**
 * Obtiene las peticiones agrupadas por día de la semana.
 */
export const obtenerPeticionesPorDiaSemana = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/por-dia-semana`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las peticiones por día de la semana:", response.status, text);
        throw new Error(text || 'Error al obtener las peticiones por día de la semana');
    }

    return await response.json();
};

/**
 * Obtiene las peticiones agrupadas por tramo horario.
 */
export const obtenerPeticionesPorTramoHorario = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/por-tramo-horario`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las peticiones por tramo horario:", response.status, text);
        throw new Error(text || 'Error al obtener las peticiones por tramo horario');
    }

    return await response.json();
};

/**
 * Obtiene las peticiones agrupadas por microservicio.
 */
export const obtenerPeticionesPorMicroservicio = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/por-microservicio`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las peticiones por microservicio:", response.status, text);
        throw new Error(text || 'Error al obtener las peticiones por microservicio');
    }

    return await response.json();
};