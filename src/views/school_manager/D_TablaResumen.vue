<template>
  <div class="table-container">
    <h1 class="t-1">Resumen por asignaturas</h1>
    <!-- Desplegable para elegir curso y etapa -->
    <FilterCursoEtapa 
      v-model="filtroSeleccionadoString"
      @actualizar-select="actualizarSelect" 
      selectClass="select-sm"
      class="texto-dropdown"/>
    <!-- Tarjeta que contiene la tabla -->
    <ion-card class="card-table">
      <ion-card-header>
        <ion-card-title class="t-2">
          Tabla de grupos por asignatura
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div v-if="mensajeActualizacion" class="mensajeError">{{ mensajeActualizacion }}</div>
        <div v-if="loading" class="cargar">Cargando datos...</div>
        <div v-if="asignaturas.length > 0 && !loading">
          <table class="table-asignaturas">
            <thead>
            <tr>
              <th class="th th-center">Asignatura</th>
              <th class="th th-center white-space">Nº Horas</th>
              <!-- Se calcula el total sumando los valores de cada grupo -->
              <th class="th th-center white-space">Tot. Alumnos</th>
              <!-- Cabeceras dinámicas para cada grupo -->
              <th v-for="(infoGrupo, index) in infoGrupos" :key="index" class="th th-center white-space">
                Grupo {{ infoGrupo.grupo }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(asignatura) in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="th">{{ asignatura.nombre }}</td>
              <td class="th th-center">{{ asignatura.horas }}</td>
              <!-- Se calcula el total al sumar los valores obtenidos en cada grupo -->
              <td class="th th-center">{{ calcularTotal(asignatura.numeroAlumnosEnGrupo) }}</td>
              <td v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo" class="th th-center">
                {{ asignatura.numeroAlumnosEnGrupo[infoGrupo.grupo] || "-" }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="!loading" class="t-3">
          <p>No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
        </div>
      </ion-card-content>
    </ion-card>
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
import {onMounted, ref} from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { cargarAsignaturasUnicas, obtenerCantidadAlumnosEnGrupoPorAsignatura, obtenerTodosGrupos } from '@/services/schoolManager.js';
import { IonToast, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';
import { crearToast } from '@/utils/toast.js';

// Variables reactivas
const filtroSeleccionado = ref({ curso: null, etapa: '' });
const filtroSeleccionadoString = ref('');
const asignaturas = ref([]);
const infoGrupos = ref([]);
const loading = ref(false);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

/**
 * Función auxiliar que recibe un objeto con los números de alumnos por grupo
 * y devuelve la suma total.
 */
const calcularTotal = (alumnosPorGrupo) => {
  if (!alumnosPorGrupo) return 0;
  return Object.values(alumnosPorGrupo).reduce((acc, val) => {
    // Conviertes cada valor a número y, si da NaN, pones 0
    const num = Number(val);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);
};

/**
 * Actualiza el filtro de curso y etapa y dispara la carga de asignaturas.
 */
const actualizarSelect = (seleccionado) => {
  filtroSeleccionado.value = seleccionado;
  filtroSeleccionadoString.value = `${seleccionado.curso}-${seleccionado.etapa}`;
  cargarAsignatura();
};

/**
 * Carga las asignaturas según el curso y etapa seleccionados.
 * Esta vez solo tienen curso, etapa, nombre y horas.
 */
const cargarAsignatura = async () => {
  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {
    asignaturas.value = [];
    infoGrupos.value = [];
    return;
  }
  loading.value = true;
  try {

    const response = await cargarAsignaturasUnicas(
        filtroSeleccionado.value.curso,
        filtroSeleccionado.value.etapa,
        toastMessage,
        toastColor,
        isToastOpen
    );

    asignaturas.value = Array.isArray(response) ? response : [];

    // Carga los grupos para el curso y etapa seleccionados.
    await obtenerGrupo();

    // Para cada asignatura, se saca el número de alumnos para cada grupo.
    await cargarNumeroAlumnosPorGrupo();
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
    asignaturas.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * Para cada asignatura, consulta el endpoint que retorna el número de alumnos para cada grupo.
 * Como las asignaturas no traen este dato, se crea la propiedad 'numeroAlumnosEnGrupo'
 * y se le asigna el resultado de cada petición.
 */
const cargarNumeroAlumnosPorGrupo = async () => {
  for (const asignatura of asignaturas.value) {
    // Banco de números obtenidos.
    asignatura.numeroAlumnosEnGrupo = {};
    for (const infoGrupo of infoGrupos.value) {
      try {
        const cursoInt = parseInt(filtroSeleccionado.value.curso, 10);

        const response = await obtenerCantidadAlumnosEnGrupoPorAsignatura(
            cursoInt,
            filtroSeleccionado.value.etapa,
            infoGrupo.grupo,
            asignatura.nombre
        );
        const numero = parseInt(response,10);
        asignatura.numeroAlumnosEnGrupo[infoGrupo.grupo] = isNaN(numero) ? 0 : numero;

      } catch (error) {
        mensajeActualizacion = `Error al obtener alumnos para ${asignatura.nombre} - Grupo ${infoGrupo.grupo}:`;
        mensajeColor = "danger";
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
        console.error(error);
        asignatura.numeroAlumnosEnGrupo[infoGrupo.grupo] = 0;
      }
    }
  }
};

const obtenerGrupo = async () => {
  try {
   
    const response = await obtenerTodosGrupos(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);

    infoGrupos.value = response
    
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

onMounted(() => {
  cargarAsignatura();
});
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  align-items: center;
  width: 100%;
}

.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.texto-dropdown {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.card-table {
  margin: 1.5rem;
  width: 100%;
  max-width: 56rem;
  overflow: auto;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
}

.t-2 {
  font-size: 1.3rem;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.cargar {
  text-align: center;
  color: #6b7280;
}

.mensajeError {
  color: red;
  margin-bottom: 1rem;
}

.table-asignaturas {
  color: black;
  table-layout: auto;
  border-collapse: collapse;
  border: 1px solid currentColor;
  width: 100%;
}

.th {
  border: 1px solid currentColor;
  padding-left: 0.5rem; 
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.th-center {
  text-align: center;
}

.t-3 {
  text-align: center;
  color: black;
}

.white-space {
  white-space: nowrap; 
}

@media (prefers-color-scheme: dark) {
  .table-asignaturas {
    color: #c4c6ca;
  }
  .t-3{
    color: #c4c6ca;
  }
}

@media (max-width: 768px) {
  .table-asignaturas {
    min-width: 200px;
  }
}
</style>