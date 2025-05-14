// Importa la URL base de la API de incidencias correctamente.
// El archivo apiUrls.ts exporta 'issuesApiUrl'.
import { issuesApiUrl } from '../environment/apiUrls';
// Si tienes configurado un alias como '@' para la carpeta 'src', también podrías usar:
// import { issuesApiUrl } from '@/environment/apiUrls';

// Clase que contiene métodos estáticos para manejar incidencias
export class IncidenciaService {
  // Método estático para crear una incidencia
  static async crearIncidencia(incidencia) {
    try {
      // Utiliza la variable 'issuesApiUrl' importada correctamente.
      const response = await fetch(`${issuesApiUrl}/crear_incidencia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain; charset=UTF-8', // Especifica que esperas texto plano
        },
        body: JSON.stringify(incidencia),
      });

      if (!response.ok) {
        // Intenta obtener un mensaje de error más detallado del cuerpo de la respuesta si es posible
        const errorText = await response.text();
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
      }

      return await response.text(); // Devuelve la respuesta como texto
    } catch (error) {
      console.error('Error al crear la incidencia:', error);
      throw error; // Re-lanza el error para que el llamador pueda manejarlo
    }
  }

  // Método estático para obtener incidencias
  static async obtenerIncidencias(page = 0, size = 10) {
    try {
      // Utiliza la variable 'issuesApiUrl' importada correctamente.
      const response = await fetch(`${issuesApiUrl}/listarIncidenciasOrdenadas?page=${page}&size=${size}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener las incidencias: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
      }
      return await response.json(); // Devuelve la respuesta en formato JSON
    } catch (error) {
      console.error('Error al obtener las incidencias:', error);
      throw error;
    }
  }

  // Método estático para enviar una modificación de una incidencia
  static async enviarModificacion(incidencia) {
    try {
      // Utiliza la variable 'issuesApiUrl' importada correctamente.
      const response = await fetch(`${issuesApiUrl}/modificar_incidencia`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain; charset=UTF-8', // Especifica que esperas texto plano
        },
        body: JSON.stringify(incidencia),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al enviar la modificación: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
      }
      // Considera no recargar la página aquí directamente.
      // Es mejor que el componente que llama a este servicio decida cómo actualizar la UI.
      // Por ejemplo, podría volver a cargar la lista de incidencias o mostrar un toast.
      // window.location.reload();
      return await response.text(); // Devuelve la respuesta del servidor (si la hay)
    } catch (error) {
      console.error('Error al enviar la modificación:', error);
      throw error;
    }
  }
}
