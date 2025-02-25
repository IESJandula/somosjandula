<script setup>
import { onMounted, ref, defineEmits } from 'vue';
import axios from 'axios';

const cursosEtapas = ref([]);
const emit = defineEmits(['actualizar-select']);

const seleccionado = ref('');

const cargarCursosEtapas = async () => {
    try {
        const response = await axios.get('http://localhost:8086/direccionVentana3/etapaCursos');
        cursosEtapas.value = response.data;
    } catch (error) {
        console.error('Error al cargar cursos y etapas', error);
    }
};

onMounted(() => {
    cargarCursosEtapas();
});

const actualizarSelect = () => {
    if (seleccionado.value) {
        const [curso, etapa] = seleccionado.value.split('-');
        emit('actualizar-select', { curso: parseInt(curso), etapa });
        console.log("Evento emitido:", { curso: parseInt(curso), etapa });
    } else {
        emit('actualizar-select', { curso: null, etapa: '' });
    }
};
</script>

<template>
    <div>
        <p class="mb-4">Filtrar por curso y etapa</p>
        <select v-model="seleccionado" @change="actualizarSelect" name="cursos-etapas" id="cursos-etapas" class="p-2 border border-gray-300 rounded-md">
            <option value="">Selecciona un curso</option>
            <option v-for="cursoEtapa in cursosEtapas" 
                    :key="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`"
                    :value="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`">
                {{ cursoEtapa.idCursoEtapa.curso }} {{ cursoEtapa.idCursoEtapa.etapa }}
            </option>
        </select>
    </div>
</template>

<style>

</style>
