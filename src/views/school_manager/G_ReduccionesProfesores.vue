<template>
  <h1 class="t-1">Reducciones</h1>
    <div class="top-section">
      <!-- Tabla para crear las reducciones -->
      <div class="card-crea-reduccion">
        <div class="t-2">Crear reducción</div>
        <div class="form-group">
          <label class="form-label">Nombre:
            <ion-input type="text" v-model="nombre" class="form-input"/>
          </label>
          <label class="form-label-numer">Horas:
            <ion-input type="number" v-model.number="horas" min="0" max="50" step="1" class="form-input-numer"/>
          </label>
        </div>
                 <label class="form-label">
           <input 
             type="checkbox"
             class="checkbox"
             v-model="decideDireccion"/> Decide dirección
         </label>
         <div class="texto-instruccion">
            Si posee docencia, elige un grupo:
          </div>
                   <FilterCursoEtapaGrupo 
            v-model="cursosEtapasGruposSeleccionado" 
            @actualizar-select="actualizarCurso(cursosEtapasGruposSeleccionado)" 
            selectClass="select-sm" 
            class="texto-dropdown"
          />
        <!-- Aqui se guarda en la tabla de reducciones -->
        <button @click="crearReduccion(nombre, horas, decideDireccion)" class="btn-guardar">Guardar</button>
      </div>
      <!-- Tabla con todas las reducciones que existen -->
      <div class="card-cargar-reduccion">
        <div class="t-2">Tabla de reducciones</div>
                 <table>
          <thead>
            <tr>
              <th class="columna">Nombre</th>
              <th class="columna">Horas</th>
              <th class="columna">Asigna dirección</th>
              <th class="columna">Curso/Etapa/Grupo</th>
              <th class="columna">Acción</th>
            </tr>
          </thead>
          <tbody>
             <tr v-for="(reduccion, index) in listaReducciones" :key="index">
               <td class="columna">{{ reduccion.nombre }}</td>
               <td class="columna">{{ reduccion.horas }}</td>
               <td class="columna">{{ reduccion.decideDireccion === true ? 'Si' : 'No' }}</td>
               <td class="columna">
                 {{ reduccion.curso && reduccion.etapa && reduccion.grupo 
                    ? `${reduccion.curso}º ${reduccion.etapa} ${reduccion.grupo}` 
                    : 'No asignado' }}
               </td>
               <td class="columna">
                 <button @click="borrarReduccion(index)" class="btn-eliminar">&times;</button>
               </td>
             </tr>
          </tbody>
         </table>
      </div>
    </div>
    <div class="top-section-dos">
      <!-- Tabla para asignar las reducciones -->
      <div class="card-crea-reduccion">
        <div class="t-2">Asignar reducción</div>
        <div class="dropdown-container">
          <div class="dropdown-group">
            <label  for="profesor-select">Profesor:</label>
            <select 
                id="profesor-select"
                v-model="profesorSeleccionado" 
                class="dropdown-select">
                <option value="" disabled hidden>Selecciona un profesor</option>
                <option 
                    v-for="profesor in listaProfesores" 
                    :key="profesor"
                    :value="profesor">
                    {{ profesor.nombre }} {{ profesor.apellidos }}
                </option>
            </select>
          </div>
            <div class="dropdown-group">
              <label for="reduccion-select">Reducción:</label>
              <select 
                  id="reduccion-select"
                  v-model="reduccionSeleccionada" 
                  class="dropdown-select">
                  <option value="" disabled hidden>Selecciona una reducción</option>
                  <option 
                      v-for="reduccion in listaReducciones" 
                      :key="reduccion" 
                      :value="reduccion">
                      {{ reduccion.nombre }} ({{ reduccion.horas }} horas)
                  </option>
              </select>
            </div>
        </div>
        <!-- Aqui se guarda en la tabla de reducciones -->
        <button @click="asignarReduccion(profesorSeleccionado)" class="btn-guardar">Asignar</button>
      </div>
      <!-- Tabla con todas las reducciones que existen -->
      <div class="card-cargar-reduccion">
        <div class="t-2">Reducciones asignadas</div>
        <table>
         <thead>
           <tr>
             <th class="columna">Profesor</th>
             <th class="columna">Reducción</th>
             <th class="columna">Horas</th>
             <th class="columna">Acción</th>
           </tr>
         </thead>
         <tbody>
            <tr v-for="(reduccionAsignada, index) in listaReduccionesAsignadas" :key="index">
              <td class="columna">{{ reduccionAsignada.nombre }} {{ reduccionAsignada.apellidos }}</td>
              <td class="columna">{{ reduccionAsignada.nombreReduccion }}</td>
              <td class="columna">{{ reduccionAsignada.horas }}</td>
              <td class="columna">
                <button @click="borrarReduccionProfesor(index)" class="btn-eliminar">&times;</button>
              </td>
            </tr>
         </tbody>
        </table>
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
import { onMounted, ref } from 'vue';
import { IonInput, IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { cargarReducciones, crearReducciones, borrarReducciones, obtenerProfesores, asignarReducciones, obtenerReduccionesProfesores, borrarReduccionesProfesores } from '@/services/schoolManager.js';
import FilterCursoEtapaGrupo from '@/components/school_manager/FilterCursoEtapaGrupo.vue';

const listaReducciones = ref([]);
const decideDireccion = ref(false);
const nombre = ref('');
const horas = ref('');
const listaProfesores = ref([]);
const profesorSeleccionado = ref('');
const reduccionSeleccionada = ref('');
const listaReduccionesAsignadas = ref([]);
const cursosEtapasGruposSeleccionado = ref('');
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const crearReduccion = async (nombreRe, horasRe, decideDireccionRe) => {

  try {

    if (horasRe < 0) {
      mensajeActualizacion = 'Las horas deben ser mayor o igual a 0.';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    if (!nombreRe || horasRe === '') {
      mensajeActualizacion = 'Por favor, completa todos los campos.';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

         let curso = undefined;
     let etapa = undefined;
     let grupo = undefined;

     if (cursosEtapasGruposSeleccionado.value && cursosEtapasGruposSeleccionado.value !== '') {
       curso = cursosEtapasGruposSeleccionado.value.curso;
       etapa = cursosEtapasGruposSeleccionado.value.etapa;
       grupo = cursosEtapasGruposSeleccionado.value.grupo;
     }

    const response = await crearReducciones(nombreRe, horasRe, decideDireccionRe, 
                                            curso,
                                            etapa,
                                            grupo,
                                            toastMessage, toastColor, isToastOpen);
  
    if (response.ok) {
      mensajeActualizacion = "Reducción creada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    cargarReduccion();
   
  } catch (error) {
    mensajeActualizacion = 'Error al crear la reducción.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const cargarReduccion = async () => {
  try {

    const response = await cargarReducciones(toastMessage, toastColor, isToastOpen);
    listaReducciones.value = response;
         decideDireccion.value = false;
     cursosEtapasGruposSeleccionado.value = '';
    
  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const borrarReduccion = async(index) => {
  
  try {

    const registro = listaReducciones.value[index];
    
    if (!registro) {
      mensajeActualizacion = 'Reducción no encontrada';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }
    const nombreRe = registro.nombre;
    const horasRe = registro.horas;
    const decideDireccionRe = registro.decideDireccion;

    // Asegúrate de que las reducciones asignadas estén actualizadas
    await obtenerReduccionProfesor();

    const response = await borrarReducciones(nombreRe, horasRe, decideDireccionRe, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Reducción eliminada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await cargarReduccion();

  } catch (error) {
    mensajeActualizacion = 'Error al eliminar la reducción.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerProfesor = async () => {

  try {

    const response = await obtenerProfesores(toastMessage, toastColor, isToastOpen);
    listaProfesores.value = response;

    profesorSeleccionado.value = '';

    if(response.length < 0) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const asignarReduccion = async (profesor) => {
  try {

    if (!profesorSeleccionado.value || !reduccionSeleccionada.value) {
      mensajeActualizacion = 'Por favor, selecciona un profesor y una reducción.';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    for(const i in listaReduccionesAsignadas.value) {
      if (listaReduccionesAsignadas.value[i].email === profesor.email && listaReduccionesAsignadas.value[i].nombreReduccion === reduccionSeleccionada.value.nombre) {
        mensajeActualizacion = 'El profesor ya tiene asignada esta reducción.';
        mensajeColor = 'warning';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
        return;
      }
    }

    const horas = reduccionSeleccionada.value.horas;
    const reduccion = reduccionSeleccionada.value.nombre;

    const response = await asignarReducciones(profesor.email, reduccion, horas, toastMessage, toastColor, isToastOpen);
    
    await obtenerReduccionProfesor();
    
    if(response.ok) {
      mensajeActualizacion = "Reducción asignada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = 'Error al asignar la reducción.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerReduccionProfesor = async () => {

  try {

    const response = await obtenerReduccionesProfesores(toastMessage, toastColor, isToastOpen);
    listaReduccionesAsignadas.value = response;
    profesorSeleccionado.value = '';
    reduccionSeleccionada.value = '';

    if(response.length < 0) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const borrarReduccionProfesor = async (index) => {
  try {
    
    const registro = listaReduccionesAsignadas.value[index];
    
    if (!registro) {
      mensajeActualizacion = 'Reducción no encontrada';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }
    const email = registro.email;
    const nombreRe = registro.nombreReduccion;
    const horasRe = registro.horas;

    const response = await borrarReduccionesProfesores(email, nombreRe, horasRe, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Reducción eliminada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await obtenerReduccionProfesor();

  } catch (error) {
    mensajeActualizacion = 'Error al eliminar la reducción.';
    mensajeColor = 'danger';  
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

onMounted(async () => {
  await cargarReduccion();
  await obtenerProfesor();
  await obtenerReduccionProfesor();
});


</script>

<style scoped>

.t-1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card-crea-reduccion {
  min-width: 420px;
  min-height: 400px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.t-2{
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1.5rem;
}

.form-group{
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 2.5rem;
}

.form-label {
  cursor: pointer;
  top: 50px;
  left: 5px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 25px;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-input {
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid black;
  padding: 0.5rem;
  min-width: 150px;
  margin-bottom: 1rem;
}

.form-label-numer {
  cursor: pointer;
  top: 50px;
  left: 5px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-left: 5rem;
}

 .form-input-numer {
   min-width: 60px;
   text-align: center;
   background: transparent;
   border: none;
   outline: none;
   border-bottom: 1px solid black;
   padding: 0.5rem;
   margin-bottom: 1rem;
 }

 .texto-instruccion {
   text-align: left;
   margin-top: 0.5rem;
   margin-bottom: 0.5rem;
   margin-left: 25px;
   font-size: 0.9rem;
   color: #666;
   font-style: italic;
 }

 .texto-dropdown {
   display: flex;
   justify-content: center;
   width: 100%;
 }

.btn-guardar {
  background-color: #0054e9;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  margin-top: 2.4rem;
  margin-left: 15px;
  margin-right: 15px;
}

.btn-guardar:hover {
  background-color: #2563EB;
}

 .card-cargar-reduccion {
   min-width: 700px;
   min-height: 400px;
   height: auto;
   background-color: var(--form-bg-light);
   box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
   border-radius: 10px;
   padding: 20px;
   display: flex;
   flex-direction: column;
   align-items: center;
   overflow: auto;
   height: 300px;
 }

table{
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

 .columna {
   width: 20%;
   border: 1px solid currentColor;
   padding-left: 0.5rem; 
   padding-right: 0.5rem;
   padding-top: 0.5rem;
   padding-bottom: 0.5rem;
   text-align: center;
 }

.btn-eliminar {
  color: #EF4444;
  font-size: 2rem; /* <-- Reducir tamaño */
  background-color: transparent;
  line-height: 1; /* <-- Ajuste para evitar desbordamiento */
  border: none;
}

.top-section-dos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 2rem;
}

.dropdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  margin-top: 1rem;
}

.dropdown-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 300px;
  margin-top: 0.5rem;
}

.dropdown-group label {
  margin-bottom: 0.8rem;
}

.dropdown-select {
  width: 300px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

@media (prefers-color-scheme: dark) {
  .card-crea-reduccion,
  .card-cargar-reduccion {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

     .form-input,
   .form-input-numer {
     border-bottom: 1px solid #D1D5DB
   }

   .texto-instruccion {
     color: #AAA;
   }

  .btn-guardar {
    color: black;
    background-color: #4782eb;
  }

  .btn-guardar:hover {
    background-color: #3476eb;
  }
}

@media ((min-width: 768px) and (max-width: 1422px)) {
  .card-cargar-reduccion {
    min-width: 420px;
  }
}

@media (max-width: 768px) {
  .card-crea-reduccion,
  .card-cargar-reduccion {
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }
}
</style>