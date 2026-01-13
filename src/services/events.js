import { eventsApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast.js';

export const obtenerEventos = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/manager/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Error al obtener eventos');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al obtener eventos");
    throw error;
  }
};

export const crearEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin, nombre) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);


    const payload = {
      titulo: titulo,
      nombre: nombre,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };

    const response = await fetch(`${eventsApiUrl}/events/manager/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al crear evento');
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Evento creado correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al crear evento");
    throw error;
  }
};

export const borrarEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/manager/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'titulo': titulo,
        'fechaInicio': fechaInicio.toString(),
        'fechaFin': fechaFin.toString(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message);
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Evento borrado correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al borrar evento");
    throw error;
  }
};

export const crearCategoria = async (toastMessage, toastColor, isToastOpen, nombre, color) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const payload = { nombre, color };

    const response = await fetch(`${eventsApiUrl}/events/categories/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || 'Error al crear categoría');
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría creada correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al crear categoría");
    throw error;
  }
};

export const obtenerCategorias = async (toastMessage, toastColor, isToastOpen) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/categories/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message);
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categorías obtenidas correctamente");

    return await response.json();

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al obtener categorías");
    throw error;
  }
};

export const borrarCategoria = async (toastMessage, toastColor, isToastOpen, nombre) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(
      `${eventsApiUrl}/events/categories/${encodeURIComponent(nombre)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenPropio}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message);
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría borrada correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al borrar categoría");
    throw error;
  }
};
