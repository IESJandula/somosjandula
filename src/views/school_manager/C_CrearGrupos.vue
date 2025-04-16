<script setup>
import { ref, onMounted } from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { crearNuevosGrupos, obtenerInfoGrupos, obtenerAlumnosConGrupos, obtenerAlumnosSinGrupos, asignarAlumnos, borrarAlumnos } from '@/services/schoolManager.js'
import { IonToast } from "@ionic/vue";

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const grupoSeleccionado = ref('');
const resultadoGrupos = ref('');
const infoGrupos = ref([]);
const listadoAlumnosSeleccionados = ref([]);
const listadoAlumnosSinGrupo = ref([]);
const alumnosPorGrupo = ref({})
const errorMensaje = ref("");
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const actualizarSelect = (parametro) => {
    filtroSeleccionado.value = parametro;
    infoGrupos.value = [];
    grupoSeleccionado.value = '';
    alumnosPorGrupo.value = {};
    listadoAlumnosSinGrupo.value = [];
    
    obtenerGrupo(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa);
    obtenerAlumno();
};

const actualizarGrupo = (parametro) => {
    grupoSeleccionado.value = parametro;

};

const crearNuevoGrupo = async (curso, etapa) => {
  try {
    const response  = await crearNuevosGrupos(curso, etapa, toastMessage, toastColor, isToastOpen);

      if (response.status === 200) {
          resultadoGrupos.value = "GRUPO CREADO CON ÉXITO";
          await obtenerGrupo(parseInt(curso, 10), etapa);
          actualizarGrupo('');
      } else {
          resultadoGrupos.value = "Hubo un problema al crear el grupo.";
      }
  } catch (error) {
    console.error('Error al crear grupo:', error);
    resultadoGrupos.value = "Hubo un problema al crear el grupo.";
  }
};

const obtenerGrupo = async (curso, etapa) => {
  try {
      if (curso != null && etapa) {
          infoGrupos.value = await obtenerInfoGrupos(curso, etapa, toastMessage, toastColor, isToastOpen);
          await obtenerAlumno();
      }
  } catch (error) {
      console.error('Error al cargar grupos', error);
  }
};

const obtenerAlumno = async () => {
  try {
      const { curso, etapa } = filtroSeleccionado.value;

      const data = await obtenerAlumnosSinGrupos(curso,etapa,toastMessage, toastColor, isToastOpen) || [];




    listadoAlumnosSinGrupo.value = data.filter(function (el) {
          return el.asignado === false;
        })
    console.log(listadoAlumnosSinGrupo)

      alumnosPorGrupo.value = {}; //HAY QUE LIMPIAR PRIMERO, SI NO SE DUPLICAN
      for (const infoGrupo of infoGrupos.value) {

        const alumnosDeEseGrupo = await obtenerAlumnosConGrupos(
            curso, etapa, infoGrupo.grupo, toastMessage, toastColor, isToastOpen
        );
        console.log(`Alumnos de grupo ${infoGrupo.grupo}`, alumnosDeEseGrupo);
        // Guardamos ese array bajo la clave del grupo
        alumnosPorGrupo.value[infoGrupo.grupo] = alumnosDeEseGrupo;
    }

  }
  catch (error) {
      console.error('Error al cargar alumnos', error);
  }
};

const enviarDato = async () => {
  try {
    const { curso, etapa } = filtroSeleccionado.value;
    const grupo = grupoSeleccionado.value;
    if (!grupo) {
      // Si no se ha seleccionado grupo, avisas o retornas
      toastMessage.value = "Debes seleccionar un grupo antes de añadir alumnos.";
      toastColor.value = "warning";
      isToastOpen.value = true;
      return;
    }
    const cursoInt = parseInt(curso);

    await asignarAlumnos(cursoInt, etapa, grupo, listadoAlumnosSeleccionados.value, toastMessage, toastColor, isToastOpen);

    const idsSeleccionados = listadoAlumnosSeleccionados.value.map(a => a.nombre + ' ' + a.apellidos);
    listadoAlumnosSinGrupo.value = listadoAlumnosSinGrupo.value.filter(
      (al) => !idsSeleccionados.includes(al.nombre + ' ' + al.apellidos)
    );

    // Limpiamos el array de alumnos sin grupo para que no se repitan
    listadoAlumnosSinGrupo.value = listadoAlumnosSinGrupo.value.filter(alumno => !listadoAlumnosSeleccionados.value.includes(alumno));

    // Y los añadimos al array del grupo
    if (!alumnosPorGrupo.value[grupo]) {
      alumnosPorGrupo.value[grupo] = [];
    }
    alumnosPorGrupo.value[grupo].push(...listadoAlumnosSeleccionados.value);

    // Limpiamos selección
    listadoAlumnosSeleccionados.value = [];
  } catch (error) {
      console.error('Error al enviar alumnos:', error);
  }
};

const borrarAlumno = async (alumno, grupo) => {
  try {
    await borrarAlumnos(alumno, toastMessage, toastColor, isToastOpen);

    console.log("Antes de borrar, grupo:", grupo, alumnosPorGrupo.value[grupo]);

    // Buscar el índice del alumno dentro del grupo
    const index = alumnosPorGrupo.value[grupo].findIndex(a =>
        a.nombre === alumno.nombre && a.apellidos === alumno.apellidos
    );

    // Si el alumno está en la lista, lo eliminamos con splice()
    if (index !== -1) {
      alumnosPorGrupo.value[grupo].splice(index, 1);
    }

    console.log("Después de borrar, grupo:", grupo, alumnosPorGrupo.value[grupo]);

    // Agregarlo a la lista de alumnos sin grupo
    listadoAlumnosSinGrupo.value.push(alumno);
    listadoAlumnosSinGrupo.value.sort((a, b) => { //Primero filtra por nombre y después por apellido
      const cmpApellidos  = a.apellidos.localeCompare(b.apellidos);
      if (cmpApellidos  !== 0) return cmpApellidos ;
      return a.nombre.localeCompare(b.nombre);
    });
  } catch (error) {
    errorMensaje.value = "Error al borrar el alumno.";
  }
};

const limpiarGrupo = async (grupo) => {
  try {
    const alumnosDeEsteGrupo = alumnosPorGrupo.value[grupo] || [];
    for (const alumno of alumnosDeEsteGrupo) {
      await borrarAlumnos(alumno, toastMessage, toastColor, isToastOpen);

      listadoAlumnosSinGrupo.value.push(alumno);
      listadoAlumnosSinGrupo.value.sort((a, b) => { //Primero filtra por nombre y después por apellido
        const cmpApellidos  = a.apellidos.localeCompare(b.apellidos);
        if (cmpApellidos  !== 0) return cmpApellidos ;
        return a.nombre.localeCompare(b.nombre);
      });
    }

    alumnosPorGrupo.value[grupo] = [];

  } catch (error) {
    console.error("Error al limpiar grupo:", error);
  }
};

const seleccionarTodo = () => {
  listadoAlumnosSeleccionados.value = [...listadoAlumnosSinGrupo.value];
};

const deseleccionarTodo = () => {
  listadoAlumnosSeleccionados.value = [];
};

onMounted(async () => {
  
});
</script>

<template>
  <h1 class="m-2">Creación de grupos</h1>
  <div class="top-section">
    <div class="card-upload-alumnos">
      <FilterCursoEtapa @actualizar-select="actualizarSelect" class="m-1" />
      <span style="display: flex; gap: 10px;">
        <button @click="seleccionarTodo" class="btn">Seleccionar todo</button>
        <button @click="deseleccionarTodo" class="btn">Quitar todo</button>
      </span>
      <!-- Listado de alumnos -->
      <p class="cantidad-alumnos">
        Total de alumnos: {{ listadoAlumnosSinGrupo.length }}
      </p>
      <ul class="listaAlumnos">
        <li class="pad" v-if="listadoAlumnosSinGrupo.length === 0">No hay alumnos disponibles.</li>

        <li v-for="alumno in listadoAlumnosSinGrupo" :key="alumno.id" class="p-2 m-1 transparente">
          <label>
            <input type="checkbox" :value="alumno" v-model="listadoAlumnosSeleccionados" />
            {{ alumno.apellidos }}, {{ alumno.nombre }}
          </label>
        </li>

      </ul>
      <button @click="crearNuevoGrupo(filtroSeleccionado.curso, filtroSeleccionado.etapa)" class="btn">Crea grupo</button>

      <select v-model="grupoSeleccionado" @change="actualizarGrupo(grupoSeleccionado)" class="p-2 m-1">
        <option value="">Selecciona un grupo</option>
        <option v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo" :value="infoGrupo.grupo">{{ infoGrupo.grupo }}</option>
      </select>
      <button @click="enviarDato" class="btn">Añadir alumnos</button>
    </div>
    <div class="card-upload-table">
      <div class="espacio">a
      </div>
      <div  v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo">
          <h1 class="m-4">{{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ infoGrupo.grupo }}
            <button class="eliminarGrupo" @click="limpiarGrupo(infoGrupo.grupo)"> Limpiar grupo</button></h1>
        <div class="scroll-wrapper">
          <p v-if="alumnosPorGrupo[infoGrupo.grupo] && alumnosPorGrupo[infoGrupo.grupo].length > 0" class="cantidad-alumnos">
            Total de alumnos: {{ alumnosPorGrupo[infoGrupo.grupo].length }}
            <label class="horario-checkbox">
              <input type="checkbox" v-model="infoGrupo.horarioMatutino" /> Horario de mañana
            </label>
          </p>
          <table v-if="alumnosPorGrupo[infoGrupo.grupo] && alumnosPorGrupo[infoGrupo.grupo].length > 0" class="tablaAlumnos">
            <thead>
              <tr class="blue">
                <th class="th">Acciones</th>
                <th class="th">Nombre</th>
                <th class="th">Apellidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alumno in alumnosPorGrupo[infoGrupo.grupo]" :key="alumno.id">
                <td class="th"><button class="eliminar" @click="borrarAlumno(alumno, infoGrupo.grupo)">&times;</button></td>
                <td class="th">{{ alumno.nombre }}</td>
                <td class="th">{{ alumno.apellidos }}</td>
              </tr>
            </tbody>

          </table>

          <p v-else>No hay alumnos en este grupo.</p>

        </div>
      </div>
    </div>
    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
  </div>
</template>

<style scoped>
.pad{
  padding-top: 4rem;
  padding-bottom: 5rem;
  padding-left: 2.2rem;
}
.card-upload-alumnos {
flex: 1 1 30%;
min-width: 350px;
max-width: 490px;
min-height: 100%;
height: auto;
background-color: var(--form-bg-light);
box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
border-radius: 10px;
padding: 20px;
display: flex;
flex-direction: column;
align-items: center;
}
.card-upload-table {
  flex: 1 1 30%;
  min-width: 300px;
  max-width: 490px;
  min-height: 502px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: auto;
    height: 380px;


}
label:hover{
  color: #3B82F6;
}
.m-1 {
  font-size: 17px;
  flex-grow: 1; 
  margin-top: 10px;
}
.m-2 {
  font-size: 2.25rem;
  font-weight: 700; 
  margin-bottom: 1.5rem; 
  text-align: center;
}
.p-2{
  padding: 0.4rem;
  border: 1px solid #D1D5DB; 
  border-radius: 0.375rem; 
}
.m-4 {
  font-weight: 700;
  font-size: 1.1rem;
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
  padding: 0.0.5rem;
  border: 1px solid;
  overflow: auto; 
  max-height: 10rem;
  max-width: 100%;
  margin-top: 0.1rem;
  margin-bottom: 1rem;
  width: 50%;
  min-width: 300px;
  border-radius: 10px;
}
.tablaAlumnos {
  flex: 1;
  display: table; 
  border-collapse: collapse;
  border: 1px solid;
  width: auto;      
  min-width: 450px;    
  margin-left: 1%;
  text-align: center;
  margin-right: 10px;
  position: relative; 
}

.transparente{
  border-color: transparent;
}

.blue {
  background-color: #3B82F6; 
  color: #FFFFFF; 
}
.th {
  border: 1px solid currentColor; 
  padding-left: 1rem; 
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.eliminar {
  display: block;
  margin: auto;
  color: #EF4444;
  font-size: 24px;
  background-color: transparent;
  line-height: 1;
  border: none;
}
.eliminarGrupo {
  color: #EF4444;
  font-size: 15px;
  text-decoration: underline;
  background-color: transparent;
  line-height: 1; 
  border: none;
}
.top-section {
  display: flex;
  flex-direction: row; 
  justify-content: center; 
  align-items: flex-start; 
  flex-wrap: wrap; 
  width: 100%;
  gap: 20px; 
  max-width: 100%;
}
.espacio{
  text-align: center;
  color: var(--form-bg-light);
}

.horario-checkbox {
  float: right; /* Coloca el elemento a la derecha */
  display: inline-block; /* Permite que esté en la misma línea que otros elementos */
  text-align: right; /* Mantiene la alineación del texto a la derecha */
  margin-left: auto; /* Empuja el elemento hacia la derecha */
  vertical-align: middle; /* Alinea verticalmente con el texto */
}

/* Media queries para hacer que la tarjeta sea más responsive */
@media ((min-width: 768px) and (max-width: 3571px)) {
  .espacio{
    color: transparent;
    margin-left: 100%;
    margin-top: -30px;
  }
  .tablaAlumnos{
    margin-left: 0%;
  }

}

/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .card-upload-alumnos,
  .card-upload-table {
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    max-width: 500px;
  }

  .espacio{
    color: transparent;
    margin-left: 103%;
    margin-top: -30px;
  }
  .tablaAlumnos {
    min-width: 300px;
  }

}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .card-upload-alumnos {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .card-upload-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .btn{
    color: black;
  }

}
</style>
