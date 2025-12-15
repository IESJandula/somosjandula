import { automationsSchoolApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const crearSensorBooleano = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(automationsSchoolApiUrl + '/automations_school/admin/sensor/booleano',
    {
      method: 'POST',
      headers:
      {
        'Authorization': `Bearer ${tokenPropio}`,
        mac: mac, 
        estado: estado, 
        nombreUbicacion: nombreUbicacion
      },
    })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}
export const obtenerSensorBooleano = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(automationsSchoolApiUrl + '/automations_school/admin/sensor/booleano',
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

export const crearSensorNumerico = async (toastMessage, toastColor, isToastOpen, mac, estado, nombreUbicacion, umbralMinimo, umbralMaximo) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(automationsSchoolApiUrl + '/automations_school/admin/sensor/numerico',
  {
    method: 'POST',
    headers:
    {
      'Authorization': `Bearer ${tokenPropio}`,
      mac: mac, 
      estado: estado, 
      nombreUbicacion: nombreUbicacion, 
      umbralMinimo: umbralMaximo, 
      umbralMaximo: umbralMinimo
    },
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
  return await response.json()
}

export const obtenerSensorNumerico = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(automationsSchoolApiUrl + '/automations_school/admin/sensor/numerico',
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

export const obtenerActuadores = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(automationsSchoolApiUrl + '/automations_school/admin/actuador',
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

export const obtenerUbicaciones = async (toastMessage, toastColor, isToastOpen) =>
{
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

  const response = await fetch(automationsSchoolApiUrl + '/automations_school/admin/ubicacion',
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




