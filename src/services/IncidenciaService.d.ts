// src/services/IncidenciaService.d.ts

/**
 * Interfaz que define la estructura del payload para crear una incidencia,
 * basándose en los campos del FormularioIncidencias.vue.
 */
export interface IncidenciaPayloadCrear {
  numeroAula: string;
  correoDocente: string;
  descripcionIncidencia: string;
  correoDestinatario: string;
  // Si el backend espera otros campos que no están en el formulario pero se generan
  // o tienen valores por defecto (ej. estado, fecha), podrían añadirse aquí como opcionales
  // o ser manejados por el backend.
}

/**
 * Interfaz para una Incidencia una vez creada (si el backend devuelve el objeto completo).
 * Podría incluir campos adicionales como id, fecha_creacion, estado, etc.
 * Por ahora, la mantenemos simple.
 */
export interface IncidenciaRegistrada {
  id?: number; // El ID usualmente es asignado por el backend
  numeroAula: string;
  correoDocente: string;
  descripcionIncidencia: string;
  correoDestinatario: string;
  fecha?: string; // Ejemplo de campo adicional
  estado?: string; // Ejemplo de campo adicional
}


/**
 * Declara la clase IncidenciaService y sus métodos estáticos.
 */
export declare class IncidenciaService {
  /**
   * Método estático para crear una nueva incidencia.
   * @param incidencia Objeto con los datos de la incidencia a crear.
   * @returns Una promesa que se resuelve con la respuesta del servidor (generalmente un mensaje de texto o el objeto creado).
   */
  static crearIncidencia(incidencia: IncidenciaPayloadCrear): Promise<string>; // Asumiendo que la API devuelve un string como mensaje

  /**
   * Método estático para obtener una lista de incidencias.
   * (Asumiendo que la estructura de una incidencia obtenida puede ser diferente)
   * @param page Número de página para la paginación (opcional).
   * @param size Número de elementos por página (opcional).
   * @returns Una promesa que se resuelve con un array de objetos IncidenciaRegistrada.
   */
  static obtenerIncidencias(page?: number, size?: number): Promise<IncidenciaRegistrada[]>; // Ajusta IncidenciaRegistrada según necesidad

  /**
   * Método estático para enviar una modificación a una incidencia existente.
   * @param incidencia Objeto de incidencia completo, incluyendo su 'id' para identificarla.
   * @returns Una promesa que se resuelve con la respuesta del servidor (generalmente un mensaje de texto).
   */
  static enviarModificacion(incidencia: IncidenciaRegistrada): Promise<string>; // Asumiendo que se modifica una IncidenciaRegistrada que incluye ID
}
