<template>

  <div class="page-asignaturas-bloques">

    <header class="page-header">

      <h1 class="t-1">

        Asignaturas y bloques<span v-if="cursoAcademico"> ({{ cursoAcademico }})</span>

      </h1>

      <SchoolManagerNav>

        <p class="page-subtitle">

          Gestiona bloques, horas lectivas y opciones de docencia por curso y etapa. Puedes cargar las horas desde un CSV de Séneca.

        </p>

      </SchoolManagerNav>

    </header>



    <div class="main-panel">

      <section class="panel-section">

        <div class="listado-header">

          <div class="listado-header-left">

            <h2 class="section-title section-title-inline">Asignaturas</h2>

            <p v-if="filtroSeleccionado.curso && filtroSeleccionado.etapa" class="listado-context">

              Curso y etapa: <strong>{{ filtroSeleccionado.curso }}-{{ filtroSeleccionado.etapa }}</strong>

            </p>

          </div>

          <div class="datos-controls">

            <FilterCursoEtapa

              v-model="filtroSeleccionadoString"

              @actualizar-select="actualizarSelect"

              selectClass="select-sm"

              class="texto-dropdown"

            />

          </div>

        </div>



        <div v-if="mensajeAsignaturasSinHoras" class="alerta alerta-peligro">

          {{ mensajeAsignaturasSinHoras }}

        </div>



        <div v-if="loading" class="empty-state">Cargando datos...</div>



        <div v-if="bloquesConUnaAsignatura.length > 0" class="alerta alerta-peligro">

          {{ bloquesConUnaAsignatura.length === 1

            ? `El bloque ${bloquesConUnaAsignatura[0]} tiene una asignatura, elimínalo, ya un bloque debe tener al menos dos asignaturas.`

            : `Los bloques ${bloquesConUnaAsignatura.join(", ")} tienen una asignatura, elimínalos, ya que un bloque debe tener al menos dos asignaturas.` }}

        </div>



        <div

          v-if="filtroSeleccionado.curso && filtroSeleccionado.etapa && !loading"

          class="content-layout"

        >

          <div class="table-section">

            <div v-if="asignaturas.length > 0" class="table-scroll">

              <table class="tabla-asignaturas">

                <thead>

                  <tr>

                    <th>Selecciona para crear un bloque</th>

                    <th>Nombre</th>

                    <th>Bloque</th>

                    <th>Sin docencia</th>

                    <th>Desdoble</th>

                    <th>

                      Horas

                      <span class="th-horas-total">({{ totalHoras }})</span>

                    </th>

                    <th>Acciones</th>

                  </tr>

                </thead>

                <tbody>

                  <tr

                    v-for="asignatura in asignaturas"

                    :key="`${asignatura.curso}-${asignatura.etapa}-${asignatura.nombre}`"

                  >

                    <td>

                      <input

                        type="checkbox"

                        class="checkbox"

                        :disabled="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null"

                        v-model="asignaturasSeleccionadas"

                        :value="asignatura"

                      />

                    </td>

                    <td>{{ asignatura.nombre }}</td>

                    <td>

                      <div v-if="asignatura.bloqueId !== undefined && asignatura.bloqueId !== null">

                        Bloque {{ asignatura.bloqueId }}

                        <button type="button" class="btn-delete btn-mini-inline" @click="eliminarBloque(asignatura)">X</button>

                      </div>

                      <span v-else>Sin bloque</span>

                    </td>

                    <td>

                      <input

                        type="checkbox"

                        class="checkbox"

                        v-model="asignatura.sinDocencia"

                        :disabled="tieneBloque(asignatura)"

                        @click="asignaturaSinDocencia(asignatura)"

                      />

                    </td>

                    <td>

                      <input

                        type="checkbox"

                        class="checkbox"

                        v-model="asignatura.desdoble"

                        @click="asignaturasDesdoble(asignatura)"

                      />

                    </td>

                    <td>

                      <input

                        type="number"

                        v-model.number="horasPorAsignatura[asignatura.nombre]"

                        min="1"

                        step="1"

                        class="cell-input cell-input-num"

                      />

                    </td>

                    <td>

                      <button type="button" class="btn-primary btn-mini" @click="guardarHoras(asignatura.nombre)">

                        Actualizar hora

                      </button>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <p v-else class="empty-state">

              No hay asignaturas disponibles para el curso y etapa seleccionados.

            </p>



            <div v-if="asignaturas.length > 0" class="seccion-footer">

              <button

                type="button"

                class="btn-primary btn-mini"

                @click="crearBloque"

                :disabled="asignaturasSeleccionadas.length < 2 || seleccionIncluyeSinDocencia || loading"

              >

                {{ loading ? "Procesando..." : "Crear bloque" }}

              </button>

              <button type="button" class="btn-primary btn-mini" @click="guardarTodasHoras">

                Actualizar horas

              </button>

            </div>

          </div>



          <article class="action-card upload-section">

            <h3 class="card-title">Subir horas (CSV)</h3>

            <div class="card-body">

              <div class="field">

                <label for="csvHorasInput">Adjunta el CSV de Séneca con las horas por asignatura</label>

                <FileUpload ref="fileUploadRef" accept=".csv" @file-selected="monitorizarSiHayArchivo" />

                <p class="upload-hint">El fichero se sube automáticamente al adjuntarlo.</p>

              </div>

            </div>

          </article>

        </div>



        <p

          v-else-if="!loading && (!filtroSeleccionado.curso || !filtroSeleccionado.etapa)"

          class="empty-state"

        >

          Selecciona un curso y etapa para ver las asignaturas.

        </p>

      </section>

    </div>



    <div v-if="isUploadingCsv" class="fondo-gris">

      <div class="circulo"></div>

    </div>



    <ion-toast

      :is-open="isToastOpen"

      :message="toastMessage"

      :color="toastColor"

      duration="2000"

      @did-dismiss="() => (isToastOpen = false)"

      position="top"

    />

  </div>

</template>



<script setup>

import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';

import SchoolManagerNav from '@/components/school_manager/SchoolManagerNav.vue';

import FileUpload from '@/components/printers/FileUpload.vue';

import { crearToast } from '@/utils/toast.js';

import {

  cargarAsignaturas,

  crearBloques,

  eliminarBloques,

  asignaturasSinDocencia,

  asignaturasDesdobles,

  mostrarHoras,

  asignarHoras,

  subirHorasAsignaturasCsv,

  obtenerCursoAcademicoSeleccionado

} from '@/services/schoolManager.js';

import { IonToast } from '@ionic/vue';



const cursoAcademico = ref('');

const filtroSeleccionado = ref({ curso: null, etapa: '' });

const asignaturas = ref([]);

const columnasGrupos = ref([]);

const asignaturasSeleccionadas = ref([]);

const loading = ref(false);

const asignaturasConHoras = ref([]);

const horasPorAsignatura = ref({});

const isProcessing = ref(false);

const bloquesConUnaAsignatura = ref([]);

const filtroSeleccionadoString = ref('');

const archivoSeleccionado = ref(false);

const file = ref(null);

const fileUploadRef = ref(null);

const buttonTextCsv = ref('Rellenar campos para enviar');

const isUploadingCsv = ref(false);

const isToastOpen = ref(false);

const toastMessage = ref('');

const toastColor = ref('success');

let mensajeActualizacion = '';

let mensajeColor = '';



const puedeEnviarCsv = computed(() =>

  archivoSeleccionado.value &&

  filtroSeleccionado.value.curso &&

  filtroSeleccionado.value.etapa

);



const totalHoras = computed(() => {

  const bloquesContados = new Set();

  let total = 0;



  for (const asignatura of asignaturas.value) {

    if (asignatura.sinDocencia) continue;



    const horas = Number(horasPorAsignatura.value[asignatura.nombre]);

    if (!horas || Number.isNaN(horas)) continue;



    const tieneBloque = asignatura.bloqueId !== undefined && asignatura.bloqueId !== null;

    if (tieneBloque) {

      if (bloquesContados.has(asignatura.bloqueId)) continue;

      bloquesContados.add(asignatura.bloqueId);

    }



    total += horas;

  }



  return total;

});



const asignaturaSinHorasAsignadas = (nombre) => {

  const horas = horasPorAsignatura.value[nombre];

  if (horas === null || horas === undefined || horas === '') return true;

  const num = Number(horas);

  return Number.isNaN(num) || num <= 0;

};



const asignaturasSinHoras = computed(() =>

  asignaturas.value

    .filter((asignatura) => asignaturaSinHorasAsignadas(asignatura.nombre))

    .map((asignatura) => asignatura.nombre)

);



const mensajeAsignaturasSinHoras = computed(() => {

  if (

    loading.value ||

    !filtroSeleccionado.value.curso ||

    !filtroSeleccionado.value.etapa ||

    asignaturas.value.length === 0

  ) {

    return '';

  }



  const sinHoras = asignaturasSinHoras.value;

  if (sinHoras.length === 0) return '';



  if (sinHoras.length === 1) {

    return `La asignatura «${sinHoras[0]}» no tiene horas asignadas.`;

  }



  return `Hay ${sinHoras.length} asignaturas sin horas asignadas: ${sinHoras.join(', ')}.`;

});



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



const reiniciarSeleccionVista = () => {

  filtroSeleccionado.value = { curso: null, etapa: '' };

  filtroSeleccionadoString.value = '';

  asignaturas.value = [];

  columnasGrupos.value = [];

  asignaturasConHoras.value = [];

  horasPorAsignatura.value = {};

  asignaturasSeleccionadas.value = [];

  bloquesConUnaAsignatura.value = [];

  comprobarBotonCsv();

};

const onCursoAcademicoCambiado = (event) => {

  cursoAcademico.value = event.detail?.cursoAcademico || '';

  if (cursoAcademico.value) {

    localStorage.setItem('cursoAcademicoSeleccionado', cursoAcademico.value);

  }

  // Al cambiar el curso académico, la selección curso/etapa anterior puede no existir

  // en el nuevo curso académico: limpiamos selección y tablas para forzar recarga

  // con el nuevo contexto (el FilterCursoEtapa recarga sus opciones por su cuenta).

  reiniciarSeleccionVista();

};



const actualizarSelect = (seleccionado) => {

  filtroSeleccionado.value = seleccionado;

  filtroSeleccionadoString.value = `${seleccionado.curso}-${seleccionado.etapa}`;

  comprobarBotonCsv();

};



const comprobarBotonCsv = () => {

  buttonTextCsv.value = puedeEnviarCsv.value ? 'Enviar' : 'Rellenar campos para enviar';

};



const validarCsvHoras = (archivo) => {

  if (!archivo.name.toLowerCase().endsWith('.csv')) {

    return Promise.reject('Solo se permiten archivos .csv');

  }



  return new Promise((resolve, reject) => {

    const reader = new FileReader();



    reader.onload = (event) => {

      const contenido = event.target.result;

      const lineas = contenido.split('\n');

      const encabezados = lineas[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));



      if (!encabezados.includes('Materia')) {

        reject('El CSV no tiene el formato correcto (falta columna Materia)');

        return;

      }

      resolve();

    };



    reader.onerror = () => reject('Error al leer el archivo');

    reader.readAsText(archivo);

  });

};



const monitorizarSiHayArchivo = async (archivo) => {

  archivoSeleccionado.value = !!archivo;



  if (!archivo) {

    file.value = null;

    comprobarBotonCsv();

    return;

  }



  try {

    await validarCsvHoras(archivo);

    const formData = new FormData();

    formData.append('csv', archivo);

    file.value = formData;

    comprobarBotonCsv();

    // Subida automática: en cuanto se adjunta un CSV válido se envía sin pulsar ningún botón,

    // siempre que haya curso y etapa seleccionados.

    if (puedeEnviarCsv.value) {

      await subirCsvHoras();

    } else {

      mensajeColor = 'warning';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, 'Selecciona un curso y una etapa antes de subir el CSV.');

    }

  } catch (error) {

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message || error);

    const fileUploadComponent = fileUploadRef.value;

    if (fileUploadComponent) {

      fileUploadComponent.fileClear();

    }

    archivoSeleccionado.value = false;

    file.value = null;

    comprobarBotonCsv();

  }

};



const subirCsvHoras = async () => {

  if (!file.value) return;



  isUploadingCsv.value = true;



  try {

    const response = await subirHorasAsignaturasCsv(

      file.value,

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      toastMessage,

      toastColor,

      isToastOpen

    );



    if (response.ok) {

      mensajeActualizacion = 'CSV de horas cargado con éxito';

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);



      const fileUploadComponent = fileUploadRef.value;

      if (fileUploadComponent) {

        fileUploadComponent.fileClear();

      }

      file.value = null;

      archivoSeleccionado.value = false;

      comprobarBotonCsv();



      await cargarAsignatura();

      await mostrarHora();

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

    }

  } catch (error) {

    mensajeActualizacion = 'Error al subir el fichero';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    console.error(error);

  } finally {

    isUploadingCsv.value = false;

  }

};



const actualizarBloquesConUnaAsignatura = () => {

  const bloques = asignaturas.value.reduce((acc, asignatura) => {

    if (asignatura.bloqueId) {

      if (!acc[asignatura.bloqueId]) {

        acc[asignatura.bloqueId] = [];

      }

      acc[asignatura.bloqueId].push(asignatura);

    }

    return acc;

  }, {});



  bloquesConUnaAsignatura.value = Object.entries(bloques)

    .filter(([, asignaturasBloque]) => asignaturasBloque.length === 1)

    .map(([bloqueId]) => bloqueId);

};



const tieneBloque = (asignatura) =>

  asignatura.bloqueId !== undefined && asignatura.bloqueId !== null;



const seleccionIncluyeSinDocencia = computed(() =>

  asignaturasSeleccionadas.value.some((a) => a.sinDocencia)

);



const validarSinDocenciaParaBloque = (seleccionadas) => {

  const conSinDocencia = seleccionadas.filter((a) => a.sinDocencia);

  if (conSinDocencia.length === 0) return null;



  const nombres = conSinDocencia.map((a) => `«${a.nombre}»`).join(', ');

  if (conSinDocencia.length === 1) {

    return `No se puede crear el bloque: la asignatura ${nombres} está marcada como sin docencia.`;

  }

  return `No se puede crear el bloque: las asignaturas ${nombres} están marcadas como sin docencia.`;

};



const validarHorasParaBloque = (seleccionadas) => {

  const conDocencia = seleccionadas.filter((a) => !a.sinDocencia);

  if (conDocencia.length < 2) return null;



  let horasReferencia = null;

  let nombreReferencia = null;



  for (const asignatura of conDocencia) {

    const horas = Number(horasPorAsignatura.value[asignatura.nombre]);

    if (!horas || Number.isNaN(horas)) {

      return `La asignatura «${asignatura.nombre}» no tiene horas asignadas. No se puede crear el bloque.`;

    }

    if (horasReferencia === null) {

      horasReferencia = horas;

      nombreReferencia = asignatura.nombre;

    } else if (horas !== horasReferencia) {

      return `No se puede crear el bloque: las asignaturas con docencia deben tener las mismas horas. «${nombreReferencia}» tiene ${horasReferencia} h y «${asignatura.nombre}» tiene ${horas} h.`;

    }

  }

  return null;

};



const cargarAsignatura = async () => {

  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {

    asignaturas.value = [];

    columnasGrupos.value = [];

    return;

  }



  loading.value = true;



  try {

    const response = await cargarAsignaturas(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      toastMessage,

      toastColor,

      isToastOpen

    );



    asignaturas.value = Array.isArray(response) ? response : [];

    actualizarBloquesConUnaAsignatura();



    const gruposSet = new Set();

    asignaturas.value.forEach((asignatura) => {

      const grupos = typeof asignatura.numeroAlumnosEnGrupo === 'object' ? asignatura.numeroAlumnosEnGrupo : {};

      Object.keys(grupos).forEach((grupo) => {

        gruposSet.add(grupo);

      });

    });

    columnasGrupos.value = Array.from(gruposSet);

  } catch (error) {

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);

    console.error(error);

    asignaturas.value = [];

  } finally {

    loading.value = false;

  }

};



const crearBloque = async () => {

  if (asignaturasSeleccionadas.value.length < 2) {

    mensajeActualizacion = 'Debe seleccionar al menos dos asignaturas.';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    return;

  }



  const errorSinDocencia = validarSinDocenciaParaBloque(asignaturasSeleccionadas.value);

  if (errorSinDocencia) {

    mensajeActualizacion = errorSinDocencia;

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    return;

  }



  const errorHoras = validarHorasParaBloque(asignaturasSeleccionadas.value);

  if (errorHoras) {

    mensajeActualizacion = errorHoras;

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    return;

  }



  loading.value = true;



  try {

    const nombresSeleccionados = asignaturasSeleccionadas.value.map(a => a.nombre);

    const response = await crearBloques(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      nombresSeleccionados,

      toastMessage,

      toastColor,

      isToastOpen

    );



    if (response.ok) {

      mensajeActualizacion = 'Bloque creado correctamente.';

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

    }



    asignaturasSeleccionadas.value = [];

    await cargarAsignatura();

  } catch (error) {

    mensajeActualizacion = 'Error al crear el bloque.';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    console.error(error);

  } finally {

    loading.value = false;

  }

};



const eliminarBloque = async (asignatura) => {

  loading.value = true;

  try {

    const response = await eliminarBloques(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      asignatura.nombre,

      toastMessage,

      toastColor,

      isToastOpen

    );



    if (response.ok) {

      mensajeActualizacion = `Bloque ${asignatura.bloqueId} eliminado correctamente.`;

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

    }



    asignatura.bloqueId = null;

    await cargarAsignatura();

    actualizarBloquesConUnaAsignatura();

  } catch (error) {

    mensajeActualizacion = 'Error al eliminar el bloque.';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    console.error(error);

  } finally {

    loading.value = false;

  }

};



const asignaturaSinDocencia = async (asignatura) => {

  if (tieneBloque(asignatura)) {

    mensajeActualizacion = `La asignatura «${asignatura.nombre}» pertenece a un bloque y no puede marcarse como sin docencia.`;

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    return;

  }



  try {

    const nuevoValor = !asignatura.sinDocencia;



    const response = await asignaturasSinDocencia(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      asignatura.nombre,

      nuevoValor,

      toastMessage,

      toastColor,

      isToastOpen

    );



    if (response.ok) {

      mensajeActualizacion = `Asignatura ${asignatura.nombre} ${nuevoValor ? 'marcada' : 'desmarcada'} como sin docencia`;

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      asignatura.sinDocencia = nuevoValor;

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

      asignatura.sinDocencia = !nuevoValor;

    }

  } catch (error) {

    mensajeActualizacion = 'Error al actualizar el estado de sin docencia';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    asignatura.sinDocencia = !asignatura.sinDocencia;

  }

};



const asignaturasDesdoble = async (asignatura) => {

  try {

    const nuevoValor = !asignatura.desdoble;



    const response = await asignaturasDesdobles(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      asignatura.nombre,

      nuevoValor,

      toastMessage,

      toastColor,

      isToastOpen

    );



    if (response.ok) {

      mensajeActualizacion = `Asignatura ${asignatura.nombre} ${nuevoValor ? 'marcada' : 'desmarcada'} como desdoble`;

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

    }

  } catch (error) {

    mensajeActualizacion = 'Error al desdoblar la asignatura.';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    console.error(error);

  }

};



const mostrarHora = async () => {

  if (!filtroSeleccionado.value.curso || !filtroSeleccionado.value.etapa) {

    asignaturasConHoras.value = [];

    return;

  }



  loading.value = true;



  try {

    const response = await mostrarHoras(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      toastMessage,

      toastColor,

      isToastOpen

    );



    asignaturasConHoras.value = Array.isArray(response) ? response : [];

    horasPorAsignatura.value = asignaturasConHoras.value.reduce((acc, item) => {

      acc[item.nombre] = item.horas;

      return acc;

    }, {});

  } catch (error) {

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);

    console.error(error);

  } finally {

    loading.value = false;

  }

};



const guardarHoras = async (nombreAsignatura) => {

  if (horasPorAsignatura.value[nombreAsignatura] < 0) {

    mensajeActualizacion = 'Asignatura con horas negativas';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    return;

  }



  try {

    const response = await asignarHoras(

      filtroSeleccionado.value.curso,

      filtroSeleccionado.value.etapa,

      nombreAsignatura,

      horasPorAsignatura.value[nombreAsignatura],

      toastMessage,

      toastColor,

      isToastOpen

    );



    if (response.ok) {

      mensajeActualizacion = `Has actualizado las horas de ${nombreAsignatura}.`;

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

    }

  } catch (error) {

    mensajeActualizacion = 'Error al actualizar las horas.';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    console.error(error);

  }

};



const guardarTodasHoras = async () => {

  const asignaturasAActualizar = Object.entries(horasPorAsignatura.value).filter(

    ([, horas]) => horas > 0

  );



  if (asignaturasAActualizar.length === 0) {

    toastMessage.value = 'No hay cambios para guardar.';

    toastColor.value = 'warning';

    isToastOpen.value = true;

    return;

  }



  isProcessing.value = true;



  try {

    let response = null;



    for (const [nombre, horas] of asignaturasAActualizar) {

      response = await asignarHoras(

        filtroSeleccionado.value.curso,

        filtroSeleccionado.value.etapa,

        nombre,

        horas,

        toastMessage,

        toastColor,

        isToastOpen

      );

    }



    if (response.ok) {

      mensajeActualizacion = 'Todas las asignaturas se actualizaron correctamente.';

      mensajeColor = 'success';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    } else {

      const errorData = await response.json();

      mensajeColor = 'danger';

      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);

    }

  } catch (error) {

    mensajeActualizacion = 'Error al actualizar las horas.';

    mensajeColor = 'danger';

    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

    console.error(error);

  } finally {

    isProcessing.value = false;

    isToastOpen.value = true;

  }

};



watch(

  [() => filtroSeleccionado.value.curso, () => filtroSeleccionado.value.etapa],

  async () => {

    cargarAsignatura();

    mostrarHora();

  },

  { immediate: true }

);



onMounted(async () => {

  await sincronizarCursoAcademico();

  window.addEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);

});



onUnmounted(() => {

  window.removeEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);

});

</script>



<style scoped>

.page-asignaturas-bloques {

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



.listado-context {

  margin: 0.35rem 0 0;

  font-size: 0.95rem;

  color: #555;

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



.alerta {

  margin: 0 0 1rem;

  padding: 0.85rem 1rem;

  border-radius: 8px;

  font-size: 0.95rem;

  font-weight: 600;

  text-align: center;

}



.alerta-peligro {

  color: #b91c1c;

  background-color: #fef2f2;

  border: 1px solid #fecaca;

}



.content-layout {

  display: flex;

  gap: 1.25rem;

  align-items: flex-start;

}



.table-section {

  flex: 1;

  min-width: 0;

}



.upload-section {

  width: 280px;

  flex-shrink: 0;

}



.action-card {

  display: flex;

  flex-direction: column;

  min-height: 100%;

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



.upload-hint {

  margin: 0;

  font-size: 0.8rem;

  font-style: italic;

  color: #555;

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



.btn-mini {

  width: auto;

  margin-top: 0;

  padding: 6px 12px;

  white-space: nowrap;

}



.btn-mini-inline {

  margin-left: 0.35rem;

  padding: 4px 8px;

  font-size: 12px;

}



.btn-delete {

  padding: 5px 10px;

  border: none;

  background-color: #dc3545;

  color: white;

  border-radius: 5px;

  cursor: pointer;

}



.btn-delete:disabled {

  background-color: #999;

  cursor: not-allowed;

  opacity: 0.6;

}



.seccion-footer {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 1rem;

  flex-wrap: wrap;

  margin-top: 1rem;

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



th,

td {

  border: 2px solid #007bff;

  padding: 8px 6px;

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



.th-horas-total {

  display: block;

  font-size: 0.85em;

  font-weight: 500;

  margin-top: 0.15rem;

  opacity: 0.9;

}



.table-scroll {

  width: 100%;

  max-height: 360px;

  overflow: auto;

}



.checkbox {

  width: 16px;

  height: 16px;

  accent-color: #2196f3;

  cursor: pointer;

}



.checkbox:disabled {

  cursor: not-allowed;

}



.cell-input {

  width: 100%;

  box-sizing: border-box;

  background: #fff;

  border: 1px solid #ccc;

  border-radius: 4px;

  text-align: center;

  padding: 4px 6px;

  outline: none;

  color: #000;

}



.cell-input-num {

  max-width: 72px;

  margin: 0 auto;

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



  .section-title,

  .card-title,

  .field label {

    color: var(--text-color-dark);

  }



  .page-subtitle,

  .listado-context,

  .empty-state {

    color: #c8c8c8;

  }



  .action-card {

    background-color: #2a302b;

    border-color: #555;

  }



  .empty-state {

    background-color: #2a302b;

    border-color: #555;

  }



  .alerta-peligro {

    color: #fca5a5;

    background-color: #3f1d1d;

    border-color: #7f1d1d;

  }

}



@media (max-width: 1024px) {

  .content-layout {

    flex-direction: column;

  }



  .upload-section {

    width: 100%;

  }

}



@media (max-width: 768px) {

  .page-asignaturas-bloques {

    padding-inline: 0.75rem;

  }



  .main-panel {

    padding: 1rem;

  }



  .t-1 {

    font-size: 1.75rem;

  }



  .listado-header {

    flex-direction: column;

    align-items: stretch;

  }



  .datos-controls {

    flex-direction: column;

    align-items: stretch;

  }



  .seccion-footer {

    flex-direction: column;

    align-items: stretch;

  }



  .seccion-footer .btn-primary {

    width: 100%;

  }



  table {

    font-size: 14px;

  }

}

</style>

