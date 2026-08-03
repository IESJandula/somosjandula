import { issuesApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/adminService';

/*************************************************/
/**************** Resolutores ********************/
/*************************************************/

/*
 * NOTA: el microservicio Reaktor_IssuesServer sigue modelando el resolutor como "categoría"
 * (rutas /issues/categorias y cabecera nombreCategoria), por lo que las rutas y las cabeceras
 * conservan ese nombre aunque el concepto de la aplicación sea el resolutor.
 */

/**
 * Listar resolutores.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns La respuesta de la API con los resolutores listados.
 */
export const listarResolutores = async (toastMessage, toastColor, isToastOpen) =>
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
    console.error("Error al listar resolutores:", response.status, text);
    throw new Error(text || 'Error al obtener los resolutores');
  }

  return await response.json();
};

/**
 * Crear un resolutor o actualizarlo si ya existiese (el nombre es su clave).
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombre - El nombre del resolutor.
 * @param imprimirInforme - Indica si se debe imprimir el informe
 * @returns La respuesta de la API con el resolutor guardado.
 */
export const guardarResolutor = async (toastMessage, toastColor, isToastOpen, nombre, imprimirInforme) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombre': nombre,
      'imprimirInforme': String(imprimirInforme),
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al guardar el resolutor:', response.status, text);
    throw new Error(text || 'Error al guardar el resolutor');
  }

  return response;
};

/**
 * Borrar un resolutor.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombre - El nombre del resolutor.
 * @returns La respuesta de la API con el resolutor borrado.
 */
export const borrarResolutor = async (toastMessage, toastColor, isToastOpen, nombre) =>
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
    console.error('Error al borrar el resolutor:', response.status, text);
    throw new Error(text || 'Error al borrar el resolutor');
  }

  return response;
};

/**
 * Borrar todos los resolutores que no tengan incidencias asociadas.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns El número de resolutores borrados.
 */
export const borrarTodosLosResolutores = async (toastMessage, toastColor, isToastOpen) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/categorias/all`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al borrar todos los resolutores:', response.status, text);
    throw new Error(text || 'Error al borrar todos los resolutores');
  }

  return await response.json();
};


/*************************************************/
/*********** Usuarios de un Resolutor ************/
/*************************************************/

/**
 * Listar todos los usuarios responsables de resolutores.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @returns La respuesta de la API con los usuarios responsables de resolutores listados.
 */
export const listarUsuariosResolutor = async (toastMessage, toastColor, isToastOpen) =>
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
    console.error("Error al listar usuarios de resolutor:", response.status, text);
    throw new Error(text || 'Error al obtener los usuarios de resolutor');
  }

  return await response.json();
};

/**
 * Asignar un usuario responsable a un resolutor.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombreResolutor - El nombre del resolutor.
 * @param nombreResponsable - El nombre del usuario responsable.
 * @param emailResponsable - El email del usuario responsable.
 * @returns La respuesta de la API con el usuario responsable de resolutor creado.
 */
export const crearUsuarioResolutor = async (toastMessage, toastColor, isToastOpen, nombreResolutor, nombreResponsable, emailResponsable) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombreCategoria': nombreResolutor,
      'nombreResponsable': nombreResponsable,
      'emailResponsable': emailResponsable,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al crear usuario de resolutor:', response.status, text);
    throw new Error(text || 'Error al crear usuario de resolutor');
  }

  return response;
};

/**
 * Desasignar un usuario responsable de un resolutor.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param nombreResolutor - El nombre del resolutor.
 * @param nombreResponsable - El nombre del usuario responsable.
 * @param emailResponsable - El email del usuario responsable.
 * @returns La respuesta de la API con el usuario responsable de resolutor borrado.
 */
export const borrarUsuarioResolutor = async (toastMessage, toastColor, isToastOpen, nombreResolutor, nombreResponsable, emailResponsable) =>
{
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  const response = await fetch(`${issuesApiUrl}/issues/usuarios_categoria/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'nombreCategoria': nombreResolutor,
      'nombreResponsable': nombreResponsable,
      'emailResponsable': emailResponsable,
    },
  });

  if (!response.ok)
  {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error('Error al borrar usuario de resolutor:', response.status, text);
    throw new Error(text || 'Error al borrar usuario de resolutor');
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
 * Listar todas las incidencias con paginación.
 * @param toastMessage - El mensaje de toast.
 * @param toastColor - El color de toast.
 * @param isToastOpen - Indica si el toast está abierto.
 * @param page - Número de página.
 * @param size - Tamaño de página.
 * @param sort - Ordenación (por fecha descendente).
 * @returns La respuesta de la API con las incidencias paginadas.
 */
export const listarIncidencias = async (
  toastMessage, 
  toastColor, 
  isToastOpen,
  page = 0,
  size = 20,
  sort = 'fecha,desc'
) => {
  const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

  // Construimos la URL con query params dinámicos con los valores por defecto.
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: sort,
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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const text = errorData.message || await response.text();
    console.error("Error al listar incidencias:", response.status, text);
    throw new Error(text || 'Error al obtener las incidencias');
  }

  // Devolvemos el objeto Page completo
  return await response.json();
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

  /*************************************************/
/********** Estadísticas de Incidencias **********/
/*************************************************/

/**
 * Obtiene estadísticas de incidencias por categoría.
 * @returns Promise<EstadisticasCategoriaDto[]>
 */
export const obtenerEstadisticasPorCategoria = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${issuesApiUrl}/issues/estadisticas/por-categoria`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener estadísticas por categoría:", response.status, text);
        throw new Error(text || 'Error al obtener estadísticas por categoría');
    }

    return await response.json();
};

/**
 * Obtiene estadísticas de incidencias por estado.
 * @returns Promise<EstadisticasEstadoDto[]>
 */
export const obtenerEstadisticasPorEstado = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${issuesApiUrl}/issues/estadisticas/por-estado`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener estadísticas por estado:", response.status, text);
        throw new Error(text || 'Error al obtener estadísticas por estado');
    }

    return await response.json();
};

/**
 * Obtiene estadísticas de incidencias por ubicación.
 * @returns Promise<EstadisticasUbicacionDto[]>
 */
export const obtenerEstadisticasPorUbicacion = async (toastMessage, toastColor, isToastOpen) => {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${issuesApiUrl}/issues/estadisticas/por-ubicacion`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const text = errorData.message || await response.text();
        console.error("Error al obtener estadísticas por ubicación:", response.status, text);
        throw new Error(text || 'Error al obtener estadísticas por ubicación');
    }

    return await response.json();
};