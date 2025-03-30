<script setup>
import {onMounted, ref} from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import {
  cargarAsignaturasUnicas,
  obtenerNumAlumnosAsignatura,
} from '@/services/schoolManager.js';
import { IonToast, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/vue';

// Variables reactivas
const filtroSeleccionado = ref({ curso: null, etapa: '' });
const asignaturas = ref([]);
const columnasGrupos = ref([]);
const loading = ref(false);
const errorMensaje = ref("");
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

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
    columnasGrupos.value = [];
    return;
  }
  loading.value = true;
  errorMensaje.value = "";
  try {

    const data = await cargarAsignaturasUnicas(
        filtroSeleccionado.value.curso,
        filtroSeleccionado.value.etapa,
        toastMessage,
        toastColor,
        isToastOpen
    );
    asignaturas.value = Array.isArray(data) ? data : [];

    // Aqui falta el endpoint de cargar los grupos de la asignatura asi que de mientras a fuego, podria ponerlo pero tengo sueño
    columnasGrupos.value = ['A', 'B', 'C'];

    // Para cada asignatura, se saca el número de alumnos para cada grupo.
    await cargarNumeroAlumnosPorGrupo();
  } catch (error) {
    errorMensaje.value = "Error al cargar asignaturas. Inténtelo de nuevo.";
    console.error("Error:", error);
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
    for (const grupo of columnasGrupos.value) {
      try {
        const cursoInt = parseInt(filtroSeleccionado.value.curso, 10);

        const response = await obtenerNumAlumnosAsignatura(
            cursoInt,
            filtroSeleccionado.value.etapa,
            grupo,
            asignatura.nombre
        );
        const numero = parseInt(response,10);
        asignatura.numeroAlumnosEnGrupo[grupo] = isNaN(numero) ? 0 : numero;
      } catch (error) {
        console.error(`Error al obtener alumnos para ${asignatura.nombre} - Grupo ${grupo}:`, error);
        asignatura.numeroAlumnosEnGrupo[grupo] = 0;
      }
    }
  }
};

onMounted(() => {
  cargarAsignatura();
});
</script>

<template>
  <div class="container">
    <h1 class="m-4">Resumen de cursos</h1>
    <!-- Desplegable para elegir curso y etapa -->
    <FilterCursoEtapa @actualizar-select="actualizarSelect" class="m-1" />

    <!-- Tarjeta que contiene la tabla -->
    <ion-card class="m-6">
      <ion-card-header>
        <ion-card-title style="text-align: center;">
          Tabla de grupos por asignatura
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <div v-if="errorMensaje" class="mensajeError">{{ errorMensaje }}</div>
        <div v-if="loading" class="cargar">Cargando datos...</div>

        <div v-if="asignaturas.length > 0 && !loading">
          <table class="tablaAlumnos">
            <thead>
            <tr>
              <th class="th">Asignatura</th>
              <th class="th">Nº Horas</th>
              <!-- Se calcula el total sumando los valores de cada grupo -->
              <th class="th">Tot. Alumnos</th>
              <!-- Cabeceras dinámicas para cada grupo -->
              <th v-for="(grupo, index) in columnasGrupos" :key="index" class="th">
                Grupo {{ grupo }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(asignatura) in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td class="th">{{ asignatura.nombre }}</td>
              <td class="th">{{ asignatura.horas }}</td>
              <!-- Se calcula el total al sumar los valores obtenidos en cada grupo -->
              <td class="th">{{ calcularTotal(asignatura.numeroAlumnosEnGrupo) }}</td>
              <td v-for="grupo in columnasGrupos" :key="grupo" class="th">
                {{ asignatura.numeroAlumnosEnGrupo[grupo] || 0 }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!loading" class="m-7">
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

<style scoped>
.container {
  padding: 2rem;
}
.m-4 {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.m-1 {
  font-size: 17px;
  margin-top: 10px;
}
.m-6 {
  margin: 1.5rem;
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
.tablaAlumnos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.th {
  border: 1px solid currentColor;
  padding: 0.5rem 1rem;
  text-align: center;
}
@media (max-width: 768px) {
  .tablaAlumnos {
    min-width: 300px;
  }
}
</style>