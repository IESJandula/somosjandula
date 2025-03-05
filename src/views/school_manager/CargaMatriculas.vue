<script setup>
import { ref, onMounted } from 'vue';
import FileUpload from '@/components/printers/FileUpload.vue';
import { cargarCursosEtapas, subirFicheros } from '@/services/schoolManager.js'

const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const cursosEtapas = ref([]);
const emit = defineEmits(['actualizar-select']);
const seleccionado = ref('');
let mensajeColor = ''
let mensajeActualizacion = ''

// Enviar datos al servidor
const subirFichero = async (file) => {
  if (!file) return;
    try {

      const [curso, etapa] = seleccionado.value.split('-');

      const data = await subirFicheros(file, curso, etapa, toastMessage, toastColor, isToastOpen);
      console.log("Fichero Cargado:", data);
      window.location.reload();
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
  } catch (error) {
    console.error('Error al cargar cursos y etapas', error);
  }
};

onMounted(async () => {
  await cargarCursosEtapa(),
  subirFichero() ;
});

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
</script>

<template>
    <h1 class="m-2">Carga de Matrículas</h1>
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
          <label class="m-1" for="fileInput">Subir fichero</label>
          <FileUpload @file-selected="subirFichero" />
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
</style>