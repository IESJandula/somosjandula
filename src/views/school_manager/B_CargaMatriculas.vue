<template>
  <div class="page-carga-matriculas">
    <header class="page-header">
      <h1 class="t-1">Carga de Matrículas<span v-if="cursoAcademico"> ({{ cursoAcademico }})</span></h1>
      <SchoolManagerNav>
        <p class="page-subtitle">
          Sube las matrículas de Séneca en formato CSV y gestiona los datos cargados por curso y etapa.
        </p>
      </SchoolManagerNav>
    </header>

    <div class="main-panel">
      <section class="panel-section">
        <h2 class="section-title">Acciones</h2>

        <div class="actions-grid">
          <!-- Subir CSV -->
          <article class="action-card">
            <h3 class="card-title">Subir matrículas (CSV)</h3>
            <div class="card-body">
              <div class="field">
                <label>Filtrar por curso y etapa</label>
                <FilterCursoEtapa
                  v-model="filtroSeleccionadoString"
                  @actualizar-select="actualizarSelect"
                  selectClass="select-sm"
                  class="texto-dropdown"/>
              </div>

              <div class="field">
                <label for="fileInput">Adjunta el csv de las matrículas de Séneca</label>
                <FileUpload ref="fileUploadRef" @file-selected="monitorizarSiHayArchivo" />
              </div>

              <button @click="subirFichero(); $event.target.blur()" ref="boton" class="btn-primary" id="enviar">{{ buttonText }}</button>

              <!-- Spinner de carga -->
              <div v-if="isLoading" class="fondo-gris">
                <div class="circulo"></div>
              </div>
            </div>
          </article>

          <!-- Cursos y etapas cargados -->
          <article class="action-card">
            <h3 class="card-title">Cursos y etapas cargados</h3>
            <div class="card-body">
              <div class="table-scroll" v-if="cursosMapeados.length">
                <table>
                  <thead>
                    <tr>
                      <th>Curso y etapa</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(cursoE, index) in cursosMapeados" :key="index">
                      <td>{{ cursoE }}</td>
                      <td>
                        <button type="button" class="btn-delete" @click="borrarMatricula(cursoE)">X</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-else class="empty-state">No hay cursos y etapas cargados.</p>
            </div>
          </article>
        </div>
      </section>

      <div class="panel-divider" aria-hidden="true"></div>

      <section class="panel-section listado-section">
        <div class="listado-header">
          <div class="listado-header-left">
            <h2 class="section-title section-title-inline">Datos del CSV cargado</h2>
          </div>
          <div class="datos-controls">
            <FilterCursoEtapa
              v-model="cursoSeleccionado"
              @actualizar-select="actualizarSelectDatos"
              selectClass="select-sm"
              class="texto-dropdown"/>
          </div>
        </div>

        <div class="table-scroll" v-if="datosMatriculas.length">
          <table class="tabla-matriculas">
            <thead>
              <tr>
                <th>Eliminar</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th v-for="asignatura in asignaturas" :key="asignatura">
                  {{ asignatura }} <span title="Matriculados">({{ matriculadosPorAsignatura[asignatura] }})</span>
                  <button
                    v-if="esAsignaturaAdHoc(asignatura)"
                    type="button"
                    class="eliminar-asignatura"
                    title="Borrar asignatura ad-hoc"
                    @click="eliminarAsignaturaAdHoc(asignatura)">&times;</button>
                </th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(estudiante, index) in datosMatriculas" :key="index">
                <td>
                  <button class="btn-delete" @click="desmatricularAlumnosCsv(index)">X</button>
                </td>
                <td>{{ estudiante.nombre }}</td>
                <td>{{ estudiante.apellidos }}</td>
                <td v-for="asignatura in asignaturas" :key="asignatura">
                  <select
                    v-model="estudiante.matriculas[asignatura]"
                    class="editable-cell"
                    :title="obtenerTooltipEstado(estudiante.matriculas[asignatura])">
                    <option value="" disabled>Selecciona estado</option>
                    <option
                      v-for="estado in estadosMatricula"
                      :key="estado.value"
                      :value="estado.value"
                      :title="estado.label">
                      {{ estado.value }}
                    </option>
                  </select>
                </td>
                <td>
                  <button class="btn-primary btn-mini" @click="matricularAsignaturasCsv(index)">Guardar</button>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input type="text" v-model="nuevoAlumno.nombre" class="cell-input">
                </td>
                <td>
                  <input type="text" v-model="nuevoAlumno.apellidos" class="cell-input">
                </td>
                <td v-for="asignatura in asignaturas" :key="asignatura">
                  <select
                    v-model="nuevoAlumno.matriculas[asignatura]"
                    class="editable-cell"
                    :title="obtenerTooltipEstado(nuevoAlumno.matriculas[asignatura])">
                    <option value="" disabled>Selecciona estado</option>
                    <option
                      v-for="estado in estadosMatricula"
                      :key="estado.value"
                      :value="estado.value"
                      :title="estado.label">
                      {{ estado.value }}
                    </option>
                  </select>
                </td>
                <td>
                  <button class="btn-primary btn-mini" @click="matricularAlumnosCsv">Registrar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="empty-state">No hay datos cargados del CSV.</p>

        <div v-if="datosMatriculas.length > 0" class="seccion-footer">
          <div class="footer-left">
            <input
              type="text"
              v-model="nuevaAsignatura"
              class="input-nueva-asignatura"
              placeholder="Nueva asignatura">
            <button type="button" class="btn-primary btn-mini" @click="crearAsignaturaAdHocHandler">Crear</button>
          </div>
          <button class="btn-primary btn-guardar-todo" @click="guardarTodo">Guardar todo</button>
        </div>
      </section>
    </div>
  </div>

  <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
    @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import SchoolManagerNav from '@/components/school_manager/SchoolManagerNav.vue';
import { subirFicheros, cargarMatriculas, borrarMatriculas, obtenerDatosMatriculas, matricularAsignaturas, matricularAlumnos, desmatricularAlumnos, crearAsignaturaAdHoc, borrarAsignaturaAdHoc, obtenerCursoAcademicoSeleccionado } from '@/services/schoolManager.js'
import { crearToast } from "@/utils/toast.js";
import { IonToast } from "@ionic/vue";

const cursoAcademico = ref('');
const filtroSeleccionado = ref({ curso: null, etapa: '' });
const filtroSeleccionadoString = ref('');
const cursoSeleccionado = ref('');
const archivoSeleccionado= ref(false)
const file = ref(null);
const cursosMapeados = ref([]);
const fileUploadRef = ref(null);
const buttonText = ref('Enviar');
const datosMatriculas = ref([]);
const asignaturas = ref([]);
// Conjunto de nombres de asignaturas marcadas como ad-hoc por el backend.
// SUPUESTO: cada registro de matrícula que devuelve obtenerDatosMatriculas incluye
// un booleano `esAdHoc` (con fallback a `adHoc`) por asignatura. Si el backend usa
// otro nombre de campo, ajustar `cargarDatosMatriculas`.
const asignaturasAdHoc = ref(new Set());

const esAsignaturaAdHoc = (asignatura) => asignaturasAdHoc.value.has(asignatura);
const nuevoAlumno = ref({
  nombre: "",
  apellidos: "",
  matriculas: {}
});
const nuevaAsignatura = ref('');
const estadosValidos = ["MATR", "NO_MATR", "SUPCA", "CONV", "APRO", "PEND"];
const estadosMatricula = [
  { value: "NO_MATR", label: "No matriculado" },
  { value: "MATR", label: "Matriculado" },
  { value: "APRO", label: "Aprobado" },
  { value: "CONV", label: "Convalidado" },
  { value: "PEND", label: "Pendiente" },
  { value: "SUPCA", label: "Superada en cursos anteriores" }
];

const obtenerTooltipEstado = (valor) => {
  const estado = estadosMatricula.find(e => e.value === valor);
  return estado ? estado.label : '';
};

// Devuelve el curso/etapa actualmente seleccionados en el desplegable (cursoSeleccionado
// tiene formato "curso-etapa"). Devuelve null si la selección no es válida.
const obtenerCursoEtapaSeleccionado = () => {
  const [curso, etapa] = (cursoSeleccionado.value || '').split('-');
  if (!curso || !etapa) return null;
  return { curso: parseInt(curso, 10), etapa };
};

// Crea una asignatura ad-hoc en el backend para el curso/etapa y curso académico
// activos y recarga la tabla para reflejar la nueva columna (alumnos NO matriculados
// por defecto, según devuelva el backend).
const crearAsignaturaAdHocHandler = async () => {
  const nombre = nuevaAsignatura.value.trim();

  if (!nombre) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, "Debes indicar el nombre de la asignatura");
    return;
  }

  if (asignaturas.value.includes(nombre)) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, "Esa asignatura ya existe");
    return;
  }

  const seleccion = obtenerCursoEtapaSeleccionado();
  if (!seleccion) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, "Selecciona un curso y etapa antes de crear la asignatura");
    return;
  }

  try {
    await crearAsignaturaAdHoc(toastMessage, toastColor, isToastOpen, {
      nombre,
      curso: seleccion.curso,
      etapa: seleccion.etapa
    });
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, "Asignatura creada con éxito");
    nuevaAsignatura.value = "";
    await cargarDatosMatriculas();
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

// Borra una asignatura ad-hoc (sólo disponible para asignaturas marcadas como ad-hoc)
// y recarga la tabla.
const eliminarAsignaturaAdHoc = async (asignatura) => {
  const seleccion = obtenerCursoEtapaSeleccionado();
  if (!seleccion) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, "Selecciona un curso y etapa");
    return;
  }

  if (!window.confirm(`¿Borrar la asignatura "${asignatura}"? Esta acción no se puede deshacer.`)) return;

  try {
    await borrarAsignaturaAdHoc(toastMessage, toastColor, isToastOpen, {
      nombre: asignatura,
      curso: seleccion.curso,
      etapa: seleccion.etapa
    });
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, "Asignatura borrada con éxito");
    await cargarDatosMatriculas();
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const matriculadosPorAsignatura = computed(() => {
  const conteo = {};
  for (const asignatura of asignaturas.value) {
    conteo[asignatura] = datosMatriculas.value.filter(
      (estudiante) => estudiante.matriculas[asignatura] === "MATR"
    ).length;
  }
  return conteo;
});
// Nueva variable reactiva para el estado de carga
const isLoading = ref(false);
// Variable para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
// Nueva variable reactiva para el mensaje de actualización
let mensajeActualizacion = "";
let mensajeColor = "";

const comprobarBoton = () => {
  const boton = document.getElementById('enviar');
  if (archivoSeleccionado.value && filtroSeleccionado.value.curso && filtroSeleccionado.value.etapa && validarCSV(file.value)) {
    boton.disabled = false;
    buttonText.value = "Enviar";
  } else {
    buttonText.value = "Rellenar campos para enviar";
    boton.disabled = true;
  }
}

const validarCSV = (archivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contenido = event.target.result;
      const lineas = contenido.split("\n");
      const encabezados = Array.of(lineas[0].split(",").map(h => h.trim())); // Obtener la primera fila

      if (encabezados[0][0] !== "Alumno/a" && encabezados[0][0] !== "\"Alumno/a\"") {
        reject("El Csv no tiene el formato correcto");
        const fileUploadComponent = fileUploadRef.value;
        fileUploadComponent.fileClear();
        archivoSeleccionado.value = false;
        comprobarBoton();
      } else {
        resolve(); // El archivo es válido
      }
    };

    reader.onerror = () => reject("Error al leer el archivo");
    reader.readAsText(archivo);
  });
};

const monitorizarSiHayArchivo = async (archivo) => {
  archivoSeleccionado.value = !!archivo;

  try {
    await validarCSV(archivo); // Validar CSV antes de guardarlo
    const formData = new FormData();
    formData.append("csv", archivo);
    file.value = formData;

    comprobarBoton();
  } catch (error) {
    mensajeActualizacion = "El archivo no tiene el formato correcto";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  } 
};

// Enviar datos al servidor
const subirFichero = async () => {
  if (!file.value) return;
    try {

      if(filtroSeleccionado.value.curso && cursosMapeados.value.includes(`${filtroSeleccionado.value.curso}-${filtroSeleccionado.value.etapa}`)){
        borrarMatricula(`${filtroSeleccionado.value.curso}-${filtroSeleccionado.value.etapa}`);
      }

      isLoading.value = true; // Activar el estado de carga
      const response = await subirFicheros(
        file.value, 
        filtroSeleccionado.value.curso, 
        filtroSeleccionado.value.etapa, 
        toastMessage, 
        toastColor, 
        isToastOpen
      );

      if(response.ok) {
      mensajeActualizacion = "Csv cargado con éxito";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

      // Limpiar el archivo seleccionado
      const fileUploadComponent = fileUploadRef.value;
      fileUploadComponent.fileClear();

      await cargarMatricula()
      file.value = null;
      archivoSeleccionado.value = false;
      filtroSeleccionado.value = { curso: null, etapa: '' };
      filtroSeleccionadoString.value = '';
      comprobarBoton()
      
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
    }
    finally {
    console.log("Desactivando spinner...");
    isLoading.value = false; // Desactivar el estado de carga
  }
};

// Actualizar la selección y almacenar los valores en `filtroSeleccionado`
const actualizarSelect = (seleccionado) => {
    filtroSeleccionado.value = seleccionado;
    console.log("Filtro actualizado:", seleccionado);
    comprobarBoton();
};

const actualizarSelectDatos = (seleccionado) => {
  cursoSeleccionado.value = `${seleccionado.curso}-${seleccionado.etapa}`;
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

const reiniciarSeleccionVista = () => {
  cursoSeleccionado.value = '';
  filtroSeleccionadoString.value = '';
  filtroSeleccionado.value = { curso: null, etapa: '' };
  datosMatriculas.value = [];
  asignaturas.value = [];
  asignaturasAdHoc.value = new Set();
};

const onCursoAcademicoCambiado = async (event) => {
  cursoAcademico.value = event.detail?.cursoAcademico || '';
  if (cursoAcademico.value) {
    localStorage.setItem('cursoAcademicoSeleccionado', cursoAcademico.value);
  }
  reiniciarSeleccionVista();
  await cargarMatricula();
};

const cargarMatricula = async () => {
  try {
    const data = await cargarMatriculas(isToastOpen, toastMessage, toastColor) || [];
    if (data===undefined){
      cursosMapeados.value = ""
      mensajeActualizacion = "No hay datos";
      mensajeColor = "danger";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }
    else {
      cursosMapeados.value = data.map(curso => `${curso.curso}-${curso.etapa}`);
      console.log(cursosMapeados.value);
    }
  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const borrarMatricula = async (cursoE) => {
  
  try {
    const [curso, etapa] = cursoE.split('-');
    
    const response = await borrarMatriculas(curso, etapa, isToastOpen, toastMessage, toastColor)

    if (response.ok) {
      mensajeActualizacion = "Curso borrado con éxito";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } else {
      const errorData = await response.json();
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
    }

    await cargarMatricula();
    cursoSeleccionado.value = "" // Limpiar el curso seleccionado
    datosMatriculas.value = [] // Limpiar los datos de matrículas
  

  } catch (error) {
    mensajeActualizacion = "Error al borrar el curso";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
}


const cargarDatosMatriculas = async () => {
  if (!cursoSeleccionado.value) return;

  const [curso, etapa] = cursoSeleccionado.value.split('-');
  try {
    const response = await obtenerDatosMatriculas(parseInt(curso), etapa, isToastOpen, toastMessage, toastColor);
    
    // Obtener todas las asignaturas únicas
    asignaturas.value = [...new Set(response.map(m => m.asignatura))];

    // Detectar qué asignaturas son ad-hoc según el flag del backend (esAdHoc / adHoc)
    const adHocSet = new Set();
    response.forEach((registro) => {
      const flag = registro.esAdHoc ?? registro.adHoc ?? false;
      if (flag) {
        adHocSet.add(registro.asignatura);
      }
    });
    asignaturasAdHoc.value = adHocSet;

    // Agrupar datos por estudiante
    const estudiantesMap = new Map();
    response.forEach(({ nombre, apellidos, asignatura, estadoMatricula }) => {
      const claveEstudiante = `${nombre} ${apellidos}`;
      if (!estudiantesMap.has(claveEstudiante)) {
        estudiantesMap.set(claveEstudiante, { nombre, apellidos, matriculas: {} });
      }
      estudiantesMap.get(claveEstudiante).matriculas[asignatura] = estadoMatricula;
    });

    // Convertir el mapa en un array
    datosMatriculas.value = Array.from(estudiantesMap.values());

  } catch (error) {
    datosMatriculas.value = [];
    asignaturas.value = [];
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

const matricularAsignaturasCsv = async (index, mostrarToast = true) => {
  try {
    const [curso, etapa] = cursoSeleccionado.value.split("-");
    const alumno = datosMatriculas.value[index].nombre;
    const apellidos = datosMatriculas.value[index].apellidos;

    if (datosMatriculas.value[index].matriculas.length === 0) {
      const error = new Error("Son obligatorios todos los campos.");
      if (mostrarToast) {
        mensajeActualizacion = error.message;
        mensajeColor = "danger";
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      }
      throw error;
    }

    for (const [asignatura, estado] of Object.entries(datosMatriculas.value[index].matriculas)) {
      if (estadosValidos.includes(estado)) {
        await matricularAsignaturas(alumno, apellidos, asignatura, curso, etapa, estado, isToastOpen, toastMessage, toastColor);
      } else {
        const error = new Error(`El estado de la asignatura '${asignatura}' debe ser 'MATR', 'NO_MATR', 'SUPCA', 'CONV', 'APRO' o 'PEND'.`);
        if (mostrarToast) {
          mensajeActualizacion = error.message;
          mensajeColor = "danger";
          crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
        }
        throw error;
      }
    }

    if (mostrarToast) {
      mensajeActualizacion = "Matrícula modificada con éxito";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    }

  } catch (error) {
    if (mostrarToast) {
      mensajeColor = "danger";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    }
    throw error;
  }
};


const matricularAlumnosCsv = async () => {
  try {
    
    const [curso, etapa] = cursoSeleccionado.value.split("-");
    const { nombre, apellidos, matriculas } = nuevoAlumno.value;
    
    
    if (!nombre || !apellidos || Object.entries(matriculas).length !== asignaturas.value.length) {
      mensajeActualizacion = "Son obligatorios todos los campos.";
      mensajeColor = "danger";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      return;
    }

    for (const [asignatura, estado] of Object.entries(matriculas)) {
      if (!estadosValidos.includes(estado)) {
        mensajeActualizacion = `El estado de la debe ser 'MATR', 'NO_MATR', 'SUPCA', 'CONV', 'APRO' o 'PEND'.`;
        mensajeColor = "danger";
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
        return;
      }
      
      const response = await matricularAlumnos(nombre, apellidos, asignatura, curso, etapa, estado, isToastOpen, toastMessage, toastColor);
      
      if (response.ok) {
        mensajeActualizacion = "Alumno registrado con éxito";
        mensajeColor = "success";
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      } 
      else {
        const errorData = await response.json();
        mensajeColor = 'danger';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
      }
    }

    // Agregar el nuevo alumno a la tabla
    datosMatriculas.value.push({ ...nuevoAlumno.value });

    // Limpiar el formulario
    nuevoAlumno.value = { nombre: "", apellidos: "", matriculas: {} };
  } catch (error) {
    mensajeActualizacion = error.message;
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const desmatricularAlumnosCsv = async (index) => {
  try {

    const [curso, etapa] = cursoSeleccionado.value.split("-");
    
    const alumno = datosMatriculas.value[index].nombre;
    const apellidos = datosMatriculas.value[index].apellidos;


    for(const[asignatura, estado] of Object.entries(datosMatriculas.value[index].matriculas)){
      
      const response = await desmatricularAlumnos(alumno, apellidos, asignatura, curso, etapa, estado, isToastOpen, toastMessage, toastColor);
      if(response.ok) {
      mensajeActualizacion = "Alumno borrado con exito";
      mensajeColor = "success";
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
      
      datosMatriculas.value.splice(index, 1); // Eliminar el alumno de la lista
      
      } else {
        const errorData = await response.json();
        mensajeColor = 'danger';
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, errorData.message);
      }
    }

  } catch (error) {
    mensajeActualizacion = "Error al borrar el alumno";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

const guardarTodo = async () => {
  let mensajeError = '';

  try {
    if(nuevoAlumno.value.nombre !== '') {
      // Registrar nuevo alumno si hay datos
      if (!nuevoAlumno.value.nombre || !nuevoAlumno.value.apellidos || Object.keys(nuevoAlumno.value.matriculas).length !== asignaturas.value.length) {
        mensajeActualizacion = "Son obligatorios todos los campos.";
        mensajeColor = "danger";
        crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
        return;
      }
      if (nuevoAlumno.value.nombre && nuevoAlumno.value.apellidos && Object.keys(nuevoAlumno.value.matriculas).length > 0) {
         // Validar los estados de las asignaturas
        for (const [asignatura, estado] of Object.entries(nuevoAlumno.value.matriculas)) {
          if (!estadosValidos.includes(estado)) {
            mensajeActualizacion = `El estado de la asignatura '${asignatura}' debe ser 'MATR', 'NO_MATR', 'SUPCA', 'CONV', 'APRO' o 'PEND'.`;
            mensajeColor = "danger";
            crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
            return;
          }
        }
        // Guardar el nuevo alumno
        await matricularAlumnosCsv(false);
      }
    }

    if(nuevoAlumno.value !== null) {
      // Procesar matrículas de todos los alumnos
      for (let i = 0; i < datosMatriculas.value.length; i++) {
        try {
          await matricularAsignaturasCsv(i, false);
        } catch (error) {
          mensajeError += `Error en ${datosMatriculas.value[i].nombre} ${datosMatriculas.value[i].apellidos}: ${error.message}\n`;
        }
      }
    }

    if (mensajeError === '') {
      mensajeActualizacion = "Todo guardado con éxito";
      mensajeColor = "success";
    } else {
      mensajeActualizacion = mensajeError;
      mensajeColor = "danger";
    }
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);

  } catch (error) {
    mensajeActualizacion = "Error al guardar los cambios";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    console.error(error);
  }
};

watch([() => filtroSeleccionado.value.curso, () => filtroSeleccionado.value.etapa], 
  async () => {
    comprobarBoton();
  },
  { immediate: true }
);

// Carga automática de los datos del curso/etapa elegido en el desplegable.
// Sustituye al antiguo botón "Cargar CSV": al seleccionar curso+etapa se consulta
// el backend directamente. Sólo dispara con una selección válida (curso-etapa) y
// distinta; al limpiar la selección (p.ej. tras borrar) cursoSeleccionado queda
// vacío y no se relanza la carga.
watch(cursoSeleccionado, async (nuevoCursoEtapa) => {
  const [curso, etapa] = (nuevoCursoEtapa || '').split('-');
  if (!curso || !etapa) return;
  await cargarDatosMatriculas();
});

onMounted(async () => {
  await sincronizarCursoAcademico();
  window.addEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
  await cargarMatricula();
  comprobarBoton();
});

onUnmounted(() => {
  window.removeEventListener('curso-academico-cambiado', onCursoAcademicoCambiado);
});
</script>

<style scoped>
.page-carga-matriculas {
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

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  align-items: stretch;
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

.texto-dropdown {
  font-size: 1rem;
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

.seccion-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-left .input-nueva-asignatura {
  width: auto;
}

.btn-guardar-todo {
  width: auto;
}

.eliminar-asignatura {
  color: #ef4444;
  font-size: 1.3rem;
  line-height: 1;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0 0 0 4px;
  vertical-align: middle;
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

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cfd8e3 15%, #cfd8e3 85%, transparent);
  margin: 1.75rem 0;
}

.listado-section {
  padding-top: 0.25rem;
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

th, td {
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

/* ---- Columnas identificativas fijas horizontalmente (sticky-left) ----
   Apellidos es la 3.ª columna (tras "Eliminar" y "Nombre"). Para que el
   offset `left` sea estable y las columnas previas no se deslicen por
   debajo de Apellidos, se fija el bloque completo (Eliminar + Nombre +
   Apellidos) con anchos fijos y offsets acumulados. Los offsets llevan un
   solapamiento de 2px para evitar que asome contenido entre columnas con
   border-collapse. La 4.ª columna en adelante (asignaturas) y "Acción"
   hacen scroll normal. */
.tabla-matriculas th:nth-child(1), .tabla-matriculas td:nth-child(1) {
  width: 90px;
  min-width: 90px;
  max-width: 90px;
  position: sticky;
  left: 0;
  z-index: 1;
}

.tabla-matriculas th:nth-child(2), .tabla-matriculas td:nth-child(2) {
  width: 130px;
  min-width: 130px;
  max-width: 130px;
  position: sticky;
  left: 88px;
  z-index: 1;
}

.tabla-matriculas th:nth-child(3), .tabla-matriculas td:nth-child(3) {
  width: 170px;
  min-width: 170px;
  max-width: 170px;
  position: sticky;
  left: 216px;
  z-index: 1;
}

/* Las celdas del cuerpo de las columnas fijas necesitan fondo sólido para
   tapar las celdas que pasan por debajo al hacer scroll horizontal. */
.tabla-matriculas tbody td:nth-child(1),
.tabla-matriculas tbody td:nth-child(2),
.tabla-matriculas tbody td:nth-child(3) {
  background-color: #e9f5ff;
}

.tabla-matriculas tbody tr:hover td:nth-child(1),
.tabla-matriculas tbody tr:hover td:nth-child(2),
.tabla-matriculas tbody tr:hover td:nth-child(3) {
  background-color: #d0eaff;
}

/* Esquina cabecera+identificativas: fija en vertical (top) y horizontal
   (left) a la vez, por encima de todo. */
.tabla-matriculas thead th:nth-child(1),
.tabla-matriculas thead th:nth-child(2),
.tabla-matriculas thead th:nth-child(3) {
  z-index: 3;
}

.table-scroll {
  width: 100%;
  max-height: 360px;
  overflow: auto;
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

.input-nueva-asignatura {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  width: 100%;
  min-width: 160px;
  padding: 4px 6px;
  outline: none;
  font-size: 0.95rem;
  color: #000;
}

.editable-cell {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  width: 100%;
  min-width: calc(8ch + 2em);
  padding: 2px;
  outline: none;
  font: inherit;
  color: #000;
  cursor: pointer;
  appearance: auto;
}

.editable-cell option {
  background-color: #fff;
  color: #000;
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
  .page-subtitle, .empty-state { color: #c8c8c8; }
  .action-card { background-color: #2a302b; border-color: #555; }
  .card-title, .field label { color: var(--text-color-dark); }
  .empty-state { background-color: #2a302b; border-color: #555; }
  .panel-divider {
    background: linear-gradient(90deg, transparent, #555 15%, #555 85%, transparent);
  }
}

@media (max-width: 1024px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-carga-matriculas { padding-inline: 0.75rem; }
  .main-panel { padding: 1rem; }
  .t-1 { font-size: 1.75rem; }
  .listado-header { flex-direction: column; align-items: stretch; }
  .datos-controls { flex-direction: column; align-items: stretch; }
  .seccion-footer { flex-direction: column; align-items: stretch; }
  .footer-left { width: 100%; }
  .footer-left .input-nueva-asignatura { flex: 1; min-width: 0; }
  .btn-guardar-todo { width: 100%; }
  table { font-size: 14px; }
}
</style>