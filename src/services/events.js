import { eventsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const getEventos = async (toastMessage, toastColor, isToastOpen) => {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(eventsApiUrl + '/events',
        {
            method: 'GET',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}`,
            },
        })

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return await response.json()
}

export const enviar = async (toastMessage, toastColor, isToastOpen, payload) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(eventsApiUrl + '/events',
    {
        method: 'POST',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        },
        body: payload, // Enviar el FormData directamente
    });
}

export const getListaEventos = async (toastMessage, toastColor, isToastOpen) => {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(bookingsApiUrl + '/events',
        {
            method: 'GET',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}`,
            },
        })

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return await response.json()
};