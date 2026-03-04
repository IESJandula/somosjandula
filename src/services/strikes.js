import { strikesApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';
import { crearToast } from "@/utils/toast.js";

export const crearHuelga = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin) => {
try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    
    const response = await fetch(`${eventsApiUrl}/strikes/manager/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        titulo: titulo.value ?? titulo, 
        fechaInicio: fechaInicio.value ?? fechaInicio, 
        fechaFin: fechaFin.value ?? fechaFin, 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Huelga creada correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al crear huelga");
    throw error;
  }

};

export const obtenerHuelgas = async (toastMessage, toastColor, isToastOpen) => {
  try {

    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/strikes/manager/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenPropio}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return await response.json();

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al obtener huelgas");
    throw error;
  }
};



export const borrarHuelga = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio) => 
  {
  try {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${eventsApiUrl}/strikes/manager/`, {
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

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Huelga borrada correctamente");

  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al borrar huelga");
    throw error;
  }
};
