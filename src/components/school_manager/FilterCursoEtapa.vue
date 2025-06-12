<template>
  <div>
    <!-- Dropdown para seleccionar curso y etapa -->
    <select 
        v-model="seleccionado" 
        @change="actualizarSelect" 
        name="cursos-etapas" 
        id="cursos-etapas" 
        :class="['dropdown', selectClass]">
        <!-- Opción inicial por defecto -->
        <option value="" disabled hidden>Selecciona un curso</option>
        <!-- Genera las opciones dinámicamente desde los datos obtenidos -->
        <option 
            v-for="cursoEtapa in cursosEtapas" 
            :key="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`"
            :value="`${cursoEtapa.idCursoEtapa.curso}-${cursoEtapa.idCursoEtapa.etapa}`">
            {{ cursoEtapa.idCursoEtapa.curso }} {{ cursoEtapa.idCursoEtapa.etapa }}
        </option>
    </select>
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
// Importa las funciones necesarias de Vue y Axios
import { onMounted, ref, computed } from 'vue';
import { cargarCursosEtapas } from '@/services/schoolManager.js'
import { crearToast } from '@/utils/toast.js';
import { IonToast } from "@ionic/vue";

// Declara una variable reactiva para almacenar los cursos y etapas obtenidos del servidor
const cursosEtapas = ref([]);
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Define un emisor para comunicar eventos al componente padre
const emit = defineEmits(['actualizar-select', 'update:modelValue']);

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  selectClass: {
    type: String,
    default: ''
  }
});

// Modificar la variable seleccionado para usar v-model
const seleccionado = computed({
  get() {
    return props.modelValue || '';
  },
  set(value) {
    emit('update:modelValue', value);
  }
});

// Función asíncrona para cargar los datos de cursos y etapas desde el servidor
const cargarCursosEtapa = async () => {
  try {
    const response = await cargarCursosEtapas(isToastOpen, toastMessage, toastColor)
    cursosEtapas.value = response;

  } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
  }
};

// Usa el ciclo de vida onMounted para ejecutar código cuando el componente se monta
onMounted(async() => {
    // Llama a la función para cargar los cursos y etapas
    await cargarCursosEtapa();
});

// Función para emitir un evento con el curso y etapa seleccionados
const actualizarSelect = () => {
    if (seleccionado.value) {
        // Divide el valor seleccionado en curso y etapa
        const [curso, etapa] = seleccionado.value.split('-');
        // Emite el evento con los datos seleccionados
        emit('actualizar-select', { curso: parseInt(curso), etapa });
        console.log("Evento emitido:", { curso: parseInt(curso), etapa });
    } else {
        // Si no hay selección, emite valores por defecto
        emit('actualizar-select', { curso: null, etapa: '' });
    }
};
</script>

<style>
.dropdown {
  padding: 0.5rem;
  border: 1px solid ; 
  border-radius: 0.375rem; 
  width: 100%;
}

.select-sm {
  width: 200px;
  padding: 0.5rem;
  border: 1px solid ; 
  border-radius: 0.375rem; 
}
</style>