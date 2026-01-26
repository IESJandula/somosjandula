<template>
  <div class="container">
         <!-- Fila superior: Formulario + PDF Preview O Tabla -->
     <div class="top-section">
       <!-- Columna izquierda: Formulario de Envío de PDF -->
       <div class="form-container" ref="contenedorFormularioRef">
         <h1 class="title">Enviar PDF a Imprimir</h1>
         <form @submit.prevent="enviarPDFAImprimir" enctype="multipart/form-data">
           <div class="form-section">
             <!-- Usa el componente de carga de archivos -->
            <div class="file-upload-wrapper">
              <FileUpload @file-selected="manejarArchivoSeleccionado" />
            </div>
             
             <!-- Configuración de impresión -->
             <ion-card class="printer-settings-card">
               <ion-grid>
                 <!-- Primera Fila: Selector de impresora -->
                 <ion-row>
                   <ion-col size="12">
                     <ion-item>
                       <ion-label position="stacked">Destino</ion-label>
                       <ion-select v-model="seleccionImpresora">
                         <ion-select-option v-for="impresora in impresorasDisponibles" :key="impresora.name" :value="impresora.name">
                           {{ impresora.name }}
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
                       <ion-input type="number" v-model="seleccionCopias" min="1" max="50" step="1" @input="validarNumeroDeCopias"></ion-input>
                     </ion-item>
                   </ion-col>

                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Color</ion-label>
                       <ion-select v-model="seleccionColor">
                         <ion-select-option v-for="color in coloresDisponibles" :key="color" :value="color">
                           {{ color }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>

                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Orientación</ion-label>
                       <ion-select v-model="seleccionOrientacion">
                         <ion-select-option v-for="orientacion in orientacionesDisponibles" :key="orientacion" :value="orientacion">
                           {{ orientacion }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>

                   <ion-col size="12" size-md="3">
                     <ion-item>
                       <ion-label position="stacked">Caras</ion-label>
                       <ion-select v-model="seleccionCaras">
                         <ion-select-option v-for="caras in carasDisponibles" :key="caras" :value="caras">
                           {{ caras }}
                         </ion-select-option>
                       </ion-select>
                     </ion-item>
                   </ion-col>
                 </ion-row>

                 <!-- Nueva fila: Selección de páginas -->
                 <ion-row v-if="urlVistaPreviaPdf">
                   <ion-col size="12">
                     <div class="page-selection-controls">
                       <h6>Selección de páginas</h6>
                       <div class="selection-mode">
                         <ion-segment v-model="pdfModoSeleccionPaginas">
                           <ion-segment-button value="TODAS">
                             <ion-label>TODAS</ion-label>
                           </ion-segment-button>
                           <ion-segment-button value="RANGO">
                             <ion-label>RANGO</ion-label>
                           </ion-segment-button>
                           <ion-segment-button value="ESPECÍFICAS">
                             <ion-label>ESPECÍFICAS</ion-label>
                           </ion-segment-button>
                         </ion-segment>
                       </div>

                       <div v-if="pdfModoSeleccionPaginas === 'RANGO'" class="range-selector">
                         <ion-item>
                           <ion-label position="stacked">Desde página:</ion-label>
                           <ion-input v-model="pdfPaginasRangoInicio" type="number" min="1" :max="pdfPaginasTotales" @ionChange="validarRangoDePaginas"></ion-input>
                         </ion-item>
                         <ion-item>
                           <ion-label position="stacked">Hasta página:</ion-label>
                           <ion-input v-model="pdfPaginasRangoFin" type="number" min="1" :max="pdfPaginasTotales" @ionChange="validarRangoDePaginas"></ion-input>
                         </ion-item>
                       </div>

                       <div v-if="pdfModoSeleccionPaginas === 'ESPECÍFICAS'" class="custom-selector">
                         <ion-item>
                           <ion-label position="stacked">Páginas específicas:</ion-label>
                           <ion-input v-model="pdfPaginasEspecificas" placeholder="Ejemplo: 1,3,5-7,10" @ionChange="validarPaginasEspecificas"></ion-input>
                         </ion-item>
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
                 <ion-row v-if="mensajeImpresion">
                   <ion-col size="12">
                     <ion-text color="primary" class="folio-text">
                       {{ mensajeImpresion }}
                     </ion-text>
                   </ion-col>
                 </ion-row>

                 <!-- Botón de Imprimir -->
                 <ion-row class="ion-justify-content-center ion-padding-top">
                   <ion-col size="auto">
                     <ion-button type="submit" color="primary" expand="block" :disabled="botonImpresionDeshabilitado">
                       {{ botonImpresionTexto }}
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
       <div v-if="urlVistaPreviaPdf" class="pdf-preview-container" :style="alturaMaximaVistaPreviaPdf ? { maxHeight: alturaMaximaVistaPreviaPdf + 'px' } : {}">
         <ion-button fill="clear" class="close-preview-btn" @click="cerrarVistaPreviaPdf">
           <ion-icon :icon="closeOutline" size="small"></ion-icon>
         </ion-button>
         <div class="pdf-viewer-wrapper">
           <PdfViewer :pdf-url="urlVistaPreviaPdf" />
         </div>
       </div>

       <div v-else class="table-container">
         <h2 class="title">Mis impresiones</h2>
         <div class="table-content">
           <div class="table-scroll-inner">
             <PrintInfoTable :info="historialImpresiones" :adminRole="false" @actualizar-tabla="actualizarTablaHistorialImpresiones" />
           </div>
         </div>
         <!-- Botón de Actualizar centrado -->
         <ion-row class="ion-justify-content-center">
           <ion-col size="auto">
             <ion-button color="primary" expand="block" @click="actualizarTablaHistorialImpresiones">Actualizar</ion-button>
           </ion-col>
         </ion-row>
       </div>
     </div>

     <!-- Fila inferior: Tabla de resultados (solo visible cuando SÍ hay PDF) -->
     <div v-if="urlVistaPreviaPdf" class="bottom-section">
       <div class="table-container full-width">
         <h2 class="title">Mis impresiones</h2>
         <div class="table-content">
           <div class="table-scroll-inner">
             <PrintInfoTable :info="historialImpresiones" :adminRole="false" @actualizar-tabla="actualizarTablaHistorialImpresiones" />
           </div>
         </div>
         <!-- Botón de Actualizar centrado -->
         <ion-row class="ion-justify-content-center">
           <ion-col size="auto">
             <ion-button color="primary" expand="block" @click="actualizarTablaHistorialImpresiones">Actualizar</ion-button>
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
import { IonSelect, IonSelectOption, IonInput, IonButton, IonText, IonIcon, IonSegment, IonSegmentButton } from '@ionic/vue';
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

/*****************************/
/*** Vista previa del PDF ****/
/*****************************/
const contenedorFormularioRef         = ref(null);
const alturaMaximaVistaPreviaPdf      = ref(null);
const urlVistaPreviaPdf               = ref('');
let observadorCambioTamanioFormulario = null;

/*****************************/
/**** Modos de selección *****/
/*****************************/
const MODO_SELECCION_PAGINAS_TODAS       = 'TODAS';
const MODO_SELECCION_PAGINAS_RANGO       = 'RANGO';
const MODO_SELECCION_PAGINAS_ESPECIFICAS = 'ESPECÍFICAS';

/*******************************************/
/***** Lista de valores del formulario *****/
/*******************************************/
const impresorasDisponibles    = ref([]);
const coloresDisponibles       = ref([]);
const orientacionesDisponibles = ref([]);
const carasDisponibles         = ref([]);

/*****************************/
/*** Selección del usuario ***/
/*****************************/
const seleccionArchivo     = ref(null);
const seleccionImpresora   = ref('');
const seleccionCopias      = ref(1);
const seleccionColor       = ref('Blanco y negro');
const seleccionOrientacion = ref('Vertical');
const seleccionCaras       = ref('Doble cara');
const seleccionPaginas     = ref([]);

/***************************/
/*********** PDF ***********/
/***************************/
const pdfPaginasTotales       = ref(0);
const pdfModoSeleccionPaginas = ref(MODO_SELECCION_PAGINAS_TODAS);
const pdfPaginasRangoInicio   = ref(1);
const pdfPaginasRangoFin      = ref(1);
const pdfPaginasEspecificas   = ref('');

/*****************************/
/**** Botón de impresión *****/
/*****************************/
const botonImpresionTexto         = ref('¡IMPRIMIR!');
const botonImpresionDeshabilitado = ref(false);

/*****************************/
/** Mensajes del formulario **/
/*****************************/
const mensajeSeleccionPdf = ref('Arrastra o selecciona un archivo PDF');
const mensajeImpresion    = ref('');
const mensajeError        = ref('');
const errorImpresora      = ref('');
const errorGlobal         = ref('');

/*****************************/
/***** Variables de toast ****/
/*****************************/
const isToastOpen  = ref(false);
const toastMessage = ref('');
const toastColor   = ref('success');

/*****************************/
/*** Consultas al servidor ***/
/*****************************/
const maximoHojasImpresion = ref(null); 
const historialImpresiones = ref([]);

/*****************************/
/*** Routing - incidencias ***/
/*****************************/
const router = useRouter();

const navigateToIssues = () => {
  router.push({ path: '/issues' });
};

/**
 * Maneja el archivo cuando se selecciona
 * @param {File} archivoSeleccionado - El archivo seleccionado
 */
const manejarArchivoSeleccionado = (archivoSeleccionado) =>
{
  seleccionArchivo.value = archivoSeleccionado;
  if (seleccionArchivo.value)
  {
    // Si había un archivo anterior, liberar su URL para evitar fugas de memoria
    if (urlVistaPreviaPdf.value)
    {
      URL.revokeObjectURL(urlVistaPreviaPdf.value);
    }
    
    // Crea una URL para el PDF seleccionado para visualización
    urlVistaPreviaPdf.value = URL.createObjectURL(archivoSeleccionado);

    // Actualiza el botón y mensajes relacionados con el archivo
    mensajeSeleccionPdf.value = archivoSeleccionado.name;

   // Obtenemos el número de páginas del PDF
   const reader = new FileReader();
    reader.onload = async (e) =>
    {
      // Obtenemos el array buffer del archivo PDF
      const arrayBuffer = e.target.result;

      // Reseteamos los valores del formulario
      pdfModoSeleccionPaginas.value = MODO_SELECCION_PAGINAS_TODAS;
      pdfPaginasRangoInicio.value = 1;
      pdfPaginasEspecificas.value = '';

      // Contamos las páginas totales del archivo PDF
      contarPaginasTotalesDelFicheroPdf(arrayBuffer);
    };

    // Leemos el archivo PDF como un array buffer
    reader.readAsArrayBuffer(archivoSeleccionado);

    // La función nextTick se ejecuta después de que el DOM se haya actualizado
    // por lo que podemos sincronizar la altura de la vista previa del PDF
    nextTick(() => sincronizarAlturaVistaPreviaPdf());
  }
};

/**
 * Función para contar las páginas del PDF
 * @param {File} ficheroPdf - El archivo PDF
 */
const contarPaginasTotalesDelFicheroPdf = async (ficheroPdf) =>
{
  try
  { 
    // Utilizamos la librería pdfjs-dist para obtener el número de páginas totales del archivo PDF
    const pdf = await getDocument({ data: ficheroPdf }).promise;

    // Actualizamos el número de páginas totales del archivo PDF
    pdfPaginasTotales.value  = pdf.numPages;

    // Reseteamos el rango final de páginas
    pdfPaginasRangoFin.value = pdfPaginasTotales.value;

    // Validamos la impresión
    validarImpresion();
  }
  catch (error)
  {
    // No realizamos ninguna acción
    console.error('Error al contar las páginas del PDF:', error);
  }
};

/**
 * Validamos si se puede imprimir basándose en el número total de hojas a imprimir y el valor máximo
 */
const validarImpresion = async () =>
{
  let validacionCorrecta = false;

  // Verificamos si hay un error global
  if (!errorGlobal.value)
  {
    // Prevalidamos el sistema de forma global y obtenemos las impresoras actualizadas
    await prevalidacionGlobalObteniendoImpresoras();

    // Comprobamos el estado de la impresora seleccionada
    comprobarEstadoImpresoraSeleccionada();
  
    // Verificamos si hay un error de la impresora
    if (!errorImpresora.value)
    {
      // Verificamos que haya un archivo seleccionado
      if (!seleccionArchivo.value)
      {
        // Creamos un error si no hay archivo seleccionado
        manejarError('Selecciona un archivo para imprimir');
      }
      else
      {
        // Obtenemos el número de hojas a imprimir
        const numeroTotalDeHojasAImprimir = calcularNumeroTotalDeHojasAImprimir();

        // Si el mensaje de error es '', entonces podemos seguir con las validaciones
        if (mensajeError.value === '')
        {
          // Actualizamos el mensaje de impresión
          actualizarMensajeImpresion(numeroTotalDeHojasAImprimir);
         
          // Deshabilitamos el botón de impresión si el número total de hojas a imprimir supera el valor máximo permitido
          botonImpresionDeshabilitado.value = numeroTotalDeHojasAImprimir > maximoHojasImpresion.value;
  
          // Manejamos el error si el número total de hojas a imprimir supera el valor máximo permitido
          if (botonImpresionDeshabilitado.value)
          {
            // Manejamos el error si el número total de hojas a imprimir supera el valor máximo permitido
            manejarError(`El número máximo de hojas permitidas es ${maximoHojasImpresion.value}`);
          }
          else
          {
            validacionCorrecta = true;
          }
        }
      }
    }
  }

  return validacionCorrecta;
};

/**
 * Calcula el número total de hojas a imprimir basado en las páginas seleccionadas
 * @returns {number} - El número total de hojas a imprimir
 */
const calcularNumeroTotalDeHojasAImprimir = () =>
{
  // Limpiamos las páginas seleccionadas
  seleccionPaginas.value = [];

  // En función del modo de selección de páginas, actualizamos las páginas seleccionadas
  if (pdfModoSeleccionPaginas.value === MODO_SELECCION_PAGINAS_TODAS)
  {
    // Obtenemos todas las páginas
    seleccionPaginas.value = Array.from({ length: pdfPaginasTotales.value }, (_, i) => i + 1);
  } 
  else if (pdfModoSeleccionPaginas.value === MODO_SELECCION_PAGINAS_RANGO)
  {
    // Validamos el rango de páginas
    validarRangoDePaginas(pdfPaginasRangoInicio.value, pdfPaginasRangoFin.value);

    // Si el mensaje de error es '', entonces podemos obtener el rango de páginas
    if (mensajeError.value === '')
    {
      // Obtenemos el comienzo y el fin del rango en formato numérico
      const comienzoRango = parseInt(pdfPaginasRangoInicio.value, 10);
      const finRango = parseInt(pdfPaginasRangoFin.value, 10);
    
      // Generamos un array de páginas del rango
      seleccionPaginas.value = Array.from({ length: finRango - comienzoRango + 1 }, (_, i) => comienzoRango + i);      
    }
  }
  else // MODO_SELECCION_PAGINAS_ESPECIFICAS
  {
    // Validamos las páginas específicas
    validarPaginasEspecificas(pdfPaginasEspecificas.value);

    // Si el mensaje de error es '', entonces podemos obtener las páginas específicas
    if (mensajeError.value === '')
    {
      // Obtenemos las páginas específicas
      seleccionPaginas.value = calcularPaginasEspecificas();
    }
  }

  // Obtenemos el número de páginas seleccionadas
  const numeroDePaginasSeleccionadas = seleccionPaginas.value.length ;

  // Obtenemos el número de copias
  const numeroDeCopias = seleccionCopias.value;

  // Obtenemos si es doble cara
  const esDobleCara = seleccionCaras.value === 'Doble cara';

  // Calculamos el número de hojas por copia
  const hojasPorCopia = esDobleCara ? Math.ceil(numeroDePaginasSeleccionadas / 2) : numeroDePaginasSeleccionadas;

  // Calculamos el número total de hojas a imprimir (hojas por copia * número de copias)
  return hojasPorCopia * numeroDeCopias ;
};

/**
 * Calcula las páginas específicas
 * @returns {array} - El array de páginas específicas
 */
const calcularPaginasEspecificas = () =>
{
  try
  {
    // Separamos las páginas específicas por comas
    // unimos casos como "1", "1-3", "1,3,5-7", "1,3,5-7,10" en un array de páginas
    // para tener algo como este array: [1, 2, 3, 5, 6, 7, 10]
    const paginas = pdfPaginasEspecificas.value.split(',').flatMap(valor =>
    {
      // Eliminamos los espacios en blanco
      valor = valor.trim();

      // Si la página es un rango, la procesamos
      if (valor.includes('-'))
      {
        // Separamos el rango por el guión medio
        const [comienzo, fin] = valor.split('-').map(Number);

        // Generamos un array de páginas del rango
        return Array.from({ length: fin - comienzo + 1 }, (_, i) => comienzo + i);
      }
      else
      {
        // Si la página es una sola, la convertimos a número y la validamos
        const pagina = Number(valor);

        // Devolvemos el array con la página
        return [pagina];
      }
    });

    // Le aplicamos un Set para eliminar duplicados y ordenamos el array de páginas
    return [...new Set(paginas)].sort((a, b) => a - b);
  }
  catch (error)
  {
    manejarError(error.message);

    return [];
  }
};

/**
 * Actualiza el mensaje de impresión basado en el cálculo de hojas y opciones de impresión
 * @param {number} numeroTotalDeHojasAImprimir - El número total de hojas a imprimir
 */
 const actualizarMensajeImpresion = (numeroTotalDeHojasAImprimir) =>
{
  const colorMode = seleccionColor.value === 'Color' ? 'en color' : 'en blanco y negro';

  if (seleccionArchivo.value)
  {
    let folio = 'folios';
    if (numeroTotalDeHojasAImprimir === 1)
    {
      folio = 'folio';
    }
    
    // Si hay archivo, actualiza el mensaje de impresión
    mensajeImpresion.value = `Vas a imprimir ${numeroTotalDeHojasAImprimir} ${folio} ${colorMode}`;
  }
  else
  {
    // Si no hay archivo, limpia el mensaje
    mensajeImpresion.value = '';
  }
};

/**
 * Envia el PDF a imprimir
 */
const enviarPDFAImprimir = async () =>
{
  // Validamos la impresión
  const validacionCorrecta = await validarImpresion();

  // Si llegamos a este punto es porque todos los valores y estado de la impresora son correctos
  if (validacionCorrecta)
  {
    // Bloqueamos el botón al enviar el formulario
    botonImpresionDeshabilitado.value = true;

    // Cambiamos el texto del botón al iniciar el temporizador
    botonImpresionTexto.value = 'Habilitando en 5 segundos';
  }

  const formDataPayload = new FormData();

  formDataPayload.append('printer', seleccionImpresora.value);
  formDataPayload.append('numCopies', seleccionCopias.value);
  formDataPayload.append('orientation', seleccionOrientacion.value);
  formDataPayload.append('color', seleccionColor.value);
  formDataPayload.append('sides', seleccionCaras.value);

  // Agregar las páginas seleccionadas si no son todas
  if (seleccionPaginas.value.length > 0)
  {
    formDataPayload.append('selectedPages', seleccionPaginas.value.join(','));
  }

  // Rellenamos la información del usuario
  const userInfo = await obtenerNombreYApellidosUsuario();
  formDataPayload.append('user', `${userInfo.nombre} ${userInfo.apellidos}`);

  // Rellenamos el archivo a imprimir
  formDataPayload.append('file', seleccionArchivo.value);

  try
  {
    const response = await imprimir(toastMessage, toastColor, isToastOpen, formDataPayload);

    if (!response.ok)
    {
      manejarError('Error al enviar el documento');
    }
    else
    {
      mensajeImpresion.value = 'Enviado correctamente';

      // Actualizamos la tabla de impresiones
      await actualizarTablaHistorialImpresiones();

      // Iniciamos la cuenta atrás para bloquear el botón de impresión
      comenzarCuentaAtrasBloqueoBotonImpresion();
      
      // Cerramos la vista previa del PDF
      cerrarVistaPreviaPdf();
    }
  } 
  catch (error)
  {
    manejarError('Error al enviar el PDF');
  }
};

/**
 * Función para iniciar el temporizador de cuenta atrás para bloquear el botón de impresión
 */
const comenzarCuentaAtrasBloqueoBotonImpresion = () =>
{
  let cuentaAtrasSegundos = 5;
  const intervalo = setInterval(() =>
  {
    if (cuentaAtrasSegundos > 0)
    {
      botonImpresionTexto.value = `Habilitando en ${cuentaAtrasSegundos} segundos`; // Actualiza el texto del botón con el temporizador
      cuentaAtrasSegundos--;
    }
    else
    {
      // Función propia de JavaScript para limpiar el intervalo
      clearInterval(intervalo);

      // Limpia el error y habilita el botón después de la cuenta regresiva
      limpiarError();
    }
  }, 1000);
};

/**
 * Cierra la vista previa del PDF
 */
 const cerrarVistaPreviaPdf = () =>
{
  // Si hay una URL de vista previa del PDF, la eliminamos
  if (urlVistaPreviaPdf.value)
  {
    // Eliminamos la URL de vista previa del PDF
    URL.revokeObjectURL(urlVistaPreviaPdf.value);

    // Limpiamos la URL de vista previa del PDF
    urlVistaPreviaPdf.value = '';
  }
};

/**
 * Función para validar la entrada de copias
 */
const validarNumeroDeCopias = () =>
{
  // Validamos que el número de copias sea mayor que 0
  if (seleccionCopias.value < 1)
  {
    seleccionCopias.value = 1;
  }

  // Validamos que el número de copias sea menor que 50
  if (seleccionCopias.value > 50)
  {
    seleccionCopias.value = 50;
  }
};

/**
 * Monta el componente
 */
onMounted(async () =>
{
  // Obtenemos los datos del formulario
  await obtenerDatosDelFormulario();

  // Actualizamos el historial de impresiones
  await actualizarTablaHistorialImpresiones();

  // Prevalidamos el sistema de forma global y obtenemos las impresoras
  await prevalidacionGlobalObteniendoImpresoras();

  // Si hay impresoras disponibles ...
  if (impresorasDisponibles.value.length > 0)
  {
    // ... seleccionamos la primera impresora
    seleccionImpresora.value = impresorasDisponibles.value[0].name;

    // Verificamos el estado de la impresora inicial
    comprobarEstadoImpresoraSeleccionada();
  }

  // Obtenemos las constantes
  await obtenerConstantesInit();

  // Aseguramos que Vue haya procesado los cambios antes de verificar el estado de la impresora
  await nextTick();

  window.removeEventListener('resize', sincronizarAlturaVistaPreviaPdf);

  // Observa cambios de tamaño del formulario para ajustar el preview en caliente
  if (window.ResizeObserver && contenedorFormularioRef?.value)
  {
    // Creamos un observador de cambio de tamaño del formulario para ajustar la vista previa del PDF en caliente
    observadorCambioTamanioFormulario = new ResizeObserver(() =>
    {
      // Ajustamos la altura de la vista previa del PDF en caliente
      sincronizarAlturaVistaPreviaPdf();
    });
   
    // Observamos el cambio de tamaño del formulario para ajustar la vista previa del PDF en caliente
    observadorCambioTamanioFormulario.observe(contenedorFormularioRef.value);
  }
});

/**
 * Obtiene los datos del formulario
 */
const obtenerDatosDelFormulario = async () =>
{
  try
  {
    coloresDisponibles.value       = await obtenerColores(toastMessage, toastColor, isToastOpen);
    orientacionesDisponibles.value = await obtenerOrientaciones(toastMessage, toastColor, isToastOpen);
    carasDisponibles.value         = await obtenerCaras(toastMessage, toastColor, isToastOpen);
  }
  catch (error)
  {
    manejarError('Error al obtener datos del formulario');
  }
};

/**
 * Actualiza el historial de impresiones
 */
const actualizarTablaHistorialImpresiones = async () =>
{
  try
  {
    const userInfo              = await obtenerNombreYApellidosUsuario();
    const usuario               = userInfo.nombre + " " + userInfo.apellidos ;
    const filtroBusquedaRequest = { user:  usuario };
    const response              = await filtrarDatos(toastMessage, toastColor, isToastOpen, filtroBusquedaRequest);

    if (response.ok)
    {
      historialImpresiones.value = await response.json();
    }
    else
    {
      manejarError('Error al obtener los datos del historial de impresiones');
    }
  }
  catch (error)
  {
    manejarError('Error al obtener datos del historial de impresiones');
  }
};

/**
 * Prevalidación global y obtenemos los estados de las impresoras
 */
const prevalidacionGlobalObteniendoImpresoras = async () =>
{
  try
  {
    // Realizamos las prevalidaciones de impresión
    const response = await prevalidacionesImpresion(toastMessage, toastColor, isToastOpen);

    // Verificamos si la respuesta es correcta
    if (response.ok)
    {
      // Obtenemos los datos de la respuesta
      const data = await response.json();
      
      // Verificamos si hay un error global
      if (data.globalError)
      {
        // Si hay un error global, manejarlo y deshabilitar la impresión
        errorGlobal.value = data.globalError;
        manejarError(errorGlobal.value);
      }
      else
      {
        // No hay error global, establecemos las impresoras disponibles

        // Limpiamos el error global
        errorGlobal.value = '';

        // Actualizamos las impresoras disponibles
        impresorasDisponibles.value = data.dtoPrinters;
      }
    }
  }
  catch (error)
  {
    manejarError('Error en la prevalidación de impresión');
  }
};

/**
 * Función para verificar el estado de la impresora seleccionada
 */
 const comprobarEstadoImpresoraSeleccionada = () =>
{
  const impresoraSeleccionada = impresorasDisponibles.value.find(impresora => impresora.name === seleccionImpresora.value);
  if (impresoraSeleccionada)
  {
    if (impresoraSeleccionada.statusId !== 0)
    {
      // Obtenemos el estado de la impresora
      errorImpresora.value = impresoraSeleccionada.status;

      // Manejamos el error si la impresora tiene problemas
      manejarError(errorImpresora.value);
    }
    else if (impresoraSeleccionada.printingQueue > 3)
    {
      // Indicamos el error si la impresora está ocupada imprimiendo otros documentos
      errorImpresora.value = "La impresora está ocupada imprimiendo otros documentos";

      // Manejamos el error si la impresora está ocupada imprimiendo otros documentos
      manejarError(errorImpresora.value);
    }
    else
    {
      // Limpiamos cualquier error si la impresora está en buen estado
      limpiarError();
    }
  }
};

/**
 * Obtiene las constantes desde el backend
 */
 const obtenerConstantesInit = async () =>
{
  try
  {
    const constantes = await obtenerConstantes(printersApiUrl + '/printers/web/constantes', toastMessage, toastColor, isToastOpen) ;

    // Busca la constante con clave 'Maximo hojas impresion'
    const maxHojasImpresionConstante = constantes.find(constante => constante.clave === 'Maximo hojas impresion') ;
    
    if (!maxHojasImpresionConstante)
    {
      manejarError('No se encontró la constante "Maximo hojas impresion".');
    }
    else
    {
      maximoHojasImpresion.value = parseInt(maxHojasImpresionConstante.valor, 10) ;
    }
  }
  catch (error)
  {
    manejarError('Error al obtener las constantes');
  }
};

/**
 * Valida los inputs de rango de páginas
 */
const validarRangoDePaginas = () =>
{
  // Llamada interna a la validación de rango de páginas con guión medio	
  validarRangoDePaginasInterna(pdfPaginasRangoInicio.value, pdfPaginasRangoFin.value);
};

/**
 * Valida las páginas específicas
 */
const validarPaginasEspecificas = () =>
{
  // Separamos las páginas específicas por comas
  // unimos casos como "1", "1-3", "1,3,5-7", "1,3,5-7,10" en un array de páginas
  // para tener algo como este array: [1, 2, 3, 5, 6, 7, 10]
  pdfPaginasEspecificas.value.split(',').flatMap(valor =>
  {
    // Eliminamos los espacios en blanco
    valor = valor.trim();

    // Si la página es un rango, la procesamos
    if (valor.includes('-'))
    {
      // Separamos el rango por el guión medio
      const [comienzo, fin] = valor.split('-').map(Number);

      // Llamada interna a la validación de rango de páginas con guión medio
      validarRangoDePaginasInterna(comienzo, fin);
    }
    else
    {
      // Si la página es una sola, la convertimos a número y la validamos
      const pagina = parseInt(valor, 10);

      // Validamos la página
      if (!Number.isInteger(pagina))
      {
        manejarError("Página con carácter no permitido: " + valor);
      }
      else if (pagina < 1)
      {
        manejarError("La página no puede ser menor que 1: " + valor);
      }
      else if (pagina > pdfPaginasTotales.value)
      {
        manejarError("La página no puede ser mayor que " + pdfPaginasTotales.value + ": " + valor);
      }
    }
  });
}

/**
 * Valida los inputs de rango de páginas
 */
const validarRangoDePaginasInterna = (rangoInicio, rangoFin) =>
{
  const rangoInicioNumero = parseInt(rangoInicio, 10);
  const rangoFinNumero = parseInt(rangoFin, 10);

  if (!Number.isInteger(rangoInicioNumero))
  {
    manejarError("Rango inicial con carácter no permitido");
  }
  else if (!Number.isInteger(rangoFinNumero))
  {
    manejarError("Rango final con carácter no permitido");
  }
  else if (rangoInicioNumero < 1)
  {
    manejarError("El rango inicial no puede ser menor que 1");
  }
  else if (rangoFinNumero > pdfPaginasTotales.value)
  {
    manejarError("El rango final no puede ser mayor que " + pdfPaginasTotales.value);
  }
  else if (rangoInicioNumero > rangoFinNumero)
  {
    manejarError("El rango inicial no puede ser mayor que el final");
  }
}

/**
 * Sincroniza la altura del preview con la altura del formulario
 */
 const sincronizarAlturaVistaPreviaPdf = () =>
{
  try
  {
    // Si el contenedor del formulario existe, obtenemos el rectángulo del contenedor del formulario
    if (contenedorFormularioRef?.value)
    {
      // Obtenemos el rectángulo del contenedor del formulario
      const rect = contenedorFormularioRef.value.getBoundingClientRect();

      // Restar padding si es necesario (20px arriba y abajo -> 40)
      alturaMaximaVistaPreviaPdf.value = Math.max(0, rect.height);
    }
  }
  catch (e)
  {
    // No realizamos ninguna acción
    console.error('Error al sincronizar la altura de la vista previa del PDF:', e);
  }
};

/**
 * Watch para observar cambios en la selección de la impresora y otros campos relevantes
 */
watch(
  [
    () => seleccionImpresora.value,
    () => seleccionCopias.value,
    () => seleccionCaras.value,
    () => seleccionColor.value,
    () => seleccionArchivo.value,
    () => pdfModoSeleccionPaginas.value,
    () => pdfPaginasRangoInicio.value,
    () => pdfPaginasRangoFin.value,
    () => pdfPaginasEspecificas.value
  ],
  () => {

    // Valida la impresión
    const validacionCorrecta = validarImpresion();
    if (validacionCorrecta)
    {
      limpiarError();
    }
  }
);

/**
 * Watcher para monitorear cambios en pdfPreviewUrl
 * @param {string} newValue - El nuevo valor de la URL de la vista previa del PDF
 * @param {string} oldValue - El valor anterior de la URL de la vista previa del PDF
 */
watch(urlVistaPreviaPdf, (newValue, oldValue) =>
{
  nextTick(() => sincronizarAlturaVistaPreviaPdf());
});

/** 
 * Función para manejar errores y actualizar el botón
 * @param {string} message - El mensaje de error
 */
 const manejarError = (message) =>
{
  mensajeError.value = message;
  mensajeImpresion.value = '';
  botonImpresionDeshabilitado.value = true;
  botonImpresionTexto.value = '¡No puedes imprimir!';
};

/**
 * Función para limpiar errores y restaurar el botón
 */
const limpiarError = () =>
{
  mensajeError.value = '';
  botonImpresionDeshabilitado.value = false;
  botonImpresionTexto.value = '¡IMPRIMIR!';
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
