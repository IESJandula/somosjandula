<template>
  <div class="container">
         <!-- Fila superior: Formulario + PDF Preview O Tabla -->
     <div class="top-section">
       <!-- Columna izquierda: Formulario de Envío de PDF -->
       <div class="form-container" ref="formContainerRef">
         <h1 class="title">Enviar PDF a Imprimir</h1>
         <form @submit.prevent="submitForm" enctype="multipart/form-data">
           <div class="form-section">
             <!-- Usa el componente de carga de archivos -->
            <div class="file-upload-wrapper">
              <FileUpload @file-selected="handleFileSelected" />
            </div>
             
             <!-- Configuración de impresión -->
             <ion-card class="printer-settings-card">
               <ion-grid>
                 <!-- Primera Fila: Selector de impresora -->
                 <ion-row>
                   <ion-col size="12">
                     <ion-item>
                       <ion-label position="stacked">Destino</ion-label>
                       <ion-select v-model="formData.printerSelected">
                         <ion-select-option v-for="printer in printers" :key="printer.name" :value="printer.name">
                           {{ printer.name }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>
                 </ion-row>

                 <!-- Segunda Fila: Copias, Color, Orientación y Caras -->
                 <ion-row>
                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Copias</ion-label>
                       <ion-input type="number"
                                   v-model="formData.copiesSelected"
                                   min="1"
                                   max="50"
                                   step="1"
                                   @input="validateCopiesInput"></ion-input>
                     </ion-item>
                   </ion-col>

                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Color</ion-label>
                       <ion-select v-model="formData.colorSelected">
                         <ion-select-option v-for="color in colors" :key="color" :value="color">
                           {{ color }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>

                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Orientación</ion-label>
                       <ion-select v-model="formData.orientationSelected">
                         <ion-select-option v-for="orientation in orientations" :key="orientation" :value="orientation">
                           {{ orientation }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>

                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Caras</ion-label>
                       <ion-select v-model="formData.sidesSelected">
                         <ion-select-option v-for="side in sides" :key="side" :value="side">
                           {{ side }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>
                 </ion-row>

                 <!-- Nueva fila: Selección de páginas -->
                 <ion-row v-if="pdfPreviewUrl && pagesToPrint > 0">
                   <ion-col size="12">
                     <div class="page-selection-controls">
                       <h6>Selección de páginas</h6>
                       <div class="selection-mode">
                         <ion-segment v-model="selectionMode" @ionChange="updateSelectedPages">
                           <ion-segment-button value="all">
                             <ion-label>Todas</ion-label>
                           </ion-segment-button>
                           <ion-segment-button value="range">
                             <ion-label>Rango</ion-label>
                           </ion-segment-button>
                           <ion-segment-button value="custom">
                             <ion-label>Personalizado</ion-label>
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
                             :max="pagesToPrint" 
                             @ionChange="validateRangeInputs"
                           ></ion-input>
                         </ion-item>
                         <ion-item>
                           <ion-label position="stacked">Hasta página:</ion-label>
                           <ion-input 
                             v-model="pageRangeEnd" 
                             type="number" 
                             min="1" 
                             :max="pagesToPrint" 
                             @ionChange="validateRangeInputs"
                           ></ion-input>
                         </ion-item>
                       </div>

                       <div v-if="selectionMode === 'custom'" class="custom-selector">
                         <ion-item>
                           <ion-label position="stacked">Páginas específicas:</ion-label>
                           <ion-input 
                             v-model="customPages"
                             placeholder="Ejemplo: 1,3,5-7,10" 
                             @ionChange="validateCustomPages"
                           ></ion-input>
                         </ion-item>
                       </div>

                       <div class="page-summary">
                         <p>Se imprimirán {{ selectedPageCount }} páginas de {{ pagesToPrint }}.</p>
                       </div>
                     </div>
                   </ion-col>
                 </ion-row>

                 <!-- Tercera Fila: Mensaje de error -->
                 <ion-row v-if="mensajeError">
                   <ion-col size="12">
                     <ion-text color="warning" class="status-text">
                       {{ mensajeError }}
                     </ion-text>
                   </ion-col>
                 </ion-row>

                 <!-- Cuarta Fila: Información de la impresión -->
                 <ion-row v-if="formData.file">
                   <ion-col size="12">
                     <ion-text color="primary" class="folio-text">
                       {{ mensajeImpresion }}
                     </ion-text>
                   </ion-col>
                 </ion-row>

                 <!-- Botón de Imprimir -->
                 <ion-row class="ion-justify-content-center ion-padding-top">
                   <ion-col size="auto">
                     <ion-button type="submit" color="primary" expand="block" :disabled="isButtonDisabled">
                       {{ buttonText }}
                     </ion-button>
                     <!-- Mensaje de incidencias -->
                     <div class="incidence-message">
                       ¿Algún problema? Crea una incidencia <a @click.prevent="navigateToIssues">aquí</a>
                     </div>
                   </ion-col>
                 </ion-row>

               </ion-grid>
             </ion-card>
           </div>
         </form>
       </div>

       <!-- Columna derecha: PDF Preview O Tabla de resultados -->
       <div v-if="pdfPreviewUrl" class="pdf-preview-container" ref="pdfContainerRef" :style="previewMaxHeight ? { maxHeight: previewMaxHeight + 'px' } : {}">
         <ion-button fill="clear" class="close-preview-btn" @click="closePdfPreview">
           <ion-icon :icon="closeOutline" size="small"></ion-icon>
         </ion-button>
         <div class="pdf-viewer-wrapper">
           <PdfViewer 
             :pdf-url="pdfPreviewUrl" 
             @pages-counted="handlePagesCount" 
             @selection-changed="handlePageSelectionChanged"
           />
         </div>
       </div>

       <div v-else class="table-container">
         <h2 class="title">Mis impresiones</h2>
         <div class="table-content">
           <div class="table-scroll-inner">
             <PrintInfoTable :info="historialImpresiones" :adminRole="false" @actualizar-tabla="actualizarTabla" />
           </div>
         </div>
         <!-- Botón de Actualizar centrado -->
         <ion-row class="ion-justify-content-center">
           <ion-col size="auto">
             <ion-button color="primary" expand="block" @click="actualizarTabla">Actualizar</ion-button>
           </ion-col>
         </ion-row>
       </div>
     </div>

     <!-- Fila inferior: Tabla de resultados (solo visible cuando SÍ hay PDF) -->
     <div v-if="pdfPreviewUrl" class="bottom-section">
       <div class="table-container full-width">
         <h2 class="title">Mis impresiones</h2>
         <div class="table-content">
           <div class="table-scroll-inner">
             <PrintInfoTable :info="historialImpresiones" :adminRole="false" @actualizar-tabla="actualizarTabla" />
           </div>
         </div>
         <!-- Botón de Actualizar centrado -->
         <ion-row class="ion-justify-content-center">
           <ion-col size="auto">
             <ion-button color="primary" expand="block" @click="actualizarTabla">Actualizar</ion-button>
           </ion-col>
         </ion-row>
       </div>
     </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { obtenerColores, obtenerOrientaciones, obtenerCaras, filtrarDatos, prevalidacionesImpresion, imprimir } from '@/services/printers';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel, IonCard } from '@ionic/vue';
import { IonSelect, IonSelectOption, IonInput, IonButton, IonText, IonIcon, IonSegment, IonSegmentButton, IonNote } from '@ionic/vue';
import { obtenerConstantes } from '@/services/constantes';
import PrintInfoTable from '@/components/printers/PrintInfoTable.vue';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import FileUpload from '@/components/printers/FileUpload.vue';
import PdfViewer from '@/components/printers/PdfViewer.vue';
import { obtenerNombreYApellidosUsuario } from '@/services/firebaseService';
import { printersApiUrl } from "@/environment/apiUrls.ts";
import { closeOutline } from 'ionicons/icons';

// Configuramos la URL del Worker
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const fileUploadRef = ref(null);
const formContainerRef = ref(null);
const pdfContainerRef = ref(null);
const previewMaxHeight = ref(null);
let formResizeObserver = null;

const formData = ref({
  printerSelected: '',
  copiesSelected: 1,
  colorSelected: 'Blanco y negro',
  orientationSelected: 'Vertical',
  sidesSelected: 'Doble cara',
  file: null,
});

// PDF URL
const pdfPreviewUrl = ref('');

const printers = ref([]);
const colors = ref([]);
const orientations = ref([]);
const sides = ref([]);

const buttonLabel = ref('Arrastra o selecciona un archivo PDF');

const mensajeError = ref('');
const mensajeImpresion = ref('');
const globalError = ref('');

const historialImpresiones = ref([]);

const pagesToPrint = ref(0);
const selectedPages = ref([]);

const isButtonDisabled = ref(false);
const buttonText = ref('¡IMPRIMIR!');

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Almacenamos el valor máximo de hojas permitidas aquí
const maximoHojasImpresion = ref(null); 

const router = useRouter();

const navigateToIssues = () => {
  router.push({ path: '/issues' });
};

// Maneja el archivo cuando se selecciona
const handleFileSelected = (selectedFile) => {
  formData.value.file = selectedFile;
  if (selectedFile) {
    // Si había un archivo anterior, liberar su URL para evitar fugas de memoria
    if (pdfPreviewUrl.value) {
      URL.revokeObjectURL(pdfPreviewUrl.value);
    }
    
    // Crea una URL para el PDF seleccionado para visualización
    pdfPreviewUrl.value = URL.createObjectURL(selectedFile);
    
    // Actualiza el botón y mensajes relacionados con el archivo
    buttonLabel.value = selectedFile.name;

    // Resetear las variables relacionadas con las páginas para el nuevo PDF
    pagesToPrint.value = 0;
    selectedPages.value = [];
    selectionMode.value = 'all';
    pageRangeStart.value = 1;
    pageRangeEnd.value = 1;
    customPages.value = '';
    selectedPageCount.value = 0;

    nextTick(() => syncPreviewHeight());
  }
};

// Sincroniza la altura del preview con la altura del formulario
const syncPreviewHeight = () => {
  try {
    if (formContainerRef?.value) {
      const rect = formContainerRef.value.getBoundingClientRect();
      // Restar padding si es necesario (20px arriba y abajo -> 40)
      previewMaxHeight.value = Math.max(0, rect.height);
    }
  } catch (e) {
    // noop
  }
};

// Cierra la vista previa del PDF
const closePdfPreview = () => {
  console.log('❌ closePdfPreview llamado');
  console.log('📊 Estado antes de cerrar - pdfPreviewUrl:', pdfPreviewUrl.value ? 'SÍ' : 'NO');
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value);
    pdfPreviewUrl.value = '';
    console.log('🗑️ PDF Preview cerrado, pdfPreviewUrl limpiado');
  }
  console.log('📊 Estado después de cerrar - pdfPreviewUrl:', pdfPreviewUrl.value ? 'SÍ' : 'NO');
};

// Recibe el conteo de páginas desde el componente PdfViewer
const handlePagesCount = (count) => {
  pagesToPrint.value = count;
  
  // Inicializar correctamente las variables de selección de páginas
  if (selectionMode.value === 'all') {
    // Si está en modo "todas las páginas", seleccionar todas
    selectedPages.value = Array.from({ length: count }, (_, i) => i + 1);
    selectedPageCount.value = count;
  } else if (selectionMode.value === 'range') {
    // En modo rango, ajustar el rango final al número total de páginas
    pageRangeEnd.value = count;
    validateRangeInputs();
  } else if (selectionMode.value === 'custom') {
    // En modo personalizado, validar la selección actual
    validateCustomPages();
  }
  
  // Actualizamos el mensaje de impresión después de contar las páginas
  updatePrintMessage();
  // Validamos el número de copias
  validatePrint();
};

// Recibe las páginas seleccionadas desde el componente PdfViewer
const handlePageSelectionChanged = (pages) => {
  // Restaurar el array
  if (typeof pages === 'string') {
    selectedPages.value = pages.split(',').map(Number).filter(num => !isNaN(num));
  } else {
    selectedPages.value = pages;
  }
  
  // Actualizamos el mensaje de impresión basado en las páginas seleccionadas
  updatePrintMessage();
  // Validamos el número de copias con las páginas seleccionadas
  validatePrint();
};

// Actualiza el mensaje de impresión basado en el cálculo de hojas y opciones de impresión
const updatePrintMessage = () => {
  const totalSheets = calculateTotalSheets();
  const colorMode = formData.value.colorSelected === 'Color' ? 'en color' : 'en blanco y negro';

  if (formData.value.file) {
    mensajeImpresion.value = `Vas a imprimir ${totalSheets} folios ${colorMode}`;
  } else {
    mensajeImpresion.value = ''; // Si no hay archivo, limpia el mensaje
  }
};

// Calcula el número total de hojas a imprimir basado en las páginas seleccionadas
const calculateTotalSheets = () => {
  // Usar el número de páginas seleccionadas si hay selección, de lo contrario usar el total
  const pages = selectedPages.value.length > 0 ? selectedPages.value.length : pagesToPrint.value;
  const copies = formData.value.copiesSelected;
  const isDoubleSided = formData.value.sidesSelected === 'Doble cara';

  const sheetsPerCopy = isDoubleSided ? Math.ceil(pages / 2) : pages;
  const totalSheets = sheetsPerCopy * copies;

  return totalSheets;
};

// Watch para observar cambios en la selección de la impresora y otros campos relevantes
watch(
  [
    () => formData.value.printerSelected,
    () => formData.value.copiesSelected,
    () => formData.value.sidesSelected,
    () => formData.value.colorSelected,
    () => formData.value.file
  ],
  () => {
    if (!globalError.value)
    {
      checkPrinterStatus();
    }
    updatePrintMessage(); // Actualiza el mensaje cada vez que cambien los valores relevantes
    validatePrint();
  }
);

// Watcher para monitorear cambios en pdfPreviewUrl
watch(pdfPreviewUrl, (newValue, oldValue) => {
  console.log('👀 pdfPreviewUrl cambió:', { 
    anterior: oldValue ? 'SÍ' : 'NO', 
    actual: newValue ? 'SÍ' : 'NO',
    valor: newValue 
  });
  nextTick(() => syncPreviewHeight());
});

onUnmounted(() => {
  window.removeEventListener('resize', syncPreviewHeight);
  if (formResizeObserver) {
    try { formResizeObserver.disconnect(); } catch { /* noop */ }
    formResizeObserver = null;
  }
});

// Función para verificar el estado de la impresora seleccionada
const checkPrinterStatus = () => {
  const currentPrinter = printers.value.find(p => p.name === formData.value.printerSelected);
  if (currentPrinter)
  {
    if (currentPrinter.statusId !== 0)
    {
      handleError(`${currentPrinter.status}`); // Maneja el error si la impresora tiene problemas
    }
    else if (currentPrinter.printingQueue > 3)
    {
      handleError("La impresora está ocupada imprimiendo otros documentos");
    }
    else
    { // funciona correctamente esta impresora
      clearError(); // Limpia cualquier error si la impresora está en buen estado
    }
  }
};

// Valida si se puede imprimir basándose en las páginas y el valor máximo
const validatePrint = () =>
{
  // Verifica que haya un archivo seleccionado antes de hacer la validación
  if (!formData.value.file)
  {
    return ;  // No hacer nada si no hay archivo
  }

  const totalSheets = calculateTotalSheets() ;

  if (!formData.value.file || totalSheets > maximoHojasImpresion.value)
  {
    handleError(`El número máximo de hojas permitidas es ${maximoHojasImpresion.value}`);
    isButtonDisabled.value = true;  // Deshabilita el botón si supera el máximo
  }
  else
  {
    clearError();  // Si es válido, habilita el botón
    isButtonDisabled.value = false;
  }
};

// Función para manejar errores y actualizar el botón
const handleError = (message) => {
  mensajeError.value = message;
  isButtonDisabled.value = true;
  buttonText.value = '¡No puedes imprimir!';
};

// Función para limpiar errores y restaurar el botón
const clearError = () => {
  mensajeError.value = '';
  isButtonDisabled.value = false;
  buttonText.value = '¡IMPRIMIR!';
};

const submitForm = async () =>
{
  // Bloquea el botón al enviar el formulario
  isButtonDisabled.value = true;
  buttonText.value = 'Habilitando en 5 segundos'; // Cambia el texto del botón al iniciar el temporizador

  const formDataPayload = new FormData();
  formDataPayload.append('printer', formData.value.printerSelected);
  formDataPayload.append('numCopies', formData.value.copiesSelected);
  formDataPayload.append('orientation', formData.value.orientationSelected);
  formDataPayload.append('color', formData.value.colorSelected);
  formDataPayload.append('sides', formData.value.sidesSelected);

  // Agregar las páginas seleccionadas si no son todas
  if (selectedPages.value.length > 0 && selectedPages.value.length !== pagesToPrint.value) {
    formDataPayload.append('selectedPages', selectedPages.value.join(','));
  }

  const userInfo = await obtenerNombreYApellidosUsuario();
  formDataPayload.append('user', `${userInfo.nombre} ${userInfo.apellidos}`);

  // Asegúrate de que el archivo está seleccionado
  if (!formData.value.file)
  {
    handleError('No se ha seleccionado ningún archivo');
  } 
  else 
  {
    formDataPayload.append('file', formData.value.file);

    try
    {
      const response = await imprimir(toastMessage, toastColor, isToastOpen, formDataPayload);

      if (response.ok)
      {
        mensajeError.value = 'PDF enviado con éxito';
        await actualizarTabla();
        startCountdown();  // Inicia la cuenta regresiva solo si la respuesta es exitosa
        // Restablecer layout: ocultar preview y volver tabla a la derecha
        console.log('🔄 Llamando a closePdfPreview para resetear layout...');
        closePdfPreview();
      }
      else
      {
        handleError('Error al enviar el PDF');
      }
    } 
    catch (error)
    {
      console.error('Error al enviar el formulario:', error);
      handleError('Error al enviar el PDF');
    }
  }
};

// Función para iniciar el temporizador de cuenta regresiva
const startCountdown = () => {
  let countdown = 5;
  const interval = setInterval(() => {
    if (countdown > 0) {
      buttonText.value = `Habilitando en ${countdown} segundos`; // Actualiza el texto del botón con el temporizador
      countdown--;
    } else {
      clearInterval(interval);
      clearError(); // Limpia el error y habilita el botón después de la cuenta regresiva
    }
  }, 1000);
};

// Función para validar la entrada de copias
const validateCopiesInput = () => {
  if (formData.value.copiesSelected < 1) {
    formData.value.copiesSelected = 1; // Reemplaza cualquier valor negativo o cero por 1
  }

  if (formData.value.copiesSelected > 50) {
    formData.value.copiesSelected = 50; // Reemplaza cualquier valor superior a 50 por 50
  }
};

onMounted(async () => {
  await actualizarTabla();
  await obtenerDatos();
  await prevalidarImpresion(); // Llama a la validación del servidor al montar el componente
  await obtenerConstantesInit(); // Llama a la función que obtendrá las constantes
  await nextTick(); // Asegura que Vue haya procesado los cambios antes de verificar el estado de la impresora
  checkPrinterStatus(); // Verifica el estado de la impresora inicial
  syncPreviewHeight();
  window.addEventListener('resize', syncPreviewHeight);

  // Observa cambios de tamaño del formulario para ajustar el preview en caliente
  if (window.ResizeObserver && formContainerRef?.value) {
    formResizeObserver = new ResizeObserver(() => {
      syncPreviewHeight();
    });
    formResizeObserver.observe(formContainerRef.value);
  }
});

const obtenerDatos = async () => {
  try {
    colors.value = await obtenerColores(toastMessage, toastColor, isToastOpen);
    orientations.value = await obtenerOrientaciones(toastMessage, toastColor, isToastOpen);
    sides.value = await obtenerCaras(toastMessage, toastColor, isToastOpen);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    handleError('Error al obtener datos de impresoras');
  }
};

const actualizarTabla = async () => {
  try {
    const userInfo = await obtenerNombreYApellidosUsuario();
    const usuario = userInfo.nombre + " " + userInfo.apellidos ;
    const filtroBusquedaRequest = { user:  usuario };
    const response = await filtrarDatos(toastMessage, toastColor, isToastOpen, filtroBusquedaRequest);

    if (response.ok) {
      historialImpresiones.value = await response.json();
    } else {
      handleError('Error al obtener los datos de la tabla');
    }
  } catch (error) {
    console.error('Error al obtener datos de la tabla:', error);
    handleError('Error al obtener datos de la tabla');
  }
};

// Ajuste de prevalidación para asegurar la consistencia del estado
const prevalidarImpresion = async () => {
  try {
    const response = await prevalidacionesImpresion(toastMessage, toastColor, isToastOpen);
    if (response.ok) {
      const data = await response.json();
      
      if (data.globalError) {
        // Si hay un error global, manejarlo y deshabilitar la impresión
        globalError.value = data.globalError;
        handleError(globalError.value);
      } else {
        // No hay error global, establecer impresoras y verificar el estado de la impresora seleccionada
        globalError.value = ''; // Limpia el error global
        printers.value = data.dtoPrinters;
        if (printers.value.length > 0) {
          formData.value.printerSelected = printers.value[0].name; // Selecciona la primera impresora
          checkPrinterStatus(); // Verifica el estado de la impresora seleccionada
        } else {
          handleError('No hay impresoras disponibles');
        }
      }
    } else {
      handleError('Error en la prevalidación de impresión');
    }
  } catch (error) {
    console.error('Error en la prevalidación:', error);
    handleError('Error en la prevalidación de impresión');
  }
};

// Función para obtener constantes desde el backend
const obtenerConstantesInit = async () =>
{
  try
  {
    const constantes = await obtenerConstantes(printersApiUrl + '/printers/web/constantes', toastMessage, toastColor, isToastOpen) ;

    // Busca la constante con clave 'Maximo hojas impresion'
    const maxHojasConstante = constantes.find(constante => constante.clave === 'Maximo hojas impresion') ;
    
    if (!maxHojasConstante)
    {
      handleError('No se encontró la constante "Maximo hojas impresion".');
    }
    else
    {
      maximoHojasImpresion.value = parseInt(maxHojasConstante.valor, 10) ;
    }
  }
  catch (error)
  {
    console.error('Error al obtener las constantes:', error);
    handleError('Error al obtener constantes');
  }
};

// Variables para la selección de páginas
const selectionMode = ref('all');
const pageRangeStart = ref(1);
const pageRangeEnd = ref(pagesToPrint.value);
const customPages = ref('');
const selectedPageCount = ref(pagesToPrint.value);

// Actualiza las páginas seleccionadas según el modo de selección
const updateSelectedPages = () => {
  if (selectionMode.value === 'all') {
    selectedPages.value = Array.from({ length: pagesToPrint.value }, (_, i) => i + 1);
  } else if (selectionMode.value === 'range') {
    validateRangeInputs();
  } else if (selectionMode.value === 'custom') {
    validateCustomPages();
  }
  selectedPageCount.value = selectedPages.value.length;
};

// Valida los inputs de rango de páginas
const validateRangeInputs = () => {
  const start = parseInt(pageRangeStart.value, 10);
  const end = parseInt(pageRangeEnd.value, 10);
  if (start >= 1 && end <= pagesToPrint.value && start <= end) {
    selectedPages.value = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else {
    selectedPages.value = [];
  }
  selectedPageCount.value = selectedPages.value.length;
};

// Valida las páginas específicas ingresadas
const validateCustomPages = () => {
  const pages = customPages.value.split(',').flatMap(range => {
    if (range.includes('-')) {
      const [start, end] = range.split('-').map(Number);
      if (start >= 1 && end <= pagesToPrint.value && start <= end) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
      }
    } else {
      const page = parseInt(range, 10);
      if (page >= 1 && page <= pagesToPrint.value) {
        return [page];
      }
    }
    return [];
  });
  selectedPages.value = pages;
  selectedPageCount.value = selectedPages.value.length;
};

// Watch for changes in total pages to update the page selection accordingly
watch(
  () => pagesToPrint.value,
  (newPageCount) => {
    if (newPageCount > 0) {
      // Update pageRangeEnd to match the new total page count
      pageRangeEnd.value = newPageCount;
      
      // If in 'all' mode, select all pages of the new document
      if (selectionMode.value === 'all') {
        selectedPages.value = Array.from({ length: newPageCount }, (_, i) => i + 1);
        selectedPageCount.value = newPageCount;
      } 
      // If in range mode, make sure the end page doesn't exceed the total
      else if (selectionMode.value === 'range') {
        if (pageRangeEnd.value > newPageCount) {
          pageRangeEnd.value = newPageCount;
        }
        validateRangeInputs();
      }
      // If in custom mode, validate the entered pages against the new total
      else if (selectionMode.value === 'custom') {
        validateCustomPages();
      }
      
      // Update the print message and validate
      updatePrintMessage();
      validatePrint();
    }
  }
);
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-section {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: stretch;
  gap: 16px;
}

.form-container {
  flex: 0 1 38%;
  min-width: 280px;
  max-width: none;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px 30px;
  font-family: 'Roboto', sans-serif;
  position: relative;
}

ion-item {
  display: flex;
  align-items: center;
  --inner-padding-end: 0;
  padding-left: 0;
}

ion-label {
  flex: 1;
  white-space: nowrap;
  overflow: visible;
  text-align: left;
}

ion-select,
ion-input {
  font-size: 12px;
  flex: 1;
}

.table-container {
  flex: 1 1 62%;
  min-width: 380px;
  max-width: none;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.table-container.full-width {
  flex: 1 1 100%;
  max-width: 100%;
}

.table-content {
  flex-grow: 1;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Forzar scroll horizontal cuando la tabla tenga muchas columnas */
.table-content table {
  width: 100%;
  min-width: 1600px;
}
 
.table-scroll-inner {
  width: 100%;
  min-width: 1600px; /* fuerza scroll si el contenedor es más estrecho */
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color-light);
}

.pdf-selector-container {
  position: relative;
  text-align: center;
  border: 2px dashed var(--button-border-light);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  background-color: var(--form-bg-light);
}

.pdf-selector-container:hover {
  border-color: var(--text-color-light);
}

.pdf-button {
  width: 100%;
  height: 100%;
  display: block;
  line-height: 40px;
  font-weight: bold;
  color: var(--text-color-light);
}

.file-input-hidden {
  display: none;
}

.printer-settings-card {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--form-bg-light);
  border-radius: 12px;
}

.status-text {
  display: block;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
  font-size: 1rem;
  text-align: center;
}

.folio-text {
  display: block;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #cce5ff;
  color: #004085;
  font-size: 1rem;
  text-align: center;
}

.pages-text {
  display: block;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #d4edda;
  color: #155724;
  font-size: 1rem;
  text-align: center;
}

.pdf-preview-container {
  flex: 1 1 62%;
  min-width: 380px;
  max-width: none;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.close-preview-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 5;
  --padding-start: 5px;
  --padding-end: 5px;
}

.pdf-viewer-wrapper {
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 100%;
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .form-container,
  .table-container,
  .printer-settings-card {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  }

  .title {
    color: var(--text-color-dark);
  }

  .pdf-selector-container {
    border-color: var(--button-border-dark);
    background-color: var(--form-bg-dark);
  }

  .pdf-selector-container:hover {
    border-color: var(--text-color-dark);
  }

  .pdf-button {
    color: var(--text-color-dark);
  }

  .status-text {
    background-color: #2c2c2c;
    color: #e57373;
  }

  .folio-text {
    background-color: #3e3e3e;
    color: #a2cffe;
  }

  .pages-text {
    background-color: #3e4a3e;
    color: #8fd19e;
  }
}

.incidence-message {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: var(--text-color-light);
}

.incidence-message a {
  color: var(--primary-color);
  text-decoration: underline;
}

.incidence-message a:hover {
  color: var(--primary-color-hover);
  cursor: pointer ;
}

.page-selection-controls {
  margin-top: 20px;
}

.page-selection-controls h6 {
  margin-bottom: 2px;
}

.selection-mode {
  margin-top: 0;
  margin-bottom: 4px;
}

/* Reducir tamaño de texto de las opciones del segmento (TODAS PÁGS., RANGO, PERSONALIZA) */
.selection-mode ion-label {
  font-size: 13px;
  text-transform: none;
}

/* Ionic aplica mayúsculas a los botones del segmento; lo anulamos */
.selection-mode :deep(.segment-button) {
  text-transform: none;
  letter-spacing: normal;
}

.range-selector,
.custom-selector {
  margin-top: 10px;
}

.page-summary {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-color-light);
}

/* Media query para dispositivos móviles */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .form-container,
  .table-container,
  .pdf-preview-container {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: unset;
  }

  .bottom-section {
    margin-top: 20px;
  }
}

/* Estilos para la nueva estructura */
.bottom-section {
  margin-top: 20px;
}

.table-container.full-width {
  flex: 1 1 100%;
  max-width: 100%;
}

.file-upload-wrapper {
  max-width: 420px;
}

@media (max-width: 768px) {
  .file-upload-wrapper {
    max-width: 100%;
  }
}
</style>
