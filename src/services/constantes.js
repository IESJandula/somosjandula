import { printersApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const obtenerConstantes = async (endpointConstantes, toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(endpointConstantes,
    {
        method: 'GET',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}`
        }
    }).then(res => res.json()) ;
};

export const actualizarConstantes = async (endpointConstantes, toastMessage, toastColor, isToastOpen, payload) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(endpointConstantes,
    {
        method: 'POST',
        headers:
        {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenPropio}`
        },
        body: JSON.stringify(payload)
    }) ;
};
