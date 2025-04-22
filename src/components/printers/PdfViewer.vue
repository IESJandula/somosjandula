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
    
    <div class="page-selection-controls">
      <div class="selection-mode">
        <ion-segment v-model="selectionMode">
          <ion-segment-button value="all">
            <ion-label>Todas las páginas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="range">
            <ion-label>Rango de páginas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="custom">
            <ion-label>Páginas específicas</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <div v-if="selectionMode === 'range'" class="range-selector">
        <ion-item>
          <ion-label position="stacked">Desde página:</ion-label>
          <ion-input 
            v-model="pageRangeStart" 
            type="number" 
            min="1" 
            :max="totalPages" 
            @ionChange="validateRangeInputs"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Hasta página:</ion-label>
          <ion-input 
            v-model="pageRangeEnd" 
            type="number" 
            min="1" 
            :max="totalPages" 
            @ionChange="validateRangeInputs"
          ></ion-input>
        </ion-item>
      </div>

      <div v-if="selectionMode === 'custom'" class="custom-selector">
        <ion-item>
          <ion-label position="stacked">Páginas específicas:</ion-label>
          <ion-input 
            v-model="customPages"
            placeholder="Ej: 1,3,5-7,10" 
            @ionChange="validateCustomPages"
          ></ion-input>
          <ion-note>Usa comas para separar páginas y guiones para rangos (ej: 1,3,5-7,10)</ion-note>
        </ion-item>
      </div>

      <div class="page-summary">
        <p>Se imprimirán {{ selectedPageCount }} páginas de {{ totalPages }}.</p>
      </div>
    </div>
    <div class="pdf-container">
      <div ref="pdfContainer" class="canvas-container">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { IonButton, IonIcon, IonSegment, IonSegmentButton, 
         IonLabel, IonItem, IonInput, IonNote } from '@ionic/vue';
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
const emit = defineEmits(['pages-counted', 'selection-changed']);

// Refs
const pdfContainer = ref(null);
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.2);

// Selección de páginas
const selectionMode = ref('all'); // 'all', 'range', o 'custom'
const pageRangeStart = ref(1);
const pageRangeEnd = ref(1);
const customPages = ref('');
const selectedPages = ref<number[]>([]);

// ref pdf
let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

// Propiedad calculada para páginas seleccionadas
const selectedPageCount = computed(() => {
  return selectedPages.value.length;
});

// Monitorizar cambios
watch([selectionMode, pageRangeStart, pageRangeEnd, customPages, totalPages], () => {
  updateSelectedPages();
});

// Carga del PDF
onMounted(async () => {
  try {
    await loadPDF(props.pdfUrl);
  } catch (error) {
    console.error('Error cargando PDF:', error);
  }
});

async function loadPDF(url: string) {
  try {
    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;
    emit('pages-counted', totalPages.value);
    renderPage(currentPage.value);
    
    // Inicializar páginas
    pageRangeEnd.value = totalPages.value;
    // Initialzar páginas seleccionadas
    updateSelectedPages();
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

// Validar rango pags
function validateRangeInputs() {
  if (pageRangeStart.value < 1) {
    pageRangeStart.value = 1;
  }
  
  if (pageRangeEnd.value > totalPages.value) {
    pageRangeEnd.value = totalPages.value;
  }
  
  if (pageRangeStart.value > pageRangeEnd.value) {
    pageRangeStart.value = pageRangeEnd.value;
  }
  
  updateSelectedPages();
}

// Validar rango custom
function validateCustomPages() {
  updateSelectedPages();
}

// Actualziar páginas seleccionadas
function updateSelectedPages() {
  let pages: number[] = [];
  
  if (selectionMode.value === 'all') {
    // todas
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } 
  else if (selectionMode.value === 'range') {
    // rango
    for (let i = pageRangeStart.value; i <= pageRangeEnd.value; i++) {
      pages.push(i);
    }
  } 
  else if (selectionMode.value === 'custom') {
    // Parseo del rango custom
    if (customPages.value.trim()) {
      const parts = customPages.value.split(',');
      
      for (const part of parts) {
        if (part.includes('-')) {
          // Rango tipo "5-10"
          const [start, end] = part.split('-').map(Number);
          
          if (!isNaN(start) && !isNaN(end)) {
            const validStart = Math.max(1, Math.min(start, totalPages.value));
            const validEnd = Math.min(totalPages.value, Math.max(end, 1));
            
            for (let i = validStart; i <= validEnd; i++) {
              if (!pages.includes(i)) {
                pages.push(i);
              }
            }
          }
        } else {
          // Rango "unico" ==> "3"
          const pageNum = parseInt(part);
          
          if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
            if (!pages.includes(pageNum)) {
              pages.push(pageNum);
            }
          }
        }
      }
    }
  }
  
  // Ordenar ascendentemente
  pages.sort((a, b) => a - b);
  
  selectedPages.value = pages;
  
  // Array a string separadas por comas
  emit('selection-changed', pages.join(','));
}

// Verifica si una página específica está incluida en la selección actual
function containsPage(page: number | string): boolean {
  // Convertir el parámetro a número si es una cadena
  const pageNum = typeof page === 'string' ? parseInt(page) : page;
  
  // Verificar si el número es válido y está en las páginas seleccionadas
  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages.value) {
    return selectedPages.value.includes(pageNum);
  }
  return false;
}

// Exponer el método para que pueda ser llamado desde un componente padre
defineExpose({
  containsPage
});
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

.page-selection-controls {
  padding: 15px;
  border-top: 1px solid #ddd;
  background-color: #ffffff;
}

.selection-mode {
  margin-bottom: 15px;
}

.range-selector {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.range-selector ion-item {
  flex: 1;
}

.custom-selector {
  margin-bottom: 15px;
}

.page-summary {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #555;
  padding: 10px 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .pdf-container {
    background-color: #2d2d2d;
  }
  
  .pdf-controls {
    border-bottom: 1px solid #555;
  }
  
  .page-selection-controls {
    border-top: 1px solid #555;
    background-color: #333333;
  }
  
  .page-summary {
    color: #ddd;
  }
}
</style>