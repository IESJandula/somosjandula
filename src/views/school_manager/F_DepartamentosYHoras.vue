<template>
  <div class="school-manager-page">
    <header class="page-header">
      <h1 class="t-1">Asignaturas y departamentos<span v-if="cursoAcademico"> ({{ cursoAcademico }})</span></h1>
      <SchoolManagerNav>
        <p class="page-subtitle">
          Asigna asignaturas a departamentos propietarios y receptores y ajusta la plantilla de cada departamento.
        </p>
      </SchoolManagerNav>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Asignaturas y departamentos</h2>
        <div class="top-card">
          <article class="action-card card-asignacion">
            <h3 class="card-title">Asignar asignaturas a departamentos</h3>
            <div class="card-body">
              <div class="field">
                <label>Filtrar por curso, etapa y grupo</label>
                <select
                    id="curso-etapa-grupo-select"
                    v-model="cursosEtapasGruposSeleccionado"
                    @change="actualizarCurso(cursosEtapasGruposSeleccionado)"
                    class="curso-etapa-grupo-select texto-dropdown">
                  <option value="">Selecciona un curso-etapa-grupo</option>
                  <option
                      v-for="item in cursosEtapasGruposFiltrados"
                      :key="`${item.curso}-${item.etapa}-${item.grupo}`"
                      :value="item">
                    {{ item.curso }} - {{ item.etapa }} - {{ item.grupo }}
                  </option>
                </select>
              </div>
              <div class="top-section">
                <ul v-if="asignaturas.length > 0" class="lista-asignaturas">
                  <li v-for="asignatura in asignaturas" :key="asignatura.id" class="item-asignatura">
                    <label>
                      <input
                          type="checkbox"
                          class="checkbox"
                          name="asignaturas"
                          :value="asignatura"
                          v-model="asignaturaSeleccionada">
                      {{ asignatura.nombreAsignaturas }}<template v-if="horasDeAsignatura(asignatura) !== null"> ({{ horasDeAsignatura(asignatura) }})</template>
                    </label>
                  </li>
                </ul>
                <p v-else-if="cursosEtapasGruposSeleccionado && hayAsignaturasParaSeleccion" class="lista-asignaturas-vacia">
                  Todas las asignaturas han sido asignadas
                </p>
                <p v-else-if="cursosEtapasGruposSeleccionado" class="lista-asignaturas-vacia">
                  Aún no se han cargado las asignaturas
                </p>
                <div class="form-groups">
                  <div class="field">
                    <label for="depPropietario-select">Departamento propietario:</label>
                    <select
                      id="depPropietario-select"
                      v-model="depPropietarioSeleccionado"
                      class="custom-select">
                      <option value="" disabled hidden>Selecciona un dpto</option>
                      <option
                          v-for="departamento in departamentos"
                          :key="departamento.nombre"
                          :value="departamento.nombre">
                        {{ departamento.nombre }}
                      </option>
                    </select>
                  </div>
                  <div class="field">
                    <label for="depReceptor-select">Departamento receptor:</label>
                    <select
                      id="depReceptor-select"
                      v-model="depReceptorSeleccionado"
                      class="custom-select">
                      <option value="" disabled hidden>Selecciona un dpto</option>
                      <option
                        v-for="departamento in departamentos"
                        :key="departamento.nombre"
                        :value="departamento.nombre">
                        {{ departamento.nombre }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <button type="button" @click="asignarDepPropietario" class="btn-primary">Asignar</button>
            </div>
          </article>

          <article class="action-card card-departamentos-asignaturas">
            <h3 class="card-title">Tabla de asignaturas y departamentos</h3>
            <div class="card-body">
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Curso-etapa-grupo</th>
                      <th>Asignaturas</th>
                      <th>Horas</th>
                      <th>Departamento propietario</th>
                      <th>Departamento receptor</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(registro, index) in listaAsignaturasDepartamentos" :key="index">
                      <td>{{ registro.curso }} {{ registro.etapa }} {{ registro.grupo }}</td>
                      <td>{{ registro.nombre }}</td>
                      <td>{{ registro.horas }}</td>
                      <td>{{ registro.departamentoPropietario }}</td>
                      <td>{{ registro.departamentoDonante }}</td>
                      <td>
                        <button type="button" @click="eliminarAsignaturaDepartamento(index)" class="btn-delete">&times;</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>

        <div class="panel-divider" aria-hidden="true"></div>

        <h2 class="section-title">Profesores y departamentos</h2>
        <div class="top-card">
          <article class="action-card card-asignacion">
            <h3 class="card-title">Profesores en plantilla</h3>
            <div class="card-body">
              <div class="field">
                <label for="departamento-select">Departamento:</label>
                <select
                  id="departamento-select"
                  v-model="departamentoSeleccionado"
                  class="custom-select">
                  <option value="" disabled hidden>Selecciona un departamento</option>
                  <option
                    v-for="departamento in departamentos"
                    :key="departamento.nombre"
                    :value="departamento.nombre">
                    {{ departamento.nombre }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label for="plantilla-input">Plantilla:</label>
                <ion-input id="plantilla-input" type="number" v-model.number="plantillaPorAsignatura" min="1" max="50" step="1" class="form-input-numer"/>
              </div>
              <button type="button" @click="asignarProfesorADepartamento(departamentoSeleccionado)" class="btn-primary">Asignar</button>
            </div>
          </article>

          <article class="action-card card-departamentos-asignaturas">
            <h3 class="card-title">Tabla de departamentos</h3>
            <div class="card-body">
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Departamentos</th>
                      <th>Plantilla propuesta por sistema</th>
                      <th>Plantilla asignada por usuario</th>
                      <th>Horas plantilla</th>
                      <th>Horas asignaturas</th>
                      <th>Desfase</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="departamento in listaDepartamentosIterable" :key="departamento.nombre">
                      <td>{{ departamento.nombre }}</td>
                      <td>{{ departamento.plantillaPropuesta ?? '-' }}</td>
                      <td>{{ departamento.plantilla }}</td>
                      <td>{{ departamento.horasPlantilla }}</td>
                      <td>{{ departamento.horasAsignaturas }}</td>
                      <td>{{ departamento.desfase }}</td>
                      <td :class="{
                        'texto-amarillo': departamento.desfase > 0,
                        'texto-rojo': departamento.desfase < 0,
                        'texto-verde': departamento.desfase === 0
                      }">{{ departamento.resultado }}</td>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { IonInput, IonToast } from "@ionic/vue";
import { asignarAsignaturasADepartamentos, 
         asignarProfesoresADepartamentos, 
         obtenerAsignaturasPorCursoEtapaGrupo, 
         obtenerCursosEtapasGrupos,
         obtenerDatosDepartamentosConAsignaturas, 
         obtenerDepartamentos, 
         obtenerTodasLasAsignaturas, 
         quitarAsignaturasDeDepartamentos,
         obtenerCursoAcademicoSeleccionado } from '@/services/schoolManager.js';
import SchoolManagerNav from '@/components/school_manager/SchoolManagerNav.vue';
import { crearToast } from '@/utils/toast.js';

// Horas lectivas estándar por profesor a jornada completa (debe coincidir con
// Constants.HORAS_LECTIVAS_PROFESOR del backend).
const HORAS_LECTIVAS_PROFESOR = 18;

// Grupos "no docentes" del backend (Constants.SIN_GRUPO_ASIGNADO y Constants.GRUPO_CATALOGO_CURSO_ETAPA):
// representan filas de catálogo curso/etapa SIN grupos reales creados. El grupo de optativas
// (Constants.GRUPO_OPTATIVAS = "Optativas") sí debe mostrarse porque es un bloque de optativas.
const GRUPO_SIN_ASIGNAR = 'Sin grupo';
const GRUPO_CATALOGO_CURSO_ETAPA = '-';

const cursoAcademico = ref('');
const departamentos = ref([]);
const departamentoSeleccionado = ref('');
const plantillaPorAsignatura = ref('');
const cursosEtapasGrupos = ref([]);
const cursosEtapasGruposSeleccionado = ref('');
const asignaturas = ref([]);
const asignaturaSeleccionada = ref([]);
// Listado completo de asignaturas del sistema (AsignaturaInfoDto). Lo usamos para distinguir, en el
// estado vacío del listado, si para el curso/etapa/grupo seleccionado todavía NO hay asignaturas
// cargadas o si las hay pero ya están todas asignadas.
const todasLasAsignaturas = ref([]);

// Solo deben aparecer en el desplegable los curso/etapa/grupo que tengan grupos reales creados
// o que sean bloques de optativas; se excluyen las filas de catálogo curso/etapa sin grupos.
const cursosEtapasGruposFiltrados = computed(() =>
  cursosEtapasGrupos.value.filter(item =>
    item && item.grupo && item.grupo !== GRUPO_SIN_ASIGNAR && item.grupo !== GRUPO_CATALOGO_CURSO_ETAPA
  )
);

// Indica si el curso/etapa/grupo seleccionado tiene alguna asignatura en el sistema (asignada o no).
// Si no tiene ninguna, es que aún no se han cargado las asignaturas para esa selección.
const hayAsignaturasParaSeleccion = computed(() => {
  const seleccion = cursosEtapasGruposSeleccionado.value;
  if (!seleccion) {
    return false;
  }
  return todasLasAsignaturas.value.some(asignatura =>
    String(asignatura.curso) === String(seleccion.curso) &&
    asignatura.etapa === seleccion.etapa &&
    asignatura.grupo === seleccion.grupo
  );
});
// Mapa "curso|etapa|grupo|nombre" -> horas, construido a partir del endpoint
// de todas las asignaturas (AsignaturaInfoDto sí incluye las horas), ya que el
// listado por curso/etapa/grupo solo devuelve el nombre.
const horasPorAsignatura = ref({});
const depPropietarioSeleccionado = ref('');
const depReceptorSeleccionado = ref('');
const listaAsignaturasDepartamentos = ref([]);
const listaDepartamentosIterable = ref([]);
// Propuesta automática de plantilla por departamento (nombre -> nº profesores propuesto)
const propuestasPlantilla = ref({});
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const obtenerDepartamento = async () => {
  try {
    const response = await obtenerDepartamentos(toastMessage, toastColor, isToastOpen);
    departamentos.value = response;

  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const asignarProfesorADepartamento = async (nombreDepartamento) => {
 
  if (nombreDepartamento === '') {
    mensajeActualizacion = "Por favor, selecciona un departamento."; 
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }
  
  if (plantillaPorAsignatura.value === '') {
    mensajeActualizacion = "La plantilla no puede estar vacía.";
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  try {
    const response = await asignarProfesoresADepartamentos(nombreDepartamento, plantillaPorAsignatura.value, toastMessage, toastColor, isToastOpen);
    departamentos.value = response;

    if(response.ok) {
      mensajeActualizacion = "Plantilla actualizada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await obtenerDepartamento();
    await obtenerDatosDepartamentoConAsignatura();

  } catch (error) {
    mensajeActualizacion = "Error al asignar profesor al departamento";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

// Aplica la información de departamentos (desfase + propuesta de plantilla) que devuelve el backend.
const aplicarInfoDepartamentos = (lista) => {
  if (!Array.isArray(lista)) {
    return;
  }

  // Recalculamos en frontend con la nueva semántica de las columnas:
  // - "Horas plantilla"   = 18 x nº de profesores en plantilla del departamento.
  // - "Horas asignaturas" = horas de las asignaturas asignadas al departamento (receptor),
  //                         que el backend devuelve en `horasNecesarias`.
  // - desfase = horasPlantilla - horasAsignaturas (positivo = sobran, 0 = cerrado, negativo = faltan).
  lista.forEach(d => {
    const plantilla = Number(d.plantilla) || 0;
    const horasAsignaturas = Number(d.horasNecesarias) || 0;
    const horasPlantilla = HORAS_LECTIVAS_PROFESOR * plantilla;

    d.horasPlantilla = horasPlantilla;
    d.horasAsignaturas = horasAsignaturas;
    d.desfase = horasPlantilla - horasAsignaturas;
    d.resultado = d.desfase > 0 ? 'Sobran horas' : (d.desfase < 0 ? 'Faltan horas' : 'Cerrado');
  });

  listaDepartamentosIterable.value = lista;

  // Refrescamos la propuesta automática de plantilla por departamento
  const propuestas = {};
  lista.forEach(d => {
    if (d.plantillaPropuesta !== undefined && d.plantillaPropuesta !== null) {
      propuestas[d.nombre] = Number(d.plantillaPropuesta);
    }
  });
  propuestasPlantilla.value = propuestas;

  // Si hay un departamento seleccionado, prerellenamos su propuesta (sigue siendo editable)
  prerellenarPlantillaPropuesta();
};

// Prerellena el campo de plantilla con la propuesta del departamento seleccionado (editable por el usuario).
const prerellenarPlantillaPropuesta = () => {
  const propuesta = propuestasPlantilla.value[departamentoSeleccionado.value];
  if (propuesta !== undefined) {
    plantillaPorAsignatura.value = propuesta;
  }
};

const obtenerDatosDepartamentoConAsignatura = async () => {
  try {
    const response = await obtenerDatosDepartamentosConAsignaturas(
        toastMessage, toastColor, isToastOpen
    );

    aplicarInfoDepartamentos(response);

  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

// Al cambiar de departamento, sugerimos su propuesta de plantilla (el usuario puede modificarla).
watch(departamentoSeleccionado, () => {
  prerellenarPlantillaPropuesta();
});

// Devuelve las horas de una asignatura del listado (según el curso/etapa/grupo
// seleccionado) o null si no se conocen.
const horasDeAsignatura = (asignatura) => {
  const seleccion = cursosEtapasGruposSeleccionado.value;
  if (!seleccion || !asignatura) {
    return null;
  }
  const clave = `${seleccion.curso}|${seleccion.etapa}|${seleccion.grupo}|${asignatura.nombreAsignaturas}`;
  return horasPorAsignatura.value[clave] ?? null;
};

//Asignaturas sin departamento propietario asignado
const obtenerAsignaturas = async () => {
  if (cursosEtapasGruposSeleccionado.value) {
    try {
      const response = await obtenerAsignaturasPorCursoEtapaGrupo(
        cursosEtapasGruposSeleccionado.value.curso,
        cursosEtapasGruposSeleccionado.value.etapa,
        cursosEtapasGruposSeleccionado.value.grupo,
        toastMessage,
        toastColor,
        isToastOpen
      );
      asignaturas.value = response;

    } catch (error) {
      mensajeColor = "danger";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
      console.error(error);
    }
  } else {
    asignaturas.value = [];
  }
};

//Todas las asignaturas
const obtenerAsignaturasCompletas = async () => {
  try {
    const response = await obtenerTodasLasAsignaturas(toastMessage, toastColor, isToastOpen);

    todasLasAsignaturas.value = Array.isArray(response) ? response : [];

    // Indexamos las horas por curso/etapa/grupo/nombre para poder mostrarlas en
    // el listado "Asignar asignaturas a departamentos" (su endpoint no las trae).
    const mapaHoras = {};
    response.forEach(asignatura => {
      if (asignatura.horas !== undefined && asignatura.horas !== null) {
        const clave = `${asignatura.curso}|${asignatura.etapa}|${asignatura.grupo}|${asignatura.nombre}`;
        mapaHoras[clave] = asignatura.horas;
      }
    });
    horasPorAsignatura.value = mapaHoras;

    listaAsignaturasDepartamentos.value = response.filter(asignatura => {
      const receptor = asignatura.departamentoReceptor?.trim();
      const propietario = asignatura.departamentoPropietario?.trim();
      return receptor && receptor.length > 0 || propietario && propietario.length > 0;
    });
    
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

// Carga los curso/etapa/grupo disponibles para el desplegable de "Asignar asignaturas a departamentos".
const obtenerCursosEtapasGruposFiltro = async () => {
  try {
    const response = await obtenerCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
    cursosEtapasGrupos.value = Array.isArray(response) ? response : [];

  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const actualizarCurso = (parametro) => {
  cursosEtapasGruposSeleccionado.value = parametro;
  obtenerAsignaturas()
};

const eliminarAsignaturaDepartamento = async (index) => {
  const registro = listaAsignaturasDepartamentos.value[index];
  if (!registro) {
    mensajeActualizacion = "Registro no encontrado";
    mensajeColor = "warning";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    return;
  }

  const curso = registro.curso;
  const etapa = registro.etapa;
  const grupo = registro.grupo;
  const nombre = registro.nombre;

  try {

    const response = await quitarAsignaturasDeDepartamentos(
      curso,
      etapa,
      grupo,
      nombre,
      toastMessage,
      toastColor,
      isToastOpen
    );

    if(response.ok) {
      mensajeActualizacion = "Asignatura desasignada correctamente";
      mensajeColor = "success"; 
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await obtenerAsignaturasCompletas();
    await obtenerAsignaturas();
    await obtenerDatosDepartamentoConAsignatura();
    await obtenerDepartamento();

  } catch (error) {
    mensajeActualizacion = "Error al desasignar la asignatura del departamento";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const asignarDepPropietario = async () => {
  
  try{
    
    if (asignaturaSeleccionada.value.length === 0) {
      mensajeActualizacion = "No se ha seleccionado ninguna asignatura.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    if (depPropietarioSeleccionado.value === '' || depReceptorSeleccionado.value === '') {
      mensajeActualizacion = "No se ha seleccionado ningún departamento propietario o departamento donante.";
      mensajeColor = "warning";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    let response = null;

    for (const asignatura of asignaturaSeleccionada.value)
    {
      const nombreAsignatura = asignatura.nombreAsignaturas;
      response = await asignarAsignaturasADepartamentos(
        cursosEtapasGruposSeleccionado.value.curso,
        cursosEtapasGruposSeleccionado.value.etapa,
        cursosEtapasGruposSeleccionado.value.grupo,
        nombreAsignatura,
        depPropietarioSeleccionado.value,
        depReceptorSeleccionado.value,
        toastMessage,
        toastColor,
        isToastOpen
      );
    }

    if(response.ok) {
      mensajeActualizacion = "Asignación realizada correctamente.";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      // El backend devuelve el estado recalculado de los departamentos junto con la
      // propuesta automática de plantilla. Lo aplicamos directamente (sigue siendo editable).
      try {
        const infoDepartamentos = await response.json();
        aplicarInfoDepartamentos(infoDepartamentos);
      } catch (parseError) {
        console.warn("No se pudo leer la propuesta de plantilla de la respuesta", parseError);
      }

    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    asignaturaSeleccionada.value = [];
    if (asignaturas.value.length > 0) {
      asignaturas.value = [];
    }
    await obtenerAsignaturas()
    await obtenerAsignaturasCompletas()
    await obtenerDatosDepartamentoConAsignatura()
    
  } catch (error) {
    mensajeActualizacion = "Error al asignar departamentos a las asignaturas";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
}

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
  await obtenerDepartamento();
  await obtenerCursosEtapasGruposFiltro();
  await obtenerAsignaturasCompletas();
  await obtenerDatosDepartamentoConAsignatura();
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

.top-card {
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

.card-asignacion {
  flex: 1 1 380px;
  min-width: 320px;
}

.card-departamentos-asignaturas {
  flex: 2 1 560px;
  min-width: 320px;
}

.texto-dropdown {
  font-size: 1rem;
}

.curso-etapa-grupo-select {
  width: 100%;
  max-width: 270px;
  padding: 0.5rem;
  border: 1px solid #cfd8e3;
  border-radius: 5px;
  background-color: #fff;
  color: #000;
  cursor: pointer;
}

.top-section {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
  flex-wrap: wrap;
}

.lista-asignaturas {
  flex: 1;
  min-width: 200px;
  list-style: none;
  margin: 0;
  padding: 0.4rem;
  max-height: 12rem;
  overflow: auto;
  border: 1px solid #cfd8e3;
  border-radius: 8px;
  background-color: #fff;
}

.item-asignatura {
  padding: 0.35rem 0.5rem;
}

.lista-asignaturas-vacia {
  flex: 1;
  min-width: 200px;
  margin: 0;
  padding: 1.25rem 1rem;
  text-align: center;
  align-self: center;
  color: #666;
  background-color: #fff;
  border: 1px dashed #cfd8e3;
  border-radius: 8px;
  font-size: 0.95rem;
}

.checkbox {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.form-groups {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 280px;
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

.form-input-numer {
  max-width: 120px;
  text-align: center;
  border: 2px solid #007bff;
  border-radius: 6px;
  background: white;
  --background: white;
  --color: #000;
  --padding-start: 10px;
  --padding-end: 10px;
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
  min-width: 110px;
}

th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: inset 0 -2px 0 #007bff, inset 0 2px 0 #007bff;
}

td {
  background-color: #e9f5ff;
  height: 38px;
}

tr:hover td {
  background-color: #d0eaff;
}

.texto-verde { color: #2b8f06; font-weight: 600; }
.texto-amarillo { color: #c98a00; font-weight: 600; }
.texto-rojo { color: #dc3545; font-weight: 600; }

@media (prefers-color-scheme: dark) {
  .main-panel {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.08) 0 8px 24px;
    border-color: #444;
  }

  .section-title { color: var(--text-color-dark); }
  .page-subtitle { color: #c8c8c8; }
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label { color: var(--text-color-dark); }
  .lista-asignaturas { background-color: #1e1e1e; border-color: #555; }
  .lista-asignaturas-vacia { background-color: #1e1e1e; border-color: #555; color: #c8c8c8; }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
  .texto-amarillo { color: #FBBF24; }
}

@media (max-width: 768px) {
  .school-manager-page { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .top-card { flex-direction: column; }
  .top-section { flex-direction: column; }
  .form-groups { max-width: 100%; }
  table { font-size: 14px; }
}
</style>
