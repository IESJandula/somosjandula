const API_BASE_URL = 'http://localhost:8888/incidencias';

export class IncidenciaService {
  static async crearIncidencia(incidencia) {
    try {
      
      const response = await fetch(API_BASE_URL + '/crear_incidencia', 
      {
          method: 'POST',
          headers:
          {
              'Content-Type': 'application/json',  
              'Accept': 'text/plain; charset=UTF-8', 
          
          },
          body: JSON.stringify(incidencia)
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} - ${response.statusText}`);
      }

      return await response.text();  
    } catch (error) {
      console.error('Error al crear la incidencia:', error);
      throw error;
    }
  }
}
