<template>
  <div class="pdf-viewer-container">
    <div class="pdf-controls">
      <ion-button @click="previousPage" :disabled="currentPage <= 1">
        <ion-icon :icon="chevronBackOutline"></ion-icon>
      </ion-button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <ion-button @click="nextPage" :disabled="currentPage >= totalPages">
        <ion-icon :icon="chevronForwardOutline"></ion-icon>
      </ion-button>
      <ion-button @click="zoomIn">
        <ion-icon :icon="addOutline"></ion-icon>
      </ion-button>
      <ion-button @click="zoomOut">
        <ion-icon :icon="removeOutline"></ion-icon>
      </ion-button>
    </div>

    <div class="pdf-container">
      <div ref="pdfContainer" class="canvas-container">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { chevronBackOutline, chevronForwardOutline, addOutline, 
         removeOutline } from 'ionicons/icons';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Props
const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['pages-counted']);

// Refs
const pdfContainer = ref(null);
const pdfCanvas = ref(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.2);

// Documento PDF
let pdfDoc = null;

// Cargamos
onMounted(async () => {
  try {
    await loadPDF(props.pdfUrl);
  } catch (error) {
    console.error('Error cargando PDF:', error);
  }
});

// Carga PDF
async function loadPDF(url) {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    emit('pages-counted', totalPages.value);
    renderPage(currentPage.value);
  } catch (error) {
    console.error('Error cargando PDF:', error);
  }
}

// render de la página actual
async function renderPage(pageNum) {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: scale.value });
  
  const canvas = pdfCanvas.value;
  const context = canvas.getContext('2d');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  
  await page.render(renderContext).promise;
}

// Navegación
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    renderPage(currentPage.value);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    renderPage(currentPage.value);
  }
}

// Zoom
function zoomIn() {
  scale.value *= 1.2;
  renderPage(currentPage.value);
}

function zoomOut() {
  scale.value /= 1.2;
  renderPage(currentPage.value);
}
</script>

<style scoped>
.pdf-viewer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.pdf-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.page-info {
  margin: 0 15px;
  font-size: 14px;
}

.pdf-container {
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.canvas-container {
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

canvas {
  display: block;
}

/* Modo oscuro a futuro? */
@media (prefers-color-scheme: dark) {
  .pdf-container {
    background-color: #2d2d2d;
  }
  
  .pdf-controls {
    border-bottom: 1px solid #555;
  }
}
</style>