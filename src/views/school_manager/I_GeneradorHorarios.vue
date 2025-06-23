<template>
  <h1 class="t-1">Generador de horarios</h1>
  <div class="top-section">
    <!-- Botones existentes -->
    <button @click="generarHorarios" class="btn-lanzar-generador">Lanzar Generador</button>
    <button @click="forzarDetencion" class="btn-forzar-detencion">Forzar Detención</button>
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
            :class="{ 'fila-seleccionada': asignaturaSeleccionada?.id === asignatura.id }"
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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sesion, index) in sesionesAsignatura" :key="index">
            <td>Sesión {{ index + 1 }}</td>
            <td>
              <select v-model="sesion.forzarDia" class="select-forzar">
                <option value="Sin forzar">Sin forzar</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
              </select>
            </td>
            <td>
              <select v-model="sesion.forzarHora" class="select-forzar">
                <option value="Sin forzar">Sin forzar</option>
                <option value="1">1ª hora</option>
                <option value="2">2ª hora</option>
                <option value="3">3ª hora</option>
                <option value="4">4ª hora</option>
                <option value="5">5ª hora</option>
                <option value="6">6ª hora</option>
              </select>
            </td>
            <td>
              <button 
                @click="actualizarSesion(index)"
                class="btn-actualizar-sesion"
              >
                Actualizar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Botón actualizar todo -->
    <div class="container-botones">
      <button 
        @click="actualizarTodasSesiones"
        class="btn-actualizar-todo"
      >
        ACTUALIZAR TODO
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { 
  lanzarGeneradorHorarios, 
  forzarDetencionGeneradorHorarios, 
  obtenerProfesoresHorarios, 
  obtenerObservacionesDeUsuario, 
  obtenerPreferenciasDeUsuario,
  actualizarObservaciones,
  obtenerSolicitudes
} from '@/services/schoolManager.js';

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

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

// Mapeo de días (basado en G_EleccionDeHorarios.vue)
const diaNameMap = {
  0: 'Lunes',
  1: 'Martes',
  2: 'Miércoles',
  3: 'Jueves',
  4: 'Viernes'
};

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
const seleccionarAsignatura = (asignatura) => {
  asignaturaSeleccionado.value = asignatura;
  
  // Crear array de sesiones basado en la carga horaria
  sesionesAsignatura.value = [];
  for (let i = 0; i < asignatura.horas; i++) {
    sesionesAsignatura.value.push({
      numero: i + 1,
      forzarDia: 'Sin forzar',
      forzarHora: 'Sin forzar',
      actualizada: false // Flag para marcar si se ha actualizado
    });
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
    const tipoHorario = tramo.tipoHorario;
    
    // Formatear el tipo de horario para que sea más legible
    const tipoHorarioFormateado = tipoHorario === 'MATUTINO' ? 'mañana' : 
                                 tipoHorario === 'VESPERTINO' ? 'tarde' : 
                                 tipoHorario.toLowerCase();
    
    // Formato: "Martes 1ª hora (mañana)"
    const horaFormateada = `${diaNombre} ${tramoNum}ª hora (${tipoHorarioFormateado})`;
    horasFormateadas.push(horaFormateada);
  }
  
  // Unir todas las horas con comas
  return horasFormateadas.join(', ');
};

// Cargar datos al montar el componente
onMounted(() => {
  cargarProfesoresConPreferencias();
});

// Métodos existentes
const generarHorarios = async () => {
  try
  {
    const response = await lanzarGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok)
    {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios lanzado con éxito');
    }
    else
    {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorData.message);
    } 
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al lanzar el generador de horarios.');
  }
};

const forzarDetencion = async () => {
  try
  {
    const response = await forzarDetencionGeneradorHorarios(toastMessage, toastColor, isToastOpen);

    if (response.ok)
    {
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Generador de horarios detenido con éxito');
    }
    else
    {
      const errorData = await response.json();
      crearToast(toastMessage, toastColor, isToastOpen, "danger", errorData.message);
    }
  }
  catch (error)
  {
    crearToast(toastMessage, toastColor, isToastOpen, 'danger', 'Error al forzar la detención del generador.');
  }
};
// Actualizar una sesión específica
const actualizarSesion = async (index) => {
  const sesion = sesionesAsignatura.value[index];
  
  try {
    // Aquí iría la lógica para actualizar la sesión específica
    // Por ahora solo marcamos como actualizada
    sesion.actualizada = true;
    
    crearToast(
      toastMessage, 
      toastColor, 
      isToastOpen, 
      'success', 
      `Sesión ${index + 1} actualizada correctamente`
    );
  } catch (error) {
    crearToast(
      toastMessage, 
      toastColor, 
      isToastOpen, 
      'danger', 
      `Error al actualizar la sesión ${index + 1}`
    );
  }
};

// Actualizar todas las sesiones
const actualizarTodasSesiones = async () => {
  try {
    // Aquí iría la lógica para actualizar todas las sesiones
    // Por ahora solo marcamos todas como actualizadas
    sesionesAsignatura.value.forEach(sesion => {
      sesion.actualizada = true;
    });
    
    crearToast(
      toastMessage, 
      toastColor, 
      isToastOpen, 
      'success', 
      'Todas las sesiones actualizadas correctamente'
    );
  } catch (error) {
    crearToast(
      toastMessage, 
      toastColor, 
      isToastOpen, 
      'danger', 
      'Error al actualizar las sesiones'
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
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-lanzar-generador:hover {
  background-color: #059669;
}

@media (prefers-color-scheme: dark) {
  .btn-lanzar-generador {
    color: black;
  }
}

.btn-forzar-detencion {
  background-color: #EF4444;
  border: none;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  border-radius: 0.375rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-forzar-detencion:hover {
  background-color: #DC2626;
}

@media (prefers-color-scheme: dark) {
  .btn-forzar-detencion {
    color: black;
  }
}

/* Estilos para botones de actualizar (basados en B_AsignaturaYBloque.vue) */
.btn-actualizar-sesion {
  background-color: #0054e9;
  color: #ffffff;
  border-radius: 0.25rem;
  padding: 0.5rem;
  height: 45px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-actualizar-sesion:hover:not(:disabled) {
  background-color: #1461eb;
}

.btn-actualizar-sesion:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-actualizar-todo {
  width: 180px;
  height: 45px;
  margin-left: auto;
  background-color: #0054e9;
  color: #ffffff;
  border-radius: 0.375rem;
  font-size: 1.02rem;
  font-weight: 550;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-actualizar-todo:hover:not(:disabled) {
  background-color: #1461eb;
}

.btn-actualizar-todo:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.container-botones {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  padding-top: 1rem;
}

@media (prefers-color-scheme: dark) {
  .btn-actualizar-sesion,
  .btn-actualizar-todo {
    color: #000000;
    background-color: #4782eb;
  }
  
  .btn-actualizar-sesion:hover:not(:disabled),
  .btn-actualizar-todo:hover:not(:disabled) {
    background-color: #3476eb;
  }
}

@media (max-width: 768px) {
  .container-botones {
    flex-direction: row;
  }
  
  .btn-actualizar-todo {
    width: 100%;
    margin-left: 0;
  }
}
</style>