import { eventsApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/adminService';
import { crearToast } from "@/utils/toast.js";

export const obtenerEventos = async (toastMessage, toastColor, isToastOpen) => {
  try {

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/eventos/`, {
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

    return await response.json();

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al obtener eventos");
  }
};

export const crearEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin, nombreCategoria) => {
try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    
    const payload = { titulo, fechaInicio, fechaFin, nombreCategoria} ;
    const response = await fetch(`${eventsApiUrl}/events/eventos/`, {
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
      throw new Error(errorData.message || 'Error al crear evento');
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Evento guardado correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al guardar evento");
    throw error;
  }

};

export const borrarEvento = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio) => 
  {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/eventos/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'titulo': titulo,
        'fechaInicio': fechaInicio.toString()
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Evento borrado correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al borrar evento");
    throw error;
  }
};

export const crearCategoria = async (toastMessage, toastColor, isToastOpen, nombre, color) => {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const payload = { nombre, color };

    const response = await fetch(`${eventsApiUrl}/events/categorias/`, {
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

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría guardada correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al guardar categoría");
    throw error;
  }
};

export const obtenerCategorias = async (toastMessage, toastColor, isToastOpen) => 
{
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/categorias/`, {
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



    return await response.json();

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al obtener categorías");
  }
};

export const borrarCategoria = async (toastMessage, toastColor, isToastOpen, nombre) => {
 try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/events/categorias/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
        'nombre': nombre,
      },
    });
      if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message);
    }
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Categoría eliminada correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message || "Error al borrar categoría");
    throw error;
  }
};


