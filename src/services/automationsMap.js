import { automationsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const obtenerDispositivos = async (toastMessage, toastColor, isToastOpen) => {

  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    automationsApiUrl + '/automations/map/ubicacion/',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return await response.json();
};


objeto = map["aula-2.13"]