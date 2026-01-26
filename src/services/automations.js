import { automationsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const crearSensorBooleano = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, aplicabilidad, umbralMinimo, umbralMaximo) => {

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/admin/sensor/booleano',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac: mac.value ?? mac,
        estado: estado.value ?? estado,
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion,
        aplicabilidad: aplicabilidad.value ?? aplicabilidad,
        umbralMinimo: umbralMinimo.value ?? umbralMinimo,
        umbralMaximo: umbralMaximo.value ?? umbralMaximo,
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};

export const obtenerSensorBooleano = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/sensor/booleano',
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

export const eliminarSensorBooleano = async (toastMessage, toastColor, isToastOpen, mac) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + `/automations/admin/sensor/booleano/${mac}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const crearSensorNumerico = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, aplicabilidad, umbralMinimo, umbralMaximo) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/sensor/numerico',
    {
      method: 'POST',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac: mac.value ?? mac,
        estado: estado.value ?? estado,
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion,
        aplicabilidad: aplicabilidad.value ?? aplicabilidad,
        umbralMinimo: umbralMinimo.value ?? umbralMinimo,
        umbralMaximo: umbralMaximo.value ?? umbralMaximo,
      })
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export const obtenerSensorNumerico = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/sensor/numerico',
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

export const eliminarSensorNumerico = async (toastMessage, toastColor, isToastOpen, mac) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + `/automations/admin/sensor/numerico/${mac}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const crearActuador = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, aplicabilidad) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/admin/actuador',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac: mac.value ?? mac,
        estado: estado.value ?? estado,
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion,
        aplicabilidad: aplicabilidad.value ?? aplicabilidad,
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
};

export const obtenerActuadores = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/actuador',
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

export const eliminarActuador = async (toastMessage, toastColor, isToastOpen, mac) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + `/automations/admin/actuador/${mac}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return true;
};

export const obtenerUbicaciones = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/ubicacion',
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

export const obtenerAplicabilidad = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(automationsApiUrl + '/automations/admin/aplicabilidad',
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

export const obtenerDispositivos = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen)

  const response = await fetch(automationsApiUrl + '/automations/map/ubicacion/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokenPropio}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message ?? `HTTP ${response.status}`)
  }

  return await response.json()
}




