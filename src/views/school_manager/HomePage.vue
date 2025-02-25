<script setup>
// Importa los componentes necesarios y las funcionalidades de Vue
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue'; // Componente para seleccionar curso y etapa
import { ref } from 'vue'; // Composables de Vue para trabajar con datos reactivos
import TablaAsignaturas from '@/components/school_manager/TablaAsignaturas.vue'; // Componente que muestra las asignaturas

// Variable reactiva que almacena el filtro seleccionado (curso y etapa)
const filtroSeleccionado = ref({ curso: null, etapa: '' });

// Función que se ejecuta al actualizar el filtro en el componente FilterCursoEtapa
const actualizarSelect = (seleccionado) => {
    // Actualiza la variable reactiva con el nuevo valor del filtro
    filtroSeleccionado.value = seleccionado;

    // Muestra el filtro actualizado en la consola para depuración
    console.log("Filtro actualizado:", seleccionado);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-grow">
    <!-- Componente para seleccionar curso y etapa -->
    <FilterCursoEtapa @actualizar-select="actualizarSelect" />

    <!-- Componente que muestra la tabla de asignaturas, enlazado a los valores del filtro -->
    <TablaAsignaturas :curso="filtroSeleccionado.curso" :etapa="filtroSeleccionado.etapa" />
  </div>
</template>

<style>
/* Estilo opcional para organizar el diseño */
</style>
