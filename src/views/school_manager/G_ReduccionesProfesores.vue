<template>
  <div class="school-manager-page">
    <header class="page-header">
      <h1 class="t-1">Reducciones<span v-if="cursoAcademico"> ({{ cursoAcademico }})</span></h1>
      <SchoolManagerNav>
        <p class="page-subtitle">
          Asigna reducciones horarias a los profesores del centro.
        </p>
        <template #next>
          <button type="button" class="btn-eleccion-horario" @click="irAEleccionHorario">
            Elegir horario del profesorado &gt;&gt;
          </button>
        </template>
      </SchoolManagerNav>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Reducciones</h2>
        <div class="top-section">
          <article class="action-card card-tabla-reduccion">
            <h3 class="card-title">Tabla de reducciones</h3>
            <div class="card-body">
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Horas</th>
                      <th>Asigna dirección</th>
                      <th>Curso/Etapa/Grupo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(reduccion, index) in reduccionesExpandidas" :key="index">
                      <td>{{ reduccion.nombre }}</td>
                      <td>{{ reduccion.horas }}</td>
                      <td>{{ reduccion.decideDireccion === true ? 'Si' : 'No' }}</td>
                      <td>{{ reduccion.cursoEtapaGrupoLabel }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="field-hint">
                Las reducciones se crean y se cargan por CSV desde «Configuración básica → Crear → Reducciones».
              </p>
            </div>
          </article>
        </div>

        <div class="panel-divider" aria-hidden="true"></div>

        <h2 class="section-title">Asignación de reducciones</h2>
        <div class="top-section">
          <article class="action-card card-crea-reduccion">
            <h3 class="card-title">Asignar reducción</h3>
            <div class="card-body">
              <div class="field">
                <label for="profesor-select">Profesor:</label>
                <select
                    id="profesor-select"
                    v-model="profesorSeleccionado"
                    class="custom-select">
                    <option value="" disabled hidden>Selecciona un profesor</option>
                    <option
                        v-for="profesor in listaProfesores"
                        :key="profesor"
                        :value="profesor">
                        {{ profesor.nombre }} {{ profesor.apellidos }}
                    </option>
                </select>
              </div>
              <div class="field">
                <label for="reduccion-select">Reducción:</label>
                <select
                    id="reduccion-select"
                    v-model="reduccionSeleccionada"
                    class="custom-select">
                    <option value="" disabled hidden>Selecciona una reducción</option>
                    <option
                        v-for="(reduccion, index) in reduccionesExpandidas"
                        :key="index"
                        :value="reduccion">
                        {{ reduccion.esTutoria
                          ? `${reduccion.nombre} — ${reduccion.cursoEtapaGrupoLabel} (${reduccion.horas} horas)`
                          : `${reduccion.nombre} (${reduccion.horas} horas)` }}
                    </option>
                </select>
              </div>
              <button type="button" @click="asignarReduccion(profesorSeleccionado)" class="btn-primary">Asignar</button>
            </div>
          </article>

          <article class="action-card card-cargar-reduccion">
            <h3 class="card-title">Reducciones asignadas</h3>
            <div class="card-body">
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Profesor</th>
                      <th>Reducción</th>
                      <th>Horas</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(reduccionAsignada, index) in listaReduccionesAsignadas" :key="index">
                      <td>{{ reduccionAsignada.nombre }} {{ reduccionAsignada.apellidos }}</td>
                      <td>{{ reduccionAsignada.nombreReduccion }}</td>
                      <td>{{ reduccionAsignada.horas }}</td>
                      <td>
                        <button type="button" @click="borrarReduccionProfesor(index)" class="btn-delete">&times;</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>
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
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonToast } from "@ionic/vue";
import { crearToast } from '@/utils/toast.js';
import { cargarReducciones, asignarReducciones, obtenerReduccionesProfesores, borrarReduccionesProfesores, obtenerCursoAcademicoSeleccionado, obtenerCursosEtapasGrupos } from '@/services/schoolManager.js';
import SchoolManagerNav from '@/components/school_manager/SchoolManagerNav.vue';

const router = useRouter();

const cursoAcademico = ref('');
const listaReducciones = ref([]);
const listaProfesores = ref([]);
const profesorSeleccionado = ref('');
const reduccionSeleccionada = ref('');
const listaReduccionesAsignadas = ref([]);
// Combinaciones curso/etapa/grupo disponibles (misma fuente que usa el desplegable de tutorías de Configuración
// básica). Se usa para desglosar las reducciones de tutoría por grupo en la tabla y en el desplegable.
const cursosEtapasGrupos = ref([]);

// Grupo "catálogo" (curso/etapa registrado sin grupos reales): se excluye para dejar solo grupos reales (A, B, …).
const GRUPO_CATALOGO = '-';

// Una reducción es de TUTORÍA si está vinculada a curso/etapa o si su nombre sigue el patrón "Tutoría …"
// (las tutorías por CSV se persisten con el nombre sintetizado, así que el nombre es un criterio fiable).
const esReduccionTutoria = (r) => {
  if (r.curso != null && r.etapa != null) return true;
  const nombre = (r.nombre || '').trim().toLowerCase();
  return nombre.startsWith('tutoría') || nombre.startsWith('tutoria');
};

// Lista de reducciones lista para pintar/elegir:
//  - NO tutoría: una entrada, sin curso/etapa/grupo (se mostrará "N/A").
//  - Tutoría ya desglosada por el backend (curso+etapa+grupo): se respeta tal cual.
//  - Tutoría sin grupo concreto: se desglosa en una entrada por cada curso/etapa/grupo disponible
//    (filtrando por curso/etapa si la reducción los indica). SUPUESTO documentado: si el backend aún no
//    devuelve las tutorías desglosadas por grupo, el desglose se hace en frontend con cursosEtapasGrupos.
const reduccionesExpandidas = computed(() => {
  const combos = cursosEtapasGrupos.value;
  const filas = [];
  for (const r of listaReducciones.value) {
    if (!esReduccionTutoria(r)) {
      filas.push({ ...r, esTutoria: false, curso: null, etapa: null, grupo: null, cursoEtapaGrupoLabel: 'N/A' });
      continue;
    }
    if (r.curso && r.etapa && r.grupo) {
      filas.push({ ...r, esTutoria: true, cursoEtapaGrupoLabel: `${r.curso}º ${r.etapa} ${r.grupo}` });
      continue;
    }
    const relevantes = (r.curso && r.etapa)
      ? combos.filter((c) => String(c.curso) === String(r.curso) && c.etapa === r.etapa)
      : combos;
    if (relevantes.length === 0) {
      const label = (r.curso && r.etapa) ? `${r.curso}º ${r.etapa}` : (r.nombre || 'Tutoría');
      filas.push({ ...r, esTutoria: true, cursoEtapaGrupoLabel: label });
      continue;
    }
    for (const c of relevantes) {
      filas.push({
        ...r,
        esTutoria: true,
        curso: c.curso,
        etapa: c.etapa,
        grupo: c.grupo,
        cursoEtapaGrupoLabel: `${c.curso}º ${c.etapa} ${c.grupo}`
      });
    }
  }
  return filas;
});
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const cargarReduccion = async () => {
  try {

    const response = await cargarReducciones(toastMessage, toastColor, isToastOpen);
    listaReducciones.value = response;

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const cargarCursosEtapasGrupos = async () => {
  try {
    const data = await obtenerCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
    const lista = Array.isArray(data) ? data : [];
    const vistos = new Set();
    const resultado = [];
    for (const item of lista) {
      if (!item || !item.grupo || item.grupo === GRUPO_CATALOGO || item.grupo === 'Sin grupo') {
        continue;
      }
      const clave = `${item.curso}-${item.etapa}-${item.grupo}`;
      if (vistos.has(clave)) {
        continue;
      }
      vistos.add(clave);
      resultado.push({ curso: item.curso, etapa: item.etapa, grupo: item.grupo });
    }
    resultado.sort((a, b) => {
      if (a.curso !== b.curso) return a.curso - b.curso;
      if (a.etapa !== b.etapa) return (a.etapa || '').localeCompare(b.etapa || '');
      return (a.grupo || '').localeCompare(b.grupo || '');
    });
    cursosEtapasGrupos.value = resultado;
  } catch (error) {
    // Un catálogo vacío es un estado válido; dejamos la lista vacía sin toast de error.
    cursosEtapasGrupos.value = [];
    console.error(error);
  }
};

const obtenerProfesor = async () => {

  try {

    //TODO const response = await obtenerProfesores(toastMessage, toastColor, isToastOpen);
    listaProfesores.value = Array.isArray(response) ? response : [];

    profesorSeleccionado.value = '';

    // El backend devuelve 200 con lista vacía cuando el servicio de profesores (Firebase) no está disponible,
    // para no romper la vista. Mostramos un aviso suave (no alarmante) en lugar de un toast de error: el resto
    // de la pantalla (reducciones y asignaciones) sigue funcionando con normalidad.
    if (listaProfesores.value.length === 0) {
      mensajeColor = 'medium';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'No hay profesores disponibles ahora mismo. Si el servicio de profesores no está accesible, podrás asignar reducciones cuando vuelva a estarlo.');
    }

  } catch (error) {
    // Ante un fallo inesperado tampoco rompemos la vista: dejamos la lista vacía y avisamos de forma suave.
    listaProfesores.value = [];
    mensajeColor = 'warning';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'No se pudo cargar la lista de profesores. El resto de la vista funciona con normalidad.');
    console.error(error);
  }
};

const asignarReduccion = async (profesor) => {
  try {

    if (!profesorSeleccionado.value || !reduccionSeleccionada.value) {
      mensajeActualizacion = 'Por favor, selecciona un profesor y una reducción.';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    for(const i in listaReduccionesAsignadas.value) {
      if (listaReduccionesAsignadas.value[i].email === profesor.email && listaReduccionesAsignadas.value[i].nombreReduccion === reduccionSeleccionada.value.nombre) {
        mensajeActualizacion = 'El profesor ya tiene asignada esta reducción.';
        mensajeColor = 'warning';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
        return;
      }
    }

    const horas = reduccionSeleccionada.value.horas;
    const reduccion = reduccionSeleccionada.value.nombre;

    const response = await asignarReducciones(profesor.email, reduccion, horas, toastMessage, toastColor, isToastOpen);
    
    await obtenerReduccionProfesor();
    
    if(response.ok) {
      mensajeActualizacion = "Reducción asignada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeActualizacion = 'Error al asignar la reducción.';
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const obtenerReduccionProfesor = async () => {

  try {

    const response = await obtenerReduccionesProfesores(toastMessage, toastColor, isToastOpen);
    listaReduccionesAsignadas.value = response;
    profesorSeleccionado.value = '';
    reduccionSeleccionada.value = '';

    if(response.length < 0) {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

  } catch (error) {
    mensajeColor = 'danger';
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const borrarReduccionProfesor = async (index) => {
  try {
    
    const registro = listaReduccionesAsignadas.value[index];
    
    if (!registro) {
      mensajeActualizacion = 'Reducción no encontrada';
      mensajeColor = 'warning';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }
    const email = registro.email;
    const nombreRe = registro.nombreReduccion;
    const horasRe = registro.horas;

    const response = await borrarReduccionesProfesores(email, nombreRe, horasRe, toastMessage, toastColor, isToastOpen);

    if(response.ok) {
      mensajeActualizacion = "Reducción eliminada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await obtenerReduccionProfesor();

  } catch (error) {
    mensajeActualizacion = 'Error al eliminar la reducción.';
    mensajeColor = 'danger';  
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const irAEleccionHorario = () => {
  router.push({ name: 'A_EleccionDeHorarios' });
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

const onCursoAcademicoCambiado = async (event) => {
  cursoAcademico.value = event.detail?.cursoAcademico || '';
  if (cursoAcademico.value) {
    localStorage.setItem('cursoAcademicoSeleccionado', cursoAcademico.value);
  }
  // Las reducciones y los grupos van scoped por curso académico: al cambiarlo recargamos ambos.
  await cargarCursosEtapasGrupos();
  await cargarReduccion();
};

onMounted(async () => {
  await sincronizarCursoAcademico();
  window.addEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
  await cargarCursosEtapasGrupos();
  await cargarReduccion();
  await obtenerProfesor();
  await obtenerReduccionProfesor();
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

.subtitle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-eleccion-horario {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  background-color: #2196f3;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.btn-eleccion-horario:hover {
  background-color: #1976d2;
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

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
  align-items: stretch;
}

.action-card {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  padding: 1.25rem 1rem 1rem;
  box-sizing: border-box;
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.35;
  color: #1a1a1a;
}

.card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.card-crea-reduccion {
  flex: 1 1 360px;
  min-width: 300px;
}

.card-cargar-reduccion {
  flex: 2 1 520px;
  min-width: 300px;
}

.texto-dropdown {
  font-size: 1rem;
}

.form-input {
  border: 2px solid #007bff;
  border-radius: 6px;
  background: white;
  --background: white;
  --color: #000;
  --padding-start: 10px;
  --padding-end: 10px;
}

.custom-select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  font-size: 15px;
  border: 2px solid #007bff;
  border-radius: 6px;
  background-color: white;
  color: #000;
  outline: none;
  cursor: pointer;
}

.custom-select:hover {
  border-color: #0056b3;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.35);
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #2196f3;
  cursor: pointer;
}

.btn-primary {
  width: 100%;
  margin-top: auto;
  padding: 12px;
  font-size: 14px;
  font-weight: bold;
  background-color: #2196f3;
  border-radius: 6px;
  text-transform: uppercase;
  border: none;
  color: white;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-primary:disabled {
  background-color: #7fa9f4;
  cursor: not-allowed;
}

.btn-delete {
  padding: 2px 9px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  font-size: 16px;
  line-height: 1.2;
  cursor: pointer;
}

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cfd8e3 15%, #cfd8e3 85%, transparent);
  margin: 1.75rem 0;
}

.table-scroll {
  width: 100%;
  max-height: 360px;
  overflow: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  background-color: #f8f9fa;
  color: #1a1a1a;
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 13px;
}

th, td {
  border: 2px solid #007bff;
  padding: 8px 10px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
  /* Con border-collapse el borde se desplaza al hacer scroll; el box-shadow
     mantiene la línea de separación visible bajo la cabecera fija. */
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

td {
  background-color: #e9f5ff;
  height: 38px;
}

tr:hover td {
  background-color: #d0eaff;
}

.csv-section {
  margin-top: 1.25rem;
}

.card-cargar-csv {
  flex: 1 1 100%;
}

.csv-body {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.field-hint {
  font-size: 0.8rem;
  color: #666;
}

.fondo-gris {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circulo {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  z-index: 9999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .section-title { color: var(--text-color-dark); }
  .page-subtitle { color: #c8c8c8; }
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label, .checkbox-field { color: var(--text-color-dark); }
  .field-hint { color: #c8c8c8; }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

@media (max-width: 768px) {
  .school-manager-page { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .top-section { flex-direction: column; }
  .csv-body { grid-template-columns: 1fr; }
  table { font-size: 14px; }
}
</style>
