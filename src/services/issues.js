import { issuesApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/** INCIDENCIAS*/


/** Crear nueva incidencia */
export const crearIncidencia = async (incidencia, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const resp = await fetch(`${issuesApiUrl}/issues/crear_incidencia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incidencia), 
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Error al crear incidencia:", resp.status, text);
    throw new Error("Error al crear incidencia");
  }

  return resp;
};

/** Listar todas las incidencias */
export const listarIncidencias = async (toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const params = new URLSearchParams({
    page: '0',
    size: '50',
    sort: 'fechaIncidencia,desc',
  });

  const response = await fetch(
    `${issuesApiUrl}/issues/listarIncidenciasOrdenadas?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener las incidencias');
  }

  const page = await response.json();


  return page.content || [];
};


/** Borrar incidencia */
export const borrarIncidencia = async (incidencia, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/borrarIncidencia`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ubicacion: incidencia.ubicacion,
      correoDocente: incidencia.correoDocente,
      fechaIncidencia: incidencia.fechaIncidencia,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Error al borrar incidencia:", response.status, text);
    throw new Error("Error al borrar incidencia");
  }

  return response;
};

/** Modificar el estado o información de una incidencia */
export const modificarIncidencia = async (incidencia, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  return await fetch(`${issuesApiUrl}/issues/modificar_incidencia`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incidencia),
  });
};

/** Listar estados posibles de incidencias */
export const listarEstados = async (toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/listadoEstado`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = 'Error al listar estados de incidencias';
    try {
      const errorBody = await response.json();
      if (errorBody && (errorBody.message || errorBody.error)) {
        errorMsg = errorBody.message || errorBody.error;
      }
    } catch {
      // si no es JSON, dejamos el mensaje genérico
    }
    throw new Error(errorMsg);
  }

  // El backend devuelve: ["PENDIENTE","RESUELTA",...]
  return await response.json();
};


/*UBICACIONES*/

/** Listar ubicaciones (para desplegables) */
export const listarUbicaciones = async (toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener las ubicaciones');
  }

  return await response.json(); 

};

/** Crear nueva ubicación desde la administración */
export const crearUbicacion = async (nombre, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  return await fetch(`${issuesApiUrl}/issues/ubicaciones`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nombre }),
  });
};

/** Borrar ubicación */
export const borrarUbicacion = async (id, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error al borrar ubicación:', response.status, text);
    throw new Error('Error al borrar ubicación');
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener las categorías');
  }

  return await response.json(); // [{ nombreCategoria }, ...]
};

/** Crear categoría (solo nombreCategoria) */
export const crearCategoria = async (categoria, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoria), // { nombreCategoria }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error al crear categoría:', response.status, text);
    throw new Error('Error al crear categoría');
  }

  return await response.json();
};

/** Borrar categoría (por nombreCategoria) */
export const borrarCategoria = async (nombreCategoria, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(
    `${issuesApiUrl}/issues/categorias/${encodeURIComponent(nombreCategoria)}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();  
    console.error('Error al borrar categoría:', response.status, text);
    throw new Error(text || 'Error al borrar categoría');
  }

  return response;
};


/* USUARIOS RESPONSABLES CATEGORIAS */

/** Listar todos los usuarios responsables de categorías */
export const listarUsuariosCategoria = async (toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios-categoria`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener los usuarios de categoría');
  }

  return await response.json(); // [{ nombreCategoria, nombreResponsable, correoResponsable }, ...]
};

/** Crear un nuevo usuario responsable de una categoría */
export const crearUsuarioCategoria = async (usuarioCategoria, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios-categoria`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuarioCategoria),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error al crear usuario de categoría:', response.status, text);
    throw new Error('Error al crear usuario de categoría');
  }

  return await response.json();
};

/** Borrar un usuario de categoría (por clave compuesta, usando body) */
export const borrarUsuarioCategoria = async (usuarioCategoria, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios-categoria`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuarioCategoria), // { nombreCategoria, nombreResponsable, correoResponsable }
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error al borrar usuario de categoría:', response.status, text);
    throw new Error('Error al borrar usuario de categoría');
  }

  return response;
};