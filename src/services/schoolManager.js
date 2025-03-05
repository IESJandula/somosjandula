import { schoolmanagerApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

export const cargarCursosEtapas = async (toastMessage, toastColor, isToastOpen) => 
  {
    try
    {
      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/direccionVentana3/etapaCursos', 
      {
        method: 'GET',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`
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
export const subirFicheros = async (file, curso, etapa, toastMessage, toastColor, isToastOpen) => 
  {
    if (!file) 
    {
      return;
    }
    try
    {
      const formData = new FormData();
      formData.append('csv', file);

      const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

      const response = await fetch(schoolmanagerApiUrl + '/direccion/cargarMatriculas',
      {
        method: 'POST',
        headers: 
        {
          'Authorization': `Bearer ${tokenPropio}`,
          'curso': parseInt(curso,10),
          'etapa': etapa,
        },
        body: formData
    });

    if(!response.ok) 
    {
      throw new Error('Error al cargar el fichero de matrículas');
    }
    return await response.json();
  }
  catch (error)
  {
    console.log(error);
  }
}