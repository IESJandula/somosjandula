import { eventsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';


export const obtenerEventos = async (toastMessage,toastColor,isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${eventsApiUrl}/events/manager`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message);
  }

  return await response.json();
};

export const crearEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin, categoria) => {

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const payload = { titulo, fechaInicio, fechaFin, categoria };

  const response = await fetch(`${eventsApiUrl}/events/manager`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message);
  }

  return await response.json();
};

export const borrarEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin) => {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const payload = { titulo, fechaInicio, fechaFin };

  const response = await fetch(`${eventsApiUrl}/events/manager`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message);
  }
};

export const obtenerCategorias = async (toastMessage, toastColor, isToastOpen) => 
{
   const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${eventsApiUrl}/events/manager`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message);
  }

  return await response.json();
};