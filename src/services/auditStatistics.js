import { auditApiUrl } from "@/environment/apiUrls";
import { obtenerTokenJWTValido } from "@/services/adminService";

/**
 * Obtiene las peticiones agrupadas por día de la semana.
 */
export const obtenerPeticionesPorDiaSemana = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/dia`, {
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

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/tramo`, {
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
 * Obtiene las peticiones agrupadas por microservicio de llamadas internas.
 */
export const obtenerPeticionesPorMicroservicioInternas = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/microservicio/internas`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las peticiones por microservicio de llamadas internas:", response.status, text);
        throw new Error(text || 'Error al obtener las peticiones por microservicio de llamadas internas');
    }

    return await response.json();
};

/**
 * Obtiene las peticiones agrupadas por microservicio de llamadas externas.
 */
export const obtenerPeticionesPorMicroservicioExternas = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${auditApiUrl}/audit/estadisticas/microservicio/externas`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, 
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las peticiones por microservicio de llamadas externas:", response.status, text);
        throw new Error(text || 'Error al obtener las peticiones por microservicio de llamadas externas');
    }

    return await response.json();
};