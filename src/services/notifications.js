import { notificationsApiUrl } from '@/environment/apiUrls';
import { crearToast } from '@/utils/toast.js';
import { obtenerTokenJWTValido } from '@/services/firebaseService';

/**
 * Obtiene los roles de usuario.
 */
export async function obtenerRolesUsuario(toastMessage, toastColor, isToastOpen) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(notificationsApiUrl + '/notifications_web/roles', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener roles de usuario');
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
    const response = await fetch(notificationsApiUrl + '/notifications_web/types', {
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
  inputRol,
  inputTipo
) {
  try
  {
    // ✅ Obtenemos token JWT válido
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    // ✅ Envío al backend
    const response = await fetch(notificationsApiUrl + '/notifications_web/users', {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        texto: inputTexto,
        fechaInicio: inputFechaInicio,
        horaInicio: inputHoraInicio,
        fechaFin: inputFechaFin,
        horaFin: inputHoraFin,
        rol: inputRol,
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

    const response = await fetch(notificationsApiUrl + '/notifications_web/search_by_type', {
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

    const response = await fetch(notificationsApiUrl + '/notifications_web/search_by_user', {
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
export async function cambiarEstadoNotificacionWeb(toastMessage, toastColor, isToastOpen, id) {
  try {
    const token = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(notificationsApiUrl + '/notifications_web/users/' + id, {
      method: 'PUT',
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al cambiar el estado de la notificación');
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Estado cambiado correctamente");
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message);
    throw error;
  }
}

