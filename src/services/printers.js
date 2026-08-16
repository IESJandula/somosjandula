import { printersApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/adminService';

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

/**
 * Actualiza la configuración de una impresora: si está bloqueada y el precio de cada hoja impresa.
 * La impresora se identifica por su nombre, que viaja como parámetro porque puede llevar tildes.
 */
export const actualizarConfiguracionImpresora = async (toastMessage, toastColor, isToastOpen, nombre, bloqueada, precioHoja) =>
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

    // El backend espera el precio con punto decimal, que es como lo serializa toString de un número
    const precio = Number(precioHoja);

    const parametros = new URLSearchParams({
        name: nombre,
        bloqueada: bloqueada ? 'true' : 'false',
        precioHoja: Number.isFinite(precio) ? precio.toString() : '0'
    });

    const response = await fetch(`${printersApiUrl}/printers/web/printers/config?${parametros}`,
    {
        method: 'POST',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error al actualizar la configuración de la impresora:", response.status, errorData);
        throw new Error(errorData.message || 'Error al actualizar la configuración de la impresora');
    }

    return response;
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
 * Confirma la entrega de una impresion pendiente de recogida. El servidor solo permite esta operacion a
 * administracion y conserjeria.
 */
export const confirmarRecogidaImpresion = async (toastMessage, toastColor, isToastOpen, id) =>
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(printersApiUrl + '/printers/web/print/confirmar-recogida',
    {
        method: 'POST',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}`,
            'id': String(id),
        },
    });
};

/**
 * Obtiene el gasto de impresión acumulado por el usuario autenticado en el curso académico actual,
 * con su desglose por impresora.
 */
export const obtenerCosteImpresion = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${printersApiUrl}/printers/web/print/coste`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error al obtener el coste de impresión:", response.status, errorData);
        throw new Error(errorData.message || 'Error al obtener el coste de impresión');
    }

    return await response.json();
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
