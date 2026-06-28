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

export const filtrarDatosPaginado = async (toastMessage, toastColor, isToastOpen, payload, pagina, size = 20) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    const url = new URL(printersApiUrl + '/printers/web/filter/paginated');
    url.searchParams.append('page', pagina);
    url.searchParams.append('size', size);

    return await fetch(url.toString(), 
    {
        method: 'POST',
        headers:
        {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenPropio}`
        },
        body: JSON.stringify(payload)
    });
};

export const imprimir = async (toastMessage, toastColor, isToastOpen, payload) =>
{
    let tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    return await fetch(printersApiUrl + '/printers/web/print/user',
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

/**
 * Obtiene las impresiones agrupadas por estado.
 */
export const obtenerImpresionesPorEstado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${printersApiUrl}/printers/estadisticas/estado-impresion`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener las impresiones por estado:", response.status, text);
        throw new Error(text || 'Error al obtener las impresiones por estado');
    }

    return await response.json();
};