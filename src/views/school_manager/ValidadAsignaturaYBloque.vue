<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const asignaturas = ref([]);
const columnasGrupos = ref([]);
const asignaturasSeleccionadas = ref([]);
const loading = ref(false);
const errorMensaje = ref("");

const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
    console.log("Filtro actualizado:", seleccionado);
};

const cargarAsignaturas = async () => {
  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {
    asignaturas.value = [];
    columnasGrupos.value = [];
    return;
  }

  loading.value = true;
  errorMensaje.value = "";

  try {
    const response = await axios.get('http://localhost:8086/direccionVentana3/asignaturas', {
      params: { curso: filtroSeleccionado.value.curso, etapa: filtroSeleccionado.value.etapa },
    });

    asignaturas.value = response.data;
    const gruposSet = new Set();
    asignaturas.value.forEach((asignatura) => {
      Object.keys(asignatura.numeroAlumnosEnGrupo).forEach((grupo) => {
        gruposSet.add(grupo);
      });
    });
    columnasGrupos.value = Array.from(gruposSet);
  } catch (error) {
    errorMensaje.value = "Error al cargar asignaturas. Inténtelo de nuevo.";
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

const addBloque = async () => {
  if (asignaturasSeleccionadas.value.length < 2) {
    errorMensaje.value = "Debe seleccionar al menos dos asignaturas.";
    return;
  }

  loading.value = true;
  errorMensaje.value = "";

  try {
    const nombresSeleccionados = asignaturasSeleccionadas.value.map(a => a.nombre);
    await axios.post("http://localhost:8086/direccionVentana3/bloques", null, {
      params: {
        curso: filtroSeleccionado.value.curso,
        etapa: filtroSeleccionado.value.etapa,
        asignaturas: nombresSeleccionados.join(","),
      },
    });
    asignaturasSeleccionadas.value = [];
    cargarAsignaturas();
  } catch (error) {
    errorMensaje.value = "Error al crear el bloque.";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

const eliminarBloque = async (asignatura) => {
  loading.value = true;
  errorMensaje.value = "";
  try {
    await axios.delete('http://localhost:8086/direccionVentana3/eliminarBloque', {
      data: {
        curso: filtroSeleccionado.value.curso,
        etapa: filtroSeleccionado.value.etapa,
        nombre: asignatura.nombre,
        grupo: asignatura.grupo
      }
    });
    cargarAsignaturas();
  } catch (error) {
    errorMensaje.value = "Error al eliminar el bloque.";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

watch([() => filtroSeleccionado.value.curso, () => filtroSeleccionado.value.etapa], cargarAsignaturas, { immediate: true });
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-grow">
    <h1 class="text-4xl font-bold mb-8">Validación de asignaturas y bloques</h1>
    <FilterCursoEtapa @actualizar-select="actualizarSelect" />

    <div class="mt-6 w-full max-w-4xl">
      <div v-if="errorMensaje" class="text-red-500 mb-4 text-center">{{ errorMensaje }}</div>
      <div v-if="loading" class="text-center text-gray-500">Cargando datos...</div>

      <div v-if="asignaturas.length > 0 && !loading">
        <table class="table-auto border-collapse border border-gray-400 w-full">
          <thead>
            <tr class="bg-gray-200">
              <th class="border px-4 py-2"></th>
              <th class="border px-4 py-2">Nombre</th>
              <th class="border px-4 py-2">Grupo</th>
              <th class="border px-4 py-2">Total Alumnos</th>
              <th v-for="grupo in columnasGrupos" :key="grupo" class="border px-4 py-2">Grupo {{ grupo }}</th>
              <th class="border px-4 py-2">Bloque</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asignatura in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="text-center px-4">
                <input type="checkbox" :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null" v-model="asignaturasSeleccionadas" :value="asignatura" />
              </td>
              <td class="border px-4 py-2">{{ asignatura.nombre }}</td>
              <td class="border px-4 py-2">{{ asignatura.grupo }}</td>
              <td class="border px-4 py-2">{{ asignatura.numeroDeAlumnos }}</td>
              <td v-for="grupo in columnasGrupos" :key="grupo" class="border px-4 py-2">{{ asignatura.numeroAlumnosEnGrupo[grupo] || 0 }}</td>
              <td class="border px-4 py-2">
                <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null">
                  Bloque {{ asignatura.bloqueId }}
                  <button @click="eliminarBloque(asignatura)" class="ml-2 text-red-500 hover:underline">X</button>
                </div>
                <div v-else class="text-gray-400">Sin bloque</div>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="addBloque" :disabled="asignaturasSeleccionadas.length < 2 || loading" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
          {{ loading ? "Procesando..." : "Crear Bloque" }}
        </button>
      </div>

      <div v-else-if="!loading" class="mt-6 text-center">
        <p class="text-gray-500">No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
      </div>
    </div>
  </div>
</template>

<style>
/* Estilo opcional para organizar el diseño */
</style>
