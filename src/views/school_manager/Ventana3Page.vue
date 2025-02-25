<script setup>
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { ref } from 'vue';
import TablaAsignaturas from '@/components/school_manager/TablaAsignaturas.vue';

const filtroSeleccionado = ref({ curso: null, etapa: '' });

const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
    console.log("Filtro actualizado:", seleccionado);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-grow">
    <FilterCursoEtapa @actualizar-select="actualizarSelect" />
    <TablaAsignaturas :curso="filtroSeleccionado.curso" :etapa="filtroSeleccionado.etapa" />
  </div>
</template>

<style>
</style>
