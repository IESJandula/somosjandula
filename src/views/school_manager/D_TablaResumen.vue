<script setup>
import {onMounted, ref} from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { cargarAsignaturasUnicas, obtenerCantidadAlumnosEnGrupoPorAsignatura, obtenerGrupos } from '@/services/schoolManager.js';
import { IonToast, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';
import { crearToast } from '@/utils/toast.js';

// Variables reactivas
const filtroSeleccionado = ref({ curso: null, etapa: '' });
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
   
    const response = await obtenerGrupos(filtroSeleccionado.value.curso, filtroSeleccionado.value.etapa, toastMessage, toastColor, isToastOpen);

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

<template>
  <div class="container">
    <h1 class="m-4">Resumen por asignaturas</h1>
    <!-- Desplegable para elegir curso y etapa -->
    <FilterCursoEtapa @actualizar-select="actualizarSelect" class="m-1" />
    <!-- Tarjeta que contiene la tabla -->
    <ion-card class="m-6">
      <ion-card-header>
        <ion-card-title class="th-center">
          Tabla de grupos por asignatura
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div v-if="mensajeActualizacion" class="mensajeError">{{ mensajeActualizacion }}</div>
        <div v-if="loading" class="cargar">Cargando datos...</div>
        <div v-if="asignaturas.length > 0 && !loading">
          <table class="tablaAsignaturas">
            <thead>
            <tr>
              <th class="th">Asignatura</th>
              <th class="th">Nº Horas</th>
              <!-- Se calcula el total sumando los valores de cada grupo -->
              <th class="th">Tot. Alumnos</th>
              <!-- Cabeceras dinámicas para cada grupo -->
              <th v-for="(infoGrupo, index) in infoGrupos" :key="index" class="th">
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
                {{ asignatura.numeroAlumnosEnGrupo[infoGrupo.grupo] || 0 }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-else-if="!loading" class="m-7">
          <p class="cargar">No hay asignaturas disponibles para el curso y etapa seleccionados.</p>
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

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  align-items: center;
}
.m-4 {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.m-1 {
  font-size: 17px;
  margin-top: 10px;
  flex-grow: 1; 
}
.m-6 {
  margin: 1.5rem;
  width: 100%;
  max-width: 56rem;
  overflow: auto;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
}
.cargar {
  text-align: center;
  margin: 1rem 0;
}
.mensajeError {
  color: red;
  text-align: center;
  margin-bottom: 1rem;
}
.tablaAsignaturas {
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

@media (max-width: 768px) {
  .tablaAsignaturas {
    min-width: 200px;
  }
}
@media (prefers-color-scheme: dark) {
  .tablaAsignaturas{
    color: #c4c6ca;
  }
  .m-7{
    color: #c4c6ca;
  }
}
</style>