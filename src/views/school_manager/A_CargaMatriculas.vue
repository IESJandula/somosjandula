<template>
  <h1 class="t-1">Carga de Matrículas</h1>
  <div class="top-container">
    <div class="top-section">
      <div class="card-upload-csv">
        <div class="container">
          <!-- Selector de curso y etapa -->
           <div class="t-2">Filtrar por curso y etapa</div>
          <FilterCursoEtapa 
           v-model="filtroSeleccionadoString" 
           @actualizar-select="actualizarSelect" 
           selectClass="select-sm" 
           class="texto-dropdown"/>
  
          <!-- Subida de ficheros -->
          <div class="section">
            <label class="t-3" for="fileInput">Adjunta el csv de las matriculas de Seneca</label>
            <FileUpload ref="fileUploadRef" @file-selected="monitorizarSiHayArchivo" />
            <button @click="subirFichero(); $event.target.blur()"  ref="boton" class="btn" id = "enviar">{{ buttonText }}</button>
            <!-- Spinner de carga -->
            <div v-if="isLoading" class="fondo-gris">
              <div class="circulo"></div>
            </div>
          </div>
          <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
          @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
        </div>
      </div>
  
      <!-- Tabla con cursos y etapas que tienen datos -->
      <div class="card-upload-table card-upload-csv">
        <div class="t-2">Curso y Etapas cargados</div>
        <table>
        <tbody class="t-3">
          <tr v-for="(cursoE, index) in cursosMapeados" :key="index">
            <td class="th">{{ cursoE }}</td>
            <td class="th">
              <button @click="borrarMatricula(cursoE)" class="eliminar">&times;</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>  
    <!-- Tarjeta con los datos cargados del CSV -->
    <div class="card-upload-data">
      <div class="centro">
        <div class="t-2">Datos del CSV cargado</div>
        <!-- Selector de curso y etapa -->
        <div class="dropdown-datos">
          <FilterCursoEtapa 
          v-model="cursoSeleccionado"
          @actualizar-select="actualizarSelectDatos"
          selectClass="select-sm" 
          class="texto-dropdown"/>
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
                 <button @click="desmatricularAlumnosCsv(index)" class="eliminar">&times;</button>
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
                 <button class="btn-guardar-registrar" @click="matricularAsignaturasCsv(index)">Guardar</button>
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
                 <button class="btn-guardar-registrar" @click="matricularAlumnosCsv">Registrar</button>
               </td>
             </tr>
           </tbody>
         </table>
         <p v-else class="t-3">No hay datos cargados del CSV.</p>
       </div>
       <button v-if="datosMatriculas.length > 0" class="btn-guardar-todo" @click="guardarTodo">Guardar todo</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import FilterCursoEtapa from '@/components/school_manager/FilterCursoEtapa.vue';
import { subirFicheros, cargarMatriculas, borrarMatriculas, obtenerDatosMatriculas, matricularAsignaturas, matricularAlumnos, desmatricularAlumnos } from '@/services/schoolManager.js'
import { crearToast } from "@/utils/toast.js";
import { IonToast } from "@ionic/vue";

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
const nuevoAlumno = ref({
  nombre: "",
  apellidos: "",
  matriculas: {}
});
const estadosValidos = ["MATR", "NO_MATR", "SUPCA", "CONV", "APRO", "PEND"];
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

onMounted(async () => {
  await cargarMatricula();
  comprobarBoton();
  
});
</script>

<style scoped>
/* Centrar el título */
.t-1 {
  font-size: 2.2rem;
  font-weight: 700px; 
  margin-bottom: 1.5rem; 
  text-align: center;
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

/* Secciones */
.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
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

/* Contenedor centrado */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.t-2 {
  font-size: 1.3rem;
  text-align: center;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.texto-dropdown {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.section { 
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
 } 

.t-3 {
  margin-bottom: 0.7rem;
  margin-top: 1rem;
  font-size: 1.1rem;
  text-align: center;
}

.btn {
  padding: 0.5rem;
  border-radius: 0.375rem; 
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-top: 0.8rem;
}

.btn:hover {
  background-color: #1461eb;
}

.btn:disabled {
  background-color: #7fa9f4;
  cursor: not-allowed;
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
  border-top: 4px solid #4782eb;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  z-index: 9999;
}

@keyframes spin {
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
}

.card-upload-table {
  justify-content: flex-start;
  overflow: auto;
    height: 380px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

.th {
  width: 100%;
  border: 1px solid currentColor; 
  padding: 0.5rem 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}

.eliminar {
  color: #EF4444;
  font-size: 2rem; /* <-- Reducir tamaño */
  background-color: transparent;
  line-height: 1; /* <-- Ajuste para evitar desbordamiento */
  border: none;
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

.centro {
  justify-items: center;
}

.dropdown-datos { 
  display: flex;
  flex-direction: row;
}

.btn-csv {
  width: 170px;
  padding: 0.5rem;
  border-radius: 0.375rem; 
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
  align-self: center;
  margin-left: 20px;
  margin-bottom: 30px;
}

.btn-csv:hover {
  background-color: #1461eb;
}

.columna {
  border: 1px solid currentColor; 
  padding-left: 0.5rem; 
  padding-right: 0.5rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.btn-guardar-registrar {
  padding: 0.5rem;
  border-radius: 0.375rem; 
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
}

.btn-guardar-registrar:hover {
  background-color: #1461eb;
}

input {
    background: transparent;
    border: none;
    text-align: center;
    width: 100%;
    padding: 0;
    outline: none;
}

.btn-guardar-todo {
  width: 170px;
  padding: 0.5rem;
  border-radius: 0.375rem; 
  background-color: #0054e9;
  color: #FFFFFF;
  font-size: 1.1rem;
  margin-top: 15px;
  margin-bottom: 5px;
  position: sticky;
  top: 0;
  left: 850px;
}

.btn-guardar-todo:hover {
  background-color: #1461eb;
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
  .btn-guardar-registrar,
  .btn-guardar-todo {
    background-color: #4782eb;
    color: #000000;
  }

  .btn:hover {
    background-color: #3476eb;
  }
  
  .btn:disabled {
  color: #000000;
  background-color: #7fa9f4;
  }

  .btn-csv:hover {
    background-color: #3476eb;
  }

  .btn-guardar-registrar:hover {
    background-color: #3476eb;
  }

  .btn-guardar-todo:hover {
    background-color: #3476eb;
  }
}

/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .card-upload-csv,
  .card-upload-data {
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
  
  .dropdown-datos { 
  display: flex;
  flex-direction: column;
  }
  
  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 160px;
  }
}

@media ((min-width: 768px) and (max-width: 1190px)) {
  .card-upload-csv {
    min-width: 350px;
    max-height: 380px;
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
    position: sticky;
    top: 0;
    left: calc(100% - 180px);
  }
}

@media (max-width: 540px) {

  .card-upload-csv, 
  .card-upload-data {
    min-width: 100%;
    max-width: 100%;
  }

  .card-upload-table {
    max-width: 100%;
    width: 100%;
  }

  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 250px;
  }
}

@media (max-width: 440px) {

  .card-upload-csv, 
  .card-upload-data {
    min-width: 100%;
    max-width: 100%;
  }

  .card-upload-table {
    max-width: 100%;
    width: 100%;
  }

  .btn-guardar-todo {
    position: sticky;
    top: 0;
    left: 90px;
  }
}
</style>