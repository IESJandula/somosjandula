<script setup>
// Importa las funciones necesarias de Vue y Axios
import { onMounted, ref, defineEmits } from 'vue';
import { cargarCursosEtapas } from '@/services/schoolManager.js'

// Declara una variable reactiva para almacenar los cursos y etapas obtenidos del servidor
const cursosEtapas = ref([]);
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Define un emisor para comunicar eventos al componente padre
const emit = defineEmits(['actualizar-select']);

// Declara una variable reactiva que almacena el valor seleccionado en el dropdown
const seleccionado = ref('');

// Función asíncrona para cargar los datos de cursos y etapas desde el servidor
const cargarCursosEtapa = async () => {
  try {
    const data = await cargarCursosEtapas(isToastOpen, toastMessage, toastColor)
    cursosEtapas.value = data;
  } catch (error) {
    console.error('Error al cargar cursos y etapas', error);
  }
};

// Usa el ciclo de vida onMounted para ejecutar código cuando el componente se monta
onMounted(async() => {
    // Llama a la función para cargar los cursos y etapas
    await cargarCursosEtapa();
});

// Función para emitir un evento con el curso y etapa seleccionados
const actualizarSelect = () => {
    if (seleccionado.value) {
        // Divide el valor seleccionado en curso y etapa
        const [curso, etapa] = seleccionado.value.split('-');
        // Emite el evento con los datos seleccionados
        emit('actualizar-select', { curso: parseInt(curso), etapa });
        console.log("Evento emitido:", { curso: parseInt(curso), etapa });
    } else {
        // Si no hay selección, emite valores por defecto
        emit('actualizar-select', { curso: null, etapa: '' });
    }
};
</script>

<template>
    <div>
        <!-- Dropdown para seleccionar curso y etapa -->
        <select 
            v-model="seleccionado" 
            @change="actualizarSelect" 
            name="cursos-etapas" 
            id="cursos-etapas" 
            class="p-2">
            <!-- Opción inicial por defecto -->
            <option value="">Selecciona un curso</option>
            <!-- Genera las opciones dinámicamente desde los datos obtenidos -->
            <option 
                v-for="cursoEtapa in cursosEtapas" 
                :key="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`"
                :value="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`">
                {{ cursoEtapa.idCursoEtapa.curso }} {{ cursoEtapa.idCursoEtapa.etapa }}
            </option>
        </select>
    </div>
</template>

<style>
.m-1 {
  margin-bottom: 1rem;
  font-size: 20px;
  flex-grow: 1;
}
.p-2{
  padding: 0.5rem;
  border: 1px solid ; 
  border-radius: 0.375rem; 
}
</style>