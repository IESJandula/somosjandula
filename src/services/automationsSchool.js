import { automationsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const crearSensorBooleano = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, umbralMinimo, umbralMaximo) => {

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

export const crearSensorNumerico = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, umbralMinimo, umbralMaximo) => {
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
        umbralMinimo: umbralMinimo.value ?? umbralMinimo,
        umbralMaximo: umbralMaximo.value ?? umbralMaximo,
      })
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
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

export const crearActuador = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion) => {
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
        nombreUbicacion: nombreUbicacion.value ?? nombreUbicacion
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




