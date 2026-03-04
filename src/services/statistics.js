import { bookingsApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

// ===== RESERVAS FIJAS =====

/**
 * Obtiene el recurso más reservado en RESERVAS FIJAS activas.
 */
export const obtenerRecursoMasReservadoFija = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/recurso-mas-reservado-fija`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener recurso más reservado (fijas):", response.status, text);
        throw new Error(text || 'Error al obtener recurso más reservado (fijas)');
    }
    return await response.json();
};

// ===== RESERVAS TEMPORALES =====

/**
 * Obtiene el recurso más reservado en RESERVAS TEMPORALES activas.
 */
export const obtenerRecursoMasReservadoTemporal = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/recurso-mas-reservado-temporal`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener recurso más reservado (temporales):", response.status, text);
        throw new Error(text || 'Error al obtener recurso más reservado (temporales)');
    }
    return await response.json();
};

// ===== ESTADÍSTICAS COMBINADAS (FIJAS + TEMPORALES) =====

/**
 * Obtiene el DÍA de la semana más reservado (COMBINADO: fijas + temporales).
 */
export const obtenerDiaMasReservado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/dia-mas-reservado`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener día más reservado (combinado):", response.status, text);
        throw new Error(text || 'Error al obtener día más reservado (combinado)');
    }
    return await response.json();
};

/**
 * Obtiene el TRAMO HORARIO más reservado (COMBINADO: fijas + temporales).
 */
export const obtenerTramoMasReservado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${bookingsApiUrl}/bookings/estadisticas/tramo-mas-reservado`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener tramo más reservado (combinado):", response.status, text);
        throw new Error(text || 'Error al obtener tramo más reservado (combinado)');
    }
    return await response.json();
};