<template>
  <div class="form-wrapper">
    <div class="form-container">
      <h1 class="title">Inserción masiva de usuarios</h1>
      <div class="form-section">
        <form @submit.prevent="uploadUsers">
          <div>
            <input type="file" ref="fileInputUsers" />
            <ion-button expand="block" type="submit">Crear usuarios</ion-button>
          </div>
        </form>
      </div>
    </div>

    <div class="form-container">
      <h1 class="title">Inserción masiva de apps</h1>
      <div class="form-section">
        <form @submit.prevent="uploadApps">
          <div>
            <input type="file" ref="fileInputApps" />
            <ion-button expand="block" type="submit">Crear aplicaciones</ion-button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tarjeta unificada de gestión de constantes (obtener + actualizar) -->
    <div class="form-container">
      <h1 class="title">Gestión de constantes</h1>
      <div class="form-section">
        <ion-item>
          <ion-label position="stacked">Proyecto:</ion-label>
          <ion-select v-model="proyectoSeleccionado" placeholder="Todos" @ionChange="filtrarPorProyecto">
            <ion-select-option :value="''">Todos</ion-select-option>
            <ion-select-option v-for="proyecto in proyectos" :key="proyecto" :value="proyecto">
              {{ proyecto }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Clave de la constante:</ion-label>
          <ion-select v-model="selectedConstante" placeholder="Selecciona una constante">
            <ion-select-option v-for="constante in constantesFiltradas" :key="constante.clave" :value="constante">
              {{ constante.clave }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item v-if="selectedConstante">
          <ion-label position="stacked">Valor:</ion-label>
          <ion-input v-model="selectedConstante.valor"></ion-input>
        </ion-item>

        <ion-button expand="block" color="primary" :disabled="!selectedConstante"
          @click="actualizarConstanteSeleccionada">
          Actualizar constante
        </ion-button>
      </div>
    </div>

    <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2000"
      @did-dismiss="() => (isToastOpen = false)" position="top"></ion-toast>
  </div>
</template>

<script setup>
  import { IonButton, IonToast, IonItem, IonLabel, IonSelect, IonSelectOption, IonInput } from '@ionic/vue';
  import { ref, computed, onMounted } from 'vue';
  import { importarUsuarios, importarAplicaciones, obtenerConstantes, actualizarConstantes }  from '@/services/firebaseService';
  import { crearToast } from '@/utils/toast.js';

  const toastMessage = ref('');
  const toastColor = ref('success');
  const isToastOpen = ref(false);

  // Ref para el input de archivo
  const fileInputUsers = ref(null);
  const fileInputApps = ref(null);

  // Gestión de constantes: todas las constantes (todos los proyectos) y filtrado por proyecto
  const constantes = ref([]);
  const selectedConstante = ref(null);
  const proyectoSeleccionado = ref('');

  // Lista única de proyectos disponibles a partir de las constantes cargadas
  const proyectos = computed(() => [...new Set(constantes.value.map((c) => c.proyecto))].sort());

  // Constantes visibles según el proyecto seleccionado (o todas si no hay filtro)
  const constantesFiltradas = computed(() =>
    proyectoSeleccionado.value
      ? constantes.value.filter((c) => c.proyecto === proyectoSeleccionado.value)
      : constantes.value
  );

  const uploadUsers = async () => {
    const file = fileInputUsers.value.files[0];
    await importarUsuarios(toastMessage, toastColor, isToastOpen, file);
  };

  const uploadApps = async () => {
    const file = fileInputApps.value.files[0];
    await importarAplicaciones(toastMessage, toastColor, isToastOpen, file);
  };

  /**
   * Carga TODAS las constantes de TODOS los proyectos (GET sin cabeceras).
   */
  const cargarConstantes = async () => {
    try {
      constantes.value = await obtenerConstantes(toastMessage, toastColor, isToastOpen);
    } catch (error) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
    }
  };

  /**
   * Al cambiar de proyecto, si la constante seleccionada ya no pertenece al filtro, se deselecciona.
   */
  const filtrarPorProyecto = () => {
    if (selectedConstante.value && proyectoSeleccionado.value &&
        selectedConstante.value.proyecto !== proyectoSeleccionado.value) {
      selectedConstante.value = null;
    }
  };

  /**
   * Actualiza (POST) la constante seleccionada. El backend hace upsert por proyecto + clave.
   */
  const actualizarConstanteSeleccionada = async () => {
    if (!selectedConstante.value) {
      return;
    }

    try {
      await actualizarConstantes(toastMessage, toastColor, isToastOpen, [
        {
          proyecto: selectedConstante.value.proyecto,
          clave: selectedConstante.value.clave,
          valor: selectedConstante.value.valor,
        },
      ]);
      crearToast(toastMessage, toastColor, isToastOpen, 'success', 'Constante actualizada con éxito');

      // Recargamos para reflejar el valor persistido
      await cargarConstantes();
    } catch (error) {
      crearToast(toastMessage, toastColor, isToastOpen, 'danger', error.message);
    }
  };

  onMounted(async () => {
    await cargarConstantes();
  });
</script>

<style scoped>
  .form-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 20px; /* Espaciado entre las tarjetas */
    justify-content: center; /* Centrar las tarjetas */
  }

  .form-container {
    width: 100%;
    max-width: 400px;
    background-color: var(--form-bg-light);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 10px;
    box-sizing: border-box;
    padding: 20px 30px;
    margin: auto;
    font-family: 'Roboto', sans-serif;
    margin-top: 2%;
  }

  .form-section {
    margin-bottom: 20px;
  }

  .title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 700;
    color: var(--text-color-light);
  }

  ion-button {
    margin-top: 15px;
  }

  /* Modo oscuro */
  @media (prefers-color-scheme: dark) {
    .form-container {
      background-color: var(--form-bg-dark);
      box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
      border: 1px solid #444;
    }

    .title {
      color: var(--text-color-dark);
    }
  }
</style>
