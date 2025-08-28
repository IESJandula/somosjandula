<template>
  <h1 class="titulo-pagina">Horario Individual</h1>
  <div class="container">
    <!-- Dropdown para seleccionar profesor (solo para dirección/administrador) -->
    <div v-if="rolesUsuario.includes('ADMINISTRADOR') || rolesUsuario.includes('DIRECCION')" class="profesor-selector">
      <select 
        id="profesor-select" 
        v-model="profesorSeleccionado" 
        @change="cargarHorarioProfesor" 
        class="custom-select">
        <option value="" disabled hidden>Selecciona un profesor</option>
        <option v-for="profesor in listaProfesores" 
          :key="profesor.email"
          :value="profesor">
          {{ profesor.nombre }} {{ profesor.apellidos }}
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
            <span v-if="horarioProfesor[tramo.tramoHorario]?.[dia.diaSemana]">
              <div class="asignatura-info">
                {{ horarioProfesor[tramo.tramoHorario][dia.diaSemana].nombreAsignatura }} <br>
                <span class="curso-etapa-grupo-info">
                  {{ horarioProfesor[tramo.tramoHorario][dia.diaSemana].curso }}º {{ horarioProfesor[tramo.tramoHorario][dia.diaSemana].etapa }} {{ horarioProfesor[tramo.tramoHorario][dia.diaSemana].grupo }}
                </span>
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
  obtenerProfesoresHorarios,
  obtenerListaDias,
  obtenerListaTramos,
  obtenerHorariosIndividuales,
} from "@/services/schoolManager.js";

// Variables reactivas
const rolesUsuario = ref([]);
const profesorSeleccionado = ref('');
const listaProfesores = ref([]);
const diasSemanas = ref([]);
const tramosHorarios = ref([]);
const tramosHorariosCompletos = ref([]);
const horarioProfesor = ref({});
const mostrarTabla = ref(false);
const emailUsuarioActual = ref(null);

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

// Función para obtener el email del usuario actual
const obtenerEmailUsuarioActual = async () => {
  emailUsuarioActual.value = await obtenerEmailUsuario(toastMessage, toastColor, isToastOpen);
};

// Función para obtener la lista de profesores
const obtenerProfesores = async () => {
  try {
    const response = await obtenerProfesoresHorarios(toastMessage, toastColor, isToastOpen);
    listaProfesores.value = response;

    // Asignar automáticamente el primer profesor de la lista
    if (listaProfesores.value.length > 0) {
      profesorSeleccionado.value = listaProfesores.value[0];
    }
  } catch (error) {
    const mensajeActualizacion = 'Error al cargar la lista de profesores';
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

// Función para filtrar tramos según las sesiones del profesor
const filtrarTramosPorSesiones = (sesiones) => {
  console.log('=== DEPURACIÓN FILTRADO TRAMOS ===');
  console.log('Sesiones del profesor:', sesiones);
  
  if (!tramosHorariosCompletos.value.length || !sesiones.length) {
    console.log('No hay tramos completos o sesiones, usando todos los tramos');
    tramosHorarios.value = tramosHorariosCompletos.value;
    return;
  }
  
  // Extraer los tramos únicos que tiene el profesor
  const tramosDelProfesor = [...new Set(sesiones.map(sesion => sesion.tramoDesc))];
  console.log('Tramos únicos del profesor:', tramosDelProfesor);
  console.log('Formato de tramos:', tramosDelProfesor.map(t => ({ tramo: t, hora: t.split(':')[0], parsed: parseInt(t.split(':')[0]) })));
  
  // Determinar si tiene sesiones de mañana y/o tarde
  const tieneSesionesManana = tramosDelProfesor.some(tramo => {
    // Buscar tramos que empiecen antes de las 15:00 (mañana)
    const horaInicio = parseInt(tramo.split(':')[0]);
    console.log(`Analizando tramo: ${tramo}, hora inicio: ${horaInicio}`);
    return horaInicio < 15;
  });
  
  const tieneSesionesTarde = tramosDelProfesor.some(tramo => {
    // Buscar tramos que empiecen a las 15:00 o después (tarde)
    const horaInicio = parseInt(tramo.split(':')[0]);
    console.log(`Analizando tramo: ${tramo}, hora inicio: ${horaInicio}`);
    return horaInicio >= 15;
  });
  
  console.log('Tiene sesiones mañana:', tieneSesionesManana);
  console.log('Tiene sesiones tarde:', tieneSesionesTarde);
  
  // Filtrar tramos según las franjas horarias que tiene el profesor
  const tramosFiltrados = tramosHorariosCompletos.value.filter(tramo => {
    const horaInicio = parseInt(tramo.tramoHorario.split(':')[0]);
    console.log(`Evaluando tramo: ${tramo.tramoHorario}, hora inicio: ${horaInicio}`);
    
    if (tieneSesionesManana && horaInicio < 15) {
      console.log(`✓ Incluyendo tramo de mañana: ${tramo.tramoHorario}`);
      return true; // Incluir tramos de mañana si tiene sesiones de mañana
    }
    
    if (tieneSesionesTarde && horaInicio >= 15) {
      console.log(`✓ Incluyendo tramo de tarde: ${tramo.tramoHorario}`);
      return true; // Incluir tramos de tarde si tiene sesiones de tarde
    }
    
    console.log(`✗ Excluyendo tramo: ${tramo.tramoHorario}`);
    return false;
  });
  
  console.log('=== RESUMEN FILTRADO ===');
  console.log('Tiene sesiones mañana:', tieneSesionesManana);
  console.log('Tiene sesiones tarde:', tieneSesionesTarde);
  console.log('Tramos completos originales:', tramosHorariosCompletos.value);
  console.log('Tramos filtrados:', tramosFiltrados);
  
  console.log('Tramos filtrados finales:', tramosFiltrados);
  tramosHorarios.value = tramosFiltrados;
};

// Función para cargar el horario del profesor
const cargarHorarioProfesor = async () => {
  try {
    const emailDestino = (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))
      ? profesorSeleccionado.value.email
      : emailUsuarioActual.value;

    if (!emailDestino) {
      mostrarTabla.value = false;
      return;
    }

    const data = await obtenerHorariosIndividuales(emailDestino, toastMessage, toastColor, isToastOpen);
    console.log('=== DATOS RECIBIDOS DEL BACKEND ===');
    console.log('Email destino:', emailDestino);
    console.log('Datos recibidos:', data);
    
    // Filtrar tramos según las sesiones que realmente tiene el profesor
    filtrarTramosPorSesiones(data);
    
    // Reestructurar los datos del horario usando el tramo como clave
    const horarioEstructurado = {};
    
    for (const sesion of data) {
      // Buscar el índice del tramo y día basado en las descripciones
      const tramoIndex = tramosHorarios.value.findIndex(t => t.tramoHorario === sesion.tramoDesc);
      const diaIndex = diasSemanas.value.findIndex(d => d.diaSemana === sesion.diaDesc);
      
      if (tramoIndex !== -1 && diaIndex !== -1) {
        // Usar el tramo como clave en lugar del índice
        const tramoKey = sesion.tramoDesc;
        const diaKey = sesion.diaDesc;
        
        if (!horarioEstructurado[tramoKey]) {
          horarioEstructurado[tramoKey] = {};
        }
        
        horarioEstructurado[tramoKey][diaKey] = {
          nombreAsignatura: sesion.asignatura,
          curso: sesion.curso || '',
          etapa: sesion.etapa || '',
          grupo: sesion.grupo || '',
          horas: sesion.horas || ''
        };
      }
    }
    
    console.log('=== HORARIO ESTRUCTURADO ===');
    console.log('Tramos filtrados:', tramosHorarios.value);
    console.log('Horario estructurado:', horarioEstructurado);
    console.log('Estructura de claves:', Object.keys(horarioEstructurado));
    
    horarioProfesor.value = horarioEstructurado;
    mostrarTabla.value = true;
    
  } catch (error) {
    const mensajeActualizacion = 'Error al cargar el horario del profesor';
    const mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
    mostrarTabla.value = false;
  }
};

// Watcher para cuando cambie el profesor seleccionado
watch(profesorSeleccionado, async (nuevoProfesor) => {
  if (nuevoProfesor && (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR'))) {
    await cargarHorarioProfesor();
  }
});

// Inicialización al montar el componente
onMounted(async () => {
  await verificarRoles();
  await obtenerEmailUsuarioActual();
  await obtenerDiasSemana();
  await obtenerTramosHorarios();
  
  if (rolesUsuario.value.includes('DIRECCION') || rolesUsuario.value.includes('ADMINISTRADOR')) {
    await obtenerProfesores();
    // Si se cargó un profesor, cargar su horario
    if (profesorSeleccionado.value) {
      await cargarHorarioProfesor();
    }
  } else {
    // Para profesores, cargar directamente su horario
    await cargarHorarioProfesor();
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

.profesor-selector {
  width: 80%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profesor-selector label {
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

.curso-etapa-grupo-info {
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

  .profesor-selector {
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