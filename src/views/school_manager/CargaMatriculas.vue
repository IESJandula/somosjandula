<script setup>
import { ref, onMounted } from 'vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import { cargarCursosEtapas, subirFicheros, obtenerCursosCargados, borrarMatriculas } from '@/services/schoolManager.js'
import { crearToast } from "@/utils/toast.js";
import { IonToast } from "@ionic/vue";

const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const cursosEtapas = ref([]);
const emit = defineEmits(['actualizar-select']);
const seleccionado = ref('');
let mensajeColor = ''
let mensajeActualizacion = ''
const archivoSeleccionado= ref(false)
const file = ref(null);
const cursosMapeados = ref([]);
const fileUploadRef = ref(null);
const buttonText = ref('Enviar');

const comprobarBoton = () => {
  const boton = document.getElementById('enviar');
  if( archivoSeleccionado.value && seleccionado.value  && validarCSV(file.value)) {
    boton.disabled = false;
    buttonText.value = "Enviar";
    boton.style.backgroundColor = "#4782eb";
  } else {
    boton.style.color = "#000000";
    boton.style.backgroundColor = "#7fa9f4";
    buttonText.value = "No puedes enviar";
    boton.disabled = true;
  }
}

const validarCSV = (archivo) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contenido = event.target.result;
      const lineas = contenido.split("\n");
      const encabezados = lineas[0].split(",").map(h => h.trim()); // Obtener la primera fila

      if (encabezados[0] !== "alumno") {
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
      eliminarCursosCargados(seleccionado.value);

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
      fileUploadComponent.fileClear();
    }
    seleccionado.value = "";
    const fileUploadComponent = fileUploadRef.value;
    fileUploadComponent.fileClear();

    await insertarCursosCargados()
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
    const data = await obtenerCursosCargados(isToastOpen, toastMessage, toastColor);
    if (data===undefined){
      cursosMapeados.value = ""
    }
    else {
      cursosMapeados.value = data.map(curso => `${curso.curso}-${curso.etapa}`);
      console.log(cursosMapeados.value);
    }
    console.log("No hay cursos con matriculas para cargar.")
  } catch (error) {
    console.error('Error al insertar cursos cargados:', error);
  }
};

const eliminarCursosCargados = async (cursoE) => {

  const [curso, etapa] = cursoE.split('-');
  const data = await borrarMatriculas(curso, etapa, isToastOpen, toastMessage, toastColor)
  await insertarCursosCargados();
  return console.log("Borrado con exito: " + data)
}

onMounted(async () => {
  await cargarCursosEtapa(),
  await insertarCursosCargados(),
  comprobarBoton()
});
</script>

<template>
  <h1 class="m-2">Carga de Matrículas</h1>
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
          <button @click="subirFichero" ref="boton" class="btn" id = "enviar">{{ buttonText }}</button>
        </div>
        <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
        @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
      </div>
    </div>

    <!-- Tabla con cursos y etapas que tienen datos -->
    <div class="card-upload-table">
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
  font-size: 22px;
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
  font-size: 20px;
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
  font-size: 17px;
}
.btn:disabled {
  background-color: #484848;
  color: #FFFFFF;
}
.eliminar {
  color: #EF4444;
  font-size: 28px; /* <-- Reducir tamaño */
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
  align-items: stretch;
}

 .dropdown { 
  width: 100%;
  max-width: 250px;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
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
  min-width: 300px;
  max-width: 35%;
  min-height: 100%;
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
  width: 65%;
  flex: 1 1 30%;
  min-width: 300px;
  max-width: 35%;
  min-height: 100%;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: auto;
    height: 380px;
}
.th {
  width: 100%;
  border: 1px solid currentColor; 
  padding: 0.5rem 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  text-align: center;
}
table{
  border-collapse: collapse;
  width: 100%;
}
/* Media queries para hacer que la tarjeta sea más responsive */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .card-upload-csv,
  .card-upload-table {
    flex: 1 1 100%;
    min-width: 500px;
    min-height: 100%;
  }
}
/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-container,
  .printer-status-table,
  .card-upload-csv {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .card-upload-table {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }
  .btn{
    color: black;
  }
}
</style>