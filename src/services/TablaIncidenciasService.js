import { issuesApiUrl } from '@/environment/apiUrls'; // Assuming '@' alias is set up
// If you don't have the alias, use the relative path:
// import { issuesApiUrl } from '../environment/apiUrls';

// const BASE_URL = "http://localhost:8888/incidencias"; // Removed

// Assuming you have an interface for your Incidencia type (in TypeScript)
// interface Incidencia { ... }

async function handleResponse(response) {
  if (!response.ok) {
    let message = `HTTP error! Status: ${response.status}`;
    try {
      const errorBody = await response.json();
      message += ` - ${JSON.stringify(errorBody)}`; // Try to get a detailed error
    } catch (jsonError) {
      try {
        const text = await response.text();
        message += ` - ${text}`;
      } catch (textError) {
        //ignore
      }
    }
    throw new Error(message);
  }
  return response;
}

export const obtenerIncidencias = async (page = 0, size = 10) => {
  try {
    const response = await fetch(
      `${issuesApiUrl}/listarIncidenciasOrdenadas?page=${page}&size=${size}`
    ).then(handleResponse);
    return await response.json();
  } catch (error) {
    console.error("Error al obtener las incidencias:", error);
    throw error;
  }
};

export const enviarModificacion = async (incidencia) => {
  try {
    const response = await fetch(`${issuesApiUrl}/modificar_incidencia`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/plain; charset=UTF-8",
      },
      body: JSON.stringify(incidencia),
    }).then(handleResponse);
    return await response.text(); // Or response.json() if the server returns JSON
  } catch (error) {
    console.error("Error al enviar la solución:", error);
    throw error;
  }
};