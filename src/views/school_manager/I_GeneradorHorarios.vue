<template>
  <h1 class="t-1">Generador de horarios</h1>
  <div class="top-section">
    <!-- Tabla de estado y acciones -->
    <div class="estado-acciones-table">
      <table>
        <thead>
          <tr>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="estado-cell" 
                :title="tooltipEstado"
                @mouseenter="mostrarTooltip = true"
                @mouseleave="mostrarTooltip = false">
              <span class="estado-text">{{ estadoGeneradorCorto }}</span>
              <!-- Tooltip personalizado -->
              <div v-if="mostrarTooltip" class="tooltip-estado">
                <div class="tooltip-content">
                  <h4>Estado del Generador</h4>
                  <p><strong>Estado:</strong> {{ estadoGenerador }}</p>
                  <p v-if="tiempoInicio"><strong>Iniciado:</strong> {{ fechaInicioFormateada }}</p>
                  <p v-if="tiempoInicio"><strong>Tiempo transcurrido:</strong> {{ tiempoTranscurridoFormateado }}</p>
                  <p v-if="!tiempoInicio"><strong>Estado:</strong> Detenido</p>
                </div>
              </div>
            </td>
            <td class="acciones-cell">
              <button @click="generarHorarios" class="btn-lanzar-generador-small" title="Lanzar Generador">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button @click="forzarDetencion" class="btn-forzar-detencion-small" title="Forzar Detención">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h12v12H6z"/>
                </svg>
              </button>
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

  <!-- Tarjeta de preferencias de todos los profesores -->
  <div class="card-preferencias">
    <h2 class="t-2">Preferencias horarias personales</h2>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando preferencias de profesores...</p>
    </div>
    
    <!-- Tabla con todos los profesores -->
    <div v-else class="tabla-responsive">
      <table>
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Conciliación</th>
            <th>No tener clase ...</th>
            <th>Horas sin clase</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="profesor in profesoresConPreferencias" 
            :key="profesor.email"
            @click="seleccionarProfesor(profesor)"
            :class="{ 'fila-seleccionada': profesorSeleccionado?.email === profesor.email }"
            class="fila-clickeable"
          >
            <td class="profesor-nombre">
              {{ profesor.nombre }} {{ profesor.apellidos }}
            </td>
            <td>
              <input 
                type="checkbox" 
                v-model="profesor.preferencias.conciliacion" 
                @change="guardarConciliacion(profesor.email, profesor.preferencias.conciliacion)"
                :disabled="!profesor.preferencias.cargado"
                @click.stop
              />
            </td>
            <td>{{ obtenerTextoNoTenerClase(profesor.preferencias) }}</td>
            <td class="horas-sin-clase">{{ obtenerHorasSinClase(profesor.preferencias) }}</td>
            <td>{{ profesor.preferencias.observaciones || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Tarjeta de asignaturas impartidas -->
  <div v-if="profesorSeleccionado" class="card-asignaturas">
    <h2 class="t-2">Asignaturas impartidas - {{ profesorSeleccionado.nombre }} {{ profesorSeleccionado.apellidos }}</h2>
    
    <!-- Loading state para asignaturas -->
    <div v-if="loadingAsignaturas" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando asignaturas...</p>
    </div>
    
    <!-- Tabla de asignaturas -->
    <div v-else class="tabla-responsive">
      <table>
        <thead>
          <tr>
            <th>Asignatura</th>
            <th>Carga horaria</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="asignatura in asignaturasImpartidas" 
            :key="asignatura.id"
            @click="seleccionarAsignatura(asignatura)"
            :class="{ 'fila-seleccionada': asignaturaSeleccionado?.id === asignatura.id }"
            class="fila-clickeable"
          >
            <td>{{ asignatura.nombre }}</td>
            <td>{{ asignatura.horas }} horas</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Tarjeta de sesiones -->
  <div v-if="asignaturaSeleccionado" class="card-sesiones">
    <h2 class="t-2">Sesiones - {{ asignaturaSeleccionado.nombre }}</h2>
    
    <!-- Tabla de sesiones -->
    <div class="tabla-responsive">
      <table>
        <thead>
          <tr>
            <th>Sesión</th>
            <th>Forzar día</th>
            <th>Forzar hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sesion, index) in sesionesAsignatura" :key="index">
            <td>
              Sesión {{ index + 1 }}
            </td>
            <td>
              <select v-model="sesion.dia" class="select-forzar" @change="actualizarSesionConDebounce(index)">
                <option value="Sin forzar">Sin forzar</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
              </select>
            </td>
            <td>
              <select v-model="sesion.tramo" class="select-forzar" @change="actualizarSesionConDebounce(index)">
                <option value="Sin forzar">Sin forzar</option>
                <option value="1ª hora">1ª hora</option>
                <option value="2ª hora">2ª hora</option>
                <option value="3ª hora">3ª hora</option>
                <option value="4ª hora">4ª hora</option>
                <option value="5ª hora">5ª hora</option>
                <option value="6ª hora">6ª hora</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { 
  lanzarGeneradorHorarios, 
  forzarDetencionGeneradorHorarios, 
  obtenerEstadoGeneradorHorarios,
  obtenerProfesoresHorarios, 
  obtenerObservacionesDeUsuario, 
  obtenerPreferenciasDeUsuario,
  actualizarObservaciones,
  obtenerSolicitudes,
  actualizarSesionBase,
  obtenerSesionesBase
} from '@/services/schoolManager.js';

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Variables para el estado del generador
const estadoGenerador = ref('Cargando estado...');
const tiempoInicio = ref(null);
const timerInterval = ref(null);
const mostrarTooltip = ref(false);

// Variables para profesores y preferencias
const profesoresConPreferencias = ref([]);
const loading = ref(false);

// Variables para asignaturas
const profesorSeleccionado = ref(null);
const asignaturasImpartidas = ref([]);
const loadingAsignaturas = ref(false);

// Variables para sesiones
const asignaturaSeleccionado = ref(null);
const sesionesAsignatura = ref([]);
const debounceTimers = ref({}); // Para evitar múltiples llamadas rápidas

// Mapeo de días (basado en G_EleccionDeHorarios.vue)
const diaNameMap = {
  0: 'Lunes',
  1: 'Martes',
  2: 'Miércoles',
  3: 'Jueves',
  4: 'Viernes'
};

// Mapeo inverso para convertir nombres a números
const diaNumberMap = {
  'Lunes': 0,
  'Martes': 1,
  'Miércoles': 2,
  'Jueves': 3,
  'Viernes': 4
};

// Función para convertir día a formato numérico
const convertirDiaANumerico = (diaTexto) => {
  if (diaTexto === 'Sin forzar') 
  {
    return -1 ;
  }

  return diaNumberMap[diaTexto] ;
};

// Función para convertir hora a formato numérico
const convertirTramoANumerico = (tramoTexto) => {
  if (tramoTexto === 'Sin forzar')
  {
    return -1 ;
  }

  // Cogemos el número de la hora con un substring
  const numeroTramo = tramoTexto.substring(0, tramoTexto.length - 2);

  // Le restamos 1 para que sea el número de la hora
  const numeroTramoNumerico = parseInt(numeroTramo, 10) - 1;

  return numeroTramoNumerico ;
};

// Computed properties para el tooltip
const estadoGeneradorCorto = computed(() => {
  if (estadoGenerador.value.includes('Ejecutándose')) {
    return 'Ejecutándose';
  } else if (estadoGenerador.value.includes('Detenido')) {
    return 'Detenido';
  } else if (estadoGenerador.value.includes('Error')) {
    return 'Error';
  } else {
    return 'Cargando...';
  }
});

const fechaInicioFormateada = computed(() => {
  if (!tiempoInicio.value) return '';
  const fecha = new Date(tiempoInicio.value);
  return fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
});

const tiempoTranscurridoFormateado = computed(() => {
  if (!tiempoInicio.value) return '';
  const tiempoTranscurrido = Date.now() - tiempoInicio.value;
  const horas = Math.floor(tiempoTranscurrido / 3600000);
  const minutos = Math.floor((tiempoTranscurrido % 3600000) / 60000);
  const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
  
  if (horas > 0) {
    return `${horas}h ${minutos}m ${segundos}s`;
  } else if (minutos > 0) {
    return `${minutos}m ${segundos}s`;
  } else {
    return `${segundos}s`;
  }
});

const tooltipEstado = computed(() => {
  if (tiempoInicio.value) {
    return `Ejecutándose desde ${fechaInicioFormateada.value} (${tiempoTranscurridoFormateado.value})`;
  } else {
    return 'Generador detenido';
  }
});

// Cargar todos los profesores con sus preferencias
const cargarProfesoresConPreferencias = async () => {
  loading.value = true;
  try {
    // Obtener la lista de profesores
    const profesores = await obtenerProfesoresHorarios(toastMessage, toastColor, isToastOpen);
    
    // Inicializar array con profesores y preferencias vacías
    profesoresConPreferencias.value = profesores.map(profesor => ({
      ...profesor,
      preferencias: {
        conciliacion: false,
        sinClasePrimeraHora: false,
        observaciones: '',
        tramosHorarios: [],
        cargado: false
      }
    }));
    
    // Cargar preferencias para cada profesor
    for (const profesor of profesoresConPreferencias.value) {
      try {
        // Obtener observaciones (incluye conciliación)
        const observaciones = await obtenerObservacionesDeUsuario(
          profesor.email, 
          toastMessage, 
          toastColor, 
          isToastOpen
        );
        
        // Obtener preferencias horarias
        const preferencias = await obtenerPreferenciasDeUsuario(
          profesor.email, 
          toastMessage, 
          toastColor, 
          isToastOpen
        );
        
        // Actualizar las preferencias del profesor
        profesor.preferencias = {
          conciliacion: observaciones.conciliacion || false,
          sinClasePrimeraHora: observaciones.sinClasePrimeraHora || false,
          observaciones: observaciones.otrasObservaciones || '',
          tramosHorarios: preferencias.tramosHorarios || [],
          cargado: true
        };
      } catch (error) {
        console.error(`Error cargando preferencias para ${profesor.email}:`, error);
        profesor.preferencias.cargado = true; // Marcar como cargado aunque haya error
      }
    }
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al cargar los profesores');
  } finally {
    loading.value = false;
  }
};

// Seleccionar profesor y cargar sus asignaturas
const seleccionarProfesor = async (profesor) => {
  profesorSeleccionado.value = profesor;
  asignaturaSeleccionado.value = null; // Limpiar asignatura seleccionada
  sesionesAsignatura.value = []; // Limpiar sesiones
  await cargarAsignaturasProfesor(profesor.email);
};

// Seleccionar asignatura y crear sesiones
const seleccionarAsignatura = async (asignatura) => {
  asignaturaSeleccionado.value = asignatura;
  
  // Crear array de sesiones basado en la carga horaria
  sesionesAsignatura.value = [];
  for (let i = 0; i < asignatura.horas; i++) {
    sesionesAsignatura.value.push({
      numero: i + 1,
      dia: 'Sin forzar',
      tramo: 'Sin forzar',
      cargaInicial: true // Flag para marcar si es la carga inicial
    });
  }

  // Cargar restricciones existentes si hay un profesor seleccionado
  if (profesorSeleccionado.value) {
    await cargarRestriccionesExistentes();
  }
};

// Cargar restricciones existentes para la asignatura seleccionada
const cargarRestriccionesExistentes = async () => {
  try {
    const sesionesBase = await obtenerSesionesBase(
      profesorSeleccionado.value.email,
      asignaturaSeleccionado.value.nombre,
      asignaturaSeleccionado.value.curso,
      asignaturaSeleccionado.value.etapa,
      asignaturaSeleccionado.value.grupo,
      toastMessage,
      toastColor,
      isToastOpen
    );

    // Aplicar las restricciones existentes a las sesiones
    if (sesionesBase && sesionesBase.length > 0) {
      sesionesBase.forEach(sesionBase => {
        const sesionIndex = sesionBase.numeroSesion - 1; // Convertir a índice base 0
        if (sesionIndex >= 0 && sesionIndex < sesionesAsignatura.value.length) {
          const sesion = sesionesAsignatura.value[sesionIndex];
          
          // Convertir día numérico a texto
          if (sesionBase.dia !== null) {
            sesion.dia = diaNameMap[sesionBase.dia] || 'Sin forzar';
          }
          
          // Convertir hora numérica a texto
          if (sesionBase.tramo !== null) {
            sesion.tramo = `${sesionBase.tramo + 1}ª hora`;
          }
          
          sesion.cargaInicial = false; // Marcar como no carga inicial
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar restricciones existentes:', error);
    // No mostrar error al usuario ya que es normal que no haya restricciones configuradas
  }
};

// Cargar asignaturas de un profesor específico
const cargarAsignaturasProfesor = async (email) => {
  loadingAsignaturas.value = true;
  try {
    const solicitudes = await obtenerSolicitudes(email, toastMessage, toastColor, isToastOpen);
    
    // Filtrar solo las asignaturas (no reducciones)
    asignaturasImpartidas.value = solicitudes.asigunaturas.map(asignatura => ({
      id: `${asignatura.nombreAsignatura}-${asignatura.curso}-${asignatura.etapa}`,
      nombre: asignatura.nombreAsignatura,
      horas: asignatura.cupoHorasAsignatura,
      curso: asignatura.curso,
      etapa: asignatura.etapa,
      grupo: asignatura.grupo
    }));
  } catch (error) {
    console.error(`Error cargando asignaturas para ${email}:`, error);
    asignaturasImpartidas.value = [];
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al cargar las asignaturas');
  } finally {
    loadingAsignaturas.value = false;
  }
};

// Guardar el cambio en conciliación para un profesor específico
const guardarConciliacion = async (email, conciliacion) => {
  try {
    // Buscar el profesor para obtener sus datos actuales
    const profesor = profesoresConPreferencias.value.find(p => p.email === email);
    if (!profesor) return;
    
    // Usar el endpoint existente que actualiza observaciones
    await actualizarObservaciones(
      conciliacion,
      profesor.preferencias.sinClasePrimeraHora,
      profesor.preferencias.observaciones,
      'Lunes', // Valor por defecto, se puede ajustar según necesidades
      1, // Valor por defecto, se puede ajustar según necesidades
      'MATUTINO', // Valor por defecto, se puede ajustar según necesidades
      email,
      toastMessage,
      toastColor,
      isToastOpen
    );
    crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Conciliación actualizada');
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar la conciliación');
  }
};

// Métodos auxiliares para mostrar los datos (basados en G_EleccionDeHorarios.vue)
const obtenerTextoNoTenerClase = (preferencias) => {
  if (!preferencias || !preferencias.cargado) return '';
  return preferencias.sinClasePrimeraHora 
    ? 'última hora' 
    : 'primera hora';
};

const obtenerHorasSinClase = (preferencias) => {
  if (!preferencias || !preferencias.cargado || !preferencias.tramosHorarios) return '';
  
  const horasFormateadas = [];
  
  for (let i = 0; i < preferencias.tramosHorarios.length; i++) {
    const tramo = preferencias.tramosHorarios[i];
    if (!tramo) continue;
    
    // Formatear usando el mismo método que G_EleccionDeHorarios.vue
    const diaNum = Number(tramo.dia);
    const diaNombre = diaNameMap[diaNum] || `Día ${tramo.dia}`;
    const tramoNum = Number(tramo.tramo) + 1; // Sumar 1 como en el código original
    const horarioMatutino = tramo.horarioMatutino;
    
    // Formatear el tipo de horario para que sea más legible
    const horarioFormateado = horarioMatutino ? 'mañana' : 'tarde';
    
    // Formato: "Martes 1ª hora (mañana)"
    const horaFormateada = `${diaNombre} ${tramoNum}ª hora (${horarioFormateado})`;
    horasFormateadas.push(horaFormateada);
  }
  
  // Unir todas las horas con comas
  return horasFormateadas.join(', ');
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarProfesoresConPreferencias();
  obtenerEstadoGenerador();
});

// Función para obtener el estado del generador
const obtenerEstadoGenerador = async () => {
  try {
    const response = await obtenerEstadoGeneradorHorarios(toastMessage, toastColor, isToastOpen);
    
    if (response.ok) {
      const tiempoInicioLong = await response.text();
      if (tiempoInicioLong && tiempoInicioLong !== 'null') {
        tiempoInicio.value = parseInt(tiempoInicioLong);
        const fechaInicio = new Date(tiempoInicio.value);
        actualizarTiempoTranscurrido(fechaInicio);
        // Iniciar temporizador para actualizar el tiempo
        iniciarTemporizador(fechaInicio);
      } else {
        estadoGenerador.value = 'Detenido';
        tiempoInicio.value = null;
        detenerTemporizador();
      }
    } else {
      const errorData = await response.json();
      estadoGenerador.value = `Error: ${errorData.message}`;
      tiempoInicio.value = null;
      detenerTemporizador();
    }
  } catch (error) {
    estadoGenerador.value = 'Error al obtener estado';
    tiempoInicio.value = null;
    detenerTemporizador();
  }
};

// Función para actualizar el tiempo transcurrido
const actualizarTiempoTranscurrido = (fechaInicio) => {
  const tiempoTranscurrido = Date.now() - tiempoInicio.value;
  const minutos = Math.floor(tiempoTranscurrido / 60000);
  const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
  estadoGenerador.value = `Ejecutándose desde ${fechaInicio.toLocaleTimeString()} (${minutos}m ${segundos}s)`;
};

// Función para iniciar el temporizador
const iniciarTemporizador = (fechaInicio) => {
  detenerTemporizador(); // Detener cualquier temporizador existente
  timerInterval.value = setInterval(() => {
    actualizarTiempoTranscurrido(fechaInicio);
    // Forzar actualización de las computed properties
    if (mostrarTooltip.value) {
      // Esto forzará la actualización del tooltip
      mostrarTooltip.value = false;
      setTimeout(() => {
        mostrarTooltip.value = true;
      }, 10);
    }
  }, 1000);
};

// Función para detener el temporizador
const detenerTemporizador = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

// Limpiar temporizador al desmontar el componente
onUnmounted(() => {
  detenerTemporizador();
});

// Métodos existentes
const generarHorarios = async () => {
  try {
    // Primero obtener el estado actual
    await obtenerEstadoGenerador();
    
    const response = await lanzarGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios lanzado con éxito');
      // Actualizar el estado después de lanzar
      await obtenerEstadoGenerador();
    } else {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorData.message);
    } 
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al lanzar el generador de horarios.');
  }
};

const forzarDetencion = async () => {
  try {
    const response = await forzarDetencionGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios detenido con éxito');
      // Actualizar el estado después de detener
      await obtenerEstadoGenerador();
    } else {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorData.message);
    }
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al forzar la detención del generador.');
  }
};

// Función con debounce para actualizar sesión automáticamente
const actualizarSesionConDebounce = (index) => {
  // Limpiar timer anterior si existe
  if (debounceTimers.value[index]) {
    clearTimeout(debounceTimers.value[index]);
  }
  
  // Crear nuevo timer
  debounceTimers.value[index] = setTimeout(() => {
    actualizarSesion(index);
  }, 500); // 500ms de delay
};

// Actualizar una sesión específica
const actualizarSesion = async (index) => {
  const sesion = sesionesAsignatura.value[index];
  
  try {
    // Validar que tenemos todos los datos necesarios
    if (!profesorSeleccionado.value || !asignaturaSeleccionado.value) {
      return; // Salir silenciosamente si no hay datos suficientes
    }

    // Convertir los valores a formato numérico
    const dia = convertirDiaANumerico(sesion.dia);
    const tramo = convertirTramoANumerico(sesion.tramo);

    // Llamar al servicio para actualizar la restricción
    const response = await actualizarSesionBase(
      profesorSeleccionado.value.email,
      asignaturaSeleccionado.value.nombre,
      asignaturaSeleccionado.value.curso,
      asignaturaSeleccionado.value.etapa,
      asignaturaSeleccionado.value.grupo,
      sesion.numero,
      dia,
      tramo,
      toastMessage,
      toastColor,
      isToastOpen
    );

    if (response.ok) {
      
      // Mostrar mensaje de éxito solo si no es la carga inicial
      if (!sesion.cargaInicial) {
        crearToast(
          toastMessage, 
          toastColor, 
          isToastOpen, 
          'success', 
          `Sesión ${index + 1} actualizada`
        );
      }
    } else {
      const errorData = await response.json();
      crearToast(
        toastMessage, 
        toastColor, 
        isToastOpen, 
        'danger', 
        `Error: ${errorData.message}`
      );
    }
  } catch (error) {
    console.error('Error al actualizar sesión:', error);
    crearToast(
      toastMessage, 
      toastColor, 
      isToastOpen, 
      'danger', 
      'Error al actualizar la sesión'
    );
  }
};
</script>

<style scoped>
.t-1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}
.t-2{
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1.5rem;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 2rem;
}

.estado-acciones-table {
  background: var(--form-bg-light);
  border-radius: 10px;
  box-shadow: rgba(0,0,0,0.15) 0px 5px 15px;
  overflow: hidden;
  min-width: 400px;
}

.estado-acciones-table table {
  width: 100%;
  border-collapse: collapse;
}

.estado-acciones-table th {
  background-color: #f5f5f5;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.estado-acciones-table td {
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
}

.estado-cell {
  border-right: 1px solid #e0e0e0;
  position: relative;
  cursor: help;
}

.estado-text {
  font-weight: 500;
  font-size: 1.1rem;
}

.acciones-cell {
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

.btn-lanzar-generador-small {
  background-color: #10B981;
  border: none;
  color: #FFFFFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-lanzar-generador-small:hover {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-lanzar-generador-small svg {
  width: 20px;
  height: 20px;
}

.btn-forzar-detencion-small {
  background-color: #EF4444;
  border: none;
  color: #FFFFFF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-forzar-detencion-small:hover {
  background-color: #DC2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-forzar-detencion-small svg {
  width: 20px;
  height: 20px;
}

@media (prefers-color-scheme: dark) {
  .estado-acciones-table {
    background: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  }
  
  .estado-acciones-table th {
    background-color: #333;
    border-bottom-color: #555;
  }
  
  .estado-cell {
    border-right-color: #555;
  }
  
  .btn-lanzar-generador-small,
  .btn-forzar-detencion-small {
    color: white;
  }
  
  .tooltip-content {
    background: #1a1a1a;
    border: 1px solid #444;
  }
  
  .tooltip-content::before {
    border-bottom-color: #1a1a1a;
  }
  
  .tooltip-content h4 {
    border-bottom-color: #444;
  }
}

@media (max-width: 768px) {
  .estado-acciones-table {
    min-width: 300px;
  }
  
  .estado-acciones-table th,
  .estado-acciones-table td {
    padding: 0.75rem;
  }
  
  .estado-text {
    font-size: 1rem;
  }
  
  .btn-lanzar-generador-small,
  .btn-forzar-detencion-small {
    width: 35px;
    height: 35px;
  }
  
  .btn-lanzar-generador-small svg,
  .btn-forzar-detencion-small svg {
    width: 18px;
    height: 18px;
  }
  
  .tooltip-content {
    min-width: 200px;
    font-size: 0.8rem;
    padding: 8px;
  }
  
  .tooltip-content h4 {
    font-size: 0.9rem;
  }
}

.card-preferencias, .card-asignaturas, .card-sesiones {
  margin: 2rem auto;
  max-width: 1200px;
  background: var(--form-bg-light);
  border-radius: 10px;
  box-shadow: rgba(0,0,0,0.15) 0px 5px 15px;
  padding: 1.5rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tabla-responsive {
  overflow-x: auto;
  max-width: 100%;
}

table {
  min-width: 800px;
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
}

th {
  background-color: #f5f5f5;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.profesor-nombre {
  font-weight: 600;
  text-align: center;
  min-width: 150px;
}

.horas-sin-clase {
  text-align: center;
  max-width: 300px;
  word-wrap: break-word;
  line-height: 1.4;
}

/* Estilos para filas clickeables */
.fila-clickeable {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.fila-clickeable:hover {
  background-color: #e3f2fd !important;
}

.fila-seleccionada {
  background-color: #bbdefb !important;
  border-left: 4px solid #2196f3;
}

/* Estilos para checkboxes */
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para selects de forzar */
.select-forzar {
  padding: 0.3rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  min-width: 120px;
}

.select-forzar:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

/* Estilos para filas alternadas */
tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f0f0f0;
}

@media (max-width: 768px) {
  .tabla-responsive {
    max-width: 100vw;
  }
  table {
    min-width: 700px;
  }
  
  .profesor-nombre {
    min-width: 120px;
    font-size: 0.9rem;
  }
  
  .horas-sin-clase {
    max-width: 200px;
    font-size: 0.85rem;
  }
  
  .select-forzar {
    min-width: 100px;
    font-size: 0.8rem;
  }
  
  th, td {
    padding: 0.3rem;
    font-size: 0.85rem;
  }
}

@media (prefers-color-scheme: dark) {
  .card-preferencias, .card-asignaturas, .card-sesiones {
    background: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  
  th {
    background-color: #333;
  }
  
  th, td {
    border-color: #555;
  }
  
  tbody tr:nth-child(even) {
    background-color: #2a2a2a;
  }
  
  tbody tr:hover {
    background-color: #3a3a3a;
  }
  
  .fila-clickeable:hover {
    background-color: #1a237e !important;
  }
  
  .fila-seleccionada {
    background-color: #0d47a1 !important;
    border-left: 4px solid #64b5f6;
  }
  
  .select-forzar {
    background-color: #333;
    border-color: #555;
    color: white;
  }
  
  .select-forzar:focus {
    border-color: #64b5f6;
  }
}

.btn-lanzar-generador {
  background-color: #10B981;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-lanzar-generador:hover {
  background-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-lanzar-generador svg {
  width: 28px;
  height: 28px;
}

@media (prefers-color-scheme: dark) {
  .btn-lanzar-generador {
    color: white;
  }
}

.btn-forzar-detencion {
  background-color: #EF4444;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-forzar-detencion:hover {
  background-color: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.btn-forzar-detencion svg {
  width: 28px;
  height: 28px;
}

@media (prefers-color-scheme: dark) {
  .btn-forzar-detencion {
    color: white;
  }
}

/* Estilos para el tooltip personalizado */
.tooltip-estado {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  margin-top: 5px;
  pointer-events: none;
}

.tooltip-content {
  background: #333;
  color: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: nowrap;
  min-width: 250px;
  text-align: left;
}

.tooltip-content::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #333;
}

.tooltip-content h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid #555;
  padding-bottom: 4px;
}

.tooltip-content p {
  margin: 4px 0;
  color: #e0e0e0;
}

.tooltip-content strong {
  color: #fff;
  font-weight: 600;
}
</style>