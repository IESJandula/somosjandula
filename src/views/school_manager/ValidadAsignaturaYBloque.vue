<script setup>
import { ref, watch } from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { cargarAsignaturas, crearBloques, eliminarBloques } from '@/services/schoolManager.js'

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const asignaturas = ref([]);
const columnasGrupos = ref([]);
const asignaturasSeleccionadas = ref([]);
const loading = ref(false);
const errorMensaje = ref("");
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
    console.log("Filtro actualizado:", seleccionado);
};

const cargarAsignatura = async () => {
  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {
    asignaturas.value = [];
    columnasGrupos.value = [];
    return;
  }

  loading.value = true;
  errorMensaje.value = "";

  try {
    const data = await cargarAsignaturas(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);
    asignaturas.value = data;
    
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

const crearBloque = async () => {
  if (asignaturasSeleccionadas.value.length < 2) {
    errorMensaje.value = "Debe seleccionar al menos dos asignaturas.";
    return;
  }

  loading.value = true;
  errorMensaje.value = "";

  try {
    const nombresSeleccionados = asignaturasSeleccionadas.value.map(a => a.nombre);
    await crearBloques(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      nombresSeleccionados, 
      toastMessage, 
      toastColor, 
      isToastOpen);
    
    asignaturasSeleccionadas.value = [];
    cargarAsignatura();
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
    await eliminarBloques(
      filtroSeleccionado.value.curso, 
      filtroSeleccionado.value.etapa, 
      asignatura.nombre, 
      asignatura.grupo, 
      toastMessage, 
      toastColor, 
      isToastOpen);
    cargarAsignatura();
  } catch (error) {
    errorMensaje.value = "Error al eliminar el bloque.";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
};

watch([() => filtroSeleccionado.value.curso, () => filtroSeleccionado.value.etapa], cargarAsignatura, { immediate: true });
</script>

<template>
  <div class="container">
    <h1 class="m-4">Validación de asignaturas y bloques</h1>
    <FilterCursoEtapa @actualizar-select="actualizarSelect" class="m-1"/>

    <div class="m-6">
      <div v-if="errorMensaje" class="mensejeError">{{ errorMensaje }}</div>
      <div v-if="loading" class="cargar">Cargando datos...</div>

      <div v-if="asignaturas.length > 0 && !loading">
        <table class="table">
          <thead>
            <tr class="bg-gray-200">
              <th class="th"></th>
              <th class="th">Nombre</th>
              <th class="th">Grupo</th>
              <th class="th">Total Alumnos</th>
              <th v-for="grupo in columnasGrupos" :key="grupo" class="th">Grupo {{ grupo }}</th>
              <th class="th">Bloque</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="asignatura in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="p-4">
                <input type="checkbox" :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null" v-model="asignaturasSeleccionadas" :value="asignatura" />
              </td>
              <td class="th">{{ asignatura.nombre }}</td>
              <td class="th">{{ asignatura.grupo }}</td>
              <td class="th">{{ asignatura.numeroDeAlumnos }}</td>
              <td v-for="grupo in columnasGrupos" :key="grupo" class="th">{{ asignatura.numeroAlumnosEnGrupo[grupo] || 0 }}</td>
              <td class="th">
                <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null">
                  Bloque {{ asignatura.bloqueId }}
                  <button @click="eliminarBloque(asignatura)" class="element">X</button>
                </div>
                <div v-else style="color: #cbd5e0;">Sin bloque</div>
              </td>
            </tr>
          </tbody>
        </table>
        <button @click="crearBloque" :disabled="asignaturasSeleccionadas.length < 2 || loading">
          {{ loading ? "Procesando..." : "Crear Bloque" }}
        </button>
      </div>

      <div v-else-if="!loading" class="m-7">
        <p style="color: #6b7280;">No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}
.m-1 {
  font-size: 20px;
  flex-grow: 1; 
  
}
.m-4 {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700; /* font-bold */
  margin-bottom: 2.5rem; /* mb-10 */
}
.m-6 {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 56rem;
}
.th {
  border: 1px solid currentColor; 
  padding-left: 1rem; 
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.table{
  table-layout: auto;
  border-collapse: collapse;
  border: 1px solid #cbd5e0;
  width: 100%;
}
.mensejeError{
  color: #f56565;
  margin-bottom: 1rem;
  text-align: center;
}
.cargar{
  text-align: center;
  color: #6b7280;
}
.p-4{
  text-align: center;
  padding-left: 1rem;
  padding-right: 1rem;
}
.element{
  margin-left: 0.5rem;
  color: #f56565;
  font-size: 15px;
}

.element:hover {
  text-decoration: underline;
}
.m-7{
  margin-top: 1.5rem;
  text-align: center;
}
button{
  margin-top: 1rem;
  background-color: transparent;
  color: #ffffff;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.25rem;
}
button:hover {
  background-color: #acaeb4;
}

button:disabled {
  opacity: 0.5;
}

</style>
