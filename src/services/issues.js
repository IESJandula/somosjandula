import { issuesApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/** INCIDENCIAS*/


/** Crear nueva incidencia */
export const crearIncidencia = async (toastMessage, toastColor, isToastOpen, incidencia) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/incidencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incidencia), 
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al crear incidencia:", response.status, text);
    throw new Error("Error al crear incidencia");
  }

  return response;
};

/** Modificar el estado o información de una incidencia */
export const modificarIncidencia = async (toastMessage, toastColor, isToastOpen, incidencia) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/incidencias`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incidencia),
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al modificar incidencia:", response.status, text);
    throw new Error("Error al modificar incidencia");
  }

  return response;
};

/** Borrar incidencia */
export const borrarIncidencia = async (toastMessage, toastColor, isToastOpen, incidencia) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/incidencias`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(incidencia),
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al borrar incidencia:", response.status, text);
    throw new Error("Error al borrar incidencia");
  }

  return response;
};

/** Listar todas las incidencias */
export const listarIncidencias = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const params = new URLSearchParams({
    page: '0',
    size: '50',
    sort: 'fecha,desc',
  });

  const response = await fetch(
    `${issuesApiUrl}/issues/incidencias?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al listar incidencias:", response.status, text);
    throw new Error(text || 'Error al obtener las incidencias');
  }

  const page = await response.json();

  return page.content || [];
};

/** Listar estados posibles de incidencias */
export const listarEstados = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/estados`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al listar estados de incidencias:", response.status, text);
    throw new Error(text || 'Error al obtener los estados de incidencias');
  }

  return await response.json();
};


/*UBICACIONES*/

/** Listar ubicaciones (para desplegables) */
export const listarUbicaciones = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al listar ubicaciones:", response.status, text);
    throw new Error(text || 'Error al obtener las ubicaciones');
  }

  return await response.json(); 

};

/** Crear nueva ubicación desde la administración */
export const crearUbicacion = async (toastMessage, toastColor, isToastOpen, nombre) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombre': nombre,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al crear ubicación:", response.status, text);
    throw new Error(text || 'Error al crear ubicación');
  }

  return response;
};

/** Borrar ubicación */
export const borrarUbicacion = async (toastMessage, toastColor, isToastOpen, nombre) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombre': nombre,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al borrar ubicación:", response.status, text);
    throw new Error(text || 'Error al borrar ubicación');
  }

  return response;
};


/*CATEGORIAS*/

/** Listar categorías (solo nombreCategoria) */
export const listarCategorias = async (toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al listar categorías:", response.status, text);
    throw new Error(text || 'Error al obtener las categorías');
  }

  return await response.json();
};

/** Crear categoría (solo nombreCategoria) */
export const crearCategoria = async (toastMessage, toastColor, isToastOpen, nombre) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombre': nombre,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al crear categoría:', response.status, text);
    throw new Error('Error al crear categoría');
  }

  return response;
};

/** Borrar categoría (por nombreCategoria) */
export const borrarCategoria = async (toastMessage, toastColor, isToastOpen, nombre) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    `${issuesApiUrl}/issues/categorias`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'nombre': nombre,
      },
    }
  );

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();  
    console.error('Error al borrar categoría:', response.status, text);
    throw new Error(text || 'Error al borrar categoría');
  }

  return response;
};


/* USUARIOS RESPONSABLES CATEGORIAS */

/** Listar todos los usuarios responsables de categorías */
export const listarUsuariosCategoria = async (toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al listar usuarios de categoría:", response.status, text);
    throw new Error(text || 'Error al obtener los usuarios de categoría');
  }

  return await response.json();
};

/** Crear un nuevo usuario responsable de una categoría */
export const crearUsuarioCategoria = async (toastMessage, toastColor, isToastOpen, nombreCategoria, nombreResponsable, emailResponsable) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombreCategoria': nombreCategoria,
      'nombreResponsable': nombreResponsable,
      'emailResponsable': emailResponsable,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al crear usuario de categoría:', response.status, text);
    throw new Error('Error al crear usuario de categoría');
  }

  return response;
};

/** Borrar un usuario de categoría (por clave compuesta, usando body) */
export const borrarUsuarioCategoria = async (toastMessage, toastColor, isToastOpen, nombreCategoria, nombreResponsable, emailResponsable) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombreCategoria': nombreCategoria,
      'nombreResponsable': nombreResponsable,
      'emailResponsable': emailResponsable,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al borrar usuario de categoría:', response.status, text);
    throw new Error('Error al borrar usuario de categoría');
  }

  return response;
};