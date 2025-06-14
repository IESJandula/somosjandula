<template>
  <div class="print__container">
    <!-- Fila superior: Formulario de Envío de PDF y Tabla de Resultados -->
    <div class="print__top-section">
      <!-- Columna derecha: Formulario de Envío de PDF -->
      <div class="print__form-container">
        <h1 class="print__title">Enviar PDF a Imprimir</h1>
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div class="print__form-section">
            <FileUpload @file-selected="handleFileSelected" />

            <!-- Configuración de impresión -->
            <div class="print__settings-card">
              <div class="print__settings-grid">

                <!-- Primera Fila: Selector de impresora -->
                <div class="print__row">
                  <div class="print__col">
                    <label class="print__label">Destino:</label>
                    <select v-model="formData.printerSelected" class="print__select">
                      <option v-for="printer in printers" :key="printer.name" :value="printer.name">
                        {{ printer.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Segunda Fila: Copias, Color, Orientación y Caras -->
                <div class="print__row">
                  <div class="print__col">
                    <label class="print__label">Copias:</label>
                    <input type="number"
                           v-model="formData.copiesSelected"
                           min="1"
                           max="50"
                           step="1"
                           @input="validateCopiesInput"
                           class="print__input" />
                  </div>

                  <div class="print__col">
                    <label class="print__label">Color:</label>
                    <select v-model="formData.colorSelected" class="print__select">
                      <option v-for="color in colors" :key="color" :value="color">
                        {{ color }}
                      </option>
                    </select>
                  </div>

                  <div class="print__col">
                    <label class="print__label">Orientación:</label>
                    <select v-model="formData.orientationSelected" class="print__select">
                      <option v-for="orientation in orientations" :key="orientation" :value="orientation">
                        {{ orientation }}
                      </option>
                    </select>
                  </div>

                  <div class="print__col">
                    <label class="print__label">Caras:</label>
                    <select v-model="formData.sidesSelected" class="print__select">
                      <option v-for="side in sides" :key="side" :value="side">
                        {{ side }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Nueva fila: Selección de páginas -->
                <div v-if="pdfPreviewUrl && pagesToPrint > 0" class="print__row">
                  <div class="print__col">
                    <div class="print__page-selection">
                      <h4>Selección de páginas</h4>
                      <div class="print__selection-mode">
                        <div class="print__segment">
                          <button type="button" :class="{'print__segment-button--active': selectionMode === 'all'}"
                                  @click="selectionMode = 'all'; updateSelectedPages()">Todas págs.</button>
                          <button type="button" :class="{'print__segment-button--active': selectionMode === 'range'}"
                                  @click="selectionMode = 'range'; updateSelectedPages()">Rango</button>
                          <button type="button" :class="{'print__segment-button--active': selectionMode === 'custom'}"
                                  @click="selectionMode = 'custom'; updateSelectedPages()">Personalizado</button>
                        </div>
                      </div>

                      <div v-if="selectionMode === 'range'" class="print__range-selector">
                        <label class="print__label">Desde página:</label>
                        <input v-model="pageRangeStart" type="number" min="1" :max="pagesToPrint"
                               @input="validateRangeInputs" class="print__input" />
                        <label class="print__label">Hasta página:</label>
                        <input v-model="pageRangeEnd" type="number" min="1" :max="pagesToPrint"
                               @input="validateRangeInputs" class="print__input" />
                      </div>

                      <div v-if="selectionMode === 'custom'" class="print__custom-selector">
                        <label class="print__label">Páginas específicas:</label>
                        <input v-model="customPages" placeholder="Ej: 1,3,5-7,10"
                               @input="validateCustomPages" class="print__input" />
                        <small class="print__note">Usa comas para separar páginas y guiones para rangos (ej: 1,3,5-7,10)</small>
                      </div>

                      <div class="print__page-summary">
                        <p>Se imprimirán {{ selectedPageCount }} páginas de {{ pagesToPrint }}.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tercera Fila: Mensaje de error -->
                <div v-if="mensajeError" class="print__row">
                  <div class="print__col">
                    <p class="print__status-text">{{ mensajeError }}</p>
                  </div>
                </div>

                <!-- Cuarta Fila: Información de la impresión -->
                <div v-if="formData.file" class="print__row">
                  <div class="print__col">
                    <p class="print__folio-text">{{ mensajeImpresion }}</p>
                  </div>
                </div>

                <!-- Botón de Imprimir -->
                <div class="print__row print__row--center print__row--padding-top">
                  <div class="print__col--auto">
                    <button type="submit" class="print__submit-button" :disabled="isButtonDisabled">
                      {{ buttonText }}
                    </button>
                    <div class="print__incidence-message">
                      ¿Crees que sucede algún problema? Crea una incidencia <a @click.prevent="navigateToIssues">aquí</a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Visor PDF cuando haya selección -->
      <div v-if="pdfPreviewUrl" class="print__pdf-preview">
        <button class="print__close-btn" @click="closePdfPreview">✕</button>
        <PdfViewer
            :pdf-url="pdfPreviewUrl"
            @pages-counted="handlePagesCount"
            @selection-changed="handlePageSelectionChanged"
        />
      </div>

      <!-- Tabla de resultados -->
      <div class="print__table-container">
        <h2 class="print__title">Mis impresiones</h2>
        <div class="print__table-content">
          <PrintInfoTable :info="historialImpresiones" :adminRole="false" @actualizar-tabla="actualizarTabla" />
        </div>
        <div class="print__row print__row--center">
          <div class="print__col--auto">
            <button class="print__update-button" @click="actualizarTabla">Actualizar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { obtenerColores, obtenerOrientaciones, obtenerCaras, filtrarDatos, prevalidacionesImpresion, imprimir } from '@/services/printers';
import { obtenerConstantes } from '@/services/constantes';
import PrintInfoTable from '@/components/printers/PrintInfoTable.vue';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import FileUpload from '@/components/printers/FileUpload.vue';
import PdfViewer from '@/components/printers/PdfViewer.vue';
import { obtenerNombreYApellidosUsuario } from '@/services/firebaseService';
import { printersApiUrl } from "@/environment/apiUrls.ts";

// Configuramos la URL del Worker
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
  router.push({ path: '/documents/itIssues' });
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
  }
};

// Cierra la vista previa del PDF
const closePdfPreview = () => {
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value);
    pdfPreviewUrl.value = '';
  }
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
.print__container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.print__top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.print__form-container {
  flex: 1 1 45%;
  min-width: 300px;
  max-width: 600px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px 30px;
  font-family: 'Roboto', sans-serif;
  position: relative;
}

.print__settings-card {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--form-bg-light);
  border-radius: 12px;
}

.print__settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.print__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.print__row--center {
  justify-content: center;
}

.print__row--padding-top {
  padding-top: 20px;
}

.print__col {
  flex: 1 1 22%;
  display: flex;
  flex-direction: column;
}

.print__col--auto {
  flex: 0 0 auto;
}

.print__label {
  font-weight: 500;
  margin-bottom: 5px;
  color: var(--text-color-light);
}

.print__select,
.print__input {
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--button-border-light);
  background-color: var(--form-bg-light);
  color: var(--text-color-light);
}

.print__title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color-light);
}

.print__table-container {
  flex: 1 1 55%;
  min-width: 300px;
  max-width: 90%;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.print__table-content {
  flex-grow: 1;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
}

.print__submit-button,
.print__update-button {
  padding: 10px 20px;
  background-color: var(--button-bg-light);
  color: #fff;
  font-weight: bold;
  border: 2px solid var(--button-border-light);
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

.print__submit-button:disabled {
  background-color: #ccc;
  border-color: #aaa;
  cursor: not-allowed;
}

.print__incidence-message {
  margin-top: 20px;
  text-align: center;
  font-size: 16px;
  color: var(--text-color-light);
}

.print__incidence-message a {
  color: var(--button-border-light);
  text-decoration: underline;
}

.print__incidence-message a:hover {
  color: var(--button-bg-light);
  cursor: pointer;
}

.print__status-text {
  display: block;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
  font-size: 1rem;
  text-align: center;
}

.print__folio-text {
  display: block;
  margin-top: 8px;
  padding: 8px;
  border-radius: 4px;
  background-color: #cce5ff;
  color: #004085;
  font-size: 1rem;
  text-align: center;
}

.print__pdf-preview {
  flex: 1 1 55%;
  min-width: 300px;
  max-width: 90%;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.print__close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 18px;
  background: transparent;
  border: none;
  color: var(--text-color-light);
  cursor: pointer;
}

/* Páginas */
.print__page-selection {
  margin-top: 20px;
}

.print__selection-mode {
  margin-bottom: 10px;
}

.print__segment {
  display: flex;
  gap: 10px;
}

.print__segment-button--active {
  background-color: var(--button-bg-light);
  color: white;
  font-weight: bold;
}

.print__range-selector,
.print__custom-selector {
  margin-top: 10px;
}

.print__note {
  font-size: 12px;
  color: var(--text-color-light);
}

.print__page-summary {
  margin-top: 10px;
  font-size: 14px;
  color: var(--text-color-light);
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .print__form-container,
  .print__table-container,
  .print__settings-card {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
  }

  .print__title {
    color: var(--text-color-dark);
  }

  .print__label,
  .print__select,
  .print__input,
  .print__note,
  .print__page-summary,
  .print__incidence-message {
    color: var(--text-color-dark);
  }

  .print__select,
  .print__input {
    background-color: var(--form-bg-dark);
    border-color: var(--button-border-dark);
  }

  .print__submit-button,
  .print__update-button {
    background-color: var(--button-bg-dark);
    border-color: var(--button-border-dark);
  }

  .print__segment-button--active {
    background-color: var(--button-bg-dark);
    color: white;
  }

  .print__status-text {
    background-color: #2c2c2c;
    color: #e57373;
  }

  .print__folio-text {
    background-color: #3e3e3e;
    color: #a2cffe;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .print__top-section {
    flex-direction: column;
    align-items: center;
  }

  .print__form-container,
  .print__table-container {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: unset;
  }
}
</style>
