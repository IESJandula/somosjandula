import { eventsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const obtenerEventos = async (toastMessage, toastColor, isToastOpen) => 
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(eventsApiUrl + '/events/manager',
        {
            method: 'GET',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}`,
            },
        })

    if (!response.ok) 
    {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return await response.json()
}

export const crearEvento = async (toastMessage, toastColor, isToastOpen, payload) => 
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(eventsApiUrl + '/events/manager',
        {
            method: 'POST',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
            },
            body: payload, // Enviar el FormData directamente
        });
}

export const borrarEvento = async (toastMessage, toastColor, isToastOpen, recurso) => 
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(eventsApiUrl + '/events/manager',
        {
            method: 'DELETE',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}`,
                'titulo': titulo,           
                'fechaInicio': fechaInicio, 
                'fechaFin': fechaFin        
            },
        })

    if (!response.ok) 
    {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
}

