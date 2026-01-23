import { issuesApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/*************************************************/
/**************** Ubicaciones ********************/
/*************************************************/

/**
 * Listar ubicaciones (para desplegables).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns La respuesta de la API con las ubicaciones listadas.
 */
export const listarUbicaciones = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones/`, {
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

/**
 * Crear una nueva ubicación.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombre - El nombre de la ubicación.
 * @returns La respuesta de la API con la ubicación creada.
 */
export const crearUbicacion = async (toastMessage, toastColor, isToastOpen, nombre) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones/`, {
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

/**
 * Borrar una ubicación.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombre - El nombre de la ubicación.
 * @returns La respuesta de la API con la ubicación borrada.
 */
export const borrarUbicacion = async (toastMessage, toastColor, isToastOpen, nombre) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/ubicaciones/`, {
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


/*************************************************/
/**************** Categorías *********************/
/*************************************************/

/**
 * Listar categorías (solo nombreCategoria).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns La respuesta de la API con las categorías listadas.
 */
export const listarCategorias = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias/`, {
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

/**
 * Crear una nueva categoría.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombre - El nombre de la categoría.
 * @returns La respuesta de la API con la categoría creada.
 */
export const crearCategoria = async (toastMessage, toastColor, isToastOpen, nombre) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias/`, {
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
    throw new Error(text || 'Error al crear categoría');
  }

  return response;
};

/**
 * Borrar una categoría.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombre - El nombre de la categoría.
 * @returns La respuesta de la API con la categoría borrada.
 */
export const borrarCategoria = async (toastMessage, toastColor, isToastOpen, nombre) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias/`,
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


/*************************************************/
/************ Usuarios Categoría *****************/
/*************************************************/

/**
 * Listar todos los usuarios responsables de categorías.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns La respuesta de la API con los usuarios responsables de categorías listados.
 */
export const listarUsuariosCategoria = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria/`, {
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

/**
 * Crear un nuevo usuario responsable de una categoría.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombreCategoria - El nombre de la categoría.
 * @param nombreResponsable - El nombre del usuario responsable.
 * @param emailResponsable - El email del usuario responsable.
 * @returns La respuesta de la API con el usuario responsable de categoría creado.
 */
export const crearUsuarioCategoria = async (toastMessage, toastColor, isToastOpen, nombreCategoria, nombreResponsable, emailResponsable) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria/`, {
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
    throw new Error(text || 'Error al crear usuario de categoría');
  }

  return response;
};

/**
 * Borrar un usuario de categoría (por clave compuesta, usando body).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombreCategoria - El nombre de la categoría.
 * @param nombreResponsable - El nombre del usuario responsable.
 * @param emailResponsable - El email del usuario responsable.
 * @returns La respuesta de la API con el usuario responsable de categoría borrado.
 */
export const borrarUsuarioCategoria = async (toastMessage, toastColor, isToastOpen, nombreCategoria, nombreResponsable, emailResponsable) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria/`, {
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
    throw new Error(text || 'Error al borrar usuario de categoría');
  }

  return response;
};

/*************************************************/
/**************** Incidencias ********************/
/*************************************************/

/**
 * Crear una nueva incidencia.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombreUbicacion - El nombre de la ubicación de la incidencia.
 * @param problema - El problema de la incidencia.
 * @param nombreCategoria - El nombre de la categoría de la incidencia.
 * @returns La respuesta de la API con el ID de la incidencia creada.
 */
export const crearIncidencia = async (toastMessage, toastColor, isToastOpen, nombreUbicacion, problema, nombreCategoria) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    const response = await fetch(`${issuesApiUrl}/issues/incidencias/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'nombreUbicacion': nombreUbicacion,
        'problema': problema,
        'nombreCategoria': nombreCategoria,
      },
    });
  
    if (!response.ok)
    {
      const errorData = await response.json().catch(() => ({}));
      const text = errorData.message || await response.text();
      console.error("Error al crear incidencia:", response.status, text);
      throw new Error(text || "Error al crear incidencia");
    }
  
    return response;
  };
  
  /**
   * Modificar el estado o información de una incidencia.
   * @param toastMessage - El mensaje de toast.
   * @param toastColor - El color de toast.
   * @param isToastOpen - Indica si el toast está abierto.
   * @param id - El ID de la incidencia.
   * @param estado - El estado de la incidencia.
   * @param solucion - La solución de la incidencia.
   * @param emailResponsable - El email del responsable de la incidencia.
   * @returns La respuesta de la API con la incidencia modificada.
   */
  export const actualizarCategoriaIncidencia = async (toastMessage, toastColor, isToastOpen, id, nombreCategoria) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    const response = await fetch(`${issuesApiUrl}/issues/incidencias/categoria/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'id': id,
        'nombreCategoria': nombreCategoria,
      },
    });
  
    if (!response.ok)
    {
      const errorData = await response.json().catch(() => ({}));
      const text = errorData.message || await response.text();
      console.error("Error al actualizar la categoría de la incidencia:", response.status, text);
      throw new Error(text || "Error al actualizar la categoría de la incidencia");
    }
  
    return response;
  };

  export const actualizarEstadoIncidencia = async (toastMessage, toastColor, isToastOpen, id, estado) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${issuesApiUrl}/issues/incidencias/estado/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'id': id,
        'estado': estado,
      },
    });
  
    if (!response.ok)
    {
      const errorData = await response.json().catch(() => ({}));
      const text = errorData.message || await response.text();
      console.error("Error al actualizar el estado de la incidencia:", response.status, text);
      throw new Error(text || "Error al actualizar el estado de la incidencia");
    }
  
    return response;
  };

  export const actualizarSolucionIncidencia = async (toastMessage, toastColor, isToastOpen, id, solucion) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${issuesApiUrl}/issues/incidencias/solucion/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'id': id,
        'solucion': solucion,
      },
    });
  
    if (!response.ok)
    {
      const errorData = await response.json().catch(() => ({}));
      const text = errorData.message || await response.text();
      console.error("Error al actualizar la solución de la incidencia:", response.status, text);
      throw new Error(text || "Error al actualizar la solución de la incidencia");
    }
  
    return response;
  };

  export const actualizarResponsableIncidencia = async (toastMessage, toastColor, isToastOpen, id, nombreCategoria, emailResponsable) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${issuesApiUrl}/issues/incidencias/responsable/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'id': id,
        'nombreCategoria': nombreCategoria,
        'emailResponsable': emailResponsable,
      },
    });
  
    if (!response.ok)
    {
      const errorData = await response.json().catch(() => ({}));  
      const text = errorData.message || await response.text();
      console.error("Error al actualizar el responsable de la incidencia:", response.status, text);
      throw new Error(text || "Error al actualizar el responsable de la incidencia");
    }
  
    return response;
  };

  /**
   * Borrar una incidencia.
   * @param toastMessage - El mensaje de toast.
   * @param toastColor - El color de toast.
   * @param isToastOpen - Indica si el toast está abierto.
   * @param id - El ID de la incidencia.
   * @returns La respuesta de la API con la incidencia borrada.
   */
  export const borrarIncidencia = async (toastMessage, toastColor, isToastOpen, id) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    const response = await fetch(`${issuesApiUrl}/issues/incidencias/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'id': id,
      },
    });
  
    if (!response.ok)
    {
      const errorData = await response.json().catch(() => ({}));
      const text = errorData.message || await response.text();
      console.error("Error al borrar incidencia:", response.status, text);
      throw new Error(text || "Error al borrar incidencia");
    }
  
    return response;
  };
  
  /**
   * Listar todas las incidencias.
   * @param toastMessage - El mensaje de toast.
   * @param toastColor - El color de toast.
   * @param isToastOpen - Indica si el toast está abierto.
   * @returns La respuesta de la API con las incidencias listadas.
   */
  export const listarIncidencias = async (toastMessage, toastColor, isToastOpen) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    const params = new URLSearchParams({
      page: '0',
      size: '50',
      sort: 'fecha,desc',
    });
  
    const response = await fetch(
      `${issuesApiUrl}/issues/incidencias/?${params.toString()}`,
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
  
  /**
   * Listar estados posibles de incidencias.
   * @param toastMessage - El mensaje de toast.
   * @param toastColor - El color de toast.
   * @param isToastOpen - Indica si el toast está abierto.
   * @returns La respuesta de la API con los estados posibles de incidencias.
   */
  export const listarEstados = async (toastMessage, toastColor, isToastOpen) =>
  {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  
    const response = await fetch(`${issuesApiUrl}/issues/incidencias/estados/`, {
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