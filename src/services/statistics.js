import { bookingsApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/**
 * Obtiene el recurso más reservado según los logs del sistema.
 * @param {import('vue').Ref<string>} toastMessage - El mensaje de toast.
 * @param {import('vue').Ref<string>} toastColor - El color de toast.
 * @param {import('vue').Ref<boolean>} isToastOpen - Indica si el toast está abierto.
 * @returns {Promise<Array>} Lista de objetos con recurso y totalReservas.
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
 * Obtiene el día de la semana y tramo horario más reservado según los logs del sistema.
 * @param {import('vue').Ref<string>} toastMessage - El mensaje de toast.
 * @param {import('vue').Ref<string>} toastColor - El color de toast.
 * @param {import('vue').Ref<boolean>} isToastOpen - Indica si el toast está abierto.
 * @returns {Promise<Array>} Lista de objetos con diaSemana, tramoHorario y totalReservas.
 */
export const obtenerDiaTramoMasReservado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/dia-tramo-mas-reservado`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener el día y tramo más reservado:", response.status, text);
        throw new Error(text || 'Error al obtener el día y tramo más reservado');
    }

    return await response.json();
};