<template>
  <div class="container">
    <!-- Fila superior: Formulario de Envío de PDF y Tabla de Resultados -->
    <div class="top-section">
      <!-- Columna derecha: Formulario de Envío de PDF -->
      <div class="form-container">
        <h1 class="title">Enviar PDF a Imprimir</h1>
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div class="form-section">
            <!-- Usa el componente de carga de archivos -->
            <FileUpload @file-selected="handleFileSelected" />
            
            <!-- Configuración de impresión -->
            <ion-card class="printer-settings-card">
              <ion-grid>
                <!-- Primera Fila: Selector de impresora -->
                <ion-row>
                  <ion-col size="12">
                    <ion-item>
                      <ion-label position="stacked">Destino:</ion-label>
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
                      <ion-label position="stacked">Copias:</ion-label>
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
                      <ion-label position="stacked">Color:</ion-label>
                      <ion-select v-model="formData.colorSelected">
                        <ion-select-option v-for="color in colors" :key="color" :value="color">
                          {{ color }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
                  </ion-col>

                  <ion-col size="12" size-md="3">
                    <ion-item>
                      <ion-label position="stacked">Orientación:</ion-label>
                      <ion-select v-model="formData.orientationSelected">
                        <ion-select-option v-for="orientation in orientations" :key="orientation" :value="orientation">
                          {{ orientation }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
                  </ion-col>

                  <ion-col size="12" size-md="3">
                    <ion-item>
                      <ion-label position="stacked">Caras:</ion-label>
                      <ion-select v-model="formData.sidesSelected">
                        <ion-select-option v-for="side in sides" :key="side" :value="side">
                          {{ side }}
                        </ion-select-option>
                      </ion-select>
                    </ion-item>
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
                      ¿Crees que sucede algún problema? Crea una incidencia <a @click.prevent="navigateToIssues">aquí</a>
                    </div>
                  </ion-col>
                </ion-row>

              </ion-grid>
            </ion-card>
          </div>
        </form>
      </div>

      <!-- Visor PDF cuando haya selección -->
      <div v-if="pdfPreviewUrl" class="pdf-preview-container">
        <ion-button fill="clear" class="close-preview-btn" @click="closePdfPreview">
          <ion-icon :icon="closeOutline" size="small"></ion-icon>
        </ion-button>
        <PdfViewer :pdf-url="pdfPreviewUrl" @pages-counted="handlePagesCount" />
      </div>

      <!-- Tabla de resultados -->
      <div class="table-container">
        <h2 class="title">Mis impresiones</h2>
        <div class="table-content">
          <PrintInfoTable :info="historialImpresiones" :adminRole="false" @actualizar-tabla="actualizarTabla" />
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
import { useRouter } from 'vue-router';
import { obtenerColores, obtenerOrientaciones, obtenerCaras, filtrarDatos, prevalidacionesImpresion, imprimir } from '@/services/printers';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel, IonCard } from '@ionic/vue';
import { IonSelect, IonSelectOption, IonInput, IonButton, IonText, IonIcon } from '@ionic/vue';
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

const formData = ref({
  printerSelected: '',
  copiesSelected: 1,
  colorSelected: 'Color',
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
    // Crea una URL para el PDF seleccionado para visualización
    pdfPreviewUrl.value = URL.createObjectURL(selectedFile);
    
    // Actualiza el botón y mensajes relacionados con el archivo
    buttonLabel.value = selectedFile.name;
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
  // Actualizamos el mensaje de impresión después de contar las páginas
  updatePrintMessage();
  // Validamos el número de copias
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

// Calcula el número total de hojas a imprimir
const calculateTotalSheets = () => {
  const pages = pagesToPrint.value;
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
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.form-container {
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

.table-content {
  flex-grow: 1;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: auto;
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

.pdf-preview-container {
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
}

.close-preview-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 5;
  --padding-start: 5px;
  --padding-end: 5px;
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


/* Media query para dispositivos móviles */
@media (max-width: 768px) {
  .top-section {
    flex-direction: column;
    align-items: center;
  }

  .form-container,
  .table-container {
    flex: 1 1 100%;
    max-width: 100%;
    min-width: unset;
  }
}
</style>
