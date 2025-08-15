<template>
    <div>
      <!-- Dropdown para seleccionar curso y etapa -->
      <select 
            id="curso-etapa-grupo-select"
            v-model="seleccionado" @change="actualizarSelect"
            class="dropdown-select">
            <option value="">Selecciona un curso-etapa-grupo</option>
            <option
                v-for="item in cursosEtapasGrupos"
                :key="`${item.curso}-${item.etapa}-${item.grupo}`"
                :value="item">
              {{ item.curso }} - {{ item.etapa }} - {{ item.grupo }}
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
  import { obtenerCursosEtapasGrupos } from '@/services/schoolManager.js'
  import { crearToast } from '@/utils/toast.js';
  import { IonToast } from "@ionic/vue";
  
  // Declara una variable reactiva para almacenar los cursos y etapas obtenidos del servidor
  const cursosEtapasGrupos = ref([]);
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
  
  const obtenerCursoEtapaGrupo = async () => {
    try {

    const response = await obtenerCursosEtapasGrupos(toastMessage, toastColor, isToastOpen);
    cursosEtapasGrupos.value = response;

    } catch (error) {
    mensajeColor = "danger";
    crearToast(toastMessage, toastColor, isToastOpen, mensajeColor, error.message);
    console.error(error);
    }
  };
  
  // Usa el ciclo de vida onMounted para ejecutar código cuando el componente se monta
  onMounted(async() => {
      // Llama a la función para cargar los cursos, etapas y grupos
      await obtenerCursoEtapaGrupo();
  });
  
  // Función para emitir un evento con el curso y etapa seleccionados
  const actualizarSelect = () => {
      if (seleccionado.value) {
          // Divide el valor seleccionado en curso y etapa
          const cursoEtapaGrupo = seleccionado.value;
          const curso = cursoEtapaGrupo.curso;
          const etapa = cursoEtapaGrupo.etapa;
          const grupo = cursoEtapaGrupo.grupo;
          // Emite el evento con los datos seleccionados
          emit('actualizar-select', { curso: parseInt(curso), etapa, grupo });
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

  .dropdown-select {
    width: 270px;
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid ; 
  }
</style>