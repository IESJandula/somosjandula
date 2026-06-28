<template>
  <div class="school-manager-page">
    <header class="page-header">
      <h1 class="t-1">Resumen por asignaturas<span v-if="cursoAcademico"> ({{ cursoAcademico }})</span></h1>
      <SchoolManagerNav>
        <p class="page-subtitle">
          Consulta el reparto de alumnos por grupo y asignatura para el curso y etapa seleccionados.
        </p>
      </SchoolManagerNav>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <div class="listado-header">
          <div class="listado-header-left">
            <h2 class="section-title section-title-inline">Tabla de grupos por asignatura</h2>
          </div>
          <div class="datos-controls">
            <FilterCursoEtapa
              v-model="filtroSeleccionadoString"
              @actualizar-select="actualizarSelect"
              selectClass="select-sm"
              class="texto-dropdown"/>
          </div>
        </div>

        <div v-if="mensajeActualizacion" class="mensajeError">{{ mensajeActualizacion }}</div>
        <div v-if="loading" class="cargar">Cargando datos...</div>

        <div class="table-scroll" v-if="asignaturas.length > 0 && !loading">
          <table class="table-asignaturas">
            <thead>
            <tr>
              <th class="th-center">Asignatura</th>
              <th class="th-center white-space">Nº Horas</th>
              <th class="th-center white-space">Tot. Alumnos</th>
              <th v-for="(infoGrupo, index) in infoGrupos" :key="index" class="th-center white-space">
                Grupo {{ infoGrupo.grupo }}<template v-if="aulaReferenciaDeGrupo(infoGrupo.grupo)"> ({{ aulaReferenciaDeGrupo(infoGrupo.grupo) }})</template>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(asignatura) in asignaturas" :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`">
              <td>{{ asignatura.nombre }}<template v-if="aulaDesdobleDeAsignatura(asignatura.nombre)"> ({{ aulaDesdobleDeAsignatura(asignatura.nombre) }})</template></td>
              <td class="th-center">{{ asignatura.horas }}</td>
              <td class="th-center">{{ calcularTotal(asignatura.numeroAlumnosEnGrupo) }}</td>
              <td v-for="infoGrupo in infoGrupos" :key="infoGrupo.grupo" class="th-center">
                {{ asignatura.numeroAlumnosEnGrupo[infoGrupo.grupo] || "-" }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="!loading" class="empty-state">
          No hay asignaturas disponibles para el curso y etapa seleccionados.
        </p>
      </section>
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
import {computed, onMounted, onUnmounted, ref} from 'vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import SchoolManagerNav from '@/components/school_manager/SchoolManagerNav.vue';
import { cargarAsignaturasUnicas, obtenerCantidadAlumnosEnGrupoPorAsignatura, obtenerTodosGrupos, obtenerCursoAcademicoSeleccionado, obtenerEspaciosFijoAsignados, obtenerEspaciosDesdobleAsignados, obtenerBloquesConAsignaturas } from '@/services/schoolManager.js';
import { IonToast } from '@ionic/vue';
import { crearToast } from '@/utils/toast.js';

// Variables reactivas
const cursoAcademico = ref('');
const filtroSeleccionado = ref({ curso: null, etapa: '' });
const filtroSeleccionadoString = ref('');
const asignaturas = ref([]);
const infoGrupos = ref([]);
const loading = ref(false);
// Aulas de referencia (espacios fijos asignados a cada curso/etapa/grupo) y aulas de desdoble
// (espacios asignados por bloque/asignatura). Se reutilizan los endpoints existentes de la ventana
// de creación de grupos; no hace falta tocar el backend.
const espaciosFijoAsignados = ref([]);
const desdoblesAsignados = ref([]);
const bloquesCursoEtapa = ref([]);
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
 * Aula de referencia (espacio fijo) asignada a un grupo del curso/etapa seleccionado.
 * Devuelve el nombre del aula o null si ese grupo no tiene aula de referencia asignada.
 */
const aulaReferenciaDeGrupo = (grupo) => {
  const { curso, etapa } = filtroSeleccionado.value;
  if (!curso || !etapa || !grupo) {
    return null;
  }
  const espacio = espaciosFijoAsignados.value.find(
    (e) => String(e.curso) === String(curso) && e.etapa === etapa && e.grupo === grupo
  );
  return espacio?.nombre ?? null;
};

/**
 * Mapa nombreAsignatura -> aula de desdoble, restringido a los bloques del curso/etapa seleccionado
 * (cada optativa de un bloque puede tener asignada un aula de desdoble).
 */
const aulasDesdoblePorAsignatura = computed(() => {
  const idsBloques = new Set(bloquesCursoEtapa.value.map((b) => String(b.bloqueId)));
  const mapa = {};
  for (const desdoble of desdoblesAsignados.value) {
    if (desdoble && desdoble.asignatura && idsBloques.has(String(desdoble.bloqueId))) {
      mapa[desdoble.asignatura] = desdoble.nombre;
    }
  }
  return mapa;
});

// Aula de desdoble asignada a una optativa concreta (o null si no tiene).
const aulaDesdobleDeAsignatura = (nombreAsignatura) =>
  aulasDesdoblePorAsignatura.value[nombreAsignatura] ?? null;

/**
 * Carga las aulas de referencia (espacios fijos) y de desdoble del curso/etapa seleccionado,
 * reutilizando los endpoints existentes. El curso académico activo lo resuelve el backend.
 */
const cargarEspaciosYAulas = async () => {
  const { curso, etapa } = filtroSeleccionado.value;
  if (!curso || !etapa) {
    espaciosFijoAsignados.value = [];
    desdoblesAsignados.value = [];
    bloquesCursoEtapa.value = [];
    return;
  }
  try {
    const [fijos, desdobles, bloques] = await Promise.all([
      obtenerEspaciosFijoAsignados(toastMessage, toastColor, isToastOpen),
      obtenerEspaciosDesdobleAsignados(toastMessage, toastColor, isToastOpen),
      obtenerBloquesConAsignaturas(curso, etapa, toastMessage, toastColor, isToastOpen),
    ]);
    espaciosFijoAsignados.value = Array.isArray(fijos) ? fijos : [];
    desdoblesAsignados.value = Array.isArray(desdobles) ? desdobles : [];
    bloquesCursoEtapa.value = Array.isArray(bloques) ? bloques : [];
  } catch (error) {
    console.error(error);
    espaciosFijoAsignados.value = [];
    desdoblesAsignados.value = [];
    bloquesCursoEtapa.value = [];
  }
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
    espaciosFijoAsignados.value = [];
    desdoblesAsignados.value = [];
    bloquesCursoEtapa.value = [];
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

    // Carga las aulas de referencia y de desdoble del curso/etapa seleccionado.
    await cargarEspaciosYAulas();

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

const sincronizarCursoAcademico = async () => {
  try {
    const curso = (await obtenerCursoAcademicoSeleccionado(isToastOpen, toastMessage, toastColor))?.trim();
    if (curso) {
      cursoAcademico.value = curso;
      localStorage.setItem('cursoAcademicoSeleccionado', curso);
      return;
    }
  } catch (error) {
    console.error(error);
  }
  cursoAcademico.value = localStorage.getItem('cursoAcademicoSeleccionado') || '';
};

const onCursoAcademicoCambiado = (event) => {
  cursoAcademico.value = event.detail?.cursoAcademico || '';
  if (cursoAcademico.value) {
    localStorage.setItem('cursoAcademicoSeleccionado', cursoAcademico.value);
  }
};

onMounted(async () => {
  await sincronizarCursoAcademico();
  window.addEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
  cargarAsignatura();
});

onUnmounted(() => {
  window.removeEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
});
</script>

<style scoped>
.school-manager-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  font-family: "Roboto", sans-serif;
}

.page-header {
  margin-bottom: 1.75rem;
  width: 100%;
}

.t-1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  text-align: center;
}

.page-subtitle {
  margin: 0;
}

.main-panel {
  background-color: var(--form-bg-light);
  border: 1px solid #444;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 8px 24px;
  padding: 1.5rem;
}

.panel-section {
  width: 100%;
}

.section-title {
  margin: 0 0 1.25rem;
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-color-light);
}

.section-title-inline {
  text-align: left;
  margin-bottom: 0.35rem;
}

.listado-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.listado-header-left {
  flex: 1;
  min-width: 200px;
}

.datos-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.texto-dropdown {
  font-size: 1rem;
}

.cargar {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1rem;
}

.mensajeError {
  color: #dc3545;
  margin-bottom: 1rem;
}

.table-scroll {
  width: 100%;
  max-height: 360px;
  overflow: auto;
}

.table-asignaturas {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 13px;
}

.table-asignaturas th,
.table-asignaturas td {
  border: 2px solid #007bff;
  padding: 8px 10px;
}

.table-asignaturas th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

.table-asignaturas td {
  background-color: #e9f5ff;
  height: 38px;
}

.table-asignaturas tr:hover td {
  background-color: #d0eaff;
}

.th-center {
  text-align: center;
}

.white-space {
  white-space: nowrap;
}

.empty-state {
  margin: 0;
  padding: 1.25rem;
  text-align: center;
  color: #666;
  background-color: #f8f9fa;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .section-title { color: var(--text-color-dark); }
  .page-subtitle, .empty-state { color: #c8c8c8; }
  .empty-state { background-color: #2a302b; border-color: #555; }
}

@media (max-width: 768px) {
  .school-manager-page { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .listado-header { flex-direction: column; align-items: stretch; }
  .datos-controls { flex-direction: column; align-items: stretch; }
  .table-asignaturas { font-size: 14px; min-width: 480px; }
}
</style>
