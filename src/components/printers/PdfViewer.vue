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
      <div class="canvas-container">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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

// Refs
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.2);

// ref pdf
let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

// Carga del PDF
onMounted(async () => {
  try {
    await loadPDF(props.pdfUrl);
  } catch (error) {
    console.error('Error cargando PDF:', error);
  }
});

// Watcher for changes in pdfUrl
watch(() => props.pdfUrl, async (newUrl) => {
  try {
    // Reset current page to 1 when loading a new PDF
    currentPage.value = 1;
    await loadPDF(newUrl);
  } catch (error) {
    console.error('Error recargando PDF:', error);
  }
}, { immediate: false });

async function loadPDF(url: string) {
  try {
    // Cleanup previous PDF document if exists
    if (pdfDoc) {
      await pdfDoc.destroy();
      pdfDoc = null;
    }
    
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    
    renderPage(currentPage.value);
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

// Mostrar página actual
async function renderPage(pageNum: number) {
  if (!pdfDoc) {
    console.error("Documento PDF no cargado aún.");
    return;
  }

  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: scale.value });

  const canvas = pdfCanvas.value;
  if (!canvas) {
    console.error("Canvas no encontrado.");
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    console.error("Contexto del canvas no encontrado.");
    return;
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Aquí context ya está validado como no nulo
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pdf-container {
    background-color: #2d2d2d;
  }
  
  .pdf-controls {
    border-bottom: 1px solid #555;
  }
}
</style>