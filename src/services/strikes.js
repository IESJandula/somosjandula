import { strikesApiUrl, adminApiUrl } from '@/environment/apiUrls';
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
      const errorData = await response.json().catch(() => ({}));
      const text = errorData.message || await response.text();
      console.error("Error al crear huelga:", response.status, text);
      throw new Error(text || 'Error al crear huelga');
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
    const tokenPropio = await obtenerTokenJWTValido( toastMessage, toastColor, isToastOpen);

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
    throw error;
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

export const obtenerAlumnosHuelga = async (toastMessage, toastColor, isToastOpen, titulo, curso, etapa, grupo, filtro) => 
{
  try 
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(`${strikesApiUrl}/strikes/inscripciones/consulta`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenPropio}`,
        "Content-Type": "application/json",
        titulo: titulo,
        curso: curso ?? "",
        etapa: etapa ?? "",
        grupo: grupo ?? "",
        filtro: filtro
      }
    });

    if (!response.ok) 
    {
      const errorData = await response.json().catch(() => ({}));
      throw new Error("Error al consultar alumnos");
    }

    return await response.json();

  } catch (error) 
  {
    crearToast(toastMessage, toastColor, isToastOpen, "error", "Error al obtener alumnos");
    return [];
  }
};

export const obtenerCursos = async (toastMessage, toastColor, isToastOpen ) =>
{
  try
  {
    const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

    const response = await fetch(
      `${strikesApiUrl}/strikes/inscripciones/cursos`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenPropio}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok)
    {
      throw new Error("Error al obtener cursos");
    }

    return await response.json();
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, "error", "Error al obtener cursos");
    return [];
  }
};