import { issuesApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/** Crear una nueva incidencia */
export const crearIncidencia = async (incidencia, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  return await fetch(`${issuesApiUrl}/issues/crear_incidencia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incidencia),
  });
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

  return await fetch(`${issuesApiUrl}/modificarIncidencia`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(incidencia),
  });
};

/** Listar estados posibles de incidencias */
export const listarEstados = async () => {
  const response = await fetch(`${issuesApiUrl}/issues/listadoEstado`, { method: 'GET' });
  if (!response.ok) throw new Error('Error al listar estados');
  return await response.json();
};


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

  return await response.json();
};

/** Crear/guardar una nueva categoría */
export const crearCategoria = async (categoria, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoria),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error al crear categoría:', response.status, text);
    throw new Error('Error al crear categoría');
  }

  return await response.json();
};

/** Borrar categoría */
export const borrarCategoria = async (id, toastMessage, toastColor, isToastOpen) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Error al borrar categoría:', response.status, text);
    throw new Error('Error al borrar categoría');
  }

  return response;
};
