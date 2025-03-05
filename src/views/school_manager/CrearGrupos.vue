<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import {obtenerTokenJWTValido} from "@/services/firebaseService.js";

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const grupoSeleccionado = ref('');
const resultadoGrupos = ref('');
const grupos = ref([]);
const listadoAlumnos = ref([]);
const listadoAlumnosSeleccionados = ref([]);
const listadoAlumnosSinGrupo = ref([]);
const listadoAlumnosDelGrupoSeleccionado = ref([]);
const errorMensaje = ref("");
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const actualizarSelect = (parametro) => {
    filtroSeleccionado.value = parametro;
    resultadoGrupos.value = "";
    grupos.value = [];
    grupoSeleccionado.value = '';
    listadoAlumnos.value = [];
    listadoAlumnosSeleccionados.value = [];
    listadoAlumnosSinGrupo.value = [];
    listadoAlumnosDelGrupoSeleccionado.value = [];
    obtenerGrupos(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa);
};

const actualizarGrupo = (parametro) => {
    grupoSeleccionado.value = parametro;
    listadoAlumnos.value = [];
    listadoAlumnosSeleccionados.value = [];
    listadoAlumnosDelGrupoSeleccionado.value = [];
    listadoAlumnosSinGrupo.value = [];

};

  const alumnosSinGrupo =() =>  {
    listadoAlumnosSinGrupo.value= listadoAlumnos.value.filter(alumno => !alumno.grupo);
    return listadoAlumnosSinGrupo.value
  };

  const alumnosDelGrupoSeleccionado=() => {
    listadoAlumnosDelGrupoSeleccionado.value = listadoAlumnos.value.filter(alumno => alumno.grupo === grupoSeleccionado.value);
    return listadoAlumnosDelGrupoSeleccionado.value
  }





const crearNuevoGrupo = async (curso, etapa) => {
    try {
        const cursoInt = parseInt(curso);
        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

        const response = await axios.post('http://localhost:8086/direccion/grupos', null, {
          headers: {curso: cursoInt, etapa: etapa, 'Authorization': `Bearer ${tokenPropio}`
        }});

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
            const cursoInt = parseInt(curso);
            const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;

            const response = await axios.get('http://localhost:8086/direccion/grupos', {
              headers: {
                curso: cursoInt, etapa: etapa, 'Authorization': `Bearer ${tokenPropio}`
              }});
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
          const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;
            const params = { curso: parseInt(curso), etapa, grupo };

            const response = await axios.get('http://localhost:8086/direccion/grupos/alumnos', { params,
              headers : {
                'Authorization': `Bearer ${tokenPropio}`
              } });
            listadoAlumnos.value = response.data;
            listadoAlumnosSinGrupo.value = alumnosSinGrupo();
            listadoAlumnosDelGrupoSeleccionado.value = alumnosDelGrupoSeleccionado();
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
        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;
        const params = { curso: cursoInt, etapa, grupo };


        await axios.post('http://localhost:8086/direccion/grupos/alumnos', listadoAlumnosSeleccionados.value, { params,
          headers: {
          'Authorization': `Bearer ${tokenPropio}`
          }
        });
        obtenerAlumnos();
    } catch (error) {
        console.error('Error al enviar alumnos:', error);
    }
};

const borrarAlumno = async (alumno) => {
    try {
        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen) ;
        await axios.delete('http://localhost:8086/direccion/grupos/alumnos', { data: alumno,
        headers: {
            'Authorization': `Bearer ${tokenPropio}`
          }});
        obtenerAlumnos();
    } catch (error) {
        errorMensaje.value = "Error al borrar el alumno.";
    }
};

onMounted(
  obtenerAlumnos, 
  obtenerGrupos());
</script>

<template>
  <h1 class="m-2">Creación de grupos</h1>
  <div class="container">

    <div class="contenido m-1">
      <!-- Primera columna (Filtros y selección de grupo) -->
      <div class="columna">
        <FilterCursoEtapa @actualizar-select="actualizarSelect" class="m-1" />
        <button @click="crearNuevoGrupo(filtroSeleccionado.curso, filtroSeleccionado.etapa)" class="btn">Crea grupo</button>

        <p class="m-1">Selecciona grupo</p>
        <select v-model="grupoSeleccionado" @change="actualizarGrupo(grupoSeleccionado)" class="p-2 m-1">
          <option value="">Selecciona un grupo</option>
          <option v-for="grupo in grupos" :key="grupo" :value="grupo">{{ grupo }}</option>
        </select>
        <button @click="obtenerAlumnos" class="btn">Cargar alumnos</button>
      </div>

      <!-- Segunda columna (Selección de alumnos y tabla de grupo) -->
      <div class="columna">
        <p class="m-1">Selecciona alumnos</p>
        <ul class="listaAlumnos">
          <li v-if="listadoAlumnosSinGrupo.length === 0">No hay alumnos disponibles.</li>
          <li v-for="(alumno, index) in listadoAlumnosSinGrupo" :key="index" class="p-2 m-1">
            <input type="checkbox" :value="alumno" v-model="listadoAlumnosSeleccionados" />
            {{ alumno.nombre }} {{ alumno.apellidos }}
          </li>
        </ul>
        <button @click="enviarDatos" class="btn">Enviar datos</button>

        <div v-if="grupoSeleccionado">
          <h1 class="m-4">{{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ grupoSeleccionado }}</h1>
          <table v-if="listadoAlumnos.length > 0" class="tablaAlumnos">
            <thead>
              <tr class="blue">
                <th class="th">Acciones</th>
                <th class="th">Nombre</th>
                <th class="th">Apellidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alumno in listadoAlumnosDelGrupoSeleccionado" :key="alumno.id">
                <td class="th"><button class="eliminar" @click="borrarAlumno(alumno)">&times;</button></td>
                <td class="th">{{ alumno.nombre }}</td>
                <td class="th">{{ alumno.apellidos }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.m-1 {
  font-size: 20px;
  flex-grow: 1; 
  
}
.m-2 {
  font-size: 2.25rem;
  font-weight: 700; 
  margin-bottom: 1.5rem; 
  text-align: center;
}
.p-2{
  padding: 0.5rem;
  border: 1px solid #D1D5DB; 
  border-radius: 0.375rem; 
}
.m-4 {
  font-weight: 700;
  font-size: 1.125rem;
  text-align: center;
  margin-top: 1rem; 
  margin-bottom: 1rem; 
}
.btn {
  padding: 0.5rem;
  border: 1px solid ;
  border-radius: 0.375rem; 
  background-color: #3B82F6;
  color: #FFFFFF;
  font-size: 17px;
}
.listaAlumnos {
  table-layout: auto;
  padding: 0.55rem;
  margin: 0.75px; 
  border: 1px solid;
  overflow: auto; 
  max-height: 10rem;
  max-width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  min-width: 300px;
}
.tablaAlumnos {
  table-layout: auto;
  border: 1px solid;
  max-width: 100%;
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
  overflow: scroll; 
}
.blue {
  background-color: #3B82F6; /* bg-blue-500 */
  color: #FFFFFF; /* text-white */
}
.th {
  border: 1px solid currentColor; 
  padding-left: 1rem; 
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.eliminar {
  color: #EF4444;
  font-size: 24px; /* <-- Reducir tamaño */
  background-color: transparent;
  line-height: 1; /* <-- Ajuste para evitar desbordamiento */
  border: none;
}
.container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  margin-left: 25%;
  padding-right: 40%;
}

/* Contenedor principal */
.contenido {
  display: flex; /* Hace que las columnas estén lado a lado */
  flex-direction: row; /* Asegura que estén en fila */
  gap: 15rem; /* Espacio entre columnas */
  justify-content: center; /* Espacio uniforme */
  align-items: flex-start; /* Alinea los elementos arriba */
  width: 80%;
  max-width: 500px;
}

/* Columnas */
.columna {
  flex: 1; /* Ambas columnas ocupan el mismo espacio */
  max-width: 100%; /* Evita que una columna sea más ancha */
  display: flex;
  flex-direction: column; /* Asegura que todo esté en columna */
}
</style>
