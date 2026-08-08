import { eventsApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/adminService';
import { crearToast } from '@/utils/toast.js';

const eventosProfesorUrl = `${eventsApiUrl}/events/eventos/profesor`;
const eventosAdminUrl = `${eventsApiUrl}/events/eventos/admin`;

const obtenerMensajeError = async (response, mensajePorDefecto) => {
  const errorData = await response.json().catch(() => null);
  return errorData?.message || errorData?.mensaje || mensajePorDefecto;
};

const obtenerToken = (toastMessage, toastColor, isToastOpen) =>
  obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

export const obtenerEventos = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventosProfesorUrl}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await obtenerMensajeError(response, 'Error al obtener eventos'));
    }

    return await response.json();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'Error al obtener eventos');
  }
};

export const obtenerEventosAdministracion = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventosAdminUrl}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await obtenerMensajeError(response, 'Error al obtener los eventos de administración'));
    }

    return await response.json();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'Error al obtener eventos');
    throw error;
  }
};

export const tieneSolicitudEventoPendiente = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventosProfesorUrl}/pendiente`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Accept': 'application/json',
      },
    });

    // El contrato del backend usa 200 cuando no hay una solicitud y 400 cuando ya existe.
    if (response.ok) return false;
    if (response.status === 400) return true;

    throw new Error(await obtenerMensajeError(response, 'Error al comprobar la solicitud pendiente'));
  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      'danger',
      error.message || 'Error al comprobar la solicitud pendiente',
    );
    throw error;
  }
};

export const crearSolicitudEvento = async (
  toastMessage,
  toastColor,
  isToastOpen,
  titulo,
  fechaInicio,
  fechaFin,
  nombreCategoria,
) => {
  const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
  const response = await fetch(`${eventosProfesorUrl}/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ titulo, fechaInicio, fechaFin, nombreCategoria }),
  });

  if (!response.ok) {
    const error = new Error(await obtenerMensajeError(response, 'Error al crear la solicitud de evento'));
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
    throw error;
  }
};

export const actualizarEstadoEvento = async (
  toastMessage,
  toastColor,
  isToastOpen,
  titulo,
  fechaInicio,
  estadoEvento,
) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventosAdminUrl}/estado`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ titulo, fechaInicio, estadoEvento }),
    });

    if (!response.ok) {
      throw new Error(await obtenerMensajeError(response, 'Error al actualizar el estado del evento'));
    }

    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Estado del evento actualizado');
  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      'danger',
      error.message || 'Error al actualizar el estado del evento',
    );
    throw error;
  }
};

export const obtenerImagenCategoriaEvento = async (
  imagenCategoriaUrl,
  toastMessage,
  toastColor,
  isToastOpen,
) => {
  if (!imagenCategoriaUrl) return null;

  const urlRecibida = new URL(imagenCategoriaUrl, `${eventsApiUrl}/`);
  const nombreCategoria = urlRecibida.searchParams.get('nombreCategoria');
  if (!nombreCategoria) {
    throw new Error('La URL de la imagen no incluye el nombre de la categoría');
  }

  // EventsServer sigue enviando la ruta anterior en imagenCategoriaUrl; reconstruimos
  // la URL usando el endpoint real del controlador de profesor.
  const urlImagen = new URL(`${eventosProfesorUrl}/imagen`);
  urlImagen.searchParams.set('nombreCategoria', nombreCategoria);

  const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
  const response = await fetch(urlImagen.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenPropio}`,
      'Accept': 'image/png',
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener la imagen de la categoría');
  }

  return await response.blob();
};

export const crearEvento = async (
  toastMessage,
  toastColor,
  isToastOpen,
  titulo,
  fechaInicio,
  fechaFin,
  nombreCategoria,
) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventosProfesorUrl}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ titulo, fechaInicio, fechaFin, nombreCategoria }),
    });

    if (!response.ok) {
      throw new Error(await obtenerMensajeError(response, 'Error al crear evento'));
    }

    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Evento guardado correctamente');
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'Error al guardar evento');
    throw error;
  }
};

export const borrarEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventosAdminUrl}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'titulo': titulo,
        'fechaInicio': fechaInicio.toString(),
      },
    });

    if (!response.ok) {
      throw new Error(await obtenerMensajeError(response, 'Error al borrar evento'));
    }

    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Evento borrado correctamente');
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'Error al borrar evento');
    throw error;
  }
};

export const obtenerCategorias = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerToken(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${eventsApiUrl}/events/categorias/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(await obtenerMensajeError(response, 'Error al obtener categorías'));
    }

    return await response.json();
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message || 'Error al obtener categorías');
  }
};
