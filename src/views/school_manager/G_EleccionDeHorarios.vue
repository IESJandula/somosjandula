<script setup>
import { onMounted, ref } from 'vue';
import { IonToast, IonInput } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { obtenerRolesUsuario } from '@/services/firebaseService';

const rolesUsuario = ref([]);
const profesorSeleccionado = ref('');
const listaProfesores = ref([]);
const reduccionSeleccionada = ref('');
const listaReducciones = ref([]);
const asignaturaSeleccionado = ref('');
const listaAsignaturas = ref([]);
const listaAsignaturasReducciones = ref([]);
const isOn = ref(true)
const tramoHorarioSeleccionado = ref('');

// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const toggle = () => {
  isOn.value = !isOn.value
}

async function verificarRoles() {
  try {
    const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);
    rolesUsuario.value = roles; // Asigna los roles al array `rolesUsuario`
  }
  catch (error) {
    mensajeActualizacion = 'Error al verificar roles'
    mensajeColor = 'danger'
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion)
  }
}

onMounted(async () => {
  await verificarRoles();
});

</script>

<template>
  <h1 class="t-1">Elección de horarios</h1>
  <div class="top-section">
    <!-- Tarjeta para asignar las asignaturas, las reducciones y indicar observaciones personales -->
    <div class="card-asignaturas-reducciones">
      <div class="t-2">Asignaturas y reducciones</div>
      <!-- Contenedor para hacer una columna -->
      <div class="top-container">
        <!-- Dropdowns que aparece si eres dirección o administrador -->
        <div class="dropdowns">
          <label class="form-label" v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')"
          for="profesor-select">Profesor:
          </label>
          <select v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')"
            id="profesor-select"
            v-model="profesorSeleccionado" 
            class="dropdown-select">
            <option value="">Selecciona un profesor</option>
            <option 
              v-for="profesor in listaProfesores" 
              :key="profesor"
              :value="profesor">
              {{ profesor.nombre }} {{ profesor.apellidos }}
            </option>
          </select>
        </div>
        <!-- Contenedor para hacer filas -->
        <div class="top-section">
          <div class="dropdowns">
            <label for="asignatura-select">Asignatura:</label>
            <select 
              id="asignatura-select"
              v-model="asignaturaSeleccionado" 
              class="dropdown-select">
              <option value="" disabled hidden>Selecciona una asignatura</option>
              <option 
                v-for="asignatura in listaAsignaturas" 
                :key="asignatura" 
                :value="asignatura">
                {{ asignatura.nombre }}
              </option>
            </select>
            <button class="btn-asignar">Asignar</button>
          </div>
          <div class="dropdowns">
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
            <button class="btn-asignar">Asignar</button>
          </div>
        </div>        
      </div>
      <div class="t-2">Preferencias horarias personales</div>
      <div class="top-content">
        <!-- Boton switch -->
        <div class="switch" @click="toggle">
          <div :class="['option', !isOn ? 'active' : '']">Si</div>
          <div :class="['option', isOn ? 'active on' : '']">No</div>
        </div>
        <div class="t-3">¿Solicitaste conciliación familiar?</div>
      </div>
      <hr class="separator-line"/>
      <!-- Botón radio -->
      <div class="t-4">Independientemente de la respuesta anterior, elige la opción que desearías:</div>
      <div class="t-5">
        <input type="radio" id="opcion1" name="opcion" value="Opción 1" v-model="decideDireccion">
        <label for="opcion1"> No tener clase a primera hora</label>
      </div>
      <div class="t-5">
        <input type="radio" id="opcion2" name="opcion" value="Opción 2" v-model="decideDireccion">
        <label for="opcion2"> No tener clase a ultima hora</label>
      </div>
      <hr class="separator-line"/>
      <!-- Dropdowns -->
      <div class="t-6">Elige tres horas que te gustaría no tener clase, exceptuando la última del viernes y la primera del lunes:</div>
      <div class="top-content">
        <div>
          <select 
            id="tramoHorario-select"
            v-model="tramoHorarioSeleccionado" 
            class="dropdown-select-hours">
            <option value="" >Elige una hora</option>
            <option 
              v-for="asignatura in listaAsignaturas" 
              :key="asignatura" 
              :value="asignatura">
              {{ asignatura.nombre }}
            </option>
          </select>
        </div>
        <div>
          <select 
            id="tramoHorario-select"
            v-model="tramoHorarioSeleccionado" 
            class="dropdown-select-hours">
            <option value="" disabled hidden>Elige una hora</option>
            <option 
              v-for="asignatura in listaAsignaturas" 
              :key="asignatura" 
              :value="asignatura">
              {{ asignatura.nombre }}
            </option>
          </select>
        </div>
        <div>
          <select 
            id="tramoHorario-select"
            v-model="tramoHorarioSeleccionado" 
            class="dropdown-select-hours">
            <option value="" disabled hidden>Elige una hora</option>
            <option 
              v-for="asignatura in listaAsignaturas" 
              :key="asignatura" 
              :value="asignatura">
              {{ asignatura.nombre }}
            </option>
          </select>
        </div>
      </div>
      <hr class="separator-line"/>
      <!-- Texto con otras observaciones -->
      <div class="t-6">Escribe otras observaciones  
        <div class="info-circle">
          i
          <div class="tooltip">Solamente si quieren guardias de recreo, recursos necesarios, alternancia de clases con horas de descanso de voz, ...</div>
        </div>
      </div>
      <ion-input type="text" v-model="nombre" placeholder="Observaciones" class="form-input" />
      <!-- Botón para guardar las observaciónes -->
      <button @click="crearReduccion(nombre, horas, decideDireccion)" class="btn-actualizar">Actualizar observaciones</button>
    </div>
    <!-- Tabla con todas las asignaturas y reducciones elegidas por el profesor -->
    <div class="card-solicitudes">
      <div class="t-2">Tus solicitudes</div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="columna">Eliminar</th>
              <th class="columna">Tipo</th>
              <th class="columna">Nombre</th>
              <th class="columna">Hores</th>
              <th class="columna">Curso</th>
              <th class="columna">Etapa</th>
              <th class="columna">Grupo</th>
              <th class="columna">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(asignaturaReduccion, index) in listaAsignaturasReducciones" :key="index">
              <td class="columna">
                <button @click="borrarReduccion(index)" class="btn-eliminar">&times;</button>
              </td>
              <td class="columna">{{ asignaturaReduccion.tipo }}</td>
              <td class="columna">{{ asignaturaReduccion.nombre }}</td>
              <td class="columna">
                <span v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
                  <select id="horas-select">
                    <option value="" disabled hidden>Selecciona horas</option>
                    <option 
                      v-for="horas in asignaturaReduccion.horas" 
                      :key="horas" 
                      :value="horas">
                      {{ horas }}
                    </option>
                  </select>
                </span>
                <span v-else>{{ asignaturaReduccion.horas }}</span>
              </td>
              <td class="columna">{{ asignaturaReduccion.curso }}</td>
              <td class="columna">{{ asignaturaReduccion.etapa }}</td>
              <td class="columna">
                <span v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')">
                  <select 
                    id="grupo-select" 
                    v-model="asignaturaReduccion.grupo" 
                    class="dropdown-select">
                    <option value="" disabled hidden>Selecciona un grupo</option>
                    <option 
                      v-for="grupo in asignaturaReduccion.grupos" 
                      :key="grupo" 
                      :value="grupo">
                      {{ grupo }}
                    </option>
                  </select>
                </span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button v-if="listaAsignaturasReducciones > 0" class="btn-guardar-todo" @click="guardarTodo">Guardar todo</button>
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
</template>

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

.card-asignaturas-reducciones {
  max-width: 530px;
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

.top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;
}

.dropdowns {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.dropdowns label {
  margin-bottom: 0.8rem;
  margin-left: 0rem;
}

.dropdown-select {
  width: 225px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.btn-asignar {
  width: 160px;
  padding: 0.4rem;
  border: 1px solid ;
  border-radius: 0.375rem; 
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
  align-self: center;
  margin-top: 1rem;
}

/* Botón sitch de si o no */
.switch {
  display: flex;
  border: 1px solid #888;
  border-radius: 5px;
  overflow: hidden;
  width: 100px;
  cursor: pointer;
  margin-left: 1rem;
}

.option {
  flex: 1;
  text-align: center;
  padding: 5px 10px;
  background-color: #ccc;
  color: black;
  transition: 0.3s;
}

.option.active {
  background-color: green;
  color: white;
  font-weight: bold;
}

.option.on {
  background-color: #EF4444;
}

.option:not(.active) {
  background-color: #ddd;
}

.t-3 {
  font-size: 1.15rem;
  margin-left: 1rem;
}

.t-4 {
  font-size: 1.15rem;
  margin-left: 1rem;
}

.t-5 {
  font-size: 1.15rem;
  margin-left: 1rem;
  margin-top: 0.5rem;
}

.t-6 {
  font-size: 1.15rem;
  margin-left: 1rem;
}

.separator-line {
  border: none;
  border-top: 1.3px solid #b8b8b8;
  margin: 0.8rem 0;
  width: 70%;
  margin-left: auto; 
  margin-right: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.dropdown-select-hours {
  width: 143px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
  margin-left: 1rem;
}

/* Circulo de información */
.info-circle {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #4782eb;
  color: white;
  text-align: center;
  line-height: 24px;
  cursor: pointer;
  position: relative;
}

.info-circle:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.tooltip {
  visibility: hidden;
  opacity: 0;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 5px 10px;
  position: absolute;
  z-index: 1;
  bottom: 130%; /* posición arriba del icono */
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.3s;
  white-space: nowrap;
  margin-left: 10rem;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%; /* flecha apunta hacia abajo */
  left: 50%;
  margin-left: 5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

.top-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 1rem;
}

.form-input {
  background: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid currentColor;
  padding: 0.5rem;
  max-width: 450px;
  margin-left: 1rem;
}

.btn-actualizar {
  background-color: #3B82F6;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  border-radius: 0.375rem;
  padding: 0.5rem;
  cursor: pointer;
  margin-top: 2rem;
  margin-left: 15px;
  margin-right: 15px;
}

.card-solicitudes {
  min-width: 750px;
  min-height: 859px;
  height: 300px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
  height: 300px;
  width: 300px;
}

.table-wrapper {
  width: 100%;
}

table{
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
}

.columna {
  width: 12,5%;
  border: 1px solid currentColor;
  padding-left: 0.5rem; 
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.btn-eliminar {
  color: #EF4444;
  font-size: 2rem; 
  background-color: transparent;
  line-height: 1;
  border: none;
}

.dropdown-group {
  width: 100px;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid currentColor;
}

.btn-guardar-todo {
  width: 170px;
  padding: 0.5rem;
  border: 1px solid ;
  border-radius: 0.375rem; 
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-top: 15px;
  margin-bottom: 5px;
  position: sticky;
  top: 0;
  left: 850px;
}

@media (prefers-color-scheme: dark) {
  .card-asignaturas-reducciones,
  .card-solicitudes {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .btn-asignar,
  .option.active,
  .info-circle,
  .btn-actualizar,
  .btn-guardar-todo {
    color: black;
  }

  .separator-line {
    border-top: 1.3px solid #949494;
  }
}

@media ((min-width: 768px) and (max-width: 1422px)) {

  .card-solicitudes {
    min-width: 420px;
  }
  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: calc(100% - 180px);
  }
}

@media (max-width: 768px) {
  .card-asignaturas-reducciones {
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }
  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 160px;
  }

  .dropdowns {
    margin-top: 0.4rem;
  }

  .top-content {
    display: flex;
    flex-direction: column;
    margin-top: -1rem;
  }

  .dropdown-select-hours {
    width: 100%;
    margin-top: 1.1rem;
  }

  .card-solicitudes {
    min-width: 390px;
    min-height: 100%;
    margin-right: 5px;
    padding-right: 25px;
  }
}

@media (max-width: 500px) {
  .card-asignaturas-reducciones {
    min-width: 100%;
    min-height: 100%;
    margin-right: 5px;
  }
  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 0;
  }

  .dropdowns {
    margin-top: 0.4rem;
  }

  .top-content {
    display: flex;
    flex-direction: column;
    margin-top: -1rem;
  }

  .dropdown-select-hours {
    width: 100%;
    margin-top: 1.1rem;
  }

  .card-solicitudes {
    min-width: 100%;
    min-height: 100%;
    margin-right: 5px;
    padding-right: 25px;
  }
}
</style>