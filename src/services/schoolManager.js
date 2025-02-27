import { schoolmanagerApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
    {
    try
    {
        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

        const response = await fetch(schoolmanagerApiUrl + '/direccion/cargarMatriculas', 
        {
            method: 'GET',
            headers: 
            {
              Authorization: `Bearer ${tokenPropio}`
            },
    
  })
  if(!response.ok) 
  {
    throw new Error('No se pudieron cargar los cursos y etapas');
  }
  return await response.json();
}
catch (error)
{
  console.log(error);
}
}