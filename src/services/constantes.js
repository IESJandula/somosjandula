import { printersApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const obtenerConstantes = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/constantes',
    {
        method: 'GET',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}`
        }
    }).then(res => res.json()) ;
};

export const actualizarConstantes = async (toastMessage, toastColor, isToastOpen, payload) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/constantes',
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
