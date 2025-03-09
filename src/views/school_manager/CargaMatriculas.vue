<script setup>
import { ref, onMounted } from 'vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import { cargarCursosEtapas, subirFicheros } from '@/services/schoolManager.js'
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

const comprobarBoton = () => {
  const boton = document.getElementById('enviar');
  if(seleccionado.value && archivoSeleccionado.value){
    boton.disabled = false;
  } else {
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
        reject("El primer campo del CSV debe llamarse 'alumno'");
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
  } else {
    emit('actualizar-select', { curso: null, etapa: '' });
  }
};

onMounted(async () => {
  await cargarCursosEtapa(),
  comprobarBoton()
});
</script>

<template>
  <h1 class="m-2">Carga de Matrículas</h1>
  <div class="card-upload-csv">
    <div class="container">
      <!-- Selector de curso y etapa -->
      <div class="dropdown">
        <label class="m-1" for="cursos-etapas">Filtrar por curso y etapa</label>
        <select v-model="seleccionado" @ionChange="actualizarSelect" id="cursos-etapas" class="p-2 m-1">
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
        <label class="m-1" for="fileInput">Adjunta el csv de las matriculas de seneca</label>
        <FileUpload @file-selected="monitorizarSiHayArchivo" />
        <button @click="subirFichero" class="btn" id = "enviar">Enviar</button>
      </div>
      <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
    </div>
  </div>
  <div class="card-upload-table">
    <div class="container">
      <h2 class="m-2">Tabla</h2>
      >
          <h1 class="m-4">{{ seleccionado.curso }} {{ seleccionado.etapa }}</h1>
          <table class="tablaAlumnos">
            <thead>
              <tr class="blue">
                <th class="th">curso</th>
                <th class="th">etapa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alumno in listadoAlumnosDelGrupoSeleccionado" :key="alumno.id">
                <td class="th"><button class="eliminar" @click="borrarAlumno(alumno)">&times;</button></td>
                <td class="th">{{ alumno.nombre }}</td>
                <td class="th">{{ alumno.apellidos }}</td>
              </tr>
            </tbody>
          </table>
        
    </div>
  </div>
</template>

<style scoped>
/* Centrar el título */
.m-2 {
  font-size: 2.25rem;
  font-weight: 700; 
  margin-bottom: 1.5rem; 
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
  background-color: #3B82F6;
  color: #FFFFFF;
  font-size: 17px;
}
.btn:disabled {
  background-color: #484848;
  color: #FFFFFF;
}

/* Secciones */
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
  max-width: 600px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
 .card-upload-table {
  flex: 5 5 30%;
  min-width: 300px;
  max-width: 600px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

  .title {
    color: var(--text-color-dark);
  }

  .printer-status-table th {
    background-color: #3a3a3a;
    color: var(--text-color-dark);
  }

  .printer-status-table tr:nth-child(even) {
    background-color: #2c2c2c;
  }

  .printer-status-table tr:hover {
    background-color: #3e3e3e;
  }

  .table-container {
    background-color: #2c2c2c;
  }
}
</style>