<template>
  <div class="viewer__container">
    <div class="viewer__controls">
      <button class="viewer__button" @click="previousPage" :disabled="currentPage <= 1">
        ◀
      </button>
      <span class="viewer__page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button class="viewer__button" @click="nextPage" :disabled="currentPage >= totalPages">
        ▶
      </button>
      <button class="viewer__button" @click="zoomIn">
        ＋
      </button>
      <button class="viewer__button" @click="zoomOut">
        －
      </button>
    </div>

    <div class="viewer__pdf">
      <div ref="pdfContainer" class="viewer__canvas-container">
        <canvas ref="pdfCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const props = defineProps({
  pdfUrl: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['pages-counted', 'selection-changed']);

const pdfContainer = ref(null);
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.2);

let pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

onMounted(async () => {
  try {
    await loadPDF(props.pdfUrl);
  } catch (error) {
    console.error('Error cargando PDF:', error);
  }
});

watch(() => props.pdfUrl, async (newUrl) => {
  try {
    currentPage.value = 1;
    await loadPDF(newUrl);
  } catch (error) {
    console.error('Error recargando PDF:', error);
  }
}, { immediate: false });

async function loadPDF(url: string) {
  try {
    if (pdfDoc) {
      await pdfDoc.destroy();
      pdfDoc = null;
    }

    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;
    totalPages.value = pdfDoc.numPages;

    emit('pages-counted', totalPages.value);
    emit('selection-changed', Array.from({ length: totalPages.value }, (_, i) => i + 1));

    renderPage(currentPage.value);
  } catch (error) {
    console.error('Error loading PDF:', error);
  }
}

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

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  await page.render(renderContext).promise;
}

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
.viewer__container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.viewer__controls {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid var(--button-border-light);
}

.viewer__button {
  margin: 0 5px;
  padding: 6px 12px;
  font-size: 16px;
  background-color: var(--button-bg-light);
  color: var(--background-light);
  border: 1px solid var(--button-border-light);
  border-radius: 4px;
  cursor: pointer;
}

.viewer__button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.viewer__page-info {
  margin: 0 15px;
  font-size: 14px;
  color: var(--text-color-light);
}

.viewer__pdf {
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: var(--form-bg-light);
}

.viewer__canvas-container {
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

canvas {
  display: block;
}

@media (prefers-color-scheme: dark) {
  .viewer__pdf {
    background-color: var(--form-bg-dark);
  }

  .viewer__controls {
    border-bottom: 1px solid var(--button-border-dark);
  }

  .viewer__button {
    background-color: var(--button-bg-dark);
    color: var(--background-dark);
    border: 1px solid var(--button-border-dark);
  }

  .viewer__page-info {
    color: var(--text-color-dark);
  }
}
</style>
