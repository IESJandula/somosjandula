<script setup>
import { ref, onMounted } from 'vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import { cargarCursosEtapas, subirFicheros, obtenerCursosCargados, borrarMatriculas, obtenerDatosMatriculas, matricularAsignaturasCsv, matricularAlumnosCsv, desmatricularAlumnosCsv } from '@/services/schoolManager.js'
import { crearToast } from "@/utils/toast.js";
import { IonToast } from "@ionic/vue";

const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const cursosEtapas = ref([]);
const emit = defineEmits(['actualizar-select']);
const seleccionado = ref('');
const cursoSeleccionado = ref('');
let mensajeColor = ''
let mensajeActualizacion = ''
const archivoSeleccionado= ref(false)
const file = ref(null);
const cursosMapeados = ref([]);
const fileUploadRef = ref(null);
const buttonText = ref('Enviar');
const datosMatriculas = ref([]);
const asignaturas = ref([]);
const nuevoAlumno = ref({
  nombre: "",
  apellidos: "",
  matriculas: {}
});


const comprobarBoton = () => {
  const boton = document.getElementById('enviar');
  if( archivoSeleccionado.value && seleccionado.value  && validarCSV(file.value)) {
    boton.disabled = false;
    buttonText.value = "Enviar";
    boton.style.backgroundColor = "#4782eb";
  } else {
    boton.style.backgroundColor = "#7fa9f4";
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

      if (encabezados[0][0] !== "Alumno/a") {
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
    console.error(error);
    mensajeActualizacion = error;
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};

// Enviar datos al servidor
const subirFichero = async () => {
  if (!file.value) return;
    try {

      const [curso, etapa] = seleccionado.value.split('-');
      if(seleccionado.value && cursosMapeados.value.includes(seleccionado.value)){
        eliminarCursosCargados(seleccionado.value);
        
      }

      const data = await subirFicheros(file.value, curso, etapa, toastMessage, toastColor, isToastOpen);
      console.log("Fichero Cargado:", data);

      mensajeActualizacion = "Csv cargado con éxito";
      mensajeColor = "success";
      crearToast( toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    } catch (error) {
      console.error('Error al cargar matriculas', error);
      mensajeActualizacion = 'Error al cargar matrículas';
      mensajeColor = 'danger';
      crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    }
    seleccionado.value = "";
    const fileUploadComponent = fileUploadRef.value;
    fileUploadComponent.fileClear();

    await insertarCursosCargados()
    file.value = null;
    archivoSeleccionado.value = false;
    comprobarBoton()
};

const cargarCursosEtapa = async () => {
  try {
    const data = await cargarCursosEtapas(isToastOpen, toastMessage, toastColor)
    cursosEtapas.value = data;
    comprobarBoton()
  } catch (error) {
    console.error('Error al cargar cursos y etapas', error);
  }
};


// Actualizar la selección y almacenar los valores en `filtroSeleccionado`
const actualizarSelect = () => {
  if (seleccionado.value) {
    const [curso, etapa] = seleccionado.value.split('-');
    emit('actualizar-select', { curso: parseInt(curso), etapa });
    console.log("Evento emitido:", { curso: parseInt(curso), etapa });
    comprobarBoton();
  } else {
    emit('actualizar-select', { curso: null, etapa: '' });
  }
};

const insertarCursosCargados = async () => {
  try {
    const data = await obtenerCursosCargados(isToastOpen, toastMessage, toastColor) || [];
    if (data===undefined){
      cursosMapeados.value = ""
      throw console.error("No hay datos")
    }
    else {
      cursosMapeados.value = data.map(curso => `${curso.curso}-${curso.etapa}`);
      console.log(cursosMapeados.value);
    }
  } catch (error) {
    console.error('Error al insertar cursos cargados:', error);
  }
};

const eliminarCursosCargados = async (cursoE) => {

  const [curso, etapa] = cursoE.split('-');
  const data = await borrarMatriculas(curso, etapa, isToastOpen, toastMessage, toastColor)
  await insertarCursosCargados();
  cursoSeleccionado.value = "" // Limpiar el curso seleccionado
  datosMatriculas.value = [] // Limpiar los datos de matrículas
  return console.log("Borrado con exito: " + data)
  
}


const cargarDatosMatriculas = async () => {
  if (!cursoSeleccionado.value) return;

  const [curso, etapa] = cursoSeleccionado.value.split('-');
  try {
    const datos = await obtenerDatosMatriculas(parseInt(curso), etapa, isToastOpen, toastMessage, toastColor);
    
    // Obtener todas las asignaturas únicas
    asignaturas.value = [...new Set(datos.map(m => m.asignatura))];

    // Agrupar datos por estudiante
    const estudiantesMap = new Map();
    datos.forEach(({ nombre, apellidos, asignatura, estadoMatricula }) => {
      const claveEstudiante = `${nombre} ${apellidos}`;
      if (!estudiantesMap.has(claveEstudiante)) {
        estudiantesMap.set(claveEstudiante, { nombre, apellidos, matriculas: {} });
      }
      estudiantesMap.get(claveEstudiante).matriculas[asignatura] = estadoMatricula;
    });

    // Convertir el mapa en un array
    datosMatriculas.value = Array.from(estudiantesMap.values());
  } catch (error) {
    console.error('No se pudieron cargar los datos de matrículas');
    datosMatriculas.value = [];
    asignaturas.value = [];
  }
};

const matricularAsignaturaCsv = async (index) => {
  try {

    const [curso, etapa] = cursoSeleccionado.value.split("-");
    
    const alumno = datosMatriculas.value[index].nombre;
    const apellidos = datosMatriculas.value[index].apellidos;

    if (Object.keys(matriculas).length === 0) {
      throw new Error("Son obligatorios todos los campos.");
    }


    for(const[asignatura, estado] of Object.entries(datosMatriculas.value[index].matriculas)){
      if(estado === "MATR" || estado === "NO_MATR" || estado === "SUPCA" || estado === "CONV" || estado === "APRO" || estado === "PEND"){ 
        await matricularAsignaturasCsv(alumno, apellidos, asignatura, curso, etapa, estado, isToastOpen, toastMessage, toastColor);
      } else {
        throw new Error("El estado de la asignatura debe ser 'MATR', 'NO_MATR', 'SUPCA', 'CONV', 'APRO' o 'PEND'.");
      }
    }

    mensajeActualizacion = "Matricula modificada con exito";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  } catch (error) {
    mensajeActualizacion = error.message;
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};


const registrarNuevoAlumno = async () => {
  try {
    
    const [curso, etapa] = cursoSeleccionado.value.split("-");
    const { nombre, apellidos, matriculas } = nuevoAlumno.value;
    
    
    if (!nombre || !apellidos || Object.entries(matriculas).length !== asignaturas.value.length) {
      throw new Error("Son obligatorios todos los campos.");
    }

    for (const [asignatura, estado] of Object.entries(matriculas)) {
      if (!["MATR", "NO_MATR", "SUPCA", "CONV", "APRO", "PEND"].includes(estado)) {
        throw new Error(`El estado de la asignatura debe ser 'MATR', 'NO_MATR', 'SUPCA', 'CONV', 'APRO' o 'PEND'.`);
      }
      
      await matricularAlumnosCsv(nombre, apellidos, asignatura, curso, etapa, estado, isToastOpen, toastMessage, toastColor);
    }

    mensajeActualizacion = "Alumno registrado con éxito";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
    
    // Agregar el nuevo alumno a la tabla
    datosMatriculas.value.push({ ...nuevoAlumno.value });

    // Limpiar el formulario
    nuevoAlumno.value = { nombre: "", apellidos: "", matriculas: {} };
  } catch (error) {
    mensajeActualizacion = error.message;
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};

const desmatricularAlumnoCsv = async (index) => {
  try {

    const [curso, etapa] = cursoSeleccionado.value.split("-");
    
    const alumno = datosMatriculas.value[index].nombre;
    const apellidos = datosMatriculas.value[index].apellidos;


    for(const[asignatura, estado] of Object.entries(datosMatriculas.value[index].matriculas)){
      
      await desmatricularAlumnosCsv(alumno, apellidos, asignatura, curso, etapa, estado, isToastOpen, toastMessage, toastColor);
    }

    datosMatriculas.value.splice(index, 1); // Eliminar el alumno de la lista

    mensajeActualizacion = "Matricula modificada con exito";
    mensajeColor = "success";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  } catch (error) {
    mensajeActualizacion = error.message;
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};

const guardarTodo = async () => {
  try {
    // Guardar todas las matrículas modificadas
    for (let i = 0; i < datosMatriculas.value.length; i++) {
      await matricularAsignaturaCsv(i);
    }
    
    // Registrar nuevo alumno si hay datos
    if (!nuevoAlumno.value.nombre || !nuevoAlumno.value.apellidos || !Object.keys(nuevoAlumno.value.matriculas).length > 0) {
      throw new Error("Son obligatorios todos los campos.");
    }
    if (nuevoAlumno.value.nombre && nuevoAlumno.value.apellidos && Object.keys(nuevoAlumno.value.matriculas).length > 0) {
      await registrarNuevoAlumno();
      
    }

  } catch (error) {
    mensajeActualizacion = "Error al guardar los cambios";
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, mensajeActualizacion);
  }
};



onMounted(async () => {
  await cargarCursosEtapa();
  await insertarCursosCargados();
  comprobarBoton();
  
});
</script>

<template>
  <h1 class="m-2">Carga de Matrículas</h1>
  <div class="top-container">
    <div class="top-section">
      <div class="card-upload-csv">
        <div class="container">
          <!-- Selector de curso y etapa -->
          <div class="dropdown">
            <label class="m-1" for="cursos-etapas">Filtrar por curso y etapa</label>
            <select v-model="seleccionado" @change="actualizarSelect" id="cursos-etapas" class="p-2 m-1">
              <option value="">Selecciona un curso</option>
              <option v-for="cursoEtapa in cursosEtapas"
                :key="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`"
                :value="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`">
                {{ cursoEtapa.idCursoEtapa.curso }} - {{ cursoEtapa.idCursoEtapa.etapa }}
              </option>
            </select>
          </div>
  
          <!-- Subida de ficheros -->
          <div class="section">
            <label class="m-1" for="fileInput">Adjunta el csv de las matriculas de Seneca</label>
            <FileUpload ref="fileUploadRef" @file-selected="monitorizarSiHayArchivo" />
            <button @click="subirFichero(); $event.target.blur()"  ref="boton" class="btn" id = "enviar">{{ buttonText }}</button>
          </div>
          <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
          @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
        </div>
      </div>
  
      <!-- Tabla con cursos y etapas que tienen datos -->
      <div class="card-upload-table card-upload-csv">
        <h4 class="m-3 ">Curso y Etapas cargados</h4>
        <table>
        <tbody class="m-1">
          <tr v-for="(cursoE, index) in cursosMapeados" :key="index">
            <td class="th">{{ cursoE }}</td>
            <td class="th">
              <button @click="eliminarCursosCargados(cursoE)" class="eliminar">&times;</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>  
    <!-- Tarjeta con los datos cargados del CSV -->
    <div class="card-upload-data">
      <div class="centro">
        <h4 class="m-3">Datos del CSV cargado</h4>
        <div class="dropdown-datos">
          <select v-model="cursoSeleccionado" id="seleccionar-curso" class="p-2 m-1">
            <option value="">Selecciona un curso</option>
            <option v-for="cursoEtapa in cursosEtapas"
              :key="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`"
              :value="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`">
              {{ cursoEtapa.idCursoEtapa.curso }} - {{ cursoEtapa.idCursoEtapa.etapa }}
            </option>
          </select>
          <button @click="cargarDatosMatriculas" class="btn-csv">Cargar CSV</button>
        </div>
      </div>
      <!-- Tabla con los datos cargados del CSV -->
       <div>
         <table v-if="datosMatriculas.length">
           <thead>
             <tr>
               <th class="columna">Eliminar</th>
               <th class="columna">Nombre</th>
               <th class="columna">Apellidos</th>
               <th class="columna" v-for="asignatura in asignaturas" :key="asignatura">
                 {{ asignatura }}
               </th>
               <th class="columna">Acción</th>
             </tr>
           </thead>
           <tbody>
             <tr v-for="(estudiante, index) in datosMatriculas" :key="index">
               <td class="columna">
                 <button @click="desmatricularAlumnoCsv(index)" class="eliminar">&times;</button>
               </td>
               <td class="columna">{{ estudiante.nombre }}</td> <!-- Nombre -->
               <td class="columna">{{ estudiante.apellidos }}</td> <!-- Apellidos -->
               <td class="columna" v-for="asignatura in asignaturas" :key="asignatura">
                 <input 
                   type="text" 
                   v-model="estudiante.matriculas[asignatura]"
                   class="editable-cell">
               </td>
               <td class="columna">
                 <button class="btn" @click="matricularAsignaturaCsv(index)">Guardar</button>
               </td>
             </tr>
             <tr>
               <td class="columna"></td>
               <td class="columna">
                 <input type="text" v-model="nuevoAlumno.nombre">
               </td>
               <td class="columna">
                 <input type="text" v-model="nuevoAlumno.apellidos">
               </td>
               <td class="columna" v-for="asignatura in asignaturas" :key="asignatura">
                 <input type="text" v-model="nuevoAlumno.matriculas[asignatura]">
               </td>
               <td class="columna">
                 <button class="btn" @click="registrarNuevoAlumno">Registrar</button>
               </td>
             </tr>
           </tbody>
         </table>
         <p v-else>No hay datos cargados del CSV.</p>
       </div>
       <button v-if="datosMatriculas.length > 0" class="btn-guardar-todo" @click="guardarTodo">Guardar todo</button>
    </div>
  </div>
</template>

<style scoped>
/* Centrar el título */
.m-2 {
  font-size: 2.2rem;
  font-weight: 700px; 
  margin-bottom: 1.5rem; 
  text-align: center;
}
.m-3{
  font-size: 1.3rem;
  text-align: center;
}

/* Contenedor centrado */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.m-1 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-align: center;
}
.p-2{
  padding: 0.5rem;
  border: 1px solid #D1D5DB; 
  border-radius: 0.375rem; 
}
.btn {
  padding: 0.5rem;
  border: 1px solid ;
  border-radius: 0.375rem; 
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
}
.btn-csv {
  width: 170px;
  padding: 0.5rem;
  border: 1px solid ;
  border-radius: 0.375rem; 
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
  align-self: center;
  margin-left: 20px;
  margin-bottom: 20px;
}
.btn-guardar-todo {
  width: 170px;
  padding: 0.5rem;
  border: 1px solid ;
  border-radius: 0.375rem; 
  background-color: #4782eb;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-top: 15px;
  margin-bottom: 5px;
  position: sticky;
  top: 0;
  left: 850px;
}

.table-container {
  flex-grow: 1;
  overflow-y: auto;
}

button:disabled{
  color: #FFFFFF;
}

input {
    background: transparent;
    border: none;
    text-align: center;
    width: 100%;
    padding: 0;
    outline: none;
}

.eliminar {
  color: #EF4444;
  font-size: 2rem; /* <-- Reducir tamaño */
  background-color: transparent;
  line-height: 1; /* <-- Ajuste para evitar desbordamiento */
  border: none;
}

/* Secciones */
.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
.top-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}

.dropdown { 
  display: flex;
  flex-direction: column;
}
.dropdown-datos { 
  display: flex;
  flex-direction: row;
}

.centro{
  justify-items: center;
}
 .section { 
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
 } 
.card-upload-csv {
  flex: 1 1 30%;
  min-width: 520px;
  min-height: 400px;
  height: auto;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-upload-table {
  justify-content: flex-start;
  overflow: auto;
    height: 380px;
}
.card-upload-data {
  min-width: 1060px;
  min-height: 500px;
  max-width: 900px;
  height: auto;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  overflow-y: auto;
    max-width: 300px;
  overflow-x: auto;
    max-height: 300px;
  font-size: 13px;
}

.th {
  width: 100%;
  border: 1px solid currentColor; 
  padding: 0.5rem 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}
.columna {
  border: 1px solid currentColor; 
  padding-left: 0.5rem; 
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

table{
  width: 100%;
  border-collapse: collapse;
}
/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .card-upload-csv,
  .card-upload-data{
    flex: 1 1 100%;
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }
  .card-upload-table {
    max-width: 400px;
  }
  .card-upload-data {
    max-width: 75%;
  }
  
  .dropdown,
  .dropdown-datos { 
  display: flex;
  flex-direction: column;
  }
  .btn-guardar-todo {
    position: relative;
    left: 850px;
  }
}

@media ((min-width: 768px) and (max-width: 1132px)) {
  
  .card-upload-csv {
    min-width: 350px;
    min-height: 100%;
    margin-right: 5px;
  }

  .card-upload-table {
    max-width: 100%;
  }
  
  .card-upload-data {
    min-width: 85%;
    min-height: 100%;
    margin-right: 5px;
  }
  
  .dropdown-datos { 
  display: flex;
  flex-direction: column;
  }
  .btn-guardar-todo {
    position: relative;
    left: 850px;
  }
}
/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .card-upload-csv, 
  .card-upload-data {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .card-upload-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .btn,
  .btn-csv,
  .btn-guardar-todo {
    color: black;
  }
  
  button:disabled{
  color: #000000;
}
}
</style>