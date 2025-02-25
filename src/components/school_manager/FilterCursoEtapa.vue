<script setup>
// Importa las funciones necesarias de Vue y Axios
import { onMounted, ref, defineEmits } from 'vue';
import axios from 'axios';

// Declara una variable reactiva para almacenar los cursos y etapas obtenidos del servidor
const cursosEtapas = ref([]);

// Define un emisor para comunicar eventos al componente padre
const emit = defineEmits(['actualizar-select']);

// Declara una variable reactiva que almacena el valor seleccionado en el dropdown
const seleccionado = ref('');

// Función asíncrona para cargar los datos de cursos y etapas desde el servidor
const cargarCursosEtapas = async () => {
    try {
        // Realiza una petición HTTP GET para obtener los datos
        const response = await axios.get('http://localhost:8086/direccion/cursoEtapa');
        // Asigna los datos obtenidos a la variable reactiva
        cursosEtapas.value = response.data;
    } catch (error) {
        // Maneja errores en caso de que la solicitud falle
        console.error('Error al cargar cursos y etapas', error);
    }
};

// Usa el ciclo de vida onMounted para ejecutar código cuando el componente se monta
onMounted(() => {
    // Llama a la función para cargar los cursos y etapas
    cargarCursosEtapas();
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
        <!-- Título del filtro -->
        <p class="mb-4">Filtrar por curso y etapa</p>
        <!-- Dropdown para seleccionar curso y etapa -->
        <select 
            v-model="seleccionado" 
            @change="actualizarSelect" 
            name="cursos-etapas" 
            id="cursos-etapas" 
            class="p-2 border border-gray-300 rounded-md"
        >
            <!-- Opción inicial por defecto -->
            <option value="">Selecciona un curso</option>
            <!-- Genera las opciones dinámicamente desde los datos obtenidos -->
            <option 
                v-for="cursoEtapa in cursosEtapas" 
                :key="`${cursoEtapa.curso}-${cursoEtapa.etapa}`"
                :value="`${cursoEtapa.curso}-${cursoEtapa.etapa}`"
            >
                {{ cursoEtapa.curso }} {{ cursoEtapa.etapa }}
            </option>
        </select>
    </div>
</template>

<style>
/* Puedes agregar estilos personalizados aquí */
</style>
