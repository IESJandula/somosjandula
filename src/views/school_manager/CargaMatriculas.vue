<script setup>
import { ref, onMounted, toRefs } from 'vue';
import axios from 'axios';
import { IonPage, IonContent, IonTitle, IonSelect, IonSelectOption, IonButton } from '@ionic/vue';

const props = defineProps({
  seleccionados: {
    type: Object,
    required: true
  }
});

const cursosEtapas = ref([]);
const emit = defineEmits(['actualizar-select']);
const seleccionado = ref('');
const { seleccionados } = toRefs(props);
    // Ref para el input de archivo
    const fileInputUsers = ref(null);

// Enviar datos al servidor
const subirFichero = async () => {
    try {
        const file = fileInputUsers.value.files[0];
        
        const formData = new FormData();
        formData.append('csv', file);

        const response = await axios.post('http://localhost:8086/direccion/cargarMatriculas', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'curso': parseInt(seleccionados.value.curso,10),
                'etapa': seleccionados.value.etapa
            }
        });
        console.log("Fichero Cargado:", response.data);
        window.location.reload();
    } catch (error) {
        console.error('Error al cargar matriculas', error);
    }
};

// Cargar los cursos y etapas desde la API
const cargarCursosEtapas = async () => {
    try {
        const response = await axios.get('http://localhost:8086/direccionVentana3/etapaCursos');
        cursosEtapas.value = response.data;
    } catch (error) {
        console.error('Error al cargar cursos y etapas', error);
    }
};

onMounted(() => {
    cargarCursosEtapas();
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
   <ion-page>
    <ion-title class="header-title">Carga de Matrículas</ion-title>


  <ion-content class="ion-padding no-padding">
    <div class="container">
      <!-- Selector de curso y etapa -->
      <div class="section">
        <label for="cursos-etapas">Filtrar por curso y etapa</label>
        <ion-select v-model="seleccionado" @ionChange="actualizarSelect" id="cursos-etapas">
          <ion-select-option value="">Selecciona un curso</ion-select-option>
          <ion-select-option v-for="cursoEtapa in cursosEtapas"
            :key="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`"
            :value="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`">
            {{ cursoEtapa.idCursoEtapa.curso }} - {{ cursoEtapa.idCursoEtapa.etapa }}
          </ion-select-option>
        </ion-select>
      </div>

      <!-- Subida de ficheros -->
      <div class="section">
        <label for="fileInput">Subir fichero</label>
        <input type="file" ref="fileInputUsers" id="fileInput" class="file-input" />
        <ion-button expand="block" @click="subirFichero" class="button">Enviar</ion-button>
      </div>
    </div>
  </ion-content>
</ion-page>
  </template>

<style scoped>
/* Eliminar padding de ion-content */
.no-padding {
    padding-top: -25px; /* Reducir el espacio superior */
    padding-bottom: 0px;
}

/* Centrar el título */
.header-title {
  text-align: center;
  font-weight: bold;
  margin-top: -140px;
  margin-bottom: -200px;
  font-size: 30px;
}

/* Contenedor centrado */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  text-align: center;
  padding-top: -20px;
}

/* Secciones */
.section {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

/* Inputs y selects */
.file-input, ion-select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  width: 100%;
}

/* Botón */
.button {
  margin-top: 5px;
  font-size: 18px;
  font-weight: bold;
  background: #007bff;
  color: white;
  border-radius: 10px;
}

.button:hover {
  background: #0056b3;
}
</style>