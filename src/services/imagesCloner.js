import { imagesClonerApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/adminService';
import { crearToast } from '@/utils/toast.js';

const ADMIN_BASE = `${imagesClonerApiUrl}/images_cloner/admin/`;

const parseApiError = async (response, fallback) => {
  const errorData = await response.json().catch(() => ({}));
  const { codigo, mensaje, message } = errorData;
  const text = mensaje || message;
  if (codigo != null) {
    throw new Error(`[${codigo}] ${text || fallback}`);
  }
  throw new Error(text || fallback);
};

const obtenerCabecerasAuth = async (toastMessage, toastColor, isToastOpen) => {
  const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
  return { Authorization: `Bearer ${tokenPropio}` };
};

export const listarImagenesClonezilla = async (toastMessage, toastColor, isToastOpen) => {
  const headers = await obtenerCabecerasAuth(toastMessage, toastColor, isToastOpen);

  const response = await fetch(ADMIN_BASE, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    await parseApiError(response, 'Error al cargar las imágenes');
  }

  return await response.json();
};

export const establecerImagenPorDefecto = async (
  toastMessage,
  toastColor,
  isToastOpen,
  nombreImagen,
  accion
) => {
  try {
    const headers = await obtenerCabecerasAuth(toastMessage, toastColor, isToastOpen);

    const response = await fetch(ADMIN_BASE, {
      method: 'POST',
      headers: {
        ...headers,
        nombreImagen,
        accion,
      },
    });

    if (!response.ok) {
      await parseApiError(response, 'Error al establecer la imagen por defecto');
    }

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      'success',
      `Imagen "${nombreImagen}" marcada como pendiente de activación`
    );

    return await response.json();
  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      'error',
      error.message || 'Error al establecer la imagen por defecto'
    );
    throw error;
  }
};

export const habilitarMenuCompletoClonezilla = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const headers = await obtenerCabecerasAuth(toastMessage, toastColor, isToastOpen);

    const response = await fetch(ADMIN_BASE, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      await parseApiError(response, 'Error al habilitar el menú completo');
    }

    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      'success',
      'Menú completo habilitado: todas las imágenes desactivadas'
    );

    return await response.json();
  } catch (error) {
    crearToast(
      toastMessage,
      toastColor,
      isToastOpen,
      'error',
      error.message || 'Error al habilitar el menú completo'
    );
    throw error;
  }
};
