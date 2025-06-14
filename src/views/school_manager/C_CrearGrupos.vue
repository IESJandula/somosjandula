<template>
  <h1 class="t-1">Creación de grupos</h1>
  <div class="top-container">
    <div class="card-upload-alumnos">
      <div class="t-2">Filtrar por curso y etapa</div>
      <FilterCursoEtapa 
        v-model="filtroSeleccionadoString"
        @actualizar-select="actualizarSelect" 
        class="texto-dropdown"/>

      <div class="fila-botones">
        <button @click="seleccionarTodo" class="btn">Seleccionar todo</button>
        <button @click="deseleccionarTodo" class="btn">Quitar todo</button>
      </div>
      <!-- Listado de alumnos -->
      <p class="cantidad-alumnos">
        Total de alumnos: {{ listadoAlumnosSinGrupo.length }}
      </p>

      <div class="lista-alumnos">
        <label class="posicion-lista" v-if="listadoAlumnosSinGrupo.length === 0">No hay alumnos disponibles.</label>
        <label v-for="alumno in listadoAlumnosSinGrupo" :key="alumno.id" class="texto-lista-alumnos">
          <label>
            <input type="checkbox" :value="alumno" v-model="listadoAlumnosSeleccionados" />
            {{ alumno.apellidos }}, {{ alumno.nombre }}
          </label>
        </label>
      </div>

      <button @click="crearNuevoGrupo(filtroSeleccionado.curso, filtroSeleccionado.etapa)" class="btn">Crea grupo</button>

      <div class="group-section">
        <div class="t-2">Filtrar por grupo</div>
        <select v-model="grupoSeleccionado" @change="actualizarGrupo(grupoSeleccionado)" class="texto-dropdown">
          <option value="" disabled hidden>Selecciona un grupo</option>
          <option v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo" :value="infoGrupo.grupo">{{ infoGrupo.grupo }}</option>
        </select>
        <button @click="asignarAlumno" class="btn">Añadir alumnos</button>
        <!-- Spinner de carga -->
        <div v-if="isLoading" class="fondo-gris">
          <div class="circulo"></div>
        </div>
      </div>
    </div>
    <div class="card-upload-table">
      <div  v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo">
        <h1 class="t-3">{{ filtroSeleccionado.curso }} {{ filtroSeleccionado.etapa }} {{ infoGrupo.grupo }}
          <button class="limpiar-grupo" @click="limpiarGrupo(infoGrupo.grupo)"> Limpiar grupo</button>
        </h1>
          <p v-if="alumnosPorGrupo[infoGrupo.grupo] && alumnosPorGrupo[infoGrupo.grupo].length > 0" class="cantidad-alumnos-tabla">
            Total de alumnos: {{ alumnosPorGrupo[infoGrupo.grupo].length }}
            <label class="horario-checkbox">
              <input type="checkbox" 
                v-model="infoGrupo.horarioMatutino" 
                @change="actualizarTurno(infoGrupo)"/> 
                Horario de mañana
            </label>
          </p>
          <div>
            <table v-if="alumnosPorGrupo[infoGrupo.grupo] && alumnosPorGrupo[infoGrupo.grupo].length > 0" class="tabla-alumnos">
              <thead>
                <tr class="blue">
                  <th class="th-accion">Acción</th>
                  <th class="th">Nombre</th>
                  <th class="th">Apellidos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alumno in alumnosPorGrupo[infoGrupo.grupo]" :key="alumno.id">
                  <td class="th-accion"><button class="btn-eliminar" @click="borrarAlumno(alumno, infoGrupo.grupo)">&times;</button></td>
                  <td class="th">{{ alumno.nombre }}</td>
                  <td class="th">{{ alumno.apellidos }}</td>
                </tr>
              </tbody>
            </table>
            <p style="text-align: center;" v-else>No hay alumnos en este grupo.</p>
          </div>
      </div>
    </div>
    <ion-toast 
      :is-open="isToastOpen" 
      :message="toastMessage" 
      :color="toastColor" 
      duration="2000" 
      @did-dismiss="() => (isToastOpen = false)" 
      position="top">
    </ion-toast>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { crearToast } from '@/utils/toast.js';
import { crearNuevosGrupos, obtenerGrupos, obtenerAlumnosConGrupos, obtenerAlumnosSinGrupos, asignarAlumnos, borrarAlumnos, actualizarTurnoHorario } from '@/services/schoolManager.js'
import { IonToast } from "@ionic/vue";

const filtroSeleccionado = ref({ curso: null, etapa: '' });
const filtroSeleccionadoString = ref('');
const grupoSeleccionado = ref('');
const infoGrupos = ref([]);
const listadoAlumnosSeleccionados = ref([]);
const listadoAlumnosSinGrupo = ref([]);
const alumnosPorGrupo = ref({})
// Nueva variable reactiva para el estado de carga
const isLoading = ref(false);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const actualizarSelect = (parametro) => {
    filtroSeleccionado.value = parametro;
    filtroSeleccionadoString.value = `${parametro.curso}-${parametro.etapa}`;
    infoGrupos.value = [];
    grupoSeleccionado.value = '';
    alumnosPorGrupo.value = {};
    listadoAlumnosSinGrupo.value = [];
    
    obtenerGrupo(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa);
    obtenerAlumnos();
};

const actualizarGrupo = (parametro) => {
    grupoSeleccionado.value = parametro;

};

const crearNuevoGrupo = async (curso, etapa) => {
  try {

    if (!curso || !etapa) {
      // Si no se ha seleccionado curso o etapa, avisas o retornas
      mensajeActualizacion = "Debes seleccionar un curso y una etapa antes de crear un grupo.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    const response = await crearNuevosGrupos(curso, etapa, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Grupo creado correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await obtenerGrupo(parseInt(curso, 10), etapa);
    actualizarGrupo('');
     
  } catch (error) {
    mensajeActualizacion = "Error al crear el grupo.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerGrupo = async (curso, etapa) => {
  try {
    if (curso != null && etapa) {
      infoGrupos.value = await obtenerGrupos(curso, etapa, toastMessage, toastColor, isToastOpen);
      await obtenerAlumnos();
    }
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const obtenerAlumnos = async () => {
  try {
    const { curso, etapa } = filtroSeleccionado.value;

    const data = await obtenerAlumnosSinGrupos(curso,etapa,toastMessage, toastColor, isToastOpen) || [];

    listadoAlumnosSinGrupo.value = data.filter(function (el) {
        return el.asignado === false;
      })
    console.log(listadoAlumnosSinGrupo)

    alumnosPorGrupo.value = {}; //HAY QUE LIMPIAR PRIMERO, SI NO SE DUPLICAN

    //La comprobacion de los grupos se realiza si la variable info grupos no esta vacía, asi se evita una falsa excepcion
    if(infoGrupos.value !== undefined) {
    for (const infoGrupo of infoGrupos.value) {

      const alumnosDeEseGrupo = await obtenerAlumnosConGrupos(
          curso, etapa, infoGrupo.grupo, toastMessage, toastColor, isToastOpen
      );
      console.log(`Alumnos de grupo ${infoGrupo.grupo}`, alumnosDeEseGrupo);
      // Guardamos ese array bajo la clave del grupo
      alumnosPorGrupo.value[infoGrupo.grupo] = alumnosDeEseGrupo;
      }
    }
  }
  catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error( error);
  }
};

const asignarAlumno = async () => {
  try {
    const { curso, etapa } = filtroSeleccionado.value;
    const grupo = grupoSeleccionado.value;
    if (!grupo) {
      // Si no se ha seleccionado grupo, avisas o retornas
      mensajeActualizacion = "Debes seleccionar un grupo antes de añadir alumnos.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }
    const cursoInt = parseInt(curso);

    if(listadoAlumnosSeleccionados.value.length === 0) {
      // Si no se han seleccionado alumnos, avisas o retornas
      mensajeActualizacion = "Debes seleccionar al menos un alumno antes de añadirlo al grupo.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    isLoading.value = true; // Activar el estado de carga
    const response = await asignarAlumnos(cursoInt, etapa, grupo, listadoAlumnosSeleccionados.value, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Alumnos añadidos correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

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
    mensajeActualizacion = "Error al añadir alumnos.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
  finally {
    console.log("Desactivando spinner...");
    isLoading.value = false; // Desactivar el estado de carga
  }
};

const borrarAlumno = async (alumno, grupo) => {
  try {
    const response = await borrarAlumnos({ ...alumno, grupo }, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Alumno borrado correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
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
    
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    console.log("Antes de borrar, grupo:", grupo, alumnosPorGrupo.value[grupo]);

    
  } catch (error) {
    mensajeActualizacion = "Error al borrar el alumno.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const limpiarGrupo = async (grupo) => {
  try {
    const alumnosDeEsteGrupo = alumnosPorGrupo.value[grupo] || [];
    for (const alumno of alumnosDeEsteGrupo) {
      isLoading.value = true; // Activar el estado de carga
      const response = await borrarAlumnos({ ...alumno, grupo }, toastMessage, toastColor, isToastOpen);

      if(response.ok) {
      mensajeActualizacion = "Grupo limpiado correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      listadoAlumnosSinGrupo.value.push(alumno);
      listadoAlumnosSinGrupo.value.sort((a, b) => { //Primero filtra por nombre y después por apellido
        const cmpApellidos  = a.apellidos.localeCompare(b.apellidos);
        if (cmpApellidos  !== 0) return cmpApellidos ;
        return a.nombre.localeCompare(b.nombre);
      });

      alumnosPorGrupo.value[grupo] = [];
      
      } else {
        const errorData = await response.json();
        mensajeColor = 'danger';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
      }     
    }
    
  } catch (error) {
    mensajeActualizacion = "Error al limpiar el grupo.";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
  finally {
    console.log("Desactivando spinner...");
    isLoading.value = false; // Desactivar el estado de carga
  }
};

const seleccionarTodo = () => {
  listadoAlumnosSeleccionados.value = [...listadoAlumnosSinGrupo.value];
};

const deseleccionarTodo = () => {
  listadoAlumnosSeleccionados.value = [];
};

const actualizarTurno = async (infoGrupo) =>
{
  try
  {
    await actualizarTurnoHorario(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, infoGrupo.grupo, infoGrupo.horarioMatutino, toastMessage, toastColor, isToastOpen);    
  }
  catch (error)
  {
    // Revertimos el cambio en el modelo si la API falla
    infoGrupo.horarioMatutino = !infoGrupo.horarioMatutino;
    
    // Mostramos toast de error
    mensajeActualizacion = "Error al actualizar el turno horario.";
    mensajeColor = "danger";

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error("Error actualizando turno:", error);
  }
};

onMounted(async () => {
  
});
</script>

<style scoped>
.t-1 {
  font-size: 2.2rem;
  font-weight: 700; 
  margin-bottom: 1.5rem; 
  text-align: center;
}

.top-container {
  display: flex;
  flex-direction: row; 
  justify-content: center; 
  align-items: flex-start; 
  flex-wrap: wrap; 
  width: 100%;
  gap: 20px; 
  max-width: 100%;
}

.card-upload-alumnos {
  background-color: var(--form-bg-light);
  padding: 25px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  width: 450px;
}

.t-2 {
  font-size: 1.27rem;
  margin-bottom: 0.5rem; 
  margin-left: 0.4rem;
}

.texto-dropdown {
  font-size: 1.1rem;
  margin-top: 10px;
}

.fila-botones {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.btn {
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 17px;
  padding: 0.2rem;
  border: none;
  border-radius: 0.375rem; 
  margin-top: 1rem;
  cursor: pointer;
  width: 100%;
  height: 2rem; 
}

.btn:hover {
  background-color: #1461eb;
}

.cantidad-alumnos {
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 10px;
  margin-top: 12px;
}

.lista-alumnos {
  max-height: 12rem;
  height: 11.5rem;
  overflow: auto; 
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid;
}

.posicion-lista {
  padding-top: 4rem;
  padding-bottom: 5rem;
  padding-left: 5.5rem;
  display: block;
  margin: 3px;
}

.texto-lista-alumnos {
  font-size: 1.1rem;
  margin-top: 10px;
  padding: 0.15rem;
  display: block;
  margin: 8px;
}

.texto-lista-alumnos:hover {
  color: #3B82F6;
}

.group-section {
  margin-top: 15px;
}

.group-section select {
  width: 100%;
  color: currentColor;
  border: 1px solid;
  border-radius: 8px;
  padding: 10px;
  margin-top: 5px;
  font-size: 1.1rem;
}

.card-upload-table {
  width: 540px;
  min-height: 627px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  overflow-x: auto;
    height: 380px;
}

.t-3 {
  font-weight: 700;
  font-size: 1.1rem;
  text-align: center;
  margin-top: 1rem; 
  margin-bottom: 1rem; 
}

.limpiar-grupo {
  color: #EF4444;
  font-size: 15px;
  text-decoration: underline;
  background-color: transparent;
  line-height: 1; 
  border: none;
}

.cantidad-alumnos-tabla {
  font-size: 1rem;
  margin-bottom: 10px;
}

.horario-checkbox {
  float: right; /* Coloca el elemento a la derecha */
  display: inline-block; /* Permite que esté en la misma línea que otros elementos */
  text-align: right; /* Mantiene la alineación del texto a la derecha */
  margin-left: auto; /* Empuja el elemento hacia la derecha */
  vertical-align: middle; /* Alinea verticalmente con el texto */
  margin-right: 10px; /* Espacio a la derecha para que no se pase de la tabla*/
}

.tabla-alumnos {
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

.blue {
  background-color: #0054e9;
  color: #FFFFFF;
}

.th {
  border: 1px solid black; 
  padding-left: 1rem; 
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.th-accion {
  width: 17%;
  border: 1px solid black; 
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.btn-eliminar {
  display: block;
  margin: auto;
  color: #EF4444;
  font-size: 24px;
  background-color: transparent;
  line-height: 1;
  border: none;
}

.fondo-gris {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 9998; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.circulo {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4782eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  z-index: 9999;
}

@keyframes spin {
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
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

  .btn {
    background-color: #4782eb;
    color: #000000;
  }

  .btn:hover {
    background-color: #3476eb;
  }

  .blue {
    /* color: #76c7c0;  */
    background-color: #4782eb;
  }

  .th,
  .th-accion {
    border: 1px solid white;
  }
}

/* Media queries para hacer que la tarjeta sea más responsive */
@media ((min-width: 768px) and (max-width: 3571px)) {
  .tabla-alumnos{
    margin-left: 0%;
  }

  .card-upload-table {
    width: 100%;
    max-width: 500px;
  }
}

/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {

  .top-container {
    flex-direction: column;
    align-items: center;
  }

  .card-upload-alumnos,
  .card-upload-table {
    width: 350px;
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    max-width: 500px;
  }

  .tabla-alumnos {
    min-width: 300px;
  }
}
</style>
