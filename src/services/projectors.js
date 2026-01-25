import { obtenerTokenJWTValido } from '@/services/firebaseService';
import { EVENTS_OVERVIEW, ACTIONS, FLOORS, MODELS, PROJECTORS, EVENTS_BATCH, CLASSROOMS, EVENT_STATES, SERVER_EVENT, PROJECTOR_OVERVIEW, PROJECTORS_ALL, ACTIONS_PAGE, COMMANDS_PAGE, COMMANDS } from '@/utils/constants';

export const fetchEventsOverView = async (toastMessage, toastColor, isToastOpen) =>
    {
        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;
    
        const respuesta = await fetch(EVENTS_OVERVIEW,
        {
            method: 'GET',
            headers:
            {
                'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
            }
        }).then(res => res.json());

        console.log( "Respuesta de servicio: " + respuesta );

        return respuesta;
};

export const fetchActionsList = async (toastMessage, toastColor, isToastOpen) => 
{
    console.log('Fetching actions list.');

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(ACTIONS,
    {
        method: 'GET',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const fetchFloorsList = async (toastMessage, toastColor, isToastOpen) => 
{
    console.log('Fetching floors list.');

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(FLOORS,
    {
        method: 'GET',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const fetchProjectorModelsList = async (toastMessage, toastColor, isToastOpen) => 
{
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(MODELS,
    {
        method: 'GET',
        headers:
        {
            'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
};

export const fetchProjectorList = async (
    toastMessage, 
    toastColor, 
    isToastOpen, 
    criteria, 
    page, 
    size, 
    classroom, 
    floor,
    status, 
    model ) => {

    // Normalizar valores
    if (classroom === 'default') classroom = null;
    if (floor === 'default') floor = null;
    if (model === 'default') model = null;
    if (status === 'default') status = null;
 
    // Obtener token JWT válido
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Construcción de query string
    const queryParams = new URLSearchParams();

    if (criteria) queryParams.append('criteria', criteria);
    if (page !== undefined) queryParams.append('page', page);
    if (size !== undefined) queryParams.append('size', size);
    if (classroom !== null) queryParams.append('classroom', classroom);
    if (floor !== null) queryParams.append('floor', floor);
    if (model !== null) queryParams.append('model', model);
    if (status !== null) queryParams.append('status', status);

    const url = `${PROJECTORS}?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenPropio}`,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la lista de proyectores');
    }

    const data = await response.json();

    if (Array.isArray(data.content)) {
        console.table(data.content); // muestra la lista de proyectores como tabla
    } else {
        console.warn('La respuesta no contiene un array en "content"');
    }

    return data;
};


export const sendServerEventBatchService = async (toastMessage, toastColor, isToastOpen, requestBody ) => 
{
    console.log('Sendinc events batch.');

    // recuperacción del token.
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(EVENTS_BATCH,
    {
        method: 'POST',
        headers:
        {
                'Authorization': `Bearer ${tokenPropio}`, // Agrega el JWT al encabezado
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }

    return await response.json();

}

export const fetchSelectedFloorClassrooms = async ( toastMessage, toastColor, isToastOpen, floorParam,  ) => {

    // Construcción de query string
    const queryParams = new URLSearchParams();

    if (floorParam !== null) queryParams.append('floor', floorParam);

    // Obtener token JWT válido
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const url = `${CLASSROOMS}?${queryParams.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenPropio}`,
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la lista de plantas');
    }

    const data = await response.json();

    return data;
};

export const fetchEventStates = async (toastMessage, toastColor, isToastOpen) => 
{
    console.log('Fetching fetchEventStates list.');

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    return await fetch(EVENT_STATES,
    {
        method: 'GET',
        headers:
        {
        'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
        }
    }).then(res => res.json());
    

};

export const fetchEvents = async (
    toastMessage,
    toastColor,
    isToastOpen,
    page,
    size,
    requestBody
    ) => {
    console.log('Fetching fetchEvent list.');

    // Normaliza valores por defecto
    if (requestBody.classroomName === 'default') requestBody.classroomName = null;
    if (requestBody.floorName === 'default') requestBody.floorName = null;
    if (requestBody.modelName === 'default') requestBody.modelName = null;
    if (requestBody.actionStatus === 'default') requestBody.actionStatus = null;

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const url = new URL(SERVER_EVENT);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
    }

  return response.json(); // ya devuelves el json parseado
};

export const fetchProjectorOverView = async (toastMessage, toastColor, isToastOpen) => {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(PROJECTOR_OVERVIEW, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenPropio}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Error al obtener el overview de proyectores.');
    }

    return await response.json();
};

export const deleteProjectors = async ( toastMessage, toastColor, isToastOpen, selectedProjectorsList ) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(PROJECTORS, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedProjectorsList),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al eliminar proyectores: ${response.status} ${errorText}`);
    }

    return await response.json();
};

export const deleteAllProjectors = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(PROJECTORS_ALL, {
    method: 'DELETE',
    headers: {
        'Authorization': `Bearer ${token}`,
    },
    });

    if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData?.message || 'Error al eliminar todos los proyectores.';
    throw new Error(errorMessage);
    }

    const result = await response.json();
    return {
    status: result.status || 'SUCCESS',
    message: result.message || 'Todos los proyectores fueron eliminados correctamente.',
    };
}

export const fetchActionsPage = async ( toastMessage, toastColor, isToastOpen, page, size) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const url = new URL(ACTIONS_PAGE);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const response = await fetch(url.toString(), {
    method: 'POST', // según tu original usabas POST
    headers: {
        'Authorization': `Bearer ${token}`,
    },
    });

    if (!response.ok) {
    let errorMessage = 'Error while retrieving actions list.';
    try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
    } catch {
        // ignore JSON parse error
    }
    throw new Error(errorMessage);
    }

    return await response.json();
}

export const deleteActions = async (toastMessage, toastColor, isToastOpen, selectedActions) => {

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(ACTIONS, {
        method: 'DELETE',
        headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedActions),
    });

    if (!response.ok) {
        let errorMessage = 'Error deleting actions.';
        try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
        } catch {
        // ignore JSON parse error
        }
        throw new Error(errorMessage);
    }

    return await response.json();
};


export const fetchCommandsPage = async (toastMessage, toastColor, isToastOpen, page, size, modelName, action) => {

    // Construir URL con parámetros query
    const url = new URL(COMMANDS_PAGE);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());
    if (modelName) url.searchParams.append('modelName', modelName);
    if (action) url.searchParams.append('action', action);

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json',
        },
        body: null,
    });

    if (!response.ok) {
        let errorMessage = 'Error fetching page of actions.';
        try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
        } catch {
        // ignore JSON parse error
        }
        throw new Error(errorMessage);
    }

    return await response.json();
};


export const deleteSelectedCommands = async (toastMessage, toastColor, isToastOpen, selectedCommands) => {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(COMMANDS, {
    method: "DELETE",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenPropio}`
    },
    body: JSON.stringify(selectedCommands)
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw { response: { status: response.status, data: errorData } };
    }

    const data = await response.json();
    return { status: data.status, message: data.message };
}

/*
EJEMPLO PARAMS
https://github.com/IESJandula/somosjandula/blob/dev_schoolmanager/src/services/schoolManager.js
*/
