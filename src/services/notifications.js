import { notificationsApiUrl } from '@/environment/apiUrls';
import { crearToast } from '@/utils/toast.js';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/*************************************************/
/******** Gestión de notificaciones web **********/
/*************************************************/

/**
 * Obtiene los receptores de usuario.
 */
export async function obtenerReceptores(toastMessage, toastColor, isToastOpen) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(notificationsApiUrl + '/notifications/web/receptors', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener receptores de usuario');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Obtiene los niveles de notificaciones.
 */
export async function obtenerTiposNotificaciones(toastMessage, toastColor, isToastOpen) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(notificationsApiUrl + '/notifications/web/types', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener tipos de notificaciones');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Crea una nueva notificación web de usuario.
 */
export async function crearNotificacionWeb(
  toastMessage,
  toastColor,
  isToastOpen,
  inputTexto,
  inputFechaInicio,
  inputHoraInicio,
  inputFechaFin,
  inputHoraFin,
  inputReceptor,
  inputTipo
) {
  try
  {
    // ✅ Obtenemos token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // ✅ Envío al backend
    const response = await fetch(notificationsApiUrl + '/notifications/web/users', {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        texto: inputTexto,
        fechaInicio: inputFechaInicio,
        horaInicio: inputHoraInicio,
        fechaFin: inputFechaFin,
        horaFin: inputHoraFin,
        receptor: inputReceptor,
        tipo: inputTipo
      },

    });

    if (!response.ok) {
      const errorMessage = await response.text();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage);
      throw new Error(errorMessage || "Error al crear notificación");
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "✅ Notificación creada correctamente");
  } catch (error) {
    console.error("❌ Error creando notificación:", error);
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Obtiene todas las notificaciones web de usuario vigentes por tipo.
 */
export async function obtenerNotificacionesVigentesPorTipo(toastMessage, toastColor, isToastOpen, tipo) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(notificationsApiUrl + '/notifications/web/search_by_type', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tipo: tipo
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener notificaciones vigentes por tipo');
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return [];
    }

    return data;
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Obtiene todas las notificaciones web de usuario vigentes.
 */
export async function obtenerNotificacionesVigentesPorUsuario(toastMessage, toastColor, isToastOpen)
{
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(notificationsApiUrl + '/notifications/web/search_by_user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener notificaciones vigentes por usuario');
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return [];
    }

    return data;
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Cambia el estado de una notificación web de usuario por ID.
 */
export async function borrarNotificacionWeb(toastMessage, toastColor, isToastOpen, id) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(notificationsApiUrl + '/notifications/web/users/' + id, {
      method: 'DELETE',
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al borrar la notificación');
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Notificación borrada correctamente");
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/*********************************************************/
/******************** Administración *********************/
/*********************************************************/

/**
 * Autoriza Gmail OAuth.
 * Obtiene la URL de autorización del servidor y la abre en el navegador.
 */
export async function autorizarGmailOAuth(toastMessage, toastColor, isToastOpen) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(notificationsApiUrl + '/notifications/gmail/authorize', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorMessage || 'Error al obtener la URL de autorización');
      throw new Error(errorMessage || 'Error al obtener la URL de autorización');
    }

    // Obtenemos la URL de autorización de la respuesta JSON
    const data = await response.json();
    const authorizationUrl = data.authorizationUrl;

    if (authorizationUrl) {
      // Abrimos la URL de autorización en una nueva ventana
      window.open(authorizationUrl, '_blank');
      crearToast(toastMessage, toastColor, isToastOpen, "success", "Redirigiendo a Google para autorizar Gmail...");
    } else {
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "No se recibió la URL de autorización");
      throw new Error("No se recibió la URL de autorización");
    }

    return true;
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Crea una nueva aplicación.
 */
export async function crearAplicacion(toastMessage, toastColor, isToastOpen, nombreAplicacion, notificacionesMaximasCalendar, notificacionesMaximasEmail, notificacionesMaximasWeb)
{
  try
  {
    // Obtenemos el token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Enviamos la petición al backend
    const response = await fetch(notificationsApiUrl + '/notifications/admin/',
    {
      method: 'POST',
      headers:
      {
        Authorization: `Bearer ${token}`,
        aplicacion: nombreAplicacion,
        notificacionesMaximasCalendar: notificacionesMaximasCalendar,
        notificacionesMaximasEmail: notificacionesMaximasEmail,
        notificacionesMaximasWeb: notificacionesMaximasWeb
      }
    });

    // Si la respuesta es de error, lanzamos la excepción
    if (!response.ok)
    {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || 'Error al crear la aplicación');
    }

    // Si llegamos aquí es porque la respuesta es correcta y mostramos el toast
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Aplicación creada correctamente");
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Lista las aplicaciones.
 */
export async function listarAplicaciones(toastMessage, toastColor, isToastOpen, pageNumber, pageSize) {
  try
  {
    // Obtenemos el token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Enviamos la petición al backend
    const response = await fetch(notificationsApiUrl + '/notifications/admin/?pageNumber=' + pageNumber + '&pageSize=' + pageSize,
    {
      method: 'GET',
      headers:
      {
        Authorization: `Bearer ${token}`
      }
    });

    // Obtenemos los datos de respuesta
    const data = await response.json();

    // Si la respuesta es de error, lanzamos la excepción
    if (!response.ok)
    {
      throw new Error(data.message);
    }
    
    // Si no hay datos, devolvemos un array vacío
    if (!data || data.length === 0)
    {
      return [];
    }

    // Si llegamos aquí es porque la respuesta contiene datos, devolvemos los datos
    return data;
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Actualiza el valor máximo de notificaciones de calendario para una aplicación.
 */
export async function actualizarNotificacionesMaximasCalendar(toastMessage, toastColor, isToastOpen, nombreAplicacion, nuevoValorMaximoAplicacion)
{
  try
  {
    // Obtenemos el token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Enviamos la petición al backend
    const response = await fetch(notificationsApiUrl + '/notifications/admin/calendar',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        aplicacion: nombreAplicacion,
        notificacionesMaximas: nuevoValorMaximoAplicacion
      },
    });

    if (!response.ok)
    {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || 'Error al actualizar el máximo de calendario');
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Actualiza el valor máximo de notificaciones de email para una aplicación.
 */
export async function actualizarNotificacionesMaximasEmail(toastMessage, toastColor, isToastOpen, nombreAplicacion, nuevoValorMaximoAplicacion)
{
  try
  {
    // Obtenemos el token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Enviamos la petición al backend
    const response = await fetch(notificationsApiUrl + '/notifications/admin/email',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        aplicacion: nombreAplicacion,
        notificacionesMaximas: nuevoValorMaximoAplicacion
      },
    });

    if (!response.ok)
      {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || 'Error al actualizar el máximo de email');
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Actualiza el valor máximo de notificaciones de web para una aplicación.
 */
export async function actualizarNotificacionesMaximasWeb(toastMessage, toastColor, isToastOpen, nombreAplicacion, nuevoValorMaximoAplicacion)
{
  try
  {
    // Obtenemos el token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Enviamos la petición al backend
    const response = await fetch(notificationsApiUrl + '/notifications/admin/web',
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        aplicacion: nombreAplicacion,
        notificacionesMaximas: nuevoValorMaximoAplicacion
      },
    });

    if (!response.ok)
    {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || 'Error al actualizar el máximo de web');
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

/**
 * Borra una aplicación por su nombre.
 */
export async function borrarAplicacion(toastMessage, toastColor, isToastOpen, nombreAplicacion)
{
  try
  {
    // Obtenemos el token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // Enviamos la petición al backend
    const response = await fetch(notificationsApiUrl + '/notifications/admin/',
    {
      method: 'DELETE',
      headers:
      {
        Authorization: `Bearer ${token}`,
        aplicacion: nombreAplicacion
      },
    });

    // Si la respuesta es de error, lanzamos la excepción
    if (!response.ok)
    {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message || 'Error al borrar la aplicación');
    }

    // Si llegamos aquí es porque la respuesta es correcta y mostramos el toast
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Aplicación borrada correctamente");
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}