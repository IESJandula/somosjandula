<template>
  <h1 class="titulo-pagina">Horario de grupos</h1>
  <div class="container">
    <!-- Dropdown para seleccionar curso / etapa / grupo -->
    <div class="curso-selector">
      <select 
        id="curso-select" 
        v-model="cursoEtapaGrupoSeleccionado" 
        @change="cargarHorarioCursoEtapaGrupo" 
        class="custom-select">
        <option value="" disabled hidden>Selecciona un curso/etapa/grupo</option>
        <option v-for="item in cursosYetapas" 
          :key="`${item.curso}º ${item.etapa} ${item.grupo}`"
          :value="item">
          {{ item.curso }}º {{ item.etapa }} {{ item.grupo }}
        </option>
      </select>
    </div>

    <!-- Tabla con horarios -->
    <table class="tabla-container" v-if="mostrarTabla">
      <thead>
        <tr>
          <th class="sticky-column">Horarios</th>
          <th v-for="(dia, index) in diasSemanas" :key="index">{{ dia.diaSemana }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tramo, index) in tramosHorarios" :key="index">
          <td class="sticky-column">{{ tramo.tramoHorario }}</td>
          <td class="celda-horario" v-for="(dia, index) in diasSemanas" :key="index">
            <span v-if="horarioCursoEtapaGrupo[tramo.id]?.[dia.id]">
              <div class="asignatura-info">
                {{ horarioCursoEtapaGrupo[tramo.id][dia.id].nombreAsignatura }} <br>
                <span class="profesor-info">{{ horarioCursoEtapaGrupo[tramo.id][dia.id].nombreProfesor }} {{ horarioCursoEtapaGrupo[tramo.id][dia.id].apellidosProfesor }}</span>
              </div>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mensaje cuando no hay horario disponible -->
    <div v-if="!mostrarTabla" class="mensaje-sin-horario">
      No hay horario disponible para mostrar
    </div>
  </div>

  <ion-toast 
    :is-open="isToastOpen" 
    :message="toastMessage" 
    :color="toastColor" 
    duration="3000"
    @did-dismiss="() => (isToastOpen = false)" 
    position="top">
  </ion-toast>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { IonToast } from '@ionic/vue';
import { obtenerRolesUsuario, obtenerEmailUsuario } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast.js';
import { 
  obtenerCursosEtapasGrupos,
  obtenerListaDias,
  obtenerListaTramos,
  obtenerHorariosCursoEtapaGrupo,
} from "@/services/schoolManager.js";

// Variables reactivas
const rolesUsuario = ref([]);
const cursosYetapas = ref([]);
const cursoEtapaGrupoSeleccionado = ref('');
const diasSemanas = ref([]);
const tramosHorarios = ref([]);
const tramosHorariosCompletos = ref([]);
const horarioCursoEtapaGrupo = ref({});
const mostrarTabla = ref(false);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Función para verificar roles del usuario
async function verificarRoles() {
  try {
    const roles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);
    rolesUsuario.value = roles;
  } catch (error) {
    const mensajeActualizacion = 'Error al verificar roles';
    const mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
}

// Función para obtener la lista de cursos, etapas y grupos
const obtenerCursosEtapas = async () => {
  try {
    const response = await obtenerCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
    cursosYetapas.value = response;

    // Asignar automáticamente el primer curso-etapa-grupo de la lista
    if (cursosYetapas.value.length > 0) {
      cursoEtapaGrupoSeleccionado.value = cursosYetapas.value[0];
    }
  } catch (error) {
    const mensajeActualizacion = 'Error al cargar la lista de cursos, etapas y grupos';
    const mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

// Función para obtener los días de la semana
const obtenerDiasSemana = async () => {
  try {
    const data = await obtenerListaDias(toastMessage, toastColor, isToastOpen);
    diasSemanas.value = data
      .filter(dia => dia !== 'Sin Seleccionar')
      .map((dia, index) => ({ 
        diaSemana: dia, 
        id: index 
      }));
  } catch (error) {
    const mensajeActualizacion = 'Error al cargar los días de la semana';
    const mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};



// Función para obtener los tramos horarios
const obtenerTramosHorarios = async () => {
  try {
    const data = await obtenerListaTramos(toastMessage, toastColor, isToastOpen);
    tramosHorariosCompletos.value = data
      .filter(tramo => tramo !== 'Sin Seleccionar')
      .map((tramo, index) => ({
        tramoHorario: tramo,
        id: index,
      }));
  } catch (error) {
    const mensajeActualizacion = 'Error al cargar los tramos horarios';
    const mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};

// Función para filtrar tramos según horario matutino del curso seleccionado
const filtrarTramosPorHorario = (esHorarioMatutino) => {
  if (!tramosHorariosCompletos.value.length) return;
  
  const totalTramos = tramosHorariosCompletos.value.length;
  const mitadTramos = Math.ceil(totalTramos / 2);
  
  if (esHorarioMatutino) {
    // Mostrar solo tramos de mañana (primeros tramos)
    tramosHorarios.value = tramosHorariosCompletos.value.slice(0, mitadTramos);
  } else {
    // Mostrar solo tramos de tarde (últimos tramos)
    tramosHorarios.value = tramosHorariosCompletos.value.slice(mitadTramos);
  }
};

// Función para cargar el horario del curso, etapa y grupo
const cargarHorarioCursoEtapaGrupo = async () => {
  try {
    if (!cursoEtapaGrupoSeleccionado.value) {
      mostrarTabla.value = false;
      return;
    }

    // Filtrar tramos según el horario del curso seleccionado
    const esHorarioMatutino = !!cursoEtapaGrupoSeleccionado.value.horarioMatutino;
    filtrarTramosPorHorario(esHorarioMatutino);

    const data = await obtenerHorariosCursoEtapaGrupo(
      cursoEtapaGrupoSeleccionado.value.curso,
      cursoEtapaGrupoSeleccionado.value.etapa,
      cursoEtapaGrupoSeleccionado.value.grupo,
      toastMessage, 
      toastColor, 
      isToastOpen
    );
    
    // Reestructurar los datos del horario
    const horarioEstructurado = {};
    
    for (const sesion of data) {
      // Mapear por IDs usados en la tabla (tramo.id y dia.id)
      const tramo = tramosHorarios.value.find(t => t.tramoHorario === sesion.tramoDesc);
      const dia = diasSemanas.value.find(d => d.diaSemana === sesion.diaDesc);
      
      if (tramo && dia) {
        if (!horarioEstructurado[tramo.id]) {
          horarioEstructurado[tramo.id] = {};
        }
        
        horarioEstructurado[tramo.id][dia.id] = {
          nombreAsignatura: sesion.asignatura,
          nombreProfesor: sesion.nombreProfesor || '',
          apellidosProfesor: sesion.apellidosProfesor || ''
        };
      }
    }
    
    horarioCursoEtapaGrupo.value = horarioEstructurado;
    mostrarTabla.value = true;
    
  } catch (error) {
    const mensajeActualizacion = 'Error al cargar el horario del curso, etapa y grupo';
    const mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
    mostrarTabla.value = false;
  }
};

// Watcher para cuando cambie el curso/etapa/grupo seleccionado
watch(cursoEtapaGrupoSeleccionado, async (nuevoCursoEtapaGrupo) => {
  if (nuevoCursoEtapaGrupo) {
    await cargarHorarioCursoEtapaGrupo();
  }
});

// Inicialización al montar el componente
onMounted(async () => {
  await verificarRoles();
  await obtenerDiasSemana();
  await obtenerTramosHorarios();
  await obtenerCursosEtapas();
  
  // Si se cargó un curso/etapa/grupo, cargar su horario
  if (cursoEtapaGrupoSeleccionado.value) {
    await cargarHorarioCursoEtapaGrupo();
  }
});
</script>

<style scoped>
.titulo-pagina {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  background-color: white;
  color: #1a1a1a;
  font-family: Arial, sans-serif;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.curso-selector {
  width: 80%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.curso-selector label {
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 16px;
}

.horario-selector {
  width: 80%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.horario-selector label {
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 16px;
}

.custom-select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 2px solid #007bff;
  border-radius: 5px;
  background-color: white;
  color: #007bff;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.tabla-container {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  margin-top: 20px;
  border-radius: 5px;
  overflow: hidden;
}

th, td {
  border: 2px solid #007bff;
  padding: 10px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}

th:first-child {
  background-color: #0056b3;
}

td {
  height: 60px;
  background-color: #e9f5ff;
  vertical-align: middle;
}

.sticky-column {
  position: sticky;
  left: 0;
  background-color: #e9f5ff;
  z-index: 2;
  font-weight: bold;
}

.celda-horario {
  height: 60px;
  background-color: #e9f5ff;
  text-overflow: ellipsis;
  overflow: hidden;
  word-wrap: break-word;
}

.asignatura-info {
  font-size: 12px;
  line-height: 1.2;
}

.profesor-info {
  font-size: 10px;
  color: #666;
  font-style: italic;
}

.mensaje-sin-horario {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-top: 20px;
  padding: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .tabla-container {
    overflow-x: auto;
    display: block;
    white-space: nowrap;
  }

  .sticky-column {
    position: sticky;
    left: 0;
    background: #e9f5ff;
    z-index: 2;
  }

  .custom-select {
    width: 100%;
  }

  .curso-selector {
    width: 100%;
  }
}

@media (prefers-color-scheme: dark) {
  .container {
    background-color: var(--form-bg-dark);
    color: var(--text-color-dark);
  }

  .tabla-container {
    background-color: var(--form-bg-dark);
    color: var(--text-color-dark);
  }

  td {
    background-color: var(--form-bg-dark);
  }

  .sticky-column {
    background-color: var(--form-bg-dark);
  }

  .celda-horario {
    background-color: var(--form-bg-dark);
  }
}
</style> 