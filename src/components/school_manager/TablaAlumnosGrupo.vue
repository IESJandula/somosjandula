<script setup>
import { ref, defineProps, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  curso: Number,
  etapa: String,
  grupo: String,
});

const alumnos = ref([]);
const loading = ref(false);
const errorMensaje = ref("");

const obtenerAlumnos = async () => {
  loading.value = true;
  errorMensaje.value = "";
  try {
    const response = await axios.get("http://localhost:8086/direccion/grupos/alumnos", {
      params: { curso: props.curso, etapa: props.etapa, grupo: props.grupo }
    });
    // Filtrar los alumnos cuyo grupo no sea null
    alumnos.value = response.data.filter(alumno => alumno.grupo == props.grupo);

    errorMensaje.value = "";
  } catch (error) {
    errorMensaje.value = "Error al obtener la lista de alumnos.";
  } finally {
    loading.value = false;
  }
};

const borrarAlumno = async (alumno) => {
  loading.value = true;
  errorMensaje.value = "";
  try {
    // Enviar los datos a través del cuerpo de la solicitud (request body)
    const response = await axios.delete("http://localhost:8086/direccion/grupos/alumnos", {
      data: alumno  // Enviar el objeto alumno en el body
    });
    alumnos.value = response.data; // Actualizar la lista de alumnos
    obtenerAlumnos();
  } catch (error) {
    errorMensaje.value = "Error al borrar el alumno."; // Mensaje de error
  } finally {
    loading.value = false; // Detener el estado de carga
  }
};


onMounted(obtenerAlumnos);
</script>

<template>
  <div class="mt-6">
    <div v-if="errorMensaje != ''" class="text-red-500 mb-4 text-center">
      {{ errorMensaje }}
    </div>
    
    <div v-if="loading" class="text-center text-gray-500">
      Cargando datos, por favor espere...
    </div>
    
    <div v-if="alumnos.length > 0 && !loading">
      
      <strong><h1> {{ props.curso }} {{ props.etapa }} {{ props.grupo }}</h1></strong>
      <table class="table-auto border-collapse border w-full">
        <thead>
          <tr class="bg-blue-500">
            <th class="border px-4 text-white py-2">Acciones</th>
            <th class="border px-4 text-white py-2">Nombre</th>
            <th class="border px-4 text-white py-2">Apellidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alumno in alumnos" :key="alumno.id">
            <td class="text-center px-4">
              <button style="color: red !important;" :value="alumno" @click="borrarAlumno(alumno)">Eliminar</button>
            </td>
            <td class="border px-4 py-2">{{ alumno.nombre }}</td>
            <td class="border px-4 py-2">{{ alumno.apellidos }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else-if="!loading" class="mt-6 text-center">
      <p class="text-gray-500">No hay alumnos disponibles para este grupo.</p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos específicos */
</style>
