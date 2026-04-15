import { strikesApiUrl, firebaseApiUrl } from '@/environment/apiUrls';
import { obtenerTokenJWTValido } from '@/services/firebaseService';
import { crearToast } from "@/utils/toast.js";

export const crearHuelga = async (toastMessage, toastColor, isToastOpen, titulo, fechaInicio, fechaFin) => 
{
  try 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    
    const response = await fetch(`${strikesApiUrl}/strikes/manager/`, 
    {
      method: "POST",
      headers: 
      {
        Authorization: `Bearer ${tokenPropio}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(
      {
        titulo,
        fechaInicio,
        fechaFin,
      })
    });

    if (!response.ok) 
    {
      const errorData = await response.json();
      throw new Error(errorData.description || "Error del servidor");
    }

    crearToast(toastMessage, toastColor, isToastOpen, "success", "Huelga creada correctamente");

  } 
  catch (error) 
  {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al crear huelga");
    throw error;
  }
};

export const obtenerHuelgas = async (toastMessage,toastColor,isToastOpen,page = 0,size = 5) => 
{
  try 
  {
    const tokenPropio = await obtenerTokenJWTValido(
      toastMessage,
      toastColor,
      isToastOpen
    );

    const response = await fetch(`${strikesApiUrl}/strikes/manager/?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenPropio}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) 
      {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message);
    }

    return await response.json(); 
  } 
  catch (error) 
  {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al obtener huelgas");
  }
};

export const borrarHuelga = async (toastMessage, toastColor, isToastOpen, titulo) => 
{
  try 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);
    const response = await fetch(`${strikesApiUrl}/strikes/manager/`, 
    {
      method: 'DELETE',
      headers: 
      {
        'Authorization': `Bearer ${tokenPropio}`,
        'titulo': titulo
      },
    });

    if (!response.ok) 
    {
      const errorData = await response.json().catch(() => ({}));
      const mensaje =
        errorData.message ||
        errorData.description ||
        JSON.stringify(errorData) ||
        "Error del servidor";
      throw new Error(mensaje);
    }
    crearToast(toastMessage, toastColor, isToastOpen, "success", "Huelga borrada correctamente");
  } 
  catch (error) 
  {
    crearToast(toastMessage, toastColor, isToastOpen, "error", error.message || "Error al borrar huelga");
    throw error;
  }
};

export const obtenerAlumnosHuelga = async (toastMessage,toastColor,isToastOpen,titulo,curso,etapa,grupo,filtro) => 
{
  try 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage,toastColor,isToastOpen
    );

    const response = await fetch(`${strikesApiUrl}/strikes/alumnos/consulta`, 
    {
      method: "GET",
      headers: 
      {
        Authorization: `Bearer ${tokenPropio}`,
        "Content-Type": "application/json",
        titulo,
        curso,
        etapa,
        grupo,
        filtro
      }
    });

    if (!response.ok) 
    {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message);
    }

    return await response.json();

  } 
  catch (error) 
  {
    crearToast(toastMessage,toastColor,isToastOpen,"error",error.message || "Error al obtener alumnos");
    throw error;
  }
};
