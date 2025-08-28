<template>
  <h1 class="t-1">Generador de horarios</h1>
  <div class="top-section">
    <!-- Tabla de estado y acciones -->
    <div class="estado-acciones-table">
      <table :key="soluciones.length">
        <thead>
          <tr>
            <th class="estado-header">Estado</th>
            <th class="acciones-header">Acciones</th>
            <th class="soluciones-header">Puntuación</th>
            <th v-if="soluciones.length > 0" v-for="columna in columnasGeneradas" :key="columna.key" class="sub-header">
              {{ columna.titulo }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="estado-cell" 
                :title="tooltipEstado"
                @mouseenter="mostrarTooltip = true"
                @mouseleave="mostrarTooltip = false">
              <span class="estado-text">{{ estadoGeneradorCorto }}</span>
              <div v-if="nuevaSolucionEncontrada" class="nueva-solucion-estado">
                <span class="nueva-solucion-estado-text">¡Nueva solución!</span>
              </div>
              <!-- Tooltip personalizado -->
              <div v-if="mostrarTooltip" class="tooltip-estado">
                <div class="tooltip-content">
                  <h4>Estado del Generador</h4>
                  <p><strong>Estado:</strong> {{ estadoGenerador }}</p>
                  <p v-if="tiempoInicio"><strong>Iniciado:</strong> {{ fechaInicioFormateada }}</p>
                  <p v-if="tiempoInicio"><strong>Tiempo transcurrido:</strong> {{ tiempoTranscurridoFormateado }}</p>
                  <p v-if="!tiempoInicio"><strong>Estado:</strong> Detenido</p>
                  <p v-if="nuevaSolucionEncontrada"><strong>Nueva solución:</strong> Disponible</p>
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
            <td class="soluciones-cell">
              <div class="soluciones-select-wrapper">
                <template v-if="soluciones.length > 0">
                  <select 
                    v-model="solucionSeleccionada" 
                    @change="seleccionarSolucionHandler"
                    class="select-soluciones"
                    :disabled="loadingSoluciones"
                    title="Seleccionar puntuación"
                  >
                    <option 
                      v-for="solucion in soluciones" 
                      :key="solucion.id" 
                      :value="solucion.id"
                      :data-elegida="solucion.solucionElegida"
                    >
                      {{ solucion.puntuacion }}{{ solucion.solucionElegida ? ' (Elegida)' : '' }}
                    </option>
                  </select>
                  <button class="btn-borrar-solucion" @click="borrarSolucionSeleccionada" :disabled="loadingSoluciones" title="Borrar solución seleccionada">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </template>
                <template v-else-if="!loadingSoluciones">
                  <div class="no-soluciones">Sin soluciones</div>
                </template>
                <template v-if="loadingSoluciones">
                  <div class="loading-soluciones">
                    <div class="loading-spinner-small"></div>
                  </div>
                </template>
              </div>
            </td>
            <td class="puntuacion-cell" v-for="columna in columnasGeneradas" :key="columna.key">
              <div v-if="solucionSeleccionada && solucionSeleccionadaInfo">
                <span v-html="obtenerPuntuacionPorTipo(solucionSeleccionadaInfo, columna.tipo)"></span>
              </div>
              <div v-else class="no-puntuacion">
                -
              </div>
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
      <table :key="soluciones.length">
        <thead>
          <tr>
            <th>Profesor</th>
            <th>Conciliación</th>
            <th>Preferencias diarias</th>
            <th>Preferencias concretas</th>
            <th>Observaciones</th>
            <th v-if="soluciones.length > 0" v-for="col in columnasProfesor" :key="col.key">{{ col.titulo }}</th>
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
            <td class="sin-clase-cell" v-html="textoSinClaseComputed(profesor.preferencias, profesor.email)"></td>
            <td class="horas-sin-clase" v-html="obtenerPreferencias(profesor.preferencias, profesor.email)"></td>
            <td>{{ profesor.preferencias.observaciones || '-' }}</td>
            <td v-for="col in columnasProfesor" :key="col.key" class="puntuacion-profesor-cell">
              <span v-html="obtenerPuntuacionPorTipoYProfesor(solucionSeleccionadaInfo, col.tipo, profesor.email)"></span>
            </td>
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

  <!-- Tarjeta de sesiones de asignaturas -->
  <div v-if="asignaturaSeleccionado" class="card-sesiones">
    <h2 class="t-2">Sesiones - {{ asignaturaSeleccionado.nombre }}</h2>
    
    <!-- Loading state para días y tramos -->
    <div v-if="loadingDias || loadingTramos" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando días y tramos disponibles...</p>
    </div>
    
    <!-- Tabla de sesiones -->
    <div v-else class="tabla-responsive">
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
              <select v-model="sesion.diaDesc" class="select-forzar" @change="actualizarRestriccionImpartirSesionConDebounce(index)" :disabled="loadingDias">
                <option v-for="dia in diasUnicos" :key="dia" :value="dia">
                  {{ dia }}
                </option>
              </select>
            </td>
            <td>
              <select v-model="sesion.tramoDesc" class="select-forzar" @change="actualizarRestriccionImpartirSesionConDebounce(index)" :disabled="loadingTramos">
                <option v-for="tramo in tramosUnicos" :key="tramo" :value="tramo">
                  {{ tramo }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- Tarjeta de sesiones de reducciones -->
  <div v-if="reduccionSeleccionado" class="card-sesiones">
    <h2 class="t-2">Reducciones - {{ reduccionSeleccionado.nombre }}</h2>
    
    <!-- Loading state para días y tramos -->
    <div v-if="loadingDias || loadingTramos" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando días y tramos disponibles...</p>
    </div>
    
    <!-- Tabla de sesiones -->
    <div v-else class="tabla-responsive">
      <table>
        <thead>
          <tr>
            <th>Sesión</th>
            <th>Forzar día</th>
            <th>Forzar hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sesion, index) in sesionesReduccion" :key="index">
            <td>
              Sesión {{ index + 1 }}
            </td>
            <td>
              <select v-model="sesion.diaDesc" class="select-forzar" @change="actualizarRestriccionReduccionSesionConDebounce(index)" :disabled="loadingDias">
                <option v-for="dia in diasUnicos" :key="dia" :value="dia">
                  {{ dia }}
                </option>
              </select>
            </td>
            <td>
              <select v-model="sesion.tramoDesc" class="select-forzar" @change="actualizarRestriccionReduccionSesionConDebounce(index)" :disabled="loadingTramos">
                <option v-for="tramo in tramosUnicos" :key="tramo" :value="tramo">
                  {{ tramo }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { 
  lanzarGeneradorHorarios, 
  forzarDetencionGeneradorHorarios, 
  obtenerEstadoGeneradorHorarios,
  obtenerProfesoresHorarios, 
  obtenerObservaciones,
  actualizarConciliacion,
  obtenerSolicitudes,
  actualizarRestriccionesImpartir,
  obtenerRestriccionesImpartir,
  actualizarRestriccionesReduccion,
  obtenerRestriccionesReduccion,
  obtenerListaDias,
  obtenerListaTramos,
  seleccionarSolucion,
  borrarSolucion
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

// Variable para el intervalo de actualización automática
const autoUpdateInterval = ref(null);

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
const reduccionSeleccionado = ref(null);
const sesionesReduccion = ref([]);
const debounceTimers = ref({}); // Para evitar múltiples llamadas rápidas

// Variables para días y tramos disponibles
const listaDias = ref([]);
const listaTramos = ref([]);
const loadingDias = ref(false);
const loadingTramos = ref(false);

// Variables para soluciones
const solucionSeleccionada = ref('');
const soluciones = ref([]);
const loadingSoluciones = ref(false);
const solucionesAnteriores = ref([]); // Para detectar nuevas soluciones
const nuevaSolucionEncontrada = ref(false); // Indicador de nueva solución
const cargaInicial = ref(true); // Flag para evitar detectar nuevas soluciones en la carga inicial
const solucionSeleccionadaInfo = ref(null); // Información detallada de la solución seleccionada

// Variable para almacenar las puntuaciones por profesor
const puntuacionesPorProfesor = ref(new Map());

// Variable para rastrear la solución elegida durante las actualizaciones
// Esto evita que se pierda la selección del usuario cuando se refresca la lista
const solucionElegidaPersistente = ref(null);

// Variable para rastrear si el usuario ya ha hecho una selección manual
// Esto evita que se seleccione automáticamente una nueva solución cuando ya hay una elegida
// Se marca como true cuando el usuario selecciona manualmente o cuando se detecta una solución elegida
const usuarioHaSeleccionado = ref(false);

// Función auxiliar para formatear fechas en formato DD/MM/YYYY HH:MM:SS
const formatearFecha = (timestamp) => {
  if (!timestamp) return '';
  const fecha = new Date(timestamp);
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const segundos = fecha.getSeconds().toString().padStart(2, '0');
  
  return `${dia}/${mes}/${año} ${hora}:${minutos}:${segundos}`;
};



// Computed properties para el tooltip
const estadoGeneradorCorto = computed(() => {
  if (estadoGenerador.value.includes('Ejecutándose')) {
    return 'Ejecutándose';
  } else if (estadoGenerador.value.includes('Finalizado')) {
    return 'Finalizado';
  } else if (estadoGenerador.value.includes('Nueva solución encontrada') && nuevaSolucionEncontrada.value) {
    return 'Nueva solución encontrada';
  } else if (estadoGenerador.value.includes('Detenido')) {
    return 'Detenido';
  } else if (estadoGenerador.value.includes('Error')) {
    return 'Error';
  } else {
    return 'Cargando...';
  }
});

// Computed para el texto de "Preferencias diarias" que se actualiza automáticamente
const textoSinClaseComputed = computed(() => {
  // Solo se ejecuta cuando cambian las dependencias relevantes
  const solucionInfo = solucionSeleccionadaInfo.value;
  
  return (preferencias, emailProfesor) => {
    if (!preferencias || !preferencias.cargado) {
      return '';
    }
    
    // Texto base estático
    const textoBase = preferencias.sinClasePrimeraHora 
      ? 'Evitar primera hora' 
      : 'Evitar última hora';
    
    // Si hay información del generador y una solución seleccionada, combinar con puntuaciones
    if (solucionInfo && solucionInfo.puntuacionesDesglosadas) {
      // Buscar la puntuación "Preferencias diarias" para este profesor
      const puntuacion = solucionInfo.puntuacionesDesglosadas.find(p => 
        p.categoria === 'Profesor' && 
        p.tipo === 'Preferencias diarias' && 
        p.emailProfesor === emailProfesor
      );
      
      if (puntuacion) {
        // Combinar texto base + salto de línea + puntuación en negrita con porcentaje de 2 decimales
        return `${textoBase}<br><strong>${puntuacion.puntuacion} (${puntuacion.porcentaje.toFixed(2)}%)</strong>`;
      }
    }
    
    // Si no hay puntuación, devolver solo el texto base
    return textoBase;
  };
});



const fechaInicioFormateada = computed(() => {
  if (!tiempoInicio.value) return '';
  return formatearFecha(tiempoInicio.value);
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
  if (nuevaSolucionEncontrada.value) {
    return 'Se ha encontrado una nueva solución. El generador se ha detenido automáticamente.';
  } else if (tiempoInicio.value) {
    return `Ejecutándose desde ${fechaInicioFormateada.value} (${tiempoTranscurridoFormateado.value})`;
  } else {
    return 'Generador detenido';
  }
});

// Computed properties para días y tramos únicos
const diasUnicos = computed(() => {
  if (!listaDias.value || listaDias.value.length === 0) {
    return ['Sin Seleccionar'];
  }
  
  return ['Sin Seleccionar', ...listaDias.value.filter(dia => dia !== 'Sin Seleccionar')];
});

const tramosUnicos = computed(() => {
  if (!listaTramos.value || listaTramos.value.length === 0) {
    return ['Sin Seleccionar'];
  }
  
  return ['Sin Seleccionar', ...listaTramos.value.filter(tramo => tramo !== 'Sin Seleccionar')];
});

// Computed properties para columnas dinámicas
const tiposPuntuacionGenerales = computed(() => {
  if (!solucionSeleccionadaInfo.value || !solucionSeleccionadaInfo.value.puntuacionesDesglosadas) {
    return [];
  }
  
  // Obtener tipos únicos de puntuaciones generales (excluyendo categoría "Profesor")
  const tiposUnicos = new Set();
  
  solucionSeleccionadaInfo.value.puntuacionesDesglosadas.forEach(puntuacion => {
    // Solo incluir puntuaciones que NO sean de categoría "Profesor"
    if (puntuacion.categoria !== 'Profesor') {
      // Extraer el tipo base (sin "Matutina" o "Vespertina")
      const tipoBase = puntuacion.tipo.replace(/\s+(Matutina|Vespertina)$/, '');
      tiposUnicos.add(tipoBase);
    }
  });
  

  return Array.from(tiposUnicos);
});



const columnasGeneradas = computed(() => {
  if (!solucionSeleccionadaInfo.value || soluciones.value.length === 0) {
    return [];
  }
  const columnas = [];
  tiposPuntuacionGenerales.value.forEach(tipo => {
    columnas.push({
      key: tipo,
      titulo: tipo,
      tipo: tipo,
      periodo: 'general'
    });
  });
  
  return columnas;
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
        const observaciones = await obtenerObservaciones(
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
          tramosHorarios: observaciones.tramosHorarios || [],
          cargado: true
        };
      } catch (error) {
        console.error(`❌ Error cargando preferencias para ${profesor.email}:`, error);
        profesor.preferencias.cargado = true; // Marcar como cargado aunque haya error
      }
    }
  } catch (error) {
    console.error('💥 Error general al cargar profesores:', error);
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
      numeroRestriccion: i + 1,
      diaDesc: 'Sin Seleccionar',
      tramoDesc: 'Sin Seleccionar',
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
    const restriccionesImpartir = await obtenerRestriccionesImpartir(
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
    if (restriccionesImpartir && restriccionesImpartir.length > 0) {
      restriccionesImpartir.forEach(restriccionImpartir => {
        const restriccionImpartirIndex = restriccionImpartir.numeroRestriccion - 1; // Convertir a índice base 0
        if (restriccionImpartirIndex >= 0 && restriccionImpartirIndex < sesionesAsignatura.value.length) {
          const sesion = sesionesAsignatura.value[restriccionImpartirIndex];
          
          // Asignar valores solo si no son null
          if (restriccionImpartir.diaDesc !== null) {
            sesion.diaDesc = restriccionImpartir.diaDesc;
          }
          if (restriccionImpartir.tramoDesc !== null) {
            sesion.tramoDesc = restriccionImpartir.tramoDesc;
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
    // Usar el endpoint específico para actualizar conciliación
    const response = await actualizarConciliacion(
      email,
      conciliacion,
      toastMessage,
      toastColor,
      isToastOpen
    );
    
    if (response.ok) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Conciliación actualizada correctamente');
    } else {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Error: ${errorData.message}`);
    }
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar la conciliación');
  }
};

const obtenerPreferencias = (preferencias, emailProfesor) => {
  if (!preferencias || !preferencias.cargado || !preferencias.tramosHorarios) return '';
  
  const horasFormateadas = [];
  
  for (let i = 0; i < preferencias.tramosHorarios.length; i++) {
    const tramo = preferencias.tramosHorarios[i];

    // Verificar si el tramo tiene "Sin Seleccionar"
    if (tramo.diaDesc !== 'Sin Seleccionar' && tramo.tramoDesc !== 'Sin Seleccionar') {
      // Formato: "Martes 1ª hora"
      const horaFormateada = `${tramo.diaDesc} ${tramo.tramoDesc}`;

      // Añadir a la lista de horas formateadas
      horasFormateadas.push(horaFormateada);
    }
  }
  
  // Texto base con las horas de preferencias
  const textoBase = horasFormateadas.length > 0 
    ? horasFormateadas.join(', ') 
    : 'Sin preferencias';
  
  // Si hay información del generador y una solución seleccionada, combinar con puntuaciones
  if (solucionSeleccionadaInfo.value && solucionSeleccionadaInfo.value.puntuacionesDesglosadas) {
    // Buscar la puntuación "Preferencias concretas" para este profesor
    const puntuacion = solucionSeleccionadaInfo.value.puntuacionesDesglosadas.find(p => 
      p.categoria === 'Profesor' && 
      p.tipo === 'Preferencias concretas' && 
      p.emailProfesor === emailProfesor
    );
    
    if (puntuacion) {
      // Combinar texto base + salto de línea + puntuación en negrita con porcentaje de 2 decimales
      return `${textoBase}<br><strong>${puntuacion.puntuacion} (${puntuacion.porcentaje.toFixed(2)}%)</strong>`;
    }
  }
  
  // Si no hay puntuación, devolver solo el texto base
  return textoBase;
};

// Cargar días y tramos disponibles
const cargarDiasTramos = async () => {
  // Cargar días
  loadingDias.value = true;
  try {
    const dias = await obtenerListaDias(toastMessage, toastColor, isToastOpen);
    listaDias.value = dias;
  } catch (error) {
    console.error('Error al cargar días:', error);
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al cargar los días disponibles');
  } finally {
    loadingDias.value = false;
  }

  // Cargar tramos
  loadingTramos.value = true;
  try {
    const tramos = await obtenerListaTramos(toastMessage, toastColor, isToastOpen);
    listaTramos.value = tramos;
  } catch (error) {
    console.error('Error al cargar tramos:', error);
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al cargar los tramos disponibles');
  } finally {
    loadingTramos.value = false;
  }
};

// Función para actualización automática
const actualizacionAutomatica = async () => {
  try {
    // Obtener el estado actual del generador
    const response = await obtenerEstadoGeneradorHorarios(toastMessage, toastColor, isToastOpen);
    
    if (response.ok) {
      const estadoData = await response.json();
      
      // Actualizar el estado del generador
      if (estadoData.estado === 'EN_CURSO' && estadoData.fechaInicio) {
        tiempoInicio.value = parseInt(estadoData.fechaInicio);
        actualizarTiempoTranscurrido(new Date(tiempoInicio.value));
      } else if (estadoData.estado === 'FINALIZADO') {
        estadoGenerador.value = 'Finalizado';
        tiempoInicio.value = null;
        detenerTemporizador();
      } else {
        estadoGenerador.value = 'Detenido';
        tiempoInicio.value = null;
        detenerTemporizador();
      }
      
      // Procesar las soluciones si están incluidas
      if (estadoData.infoGenerador || estadoData.soluciones) {
        await procesarSoluciones(estadoData.infoGenerador || estadoData.soluciones);
      }
    }
  } catch (error) {
    console.error('Error en actualización automática:', error);
  }
};

// Función para iniciar la actualización automática
const iniciarActualizacionAutomatica = () => {
  // Detener cualquier intervalo existente
  if (autoUpdateInterval.value) {
    clearInterval(autoUpdateInterval.value);
  }
  
  // Iniciar nuevo intervalo cada 3 segundos
  autoUpdateInterval.value = setInterval(actualizacionAutomatica, 3000);
};

// Función para detener la actualización automática
const detenerActualizacionAutomatica = () => {
  if (autoUpdateInterval.value) {
    clearInterval(autoUpdateInterval.value);
    autoUpdateInterval.value = null;
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  cargarProfesoresConPreferencias();
  await obtenerEstadoGenerador();
  cargarDiasTramos();
  
  // Marcar carga inicial como completada
  cargaInicial.value = false;
  
  // Sincronizar el estado de solución elegida después de la carga inicial
  await sincronizarSolucionElegida();
  
  // Iniciar actualización automática
  iniciarActualizacionAutomatica();
});

// Función para obtener el estado del generador
const obtenerEstadoGenerador = async () => {
  try {
    const response = await obtenerEstadoGeneradorHorarios(toastMessage, toastColor, isToastOpen);
    
    if (response.ok) {
      const estadoData = await response.json();
      
      // Procesar el estado del generador según la nueva estructura
      if (estadoData.estado === 'EN_CURSO' && estadoData.fechaInicio) {
        tiempoInicio.value = parseInt(estadoData.fechaInicio);
        const fechaInicio = new Date(tiempoInicio.value);
        
        actualizarTiempoTranscurrido(fechaInicio);
        // Iniciar temporizador para actualizar el tiempo
        iniciarTemporizador(fechaInicio);
      } else if (estadoData.estado === 'FINALIZADO') {
        estadoGenerador.value = 'Finalizado';
        tiempoInicio.value = null;
        detenerTemporizador();
      } else {
        estadoGenerador.value = 'Detenido';
        tiempoInicio.value = null;
        detenerTemporizador();
      }
      
      // Procesar las soluciones si están incluidas en infoGenerador o soluciones
      if (estadoData.infoGenerador) {
        await procesarSoluciones(estadoData.infoGenerador);
      } else if (estadoData.soluciones) {
        await procesarSoluciones(estadoData.soluciones);
      }
    } else {
      // Si no es OK, probablemente el generador esté parado
      estadoGenerador.value = 'Detenido';
      tiempoInicio.value = null;
      detenerTemporizador();
    }
  } catch (error) {
    console.error('Error al obtener estado del generador:', error);
    // Si hay una excepción, el generador está parado
    estadoGenerador.value = 'Detenido';
    tiempoInicio.value = null;
    detenerTemporizador();
  }
};

// Función para actualizar el tiempo transcurrido
const actualizarTiempoTranscurrido = (fechaInicio) => {
  const tiempoTranscurrido = Date.now() - tiempoInicio.value;
  const minutos = Math.floor(tiempoTranscurrido / 60000);
  const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
  
  // Formatear la fecha de inicio en formato DD/MM/YYYY HH:MM:SS
  const dia = fechaInicio.getDate().toString().padStart(2, '0');
  const mes = (fechaInicio.getMonth() + 1).toString().padStart(2, '0');
  const año = fechaInicio.getFullYear();
  const hora = fechaInicio.getHours().toString().padStart(2, '0');
  const minutosFecha = fechaInicio.getMinutes().toString().padStart(2, '0');
  const segundosFecha = fechaInicio.getSeconds().toString().padStart(2, '0');
  
  const fechaFormateada = `${dia}/${mes}/${año} ${hora}:${minutosFecha}:${segundosFecha}`;
  estadoGenerador.value = `Ejecutándose desde ${fechaFormateada} (${minutos}m ${segundos}s)`;
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

// Limpiar temporizadores al desmontar el componente
onUnmounted(() => {
  detenerTemporizador();
  detenerActualizacionAutomatica();
});

// Métodos existentes
const generarHorarios = async () => {
  try {
    // Resetear el indicador de nueva solución
    nuevaSolucionEncontrada.value = false;
    // Resetear el flag de carga inicial
    cargaInicial.value = false;
    // NO limpiar las soluciones existentes al lanzar un nuevo generador
    // Las mantendremos hasta que aparezcan nuevas soluciones
    // soluciones.value = [];
    // solucionesAnteriores.value = [];
    // solucionSeleccionada.value = '';
    // Resetear el estado del generador
    estadoGenerador.value = 'Iniciando...';
    
    const response = await lanzarGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios lanzado con éxito');
      // Reiniciar la actualización automática
      iniciarActualizacionAutomatica();
      // Actualizar el estado después de lanzar
      await obtenerEstadoGenerador();
    } else {
      const errorData = await response.json();
      
      // Formatear fechas en el mensaje de error si las contiene
      let mensajeError = errorData.message;
      if (mensajeError && typeof mensajeError === 'string') {
        // Buscar timestamps en el mensaje y formatearlos
        const timestampRegex = /\d{13,}/g; // Buscar números de 13+ dígitos (timestamps)
        mensajeError = mensajeError.replace(timestampRegex, (match) => {
          return formatearFecha(parseInt(match));
        });
      }
      
      crearToast(toastMessage, toastColor, isToastOpen, "danger", mensajeError);
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
const actualizarRestriccionImpartirSesionConDebounce = (index) => {
  // Limpiar timer anterior si existe
  if (debounceTimers.value[index]) {
    clearTimeout(debounceTimers.value[index]);
  }
  
  // Crear nuevo timer
  debounceTimers.value[index] = setTimeout(() => {
    actualizarRestriccionImpartirSesion(index);
  }, 500); // 500ms de delay
};

// Actualizar una sesión de restricción de asignatura específica
const actualizarRestriccionImpartirSesion = async (index) => {
  const sesion = sesionesAsignatura.value[index];
  
  try {
    // Validar que tenemos todos los datos necesarios
    if (!profesorSeleccionado.value || !asignaturaSeleccionado.value) {
      return; // Salir silenciosamente si no hay datos suficientes
    }

    // Llamar al servicio para actualizar la restricción
    const response = await actualizarRestriccionesImpartir(
      profesorSeleccionado.value.email,
      asignaturaSeleccionado.value.nombre,
      asignaturaSeleccionado.value.curso,
      asignaturaSeleccionado.value.etapa,
      asignaturaSeleccionado.value.grupo,
      sesion.numeroRestriccion,
      sesion.diaDesc,
      sesion.tramoDesc,
      toastMessage,
      toastColor,
      isToastOpen
    );

    if (!response.ok) {
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

// Función con debounce para actualizar sesión automáticamente
const actualizarRestriccionReduccionSesionConDebounce = (index) => {
  // Limpiar timer anterior si existe
  if (debounceTimers.value[index]) {
    clearTimeout(debounceTimers.value[index]);
  }
  
  // Crear nuevo timer
  debounceTimers.value[index] = setTimeout(() => {
    actualizarRestriccionReduccionSesion(index);
  }, 500); // 500ms de delay
};

// Actualizar una sesión de restricción de reducción específica
const actualizarRestriccionReduccionSesion = async (index) => {
  const sesion = sesionesReduccion.value[index];
  
  try {
    // Validar que tenemos todos los datos necesarios
    if (!profesorSeleccionado.value || !reduccionSeleccionado.value) {
      return; // Salir silenciosamente si no hay datos suficientes
    }

    // Llamar al servicio para actualizar la restricción
    const response = await actualizarRestriccionesReduccion(
      profesorSeleccionado.value.email,
      reduccionSeleccionado.value.nombre,
      reduccionSeleccionado.value.curso,
      reduccionSeleccionado.value.etapa,
      reduccionSeleccionado.value.grupo,
      sesion.numeroRestriccion,
      sesion.diaDesc,
      sesion.tramoDesc,
      toastMessage,
      toastColor,
      isToastOpen
    );

    if (!response.ok) {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error al actualizar la restricción de reducción:', error);
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al actualizar la restricción de reducción');
  }
};

// Método para seleccionar una solución
const seleccionarSolucionHandler = async () => {
  if (!solucionSeleccionada.value) return;

  loadingSoluciones.value = true;
  try {
    const response = await seleccionarSolucion(
      solucionSeleccionada.value,
      toastMessage,
      toastColor,
      isToastOpen
    );

    if (response.ok) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Solución seleccionada correctamente');
      // Actualizar el estado de las soluciones localmente sin recargar
      soluciones.value.forEach(solucion => {
        solucion.solucionElegida = solucion.id === solucionSeleccionada.value;
      });
      // Actualizar la solución elegida persistente
      solucionElegidaPersistente.value = solucionSeleccionada.value;
      // Marcar que el usuario ha hecho una selección manual
      usuarioHaSeleccionado.value = true;
      
      // Actualizar la información de la solución seleccionada
      actualizarSolucionSeleccionadaInfo();
      // Resetear el indicador de nueva solución
      nuevaSolucionEncontrada.value = false;
      // Cambiar el estado a Finalizado
      estadoGenerador.value = 'Finalizado';
      // Reiniciar la actualización automática para futuras ejecuciones
      iniciarActualizacionAutomatica();
    } else {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', `Error: ${errorData.message}`);
    }
  } catch (error) {
    console.error('Error al seleccionar la solución:', error);
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al seleccionar la solución');
  } finally {
    loadingSoluciones.value = false;
  }
};

// Función para obtener la puntuación por tipo de una solución
const obtenerPuntuacionPorTipo = (solucionInfo, tipo) => {
  if (!solucionInfo || !solucionInfo.puntuacionesDesglosadas) {
    return '-';
  }
  
  // Buscar puntuación que NO sea de categoría "Profesor"
  const puntuacion = solucionInfo.puntuacionesDesglosadas.find(p => 
    p.tipo === tipo && p.categoria !== 'Profesor'
  );
  
  if (puntuacion) {
    // Mostrar puntuación con porcentaje si está disponible
    if (puntuacion.porcentaje !== undefined && puntuacion.porcentaje !== null) {
      return `<strong>${puntuacion.puntuacion} (${puntuacion.porcentaje.toFixed(2)}%)</strong>`;
    }
    return puntuacion.puntuacion.toString();
  }
  
  return '-';
};

// Función para actualizar la información de la solución seleccionada
const actualizarSolucionSeleccionadaInfo = () => {
  if (!solucionSeleccionada.value || !soluciones.value.length) {
    solucionSeleccionadaInfo.value = null;
    puntuacionesPorProfesor.value.clear();
    return;
  }
  
  // Buscar la solución seleccionada en el array de soluciones
  const solucion = soluciones.value.find(s => s.id === solucionSeleccionada.value);
  if (solucion) {

    
    solucionSeleccionadaInfo.value = solucion;
    
    // Procesar puntuaciones por profesor
    procesarPuntuacionesPorProfesor(solucion);
  }
};

// Función para procesar las puntuaciones por profesor
const procesarPuntuacionesPorProfesor = (solucion) => {
  puntuacionesPorProfesor.value.clear();
  
  if (solucion.puntuacionesDesglosadas) {
    // Incluir puntuaciones de categoría "Profesor"
    const puntuacionesProfesor = solucion.puntuacionesDesglosadas.filter(p => 
      p.categoria === 'Profesor'
    );
    
    // Agrupar puntuaciones por profesor
    const puntuacionesAgrupadas = new Map();
    
    puntuacionesProfesor.forEach((puntuacion) => {
      if (puntuacion.emailProfesor) {
        if (!puntuacionesAgrupadas.has(puntuacion.emailProfesor)) {
          puntuacionesAgrupadas.set(puntuacion.emailProfesor, {
            puntuacionTotal: 0,
            porcentajeTotal: 0,
            count: 0
          });
        }
        
        const datos = puntuacionesAgrupadas.get(puntuacion.emailProfesor);
        datos.puntuacionTotal += puntuacion.puntuacion;
        if (puntuacion.porcentaje !== undefined && puntuacion.porcentaje !== null) {
          datos.porcentajeTotal += puntuacion.porcentaje;
        }
        datos.count++;
      }
    });
    
    // Calcular promedio de porcentajes y formatear resultado
    puntuacionesAgrupadas.forEach((datos, email) => {
      const porcentajePromedio = datos.count > 0 ? datos.porcentajeTotal / datos.count : 0;
      const puntuacionFormateada = porcentajePromedio > 0 
        ? `<strong>${datos.puntuacionTotal} (${porcentajePromedio.toFixed(2)}%)</strong>`
        : datos.puntuacionTotal.toString();
      
      puntuacionesPorProfesor.value.set(email, puntuacionFormateada);
    });
  }
};

// Función para sincronizar el estado de solución elegida con la base de datos
// Esto asegura que si el backend ha seleccionado automáticamente una solución,
// el frontend refleje correctamente ese estado
const sincronizarSolucionElegida = async () => {
  if (soluciones.value.length === 0) return;
  
  if (estadoGenerador.value === 'Finalizado' && !solucionSeleccionada.value) {
    try {
      // Obtener el estado actual del generador para verificar la solución elegida
      const response = await obtenerEstadoGeneradorHorarios(toastMessage, toastColor, isToastOpen);
      if (response.ok) {
        const estadoData = await response.json();
        
        // Buscar la solución elegida en los datos del backend
        if (estadoData.infoGenerador && Array.isArray(estadoData.infoGenerador)) {
          
          const solucionElegidaBackend = estadoData.infoGenerador.find(s => s.solucionElegida);
          if (solucionElegidaBackend) {
            
            // Actualizar el estado local para reflejar la solución elegida del backend
            soluciones.value.forEach(solucion => {
              solucion.solucionElegida = solucion.id === solucionElegidaBackend.idGeneradorInstancia;
            });
            
            // Actualizar la solución seleccionada
            solucionSeleccionada.value = solucionElegidaBackend.idGeneradorInstancia;
            
            // Actualizar la solución elegida persistente
            solucionElegidaPersistente.value = solucionElegidaBackend.idGeneradorInstancia;
            
            // Actualizar la información de la solución seleccionada
            actualizarSolucionSeleccionadaInfo();
          }
        }
      }
    } catch (error) {
      console.error('Error al sincronizar solución elegida:', error);
    }
  }
};

// Función para procesar las soluciones obtenidas del generador
// Maneja el campo solucionElegida que indica cuál es la solución seleccionada por el usuario
const procesarSoluciones = async (infoGenerador) => {
  // Convertir infoGenerador a array de soluciones
  soluciones.value  = [];
  if (infoGenerador && Array.isArray(infoGenerador)) {
    infoGenerador.forEach((instancia, index) => {
      const id = instancia.idGeneradorInstancia || instancia.id;
      const puntuacion = instancia.puntuacion;
      const solucionElegida = instancia.solucionElegida || false;
      const puntuacionesDesglosadas = instancia.puntuacionesDesglosadas || [];
      
      if (id && puntuacion !== undefined) {
        soluciones.value.push({
          id: id,
          puntuacion: puntuacion,
          solucionElegida: solucionElegida,
          puntuacionesDesglosadas: puntuacionesDesglosadas
        });
      }
    });
  }

  // Actualizar las soluciones (sin activar "Nueva solución encontrada")
  if (soluciones.value.length > 0) {
    // Guardar la solución elegida actual antes de actualizar
    const solucionElegidaAnterior = soluciones.value.find(s => s.solucionElegida);

    nuevaSolucionEncontrada.value = soluciones.value.length > solucionesAnteriores.value.length;
    if (nuevaSolucionEncontrada.value)
    {
      detenerTemporizador();
      detenerActualizacionAutomatica();
      estadoGenerador.value = 'Nueva solución encontrada';
      crearToast(toastMessage, toastColor, isToastOpen, 'success', '¡Nueva solución encontrada!');
    }

    solucionesAnteriores.value = soluciones.value;
    
    // Buscar la solución elegida en las nuevas soluciones
    const solucionElegida = soluciones.value.find(s => s.solucionElegida);
    
    if (solucionElegida)
    {
      // Si hay una solución marcada como elegida en el backend, usarla
      solucionSeleccionada.value = solucionElegida.id;
    }
    else
    {
      // Solo si el generador está finalizado y no hay selección previa
      solucionSeleccionada.value = soluciones.value[0].id;
      try {
        await seleccionarSolucion(
          soluciones.value[0].id,
          toastMessage,
          toastColor,
          isToastOpen
        );
        soluciones.value.forEach(s => {
          s.solucionElegida = s.id === soluciones.value[0].id;
        });
      } catch (error) {
        console.error('Error al seleccionar automáticamente la solución:', error);
      }
    }
  } else {
    soluciones.value = [];
    solucionSeleccionada.value = '';
  }
   
  actualizarSolucionSeleccionadaInfo();
};

// Cargar soluciones disponibles (ahora usa el endpoint consolidado)
const cargarSoluciones = async () => {
  loadingSoluciones.value = true;
  try {
    const response = await obtenerEstadoGeneradorHorarios(toastMessage, toastColor, isToastOpen);
    if (response.ok) {
      const estadoData = await response.json();
      // Procesar las soluciones si están incluidas en infoGenerador o soluciones
      if (estadoData.infoGenerador) {
        await procesarSoluciones(estadoData.infoGenerador);
      } else if (estadoData.soluciones) {
        await procesarSoluciones(estadoData.soluciones);
      } else {
        // Si no hay infoGenerador ni soluciones, limpiar todo
        soluciones.value = [];
        solucionSeleccionada.value = '';
        solucionSeleccionadaInfo.value = null;
        puntuacionesPorProfesor.value.clear();
      }
    } else {
      // Si la respuesta no es OK, limpiar todo
      soluciones.value = [];
      solucionSeleccionada.value = '';
      solucionSeleccionadaInfo.value = null;
      puntuacionesPorProfesor.value.clear();
    }
  } catch (error) {
    console.error('Error al cargar soluciones:', error);
    soluciones.value = [];
    solucionSeleccionada.value = '';
    solucionSeleccionadaInfo.value = null;
    puntuacionesPorProfesor.value.clear();
  } finally {
    loadingSoluciones.value = false;
  }
};

// Watcher para actualizar puntuaciones por profesor cuando cambie la solución seleccionada
watch(solucionSeleccionada, () => {
  if (solucionSeleccionada.value && soluciones.value.length) {
    const solucion = soluciones.value.find(s => s.id === solucionSeleccionada.value);
    if (solucion) {
      procesarPuntuacionesPorProfesor(solucion);
    }
  } else {
    puntuacionesPorProfesor.value.clear();
  }
});

// 1. Computed para tipos de puntuaciones de profesor
defineExpose({});

const tiposPuntuacionProfesor = computed(() => {
  if (!solucionSeleccionadaInfo.value || !solucionSeleccionadaInfo.value.puntuacionesDesglosadas) {
    return [];
  }
  // Extrae los tipos únicos de categoría 'Profesor', excluyendo "Preferencias diarias" y "Preferencias concretas"
  // ya que esta información se muestra en las columnas estáticas
  const tiposUnicos = new Set();
  solucionSeleccionadaInfo.value.puntuacionesDesglosadas.forEach(p => {
    if (p.categoria === 'Profesor' && p.tipo !== 'Preferencias diarias' && p.tipo !== 'Preferencias concretas') {
      tiposUnicos.add(p.tipo);
    }
  });
  return Array.from(tiposUnicos);
});

// 2. Computed para columnas dinámicas de profesor
const columnasProfesor = computed(() => {
  if (!solucionSeleccionadaInfo.value || soluciones.value.length === 0) {
    return [];
  }
  const cols = tiposPuntuacionProfesor.value.map(tipo => ({
    key: tipo,
    titulo: tipo,
    tipo: tipo,
    periodo: 'profesor'
  }));
  return cols;
});

// 3. Función para obtener la puntuación y porcentaje por tipo y profesor
const obtenerPuntuacionPorTipoYProfesor = (solucionInfo, tipo, emailProfesor) => {
  if (!solucionInfo || !solucionInfo.puntuacionesDesglosadas) return '-';
  const p = solucionInfo.puntuacionesDesglosadas.find(
    x => x.categoria === 'Profesor' && x.tipo === tipo && x.emailProfesor === emailProfesor
  );
  if (p) {
    if (p.porcentaje !== undefined && p.porcentaje !== null) {
      return `<strong>${p.puntuacion} (${p.porcentaje.toFixed(2)}%)</strong>`;
    }
    return p.puntuacion.toString();
  }
  return '-';
};

const borrarSolucionSeleccionada = async () => {
  if (!solucionSeleccionada.value) return;
  
  // Desactivar inmediatamente el estado de "Nueva solución encontrada"
  nuevaSolucionEncontrada.value = false;
  if (estadoGenerador.value === 'Nueva solución encontrada') {
    estadoGenerador.value = 'Finalizado';
  }
  
  // Verificar si la solución a borrar es la elegida
  const solucionABorrar = soluciones.value.find(s => s.id === solucionSeleccionada.value);
  const esSolucionElegida = solucionABorrar && solucionABorrar.solucionElegida;
  
  try {
    const response = await borrarSolucion(solucionSeleccionada.value, toastMessage, toastColor, isToastOpen);

    if (response.ok) {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Solución eliminada correctamente');      
      // Luego recargar para sincronizar con el backend
      await cargarSoluciones();
      
      // Si la solución borrada era la elegida, seleccionar la siguiente con mayor puntuación
      if (esSolucionElegida && soluciones.value.length > 0) {
        // Ordenar por puntuación de mayor a menor
        const siguienteSolucion = soluciones[0];
        
        if (siguienteSolucion) {
          try {
            // Seleccionar la siguiente solución en el backend
            await seleccionarSolucion(
              siguienteSolucion.id,
              toastMessage,
              toastColor,
              isToastOpen
            );
            
            // Actualizar el estado local
            solucionSeleccionada.value = siguienteSolucion.id;
            soluciones.value.forEach(s => {
              s.solucionElegida = s.id === siguienteSolucion.id;
            });
            
            // Actualizar la información de la solución seleccionada
            actualizarSolucionSeleccionadaInfo();
            
            // NO activar el estado de "Nueva solución encontrada"
            // Solo mostrar el toast informativo
            crearToast(toastMessage, toastColor, isToastOpen, 'success', `Solución con puntuación ${siguienteSolucion.puntuacion} seleccionada automáticamente`);
          } catch (error) {
            console.error('Error al seleccionar automáticamente la siguiente solución:', error);
          }
        }
      }
    } else {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al eliminar la solución');
    }
  } catch (error) {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al eliminar la solución');
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
  width: 100%;
}

.estado-acciones-table {
  background: var(--form-bg-light);
  border-radius: 10px;
  box-shadow: rgba(0,0,0,0.15) 0px 5px 15px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.estado-acciones-table::-webkit-scrollbar {
  height: 8px;
}

.estado-acciones-table::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.estado-acciones-table::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.estado-acciones-table::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Asegurar scroll horizontal en dispositivos móviles */
@media (max-width: 1024px) {
  .estado-acciones-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.estado-acciones-table table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  table-layout: fixed;
}

.estado-acciones-table th {
  background-color: #f5f5f5;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}



.sub-header {
  background-color: #f8f9fa !important;
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
  border: 1px solid #dee2e6;
}

.estado-header {
  min-width: 120px;
}

.acciones-header {
  min-width: 100px;
}

.soluciones-header {
  min-width: 120px;
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
  

  
  .sub-header {
    background-color: #2a2a2a !important;
    color: #e0e0e0;
    border-color: #555;
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
  
  .estado-acciones-table::-webkit-scrollbar-track {
    background: #2a2a2a;
  }
  
  .estado-acciones-table::-webkit-scrollbar-thumb {
    background: #555;
  }
  
  .estado-acciones-table::-webkit-scrollbar-thumb:hover {
    background: #666;
  }
}

@media (max-width: 768px) {
  .estado-acciones-table {
    width: 100%;
    overflow-x: auto;
  }
  
  .estado-acciones-table table {
    min-width: 700px;
  }
  
  .estado-acciones-table th,
  .estado-acciones-table td {
    padding: 0.5rem;
  }
  
  .estado-text {
    font-size: 0.9rem;
  }
  
  .sub-header {
    font-size: 0.75rem;
    padding: 0.3rem;
  }
  
  .estado-header {
    min-width: 100px;
  }
  
  .acciones-header {
    min-width: 80px;
  }
  
  .soluciones-header {
    min-width: 100px;
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
  
  .soluciones-cell {
    min-width: 100px;
  }
  
  .puntuacion-cell {
    min-width: 80px;
    font-size: 0.8rem;
    padding: 0.3rem;
  }
  
  .select-soluciones {
    min-width: 80px;
    max-width: 100px;
    font-size: 0.8rem;
    padding: 0.3rem;
  }
  
  .loading-spinner-small {
    width: 14px;
    height: 14px;
    border-width: 1px;
  }
}

.card-preferencias, .card-asignaturas, .card-sesiones {
  margin: 2rem auto;
  max-width: 1400px;
  background: var(--form-bg-light);
  border-radius: 10px;
  box-shadow: rgba(0,0,0,0.15) 0px 5px 15px;
  padding: 1.5rem;
  overflow: hidden; /* Evitar desbordamiento */
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
  overflow-y: auto;
  max-width: 100%;
  max-height: 400px; /* Altura máxima para scroll vertical */
  border-radius: 8px;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}

table {
  min-width: 1000px;
  border-collapse: collapse;
  width: 100%;
  margin: 0;
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
  white-space: nowrap; /* Evitar que el texto se rompa */
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

/* Estilos para las columnas de puntuación por profesor (Huecos, etc.) */
.puntuacion-profesor-cell {
  text-align: center;
  font-weight: 600;
  min-width: 120px;
  max-width: 150px;
}

/* Estilos específicos para la columna "Preferencias diarias" */
.sin-clase-cell {
  text-align: center;
  min-width: 150px;
  max-width: 200px;
  word-wrap: break-word;
  line-height: 1.4;
}

.puntuacion-profesor-cell {
  text-align: center;
  font-weight: 600;
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

.select-forzar:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Estilos para filas alternadas */
tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

tbody tr:hover {
  background-color: #f0f0f0;
}

/* Estilos para mejorar el scroll */
.tabla-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tabla-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tabla-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.tabla-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Estilos para pantallas muy pequeñas */
@media (max-width: 480px) {
  .estado-acciones-table {
    width: 100%;
    overflow-x: auto;
  }
  
  .estado-acciones-table table {
    min-width: 600px;
  }
  
  .estado-acciones-table th,
  .estado-acciones-table td {
    padding: 0.3rem;
  }
  
  .estado-text {
    font-size: 0.8rem;
  }
  
  .sub-header {
    font-size: 0.7rem;
    padding: 0.2rem;
  }
  
  .estado-header {
    min-width: 80px;
  }
  
  .acciones-header {
    min-width: 70px;
  }
  
  .soluciones-header {
    min-width: 100px;
  }
  
  .card-preferencias, .card-asignaturas, .card-sesiones {
    margin: 0.5rem;
    padding: 0.75rem;
  }
  
  .tabla-responsive {
    max-height: 250px;
  }
  
  table {
    min-width: 600px;
  }
  
  .t-1 {
    font-size: 1.5rem;
  }
  
  .t-2 {
    font-size: 1.1rem;
  }
  
  th, td {
    padding: 0.2rem;
    font-size: 0.75rem;
  }
  
  .sin-clase-cell {
    min-width: 100px;
    max-width: 120px;
    font-size: 0.7rem;
  }
  
  .puntuacion-profesor-cell {
    min-width: 60px;
    max-width: 80px;
    font-size: 0.7rem;
  }
}

@media (max-width: 768px) {
  .card-preferencias, .card-asignaturas, .card-sesiones {
    margin: 1rem;
    padding: 1rem;
    border-radius: 8px;
  }
  
  .tabla-responsive {
    max-width: 100%;
    max-height: 300px; /* Altura menor en móviles */
    border-radius: 6px;
  }
  
  table {
    min-width: 800px; /* Ancho mínimo ajustado para tablets */
  }
  
  .profesor-nombre {
    min-width: 100px;
    font-size: 0.85rem;
  }
  
  .horas-sin-clase {
    max-width: 150px;
    font-size: 0.8rem;
    word-break: break-word;
  }
  
  .sin-clase-cell {
    min-width: 120px;
    max-width: 150px;
    font-size: 0.8rem;
  }
  
  .puntuacion-profesor-cell {
    min-width: 80px;
    max-width: 100px;
    font-size: 0.8rem;
  }
  
  .select-forzar {
    min-width: 80px;
    font-size: 0.75rem;
    padding: 0.2rem;
  }
  
  th, td {
    padding: 0.25rem;
    font-size: 0.8rem;
  }
  
  .t-1 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
  }
  
  .t-2 {
    font-size: 1.25rem;
    margin-top: 1rem;
  }
}

@media (prefers-color-scheme: dark) {
  .card-preferencias, .card-asignaturas, .card-sesiones {
    background: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  
  .tabla-responsive {
    box-shadow: inset 0 0 5px rgba(255, 255, 255, 0.1);
  }
  
  .tabla-responsive::-webkit-scrollbar-track {
    background: #2a2a2a;
  }
  
  .tabla-responsive::-webkit-scrollbar-thumb {
    background: #555;
  }
  
  .tabla-responsive::-webkit-scrollbar-thumb:hover {
    background: #666;
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
  
  .select-forzar:disabled {
    background-color: #2a2a2a;
    color: #666;
  }
  
  .puntuacion-profesor-cell {
    color: #90caf9;
    background-color: #1a237e;
    border-left-color: #90caf9;
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

.soluciones-cell {
  text-align: center;
  vertical-align: middle;
}

.soluciones-select-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.puntuacion-cell {
  text-align: center;
  vertical-align: middle;
  min-width: 120px;
  padding: 0.5rem;
  position: relative;
  z-index: 1;
}

.no-puntuacion {
  color: #666;
  font-style: italic;
}

.select-soluciones {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
  min-width: 100px;
  max-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 200;
}

.select-soluciones:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.select-soluciones:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Asegurar que el select no se superponga */
.select-soluciones option {
  background-color: white;
  color: #333;
}

/* Estilos para el dropdown del select */
.select-soluciones:focus {
  outline: none;
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  z-index: 300;
}

.loading-soluciones {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 0 0 4px 4px;
  padding: 0.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 400;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.no-soluciones {
  padding: 0.5rem;
  text-align: center;
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.nueva-solucion-estado {
  margin-top: 0.5rem;
  background-color: #10B981;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.nueva-solucion-estado-text {
  white-space: nowrap;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  .select-soluciones {
    background-color: #333;
    border-color: #555;
    color: white;
  }
  
  .select-soluciones:focus {
    border-color: #64b5f6;
    z-index: 300;
  }
  
  .select-soluciones:disabled {
    background-color: #2a2a2a;
    color: #666;
  }
  
  .select-soluciones option {
    background-color: #333;
    color: white;
  }
  
  .loading-soluciones {
    background-color: rgba(0, 0, 0, 0.9);
  }
  
  .no-soluciones {
    background-color: #2a2a2a;
    color: #999;
    border-color: #555;
  }
  
  .nueva-solucion-estado {
    background-color: #059669;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  }
  
  .no-puntuacion {
    color: #999;
  }
}

.btn-borrar-solucion {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  color: #d32f2f;
  transition: color 0.2s;
}
.btn-borrar-solucion:hover:not(:disabled) {
  color: #b71c1c;
}
.btn-borrar-solucion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Estilos para destacar la solución elegida en el select */
.select-soluciones option[data-elegida="true"] {
  font-weight: bold;
  background-color: #e3f2fd;
  color: #1976d2;
}

@media (prefers-color-scheme: dark) {
  .select-soluciones option[data-elegida="true"] {
    background-color: #1a237e;
    color: #90caf9;
  }
}

</style>