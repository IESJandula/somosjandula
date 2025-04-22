<template>
  <div class="pdf-field-selector">
    <ion-header>
      <ion-toolbar>
        <ion-title>PDF Field Selector</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closePdfSelector">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div v-if="isLoading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Cargando PDF...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircleOutline" color="danger" size="large"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="retryLoading">Retry</ion-button>
      </div>

      <div v-else class="pdf-container">
        <pdf-viewer
          :pdf-url="pdfUrl"
          :initial-fields="savedFields"
          @fields-selected="handleFieldsSelected"
          @field-added="handleFieldAdded"
          @field-removed="handleFieldRemoved"
        ></pdf-viewer>
      </div>
    </ion-content>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
         IonIcon, IonContent, IonFooter, IonSpinner } from '@ionic/vue';
import { closeOutline, alertCircleOutline } from 'ionicons/icons';
import PdfViewer from './PdfViewer.vue';

// Props
const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  },
  documentId: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['close', 'fields-saved']);

// State
const isLoading = ref(true);
const error = ref('');
const savedFields = ref([]);



function retryLoading() {
  error.value = '';
  isLoading.value = true;
  
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
}
</script>

<style scoped>
.pdf-field-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 20px;
}

.error-container ion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pdf-container {
  height: 100%;
  overflow: hidden;
}
</style>