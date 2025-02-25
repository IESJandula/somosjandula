<script setup>
import {  ref,toRefs, defineProps  } from 'vue';
import axios from 'axios';

const props = defineProps({
  seleccionado: {
    type: Object,
    required: true
  }
});

const { seleccionado } = toRefs(props);

  // Ref para el input de archivo
  const fileInputUsers = ref(null);

const subirFichero = async () => {
    try {
        const file = fileInputUsers.value.files[0];
        
        const formData = new FormData();
        formData.append('csv', file);

        const response = await axios.post('http://localhost:8086/direccion/cargarMatriculas', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'curso': parseInt(seleccionado.value.curso,10),
                'etapa': seleccionado.value.etapa
            }
        });
        console.log("Fichero Cargado:", response.data);
        window.location.reload();
    } catch (error) {
        console.error('Error al cargar matriculas', error);
    }
};

</script>

<template>
  <div class="flex flex-col items-center mt-4">
    <p class="mb-4">Subir fichero</p>
    <form @submit.prevent="subirFichero" class="flex flex-col items-center">
        <input type="file" ref="fileInputUsers" class="p-2 border border-gray-300 rounded-md" />
        <br>
        <button type="submit" class="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Enviar
        </button>
    </form>
  </div>
</template>

<style>

</style>
