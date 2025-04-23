import { printersApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const obtenerImpresoras = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/printers',
    {
        method: 'GET', // o 'POST', 'PUT', etc. dependiendo de tu caso
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const obtenerColores = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/colors',
    {
        method: 'GET', // o 'POST', 'PUT', etc. dependiendo de tu caso
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const obtenerEstados = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/states',
    {
        method: 'GET', // o 'POST', 'PUT', etc. dependiendo de tu caso
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const obtenerOrientaciones = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/orientations',
    {
        method: 'GET', // o 'POST', 'PUT', etc. dependiendo de tu caso
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const obtenerCaras = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/sides',
    {
        method: 'GET', // o 'POST', 'PUT', etc. dependiendo de tu caso
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const prevalidacionesImpresion = async (toastMessage, toastColor, isToastOpen) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/validations',
    {
        method: 'GET', // o 'POST', 'PUT', etc. dependiendo de tu caso
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }) ;
};

export const filtrarDatos = async (toastMessage, toastColor, isToastOpen, payload) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/filter', 
    {
        method: 'POST',
        headers:
        {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        },
        body: JSON.stringify(payload)
    });
};

export const imprimir = async (toastMessage, toastColor, isToastOpen, payload) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/print',
    {
        method: 'POST',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        },
        body: payload, // Enviar el FormData directamente
    });
};

export const cancelarImpresion = async (toastMessage, toastColor, isToastOpen, id) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(printersApiUrl + `/printers/web/cancel?id=${id}`,
    {
        method: 'POST',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}`, // Agrega el JWT al encabezado
        },
    });
};

