<script setup>
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue'; // Componente para seleccionar curso y etapa
import { ref } from 'vue'; // Composables de Vue para trabajar con datos reactivos
import axios from 'axios';
import ComboGrupos from '@/components/school_manager/ComboGrupos.vue';
import ListViewAlumnos from '@/components/school_manager/ListViewAlumnos.vue';

// Variable reactiva que almacena el filtro seleccionado (curso y etapa)
const filtroSeleccionado = ref({ curso: null, etapa: '' });

// Declara la variable reactiva con un valor inicial
const grupoSeleccionado = ref('');

// Define la variable que almacenará el mensaje de éxito
const resultadoGrupos = ref('');  // Usamos ref para que sea reactivo

// Función que se ejecuta al actualizar el filtro en el componente FilterCursoEtapa
const actualizarSelect = (parametro) => {
    filtroSeleccionado.value = parametro;
    console.log("Filtro actualizado:", filtroSeleccionado.value);

    resultadoGrupos.value = "";

    obtenerGrupos(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa);
};

const actualizarGrupo = (parametro) => {
    grupoSeleccionado.value = parametro;
    console.log("Filtro grupos actualizado:", grupoSeleccionado.value);

    // reinicia la lista de alumnos recuperada anteriormente.
    listadoAlumnos.value = [];
};

// Función asíncrona para cargar los datos de cursos y etapas desde el servidor
const crearNuevoGrupo = async (curso, etapa) => {
    try {
        const cursoInt = parseInt(curso);

        const headers = {
            'curso': cursoInt,
            'etapa': etapa
        };

        const response = await axios.post('http://localhost:8081/direccion/grupos', null, { headers });

        if (response.status === 200) {
            resultadoGrupos.value = "GRUPO CREADO CON ÉXITO";
            obtenerGrupos(cursoInt, etapa);
            actualizarGrupo();
        } else {
            resultadoGrupos.value = "Hubo un problema al crear el grupo.";
        }
    } catch (error) {
        console.error('Error al crear grupo:', error);
    }
};

const grupos = ref([]);

// Función asíncrona para cargar los grupos
const obtenerGrupos = async (curso, etapa) => {
    try {
        if (curso != null && etapa != '') {
            const headers = {
                'curso': parseInt(curso),
                'etapa': etapa
            };

            const response = await axios.get('http://localhost:8081/direccion/grupos', {
                headers: headers
            });

            grupos.value = response.data;
        }
    } catch (error) {
        console.error('Error al cargar grupos', error);
    }
};

// Función para obtener los alumnos
const listadoAlumnos = ref([]);

const obtenerAlumnos = async (cursoP, etapa, grupo) => {
    try {
        const curso = parseInt(cursoP);
        
        if (curso != null && etapa != '' && grupo != '') {
            const params = {
                curso: curso,
                etapa: etapa,
                grupo: grupo
            };

            const response = await axios.get('http://localhost:8081/direccion/grupos/alumnos', {
                params: params
            });

            listadoAlumnos.value = response.data;
        }
    } catch (error) {
        console.error('Error al cargar alumnos', error);
    }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-grow mt-12 mb-12">
    <h1 class="text-4xl font-bold" style="margin-bottom: 50px">CARGA DATOS</h1>

    <!-- Escucha al evento personalizado llamado "actualizar-select" -->
    <FilterCursoEtapa @actualizar-select="actualizarSelect"/>
    
    <h1>{{ resultadoGrupos }}</h1>
    
    <button 
      @click="crearNuevoGrupo(filtroSeleccionado.curso, filtroSeleccionado.etapa)" 
      class="p-2 border border-gray-300 rounded-md bg-blue-500 text-white" 
      style="margin-top: 20px;">
      Crea grupo.
    </button>
    
    <ComboGrupos 
      @actualizar-grupos="actualizarGrupo" 
      :grupos="grupos" 
      style="margin-top:20px"
    />
    
    <button  
      @click="obtenerAlumnos(filtroSeleccionado.curso, filtroSeleccionado.etapa, grupoSeleccionado)" 
      class="p-2 border border-gray-300 rounded-md bg-blue-500 text-white" 
      style="margin-top: 20px;">
      Cargar alumnos.
    </button>

    <!-- Recibe listado de alumnos y parámetros necesarios para hacer la llamada al backend-->
    <ListViewAlumnos 
      :alumnos="listadoAlumnos" 
      :grupoSeleccionado="grupoSeleccionado" 
      :etapa="filtroSeleccionado.etapa" 
      :curso="filtroSeleccionado.curso"
    />
  </div>
</template>

<style scoped>
</style>
