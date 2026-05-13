import { printersApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/**
 * Obtiene las hojas impresas agrupadas por color (Blanco y negro / Color).
 */
export const obtenerHojasPorColor = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${printersApiUrl}/printers/estadisticas/color-impresion`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las hojas por color:", response.status, text);
        throw new Error(text || 'Error al obtener las hojas por color');
    }

    return await response.json();
};