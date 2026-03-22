import { bookingsApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/**
 * Obtiene el recurso más reservado según las reservas reales (FIJAS + TEMPORALES).
 */
export const obtenerRecursoMasReservado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/recurso-mas-reservado`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener el recurso más reservado:", response.status, text);
        throw new Error(text || 'Error al obtener el recurso más reservado');
    }

    return await response.json();
};

/**
 * Obtiene el tramo horario más reservado según las reservas reales (FIJAS + TEMPORALES).
 */
export const obtenerTramoHorarioMasReservado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/tramo-horario-mas-reservado`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener el tramo horario más reservado:", response.status, text);
        throw new Error(text || 'Error al obtener el tramo horario más reservado');
    }

    return await response.json();
};

/**
 * Obtiene el día de la semana más reservado según las reservas reales (FIJAS + TEMPORALES).
 */
export const obtenerDiaSemanaMasReservado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/dia-semana-mas-reservado`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener el día de la semana más reservado:", response.status, text);
        throw new Error(text || 'Error al obtener el día de la semana más reservado');
    }

    return await response.json();
};