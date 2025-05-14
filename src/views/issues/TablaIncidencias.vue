<script setup>
import { ref, onMounted } from "vue";
import { obtenerIncidencias, enviarModificacion } from "../../services/TablaIncidenciasService.js";

const incidencias = ref([]);
const paginaActual = ref(1);
const tamanoPagina = 10;

const convertirFecha = (fechaArray) => 
{
  const [year, month, day, hour, minute, second, millisecond] = fechaArray;
  return `${day.toString().padStart(2, "0")}/${(month).toString().padStart(2, "0")}/${year} ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

const cargarIncidencias = async () => 
{
  try 
  {
    //  Asegurar que siempre pedimos datos nuevos y NO acumulamos
    const data = await obtenerIncidencias(paginaActual.value - 1, tamanoPagina);
    incidencias.value=[];
    //  Reiniciar el array ANTES de asignar nuevos datos
    incidencias.value = data.content.map((incidencia) => ({
      ...incidencia,
      fechaLegible: convertirFecha(incidencia.fechaIncidencia),
    }));

  } 
  catch (error)
   {
    console.error("No se pudo cargar las incidencias", error);
  }
};

// Métodos para avanzar y retroceder páginas
const avanzarPagina = () =>
{
    paginaActual.value++;
    cargarIncidencias();  
};

const retrocederPagina = () => 
{
  if (paginaActual.value > 1) 
  {
    paginaActual.value--;
    cargarIncidencias();
  }
};

onMounted(cargarIncidencias);
</script>

<template>
  <div class="contenedor-tabla">
    <h1>Tabla de Incidencias</h1>
    <table class="tabla-incidencias">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Docente</th>
          <th>Aula</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Comentario</th>
          <th>Confirmación</th>
        </tr>
      </thead>
      <tbody>
        <!-- Renderizar dinámicamente las filas -->
        <tr v-for="incidencia in incidencias" :key="incidencia.numeroAula + incidencia.fechaIncidencia + incidencia.correoDocente">

          <td>{{ incidencia.fechaLegible }}</td>
          <td>{{ incidencia.correoDocente }}</td>
          <td>{{ incidencia.numeroAula }}</td>
          <td>{{ incidencia.descripcionIncidencia }}</td>

          <td>
            <select v-model="incidencia.estadoIncidencia">
              <option>PENDIENTE</option>
              <option>EN PROGRESO</option>
              <option>RESUELTA</option>
              <option>CANCELADA</option>
              <option>DUPLICADA</option>
            </select>
          </td>
          <td>
            <input
              type="text"
              v-model="incidencia.comentario"
              placeholder="Comentario de la incidencia"
              required
            />
          </td>
          <td>
            <button @click="enviarModificacion(incidencia)":disabled="!incidencia.comentario || incidencia.comentario.trim() === ''">Enviar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="paginacion">
      <button class="boton-paginacion" @click="retrocederPagina()" :disabled="paginaActual === 1">
        &#8592;
      </button>
      <button class="boton-paginacion" @click="avanzarPagina()" :disabled="incidencias.length < tamanoPagina">
        &#8594;
      </button>
    </div>
  </div>
</template>


<style scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  margin: 0;
  padding: 0;
}

.contenedor-tabla {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 20px auto;
}

.contenedor-tabla h1 {
  padding-bottom: 10px;
  margin-bottom: 10px;
  font-size: 20px;
  text-align: center;
  color: #007bff;
  font-weight: bold;
}

.tabla-incidencias {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  table-layout: fixed;
}

.tabla-incidencias th:nth-child(1) { width: 10%; } /* Fecha */
.tabla-incidencias th:nth-child(2) { width: 14%; } /* Profesor */
.tabla-incidencias th:nth-child(3) { width:  7%; } /* Aula */
.tabla-incidencias th:nth-child(4) { width: 18%; } /* Descripción */
.tabla-incidencias th:nth-child(5) { width: 15%; } /* Estado */
.tabla-incidencias th:nth-child(6) { width: 24%; } /* Solución */
.tabla-incidencias th:nth-child(7) { width: 12%; } /* Confirmación */

.tabla-incidencias th,
.tabla-incidencias td {
  border: 2px solid #E1D9D1;
  padding: 10px;
  font-size: 14px;
  color: black;
  word-break: break-word;
  overflow-wrap: break-word;
}
.tabla-correo-docente{
  width: 100px;
}

.tabla-incidencias th {
  background-color: #D1E5F4;
  color: #007bff;
  font-weight: bold;
  text-align: center;
}

.tabla-incidencias input,
.tabla-incidencias select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.tabla-incidencias input:focus,
.tabla-incidencias select:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.tabla-incidencias button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.tabla-incidencias button:hover {
  background-color: #0056b3;
}

.paginacion {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.boton-paginacion {
  padding: 10px;
  margin: 0 10px;
  font-size: 18px;
  background-color: #f4f4f4;
  color: #007bff;
  border: 2px solid #E1D9D1;
  border-radius: 50%;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.boton-paginacion:disabled {
  background-color: #e2e2e2;
  color: #aaa;
  cursor: not-allowed;
}

.boton-paginacion:hover:not(:disabled) {
  background-color: #e2e2e2;
}
</style>
