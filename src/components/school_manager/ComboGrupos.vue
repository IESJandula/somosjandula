<script setup>
// Importa las funciones necesarias de Vue y Axios
import { ref,defineProps, defineEmits } from 'vue';

// listado para almacenar desde backedn.
// Define las propiedades que este componente recibirá del padre
const props = defineProps({
  grupos: {
    type: Array,
    required: true
  }
});

// Evento que emite
const emit = defineEmits(['actualizar-grupos']);

// Variable de grupo seleccionado
const grupoSeleccionado = ref('');

// Función para emitir un evento con el grupo seleccionado
const actualizarSelect = () => {
    if (grupoSeleccionado.value) {
        // Emite el evento con el grupo seleccionado
        emit('actualizar-grupos', grupoSeleccionado.value);
        console.log("Evento emitido con grupo:", grupoSeleccionado.value);
    } else {
        // Si no hay selección, emite valores por defecto
        emit('actualizar-grupos', '');
        console.log("Evento emitido sin grupo seleccionado");
    }
};

</script>

<template>
    <div>
        <!-- Título del filtro -->
        <p class="mb-4">Selecciona grupo</p>
        <!-- Dropdown para seleccionar curso y etapa -->
        <select 
            v-model="grupoSeleccionado" 
            @change="actualizarSelect" 
            name="grupos" 
            id="grupos" 
            class="p-2 border border-gray-300 rounded-md"
        >
            <!-- Opción inicial por defecto -->
            <option value="">Selecciona un grupo</option>
            <!-- Genera las opciones dinámicamente desde los datos obtenidos -->
            <option 
                v-for="grupo in props.grupos" 
                :key="`${grupo}`"
                :value="`${grupo}`">
                {{ grupo }}
            </option>
        </select>
    </div>
</template>

<style>
/* Puedes agregar estilos personalizados aquí */
</style>
