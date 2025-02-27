<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const grupoSeleccionado = ref('');
const resultadoGrupos = ref('');
const grupos = ref([]);
const listadoAlumnos = ref([]);
const alumnosGrupo = ref([]);
const loading = ref(false);
const errorMensaje = ref("");

const actualizarSelect = (parametro) => {
    filtroSeleccionado.value = parametro;
    resultadoGrupos.value = "";
    obtenerGrupos(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa);
};

const actualizarGrupo = (parametro) => {
    grupoSeleccionado.value = parametro;
    listadoAlumnos.value = [];
};

const crearNuevoGrupo = async (curso, etapa) => {
    try {
        const cursoInt = parseInt(curso);
        const headers = { curso: cursoInt, etapa: etapa };
        const response = await axios.post('http://localhost:8081/direccion/grupos', null, { headers });

        if (response.status === 200) {
            resultadoGrupos.value = "GRUPO CREADO CON ÉXITO";
            obtenerGrupos(cursoInt, etapa);
            actualizarGrupo('');
        } else {
            resultadoGrupos.value = "Hubo un problema al crear el grupo.";
        }
    } catch (error) {
        console.error('Error al crear grupo:', error);
    }
};

const obtenerGrupos = async (curso, etapa) => {
    try {
        if (curso != null && etapa !== '') {
            const headers = { curso: parseInt(curso), etapa: etapa };
            const response = await axios.get('http://localhost:8081/direccion/grupos', { headers });
            grupos.value = response.data;
        }
    } catch (error) {
        console.error('Error al cargar grupos', error);
    }
};

const obtenerAlumnos = async () => {
    try {
        const { curso, etapa } = filtroSeleccionado.value;
        const grupo = grupoSeleccionado.value;
        if (curso && etapa && grupo) {
            const params = { curso: parseInt(curso), etapa, grupo };
            const response = await axios.get('http://localhost:8081/direccion/grupos/alumnos', { params });
            listadoAlumnos.value = response.data;
        }
    } catch (error) {
        console.error('Error al cargar alumnos', error);
    }
};

const enviarDatos = async () => {
    try {
        const { curso, etapa } = filtroSeleccionado.value;
        const grupo = grupoSeleccionado.value;
        const cursoInt = parseInt(curso);
        const params = { curso: cursoInt, etapa, grupo };
        await axios.post('http://localhost:8081/direccion/grupos/alumnos', listadoAlumnos.value, { params });
    } catch (error) {
        console.error('Error al enviar alumnos:', error);
    }
};

const borrarAlumno = async (alumno) => {
    try {
        await axios.delete('http://localhost:8086/direccion/grupos/alumnos', { data: alumno });
        obtenerAlumnos();
    } catch (error) {
        errorMensaje.value = "Error al borrar el alumno.";
    }
};

onMounted(obtenerAlumnos);
</script>

<template>
  <div class="flex flex-col items-center justify-center flex-grow mt-12 mb-12">
    <h1 class="text-4xl font-bold mb-10">Creación de grupos</h1>
    <FilterCursoEtapa @actualizar-select="actualizarSelect" />
    <h1>{{ resultadoGrupos }}</h1>
    <button @click="crearNuevoGrupo(filtroSeleccionado.curso, filtroSeleccionado.etapa)" class="btn">Crea grupo</button>
    <div>
      <p class="mb-4">Selecciona grupo</p>
      <select v-model="grupoSeleccionado" @change="actualizarGrupo(grupoSeleccionado)" class="p-2 border rounded-md">
        <option value="">Selecciona un grupo</option>
        <option v-for="grupo in grupos" :key="grupo" :value="grupo">{{ grupo }}</option>
      </select>
    </div>
    <button @click="obtenerAlumnos" class="btn">Cargar alumnos</button>
    <ul class="p-3 m-3 border overflow-auto max-h-60">
      <li v-if="listadoAlumnos.length === 0">Cargue un listado de alumnos.</li>
      <li v-for="(alumno, index) in listadoAlumnos" :key="index" class="p-2 m-1 border rounded-md">
        <input type="checkbox" :checked="alumno.grupo === grupoSeleccionado" @change="alumno.grupo = grupoSeleccionado ? '' : grupoSeleccionado" />
        {{ alumno.nombre }} {{ alumno.apellidos }}
      </li>
    </ul>
    <button @click="enviarDatos" class="btn">Enviar datos</button>
    <div v-if="grupoSeleccionado">
      <h1 class="font-bold text-lg text-center my-4">{{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ grupoSeleccionado }}</h1>
      <table v-if="listadoAlumnos.length > 0" class="table-auto border w-full">
        <thead>
          <tr class="bg-blue-500 text-white">
            <th class="border px-4 py-2">Acciones</th>
            <th class="border px-4 py-2">Nombre</th>
            <th class="border px-4 py-2">Apellidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alumno in listadoAlumnos" :key="alumno.id">
            <td class="text-center px-4"><button class="text-red-500" @click="borrarAlumno(alumno)">Eliminar</button></td>
            <td class="border px-4 py-2">{{ alumno.nombre }}</td>
            <td class="border px-4 py-2">{{ alumno.apellidos }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid gray;
  border-radius: 0.375rem;
  background-color: blue;
  color: white;
  margin-top: 1rem;
}
</style>
