<script setup>
// Importa las funciones necesarias de Vue y la biblioteca Axios para realizar solicitudes HTTP
import { ref, watch, defineProps } from 'vue';
import axios from 'axios';

// Define las propiedades que el componente recibe desde su padre
const props = defineProps({
  curso: Number, // Número que indica el curso seleccionado
  etapa: String, // Cadena que representa la etapa seleccionada
});

// Variables reactivas
const asignaturas = ref([]); // Lista de asignaturas obtenidas del servidor
const columnasGrupos = ref([]); // Columnas dinámicas basadas en los grupos de las asignaturas
const asignaturasSeleccionadas = ref([]); // Asignaturas seleccionadas por el usuario para formar un bloque
const loading = ref(false); // Indicador de estado de carga
const errorMensaje = ref(""); // Mensaje de error en caso de fallos

// Función para cargar asignaturas desde el servidor
const cargarAsignaturas = async () => {
  // Si no se ha seleccionado curso o etapa, reinicia las variables
  if (!props.curso || !props.etapa) {
    asignaturas.value = [];
    columnasGrupos.value = [];
    return;
  }

  // Inicia el estado de carga y limpia errores anteriores
  loading.value = true;
  errorMensaje.value = "";

  try {
    // Solicita las asignaturas al servidor con los parámetros curso y etapa
    const response = await axios.get('http://localhost:8086/direccionVentana3/asignaturas', {
      params: { curso: props.curso, etapa: props.etapa },
    });

    console.log("Respuesta del servidor:", response.data);

    // Almacena las asignaturas en la variable reactiva
    asignaturas.value = response.data;

    // Crea dinámicamente una lista de grupos a partir de los datos recibidos
    const gruposSet = new Set();
    asignaturas.value.forEach((asignatura) => {
      Object.keys(asignatura.numeroAlumnosEnGrupo).forEach((grupo) => {
        gruposSet.add(grupo);
      });
    });

    // Convierte el conjunto en una lista y lo almacena
    columnasGrupos.value = Array.from(gruposSet);
  } catch (error) {
    // Maneja errores durante la carga
    errorMensaje.value = "Error al cargar asignaturas. Por favor, inténtelo de nuevo.";
    console.error('Error al cargar asignaturas:', error);
  } finally {
    // Finaliza el estado de carga
    loading.value = false;
  }
};

// Función para crear un nuevo bloque con las asignaturas seleccionadas
const addBloque = async () => {
  // Verifica que al menos dos asignaturas estén seleccionadas
  if (asignaturasSeleccionadas.value.length < 2) {
    errorMensaje.value = "Debe seleccionar al menos dos asignaturas para crear un bloque.";
    return;
  }

  // Inicia el estado de carga y limpia errores anteriores
  loading.value = true;
  errorMensaje.value = "";

  // Extrae los nombres de las asignaturas seleccionadas
  const nombresSeleccionados = asignaturasSeleccionadas.value.map((a) => a.nombre);

  try {
    // Envía los datos al servidor para crear el bloque
    const response = await axios.post("http://localhost:8086/direccionVentana3/bloques", null, {
      params: {
        curso: props.curso,
        etapa: props.etapa,
        asignaturas: nombresSeleccionados.join(","),
      },
    });

    console.log("Bloque creado exitosamente:", response.data);

    // Reinicia la selección y recarga las asignaturas
    asignaturasSeleccionadas.value = [];
    cargarAsignaturas();
  } catch (error) {
    // Maneja errores durante la creación del bloque
    errorMensaje.value = "Error al crear el bloque. Intente nuevamente.";
    console.error("Error al crear el bloque:", error.response?.data || error);
  } finally {
    // Finaliza el estado de carga
    loading.value = false;
  }
};

// Función para eliminar un bloque asociado a una asignatura
const eliminarBloque = async (asignatura) => {
  // Inicia el estado de carga y limpia errores anteriores
  loading.value = true;
  errorMensaje.value = "";

  try {
    // Envía la solicitud para eliminar el bloque
    await axios.delete('http://localhost:8086/direccionVentana3/eliminarBloque', {
      data: {
        curso: props.curso,
        etapa: props.etapa,
        nombre: asignatura.nombre,
        grupo: asignatura.grupo
      }
    });

    console.log(`Bloque eliminado para la asignatura: ${asignatura.nombre}`);

    // Recarga las asignaturas
    cargarAsignaturas();
  } catch (error) {
    // Maneja errores durante la eliminación del bloque
    errorMensaje.value = "Error al eliminar el bloque. Intente nuevamente.";
    console.error("Error al eliminar el bloque:", error.response?.data || error);
  } finally {
    // Finaliza el estado de carga
    loading.value = false;
  }
};

// Observa los cambios en las propiedades 'curso' y 'etapa' y recarga las asignaturas
watch([() => props.curso, () => props.etapa], cargarAsignaturas, { immediate: true });
</script>

<template>
  <div class="mt-6">
    <!-- Mensaje de error -->
    <div v-if="errorMensaje" class="text-red-500 mb-4 text-center">
      {{ errorMensaje }}
    </div>

    <!-- Indicador de carga -->
    <div v-if="loading" class="text-center text-gray-500">
      Cargando datos, por favor espere...
    </div>

    <!-- Tabla de asignaturas -->
    <div v-if="asignaturas.length > 0 && !loading">
      <table class="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr class="bg-gray-200">
            <!-- Encabezados dinámicos -->
            <th class="border border-gray-400 px-4 py-2"></th>
            <th class="border border-gray-400 px-4 py-2">Nombre</th>
            <th class="border border-gray-400 px-4 py-2">Grupo</th>
            <th class="border border-gray-400 px-4 py-2">Número Total de Alumnos</th>
            <th v-for="grupo in columnasGrupos" :key="grupo" class="border border-gray-400 px-4 py-2">
              Grupo {{ grupo }}
            </th>
            <th class="border border-gray-400 px-4 py-2">Bloque</th>
          </tr>
        </thead>
        <tbody>
          <!-- Filas de asignaturas -->
          <tr v-for="asignatura in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
            <td class="text-center px-4">
              <input
                type="checkbox"
                :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null"
                v-model="asignaturasSeleccionadas"
                :value="asignatura"
              />
            </td>
            <td class="border border-gray-400 px-4 py-2">{{ asignatura.nombre }}</td>
            <td class="border border-gray-400 px-4 py-2">{{ asignatura.grupo }}</td>
            <td class="border border-gray-400 px-4 py-2">{{ asignatura.numeroDeAlumnos }}</td>
            <td v-for="grupo in columnasGrupos" :key="grupo" class="border border-gray-400 px-4 py-2">
              {{ asignatura.numeroAlumnosEnGrupo[grupo] || 0 }}
            </td>
            <td class="border border-gray-400 px-4 py-2">
              <!-- Bloque existente o sin bloque -->
              <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null">
                Bloque {{ asignatura.bloqueId }}
                <button
                  @click="eliminarBloque(asignatura)"
                  class="ml-2 text-red-500 hover:underline"
                >
                  X
                </button>
              </div>
              <div v-else class="text-gray-400">Sin bloque</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Botón para crear bloque -->
      <button
        @click="addBloque"
        :disabled="asignaturasSeleccionadas.length < 2 || loading"
        class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ loading ? "Procesando..." : "Crear Bloque" }}
      </button>
    </div>

    <!-- Mensaje cuando no hay asignaturas -->
    <div v-else-if="!loading" class="mt-6 text-center">
      <p class="text-gray-500">No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos para este componente */
</style>
