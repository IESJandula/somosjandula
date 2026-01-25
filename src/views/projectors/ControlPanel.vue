<script setup>
import { ref, onMounted, computed, watch } from "vue";
import SelectableActionTable from "@/components/projectors/SelectableActionTable.vue";
import SelectableCommandTable from "@/components/projectors/SelectableCommandTable.vue";
import SelectableProjectorTable from "@/components/projectors/SelectableProjectorTable.vue";
import FormBox from "@/components/projectors/FormBox.vue";
import { RESPONSE_STATUS_ERROR, RESPONSE_STATUS_INFO, PARSE_MULTIFILE, EVENTS_OVERVIEW } from '@/utils/constants';
import * as bootstrap from 'bootstrap';
import { fetchProjectorOverView, 
        fetchProjectorList,deleteProjectors, 
        deleteAllProjectors, fetchProjectorModelsList, 
        fetchActionsPage, deleteActions, 
        fetchCommandsPage,deleteSelectedCommands } from '@/services/projectors';

import { obtenerTokenJWTValido } from '@/services/firebaseService';

const colorGradienteInicio = '#ebedf5';
const colorGradienteFondo = '#134f4c';

// Computed para generar dinámicamente el gradiente
const gradientStyle = computed(() => ({
    background: `linear-gradient(to bottom, ${colorGradienteInicio}, ${colorGradienteFondo})`,
}));

const numberOfModels = ref(0);
const numberOfActions = ref(0);
const numberOfCommands = ref(0);
const numberOfProjectors = ref(0);
const numberOfFloors = ref(0);
const numberOfClassrooms = ref(0);

const errorEvents = ref(0);
const canceledEvents = ref(0);
const completedEvents = ref(0);
const deliveredEvents = ref(0);
const pendingEvents = ref(0);

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// ---------------------------- PARSE CSV FILES ----------------------------

// Selected file reference.
const commandsCsvInput = ref(null);
const projectorsCsvInput = ref(null);
const responseTypeCSV = ref(null);
const responseTypeAltCSV = ref(null);
const responseDataCSV = ref(null);
const responseDataAltCSV = ref(null);
const multifileLoading = ref(false);

const parseFiles = async () => {

    multifileLoading.value = true;
    responseTypeCSV.value = null;
    responseTypeAltCSV.value = null;
    responseDataCSV.value = null;
    responseDataAltCSV.value = null;

    const formData = new FormData();

    // Get the selected files
    const commandsFile = commandsCsvInput.value?.files[0];
    const projectorsFile = projectorsCsvInput.value?.files[0];

    if (!projectorsFile && !commandsFile) {
        responseTypeCSV.value = RESPONSE_STATUS_INFO;
        responseDataCSV.value = "ATENCIÓN: No hay ficheros seleccionados.";
        multifileLoading.value = false;
        return;
    }

    // Add files to the formData if they exist
    if (projectorsFile) {
        formData.append('projectorsFile', projectorsFile);
    }
    if (commandsFile) {
        formData.append('commandsFile', commandsFile);
    }

    try {

        console.log(PARSE_MULTIFILE);

        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

        const response = await fetch(PARSE_MULTIFILE,
            {
                method: 'POST',
                headers:
                {
                    'Authorization': `Bearer ${tokenPropio}` // Agrega el JWT al encabezado
                },
                body: formData, // Enviar el FormData directamente
            });

        if (!response.ok) {
            const errorString = 'Error al obtener los datos filtrados';
            crearToast(toastMessage, toastColor, isToastOpen, 'danger', errorString);
            throw new Error(errorString);
        }

        const respuesta = await response.json();

        // Log the server response
        console.log('Server response:', response);

        console.log("xxxxxxxxx",respuesta );

        // Update the UI with the response data
        responseTypeCSV.value = respuesta.status1;
        responseTypeAltCSV.value = respuesta.status2;

        // Response about Projectors
        responseDataCSV.value = respuesta.message1;
        // Response about Commands
        responseDataAltCSV.value = respuesta.message2;

        console.log("responseTypeCSV",responseTypeCSV );
        console.log("responseTypeAltCSV",responseTypeAltCSV );
        console.log("responseDataCSV",responseDataCSV );
        console.log("responseDataAltCSV",responseDataAltCSV );

        // Reload data in the forms
        reloadPageLists();

        multifileLoading.value = false;


    }
    catch (error) {

        multifileLoading.value = false;

        // Handle errors and update UI with the error message
        responseTypeCSV.value = "ERROR";
        if (error.response) {
            // Server responded with a status code outside the range of 2xx
            console.error('Error code:', error.response.status);
            console.error('Server message:', error.response.message);
            responseDataCSV.value = error.response.message;
        } else if (error.request) {
            // The request was made, but no response was received
            console.error('No response received from the server', error.request);
            responseDataCSV.value = "Error: No response received from the server.";
        }
        else {
            // Error occurred in setting up the request
            console.error('Error in request setup', error.message);
            responseDataCSV.value = "Error in request setup.";
        }
    }
}

// -------------------------- END PARSE CSV FILES ------------------

// ------------------------- OVERVIEW INFO -------------------------
// Funcion que rellena los valores de la visión general de eventos.
const fetchEventsOverView = async () => {
    try {

        console.log("Recuperando overview eventos.");


        const tokenPropio = await obtenerTokenJWTValido(toastMessage, toastColor, isToastOpen);

        const response = await fetch(EVENTS_OVERVIEW,
            {
                method: 'GET',
                headers:
                {
                    'Authorization': `Bearer ${tokenPropio}`
                }
            }
        );

        if (!response.ok) {
            const errorString = 'Error al obtener el overview de eventos.';
            crearToast(toastMessage, toastColor, isToastOpen, 'danger', errorString);
            throw new Error(errorString);
        }

        const respuesta = await response.json();

        errorEvents.value = respuesta.errorEvents || 0;
        canceledEvents.value = respuesta.canceledEvents || 0;
        pendingEvents.value = respuesta.pendingEvents || 0;
        deliveredEvents.value = respuesta.deliveredEvents || 0;
        completedEvents.value = respuesta.completedEvents || 0;

    } catch (error) {

        if (error.response) {
            console.error("Server error:", error.response.status, error.response);
        }
        else if (error.request) {
            console.error("No response received from the server:", error.request);
        }
        else {
            console.error("Request configuration error:", error.message);
        }
    }
}

// Función que rellena los valores de la visión general de registros.
const loadProjectorOverView = async () => {
    try {
        console.log("Recuperando overview eventos.");

        const respuesta = await fetchProjectorOverView(toastMessage, toastColor, isToastOpen);

        console.log("DATA:", respuesta);

        numberOfModels.value = respuesta.numberOfModels || 0;
        numberOfActions.value = respuesta.numberOfActions || 0;
        numberOfCommands.value = respuesta.numberOfCommands || 0;
        numberOfProjectors.value = respuesta.numberOfProjectors || 0;
        numberOfFloors.value = respuesta.numberOfFloors || 0;
        numberOfClassrooms.value = respuesta.numberOfClassrooms || 0;

    } catch (error) {
        console.error("Error fetching projector overview:", error);
        // alert("Hubo un error al obtener los datos. Intenta de nuevo.");
    }
};


// ----------------------- END OVERVIEW INFO -----------------------

// -------------------------- PROJECTORS ---------------------------

const loadProjectorList = async () => {
    try {

        // Parámetros de filtrado.
        const orderCriteria = filterObject.value.orderCriteriaF;
        const page = filterObject.value.pageNumberF;
        const size = filterObject.value.pageSizeF;
        const classroom = filterObject.value.selectedClassroomF;
        const floor = filterObject.value.selectedFloorF;
        const model = filterObject.value.selectedModelF;

        // Llamada al servicio
        const responseData = await fetchProjectorList(
            toastMessage,
            toastColor,
            isToastOpen,
            orderCriteria,
            page,
            size,
            classroom,
            floor,
            "default", // Da igual el estado, encendido o apagado.
            model
        );

        // Asignación del resultado al estado
        pageObjectP.value = responseData;

    } catch (error) {
        console.error("Error al recuperar la lista de proyectores:", error);
        responseTypeDelP.value = RESPONSE_STATUS_ERROR;

        if (error instanceof Error) {
            responseDataDelP.value = error.message;
        } else {
            responseDataDelP.value = "Se produjo un error inesperado al recuperar la lista.";
        }
    }
};


// ------------------------ END PROJECTORS -------------------------

const reloadPageLists = async () => {
    loadActionsPage();
    loadCommandsPage();
    loadProjectorOverView(); // done
    fetchEventsOverView(); // done
    fetchProjectorModels();
    loadProjectorList();
}

onMounted(() => {

    loadActionsPage();
    loadCommandsPage();
    loadProjectorOverView(); // done
    fetchEventsOverView(); // done
    fetchProjectorModels();
    loadProjectorList();

    // Initialize all tooltips on the page
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            customClass: 'custom-tooltip'
        });
    });

});



// ----------------- PROJECTOR ACTIONS -----------------

// ----------------- PROJECTOR COMMANDS -----------------

// ----------------- PROJECTORS TABLE -----------------



//const unassignmentLoading = ref(false);
const pageObjectP = ref();

const filterObject = ref({
    orderCriteriaF: "default",
    pageNumberF: 0,
    pageSizeF: 15,
    selectedClassroomF: "default",
    selectedFloorF: "default",
    selectedModelF: "default",
});

const updateFilter = (newFilterObject) => {
    filterObject.value = newFilterObject;
    loadProjectorList();
};

const responseTypeDelP = ref();
const responseDataDelP = ref();


// Variables for projector removal process
const selectedProjectors = ref([]);

const hasSelectedProjectors = computed(() => selectedProjectors.value.length > 0);

// Debugging: Watch for changes in the selected projectors
watch(selectedProjectors, (newVal) => {
    console.log("Selected projectors updated:", newVal);
});

const removeSelectedProjectorsRequest = async () => {
    console.log("Delete projectors request received.");

    const selectedProjectorsList = selectedProjectors.value;
    deleteProjectorsLoading.value = true;

    try {
        if (selectedProjectorsList.length === 0) {
            responseTypeDelP.value = "INFO";
            responseDataDelP.value = "Seleccione al menos un proyector.";
            deleteProjectorsLoading.value = false;
            return;
        }

        console.log("Request selectedProjectorsList:", selectedProjectorsList);

        const responseData = await deleteProjectors(
            toastMessage,
            toastColor,
            isToastOpen,
            selectedProjectorsList
        );

        // Info para alert
        responseTypeDelP.value = responseData.status;
        responseDataDelP.value = responseData.message;

        // Recargar tabla
        reloadPageLists();

        // Cerrar modal
        await delay(250);
        deleteSelectedModalInstance.hide();
        await delay(250);

        // Limpiar selección
        selectedProjectors.value = [];
        console.log("Projectors removed successfully.");
    } catch (error) {
        console.error("Error while removing projectors:", error);
        responseTypeDelP.value = "ERROR";
        responseDataDelP.value = error.message || "Error inesperado al eliminar proyectores.";
        deleteSelectedModalInstance.hide();
    } finally {
        deleteProjectorsLoading.value = false;
    }
};


const deleteProjectorsLoading = ref(false);

// Create a delay function that returns a Promise
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const removeAllProjectorsRequest = async () => {

    try {

        deleteProjectorsLoading.value = true;

        // Properly configure the DELETE request body
        const response = await deleteAllProjectors( toastMessage, toastColor, isToastOpen );

        // info for alert component.
        responseTypeDelP.value = response.status;
        responseDataDelP.value = response.message;

        // reload table
        reloadPageLists();

        // Cierra el modal después de eliminar
        await delay(250); // Wait for 0.25 seconds
        deleteAllModalInstance.hide();
        await delay(250); // Wait for 0.25 seconds
        // empty selected projectors list (gone)
        selectedProjectors.value = [];
        deleteProjectorsLoading.value = false;

        await delay(250); // Wait for 0.25 seconds
        deleteAllModalInstance.hide();
        await delay(250); // Wait for 0.25 seconds

    } catch (error) {

        deleteProjectorsLoading.value = false;

        await delay(250); // Wait for 0.25 seconds
        deleteAllModalInstance.hide();
        await delay(250); // Wait for 0.25 seconds

        responseDataDelP.value = RESPONSE_STATUS_ERROR;

        console.error('Error while sending remove request', error);
        if (error.response) {
            console.error('Error code:', error.response.status);
            console.error('Server message:', error.response.message);
            responseTypeDelP.value = error.response.message;

        } else if (error.request) {
            responseDataDelP.value = error.request;
            console.error('No response received from the server', error.request);
        } else {
            responseDataDelP.value = error.message;
            console.error('Request configuration error', error.message);
        }

        
    }
};



// ----------------- END PROJECTORS TABLE -----------------

// Stores the list of projectors for the table.

const projectorModels = ref([]);
//const selectedModel = ref("default");

const fetchProjectorModels = async () => {

    console.log("Fetching projector models");

    try {

        const response = await fetchProjectorModelsList();

        projectorModels.value = response.value;

    } catch (error) {
        responseTypeDelC.value = RESPONSE_STATUS_ERROR;

        if (error.response) {
            console.error("Server error:", error.response.status, error.response);
            responseDataDelC.value = error.response.message || "Error while retrieving models list.";
        }
        else if (error.request) {
            console.error("No response received from the server:", error.request);
            responseDataDelC.value = "The server is not responding. Please check your connection and try again.";
        }
        else {
            console.error("Request configuration error:", error.message);
            responseDataDelC.value = "An unexpected error occurred. Please try again.";
        }
    }
};

// --------------  modal eliminar todos

let deleteAllModalInstance = null;
const showDeleteAllModal = (modalId) => {

    if (!deleteAllModalInstance) {
        deleteAllModalInstance = new bootstrap.Modal(document.getElementById(modalId),            
        {
            backdrop: false,
            keyboard: false // opcional: evita cerrar con ESC
        });
    }
    deleteAllModalInstance.show();
};

let deleteSelectedModalInstance = null;
const showDeleteSelectedModal = (modalId) => {

    if (!deleteSelectedModalInstance) {
        deleteSelectedModalInstance = new bootstrap.Modal(document.getElementById(modalId),            
        {
            backdrop: false,
            keyboard: false // opcional: evita cerrar con ESC
        });
    }
    deleteSelectedModalInstance.show();
};

// Deletion process is loading (true | false)
const deleteOperationIsLoading = ref(false);

// ------------------------ ACTION FORM LOGIC ------------------------

// Computed property to check if there are selected actions
const hasSelectedActions = computed(() => selectedActionsList.value.length > 0);

// Stores the page of actions received from the server.
const actionsPageObject = ref(null);

// List of actions currently selected.
const selectedActionsList = ref([]);

// Stores the server response data and type.
const responseTypeDelA = ref();
const responseDataDelA = ref();

// Deletion confirmation modal for actions.
let deleteActionModalInstance = null;

// Retreives an actions page from the server.
const loadActionsPage = async (page = 0, size = 5) => {
    console.log("Recuperando pagina acciones.");
    try {

        const response = await fetchActionsPage( toastMessage, toastColor, isToastOpen, page, size); 

        actionsPageObject.value = response;

    }
    catch (error) {
        responseTypeDelA.value = RESPONSE_STATUS_ERROR;

        if (error.response) {
            console.error("Server error:", error.response.status, error.response);
            responseDataDelA.value = error.response.message || "Error while retrieving actions list.";
        }
        else if (error.request) {
            console.error("No response received from the server:", error.request);
            responseDataDelA.value = "The server is not responding. Please check your connection and try again.";
        }
        else {
            console.error("Request configuration error:", error.message);
            responseDataDelA.value = "An unexpected error occurred. Please try again.";
        }
    }
};

// Function to show the confirmation modal for actions.
const showDeleteActionModal = () => {

    if (!deleteActionModalInstance) {
        deleteActionModalInstance = new bootstrap.Modal(document.getElementById('deleteActionConfirmationModal'),            
        {
            backdrop: false,
            keyboard: false // opcional: evita cerrar con ESC
        });
    }
    deleteActionModalInstance.show();
};

// Function to send a DELETE requeste for the selected actions.
const removeActionsRequest = async () => {
    try {
        deleteOperationIsLoading.value = true;

        const response = await deleteActions(toastMessage, toastColor, isToastOpen, selectedActionsList.value);

        responseTypeDelA.value = response.status;
        responseDataDelA.value = response.message;

        console.log(responseTypeDelA.value + " " + responseDataDelA.value);

        reloadPageLists();

        deleteActionModalInstance.hide();
        await delay(500);
        selectedActionsList.value = [];
        deleteOperationIsLoading.value = false;

        console.log("Actions removed successfully.");
    } catch (error) 
    {
        deleteOperationIsLoading.value = false;
        responseTypeDelA.value = RESPONSE_STATUS_ERROR;
        deleteActionModalInstance.hide();

        if (error instanceof Error) {
        responseDataDelA.value = error.message;
        console.error("Error while removing actions:", error.message);
        } else {
        responseDataDelA.value = "An unexpected error occurred.";
        console.error("Unknown error while removing actions:", error);
        }
    }
};

// ---------------------- END ACTION FORM LOGIC ----------------------

// ----------------------- COMMAND FORM LOGIC ------------------------

// Computed property to check if there are selected commands
const hasSelectedCommands = computed(() => selectedCommandsList.value.length > 0);

// Stores the page of commands receives from the server.
const commandsPageObject = ref(null);

// List of currently selected commands.
const selectedCommandsList = ref([]);

// Stores the server response data and type.
const responseTypeDelC = ref();
const responseDataDelC = ref();

let deleteCommandModalInstance = null;

const loadCommandsPage = async (page = 0, size = 5, modelName, action) => {
    try {

        const response = await fetchCommandsPage(toastMessage, toastColor, isToastOpen, page, size, modelName, action);

        commandsPageObject.value = response;

    } catch (error) {
        responseTypeDelP.value = RESPONSE_STATUS_ERROR;

        if (error.response) {
            console.error("Server error:", error.response.status, error.response);
            responseDataDelP.value = error.response.message || "Error while retrieving commands list.";
        }
        else if (error.request) {
            console.error("No response received from the server:", error.request);
            responseDataDelP.value = "The server is not responding. Please check your connection and try again.";
        }
        else {
            console.error("Request configuration error:", error.message);
            responseDataDelP.value = "An unexpected error occurred. Please try again.";
        }
    }
};

const showDeleteCommandModal = async () => {
    if (!deleteCommandModalInstance) {
        deleteCommandModalInstance = new bootstrap.Modal(
            document.getElementById('deleteCommandConfirmationModal'),
            {
                backdrop: false,
                keyboard: false // opcional: evita cerrar con ESC
            }
        );
    }
    deleteCommandModalInstance.show();
};

const deleteSelectedCommandsRequest = async () => {

    try {
    deleteOperationIsLoading.value = true;

    const { status, message } = await deleteSelectedCommands(
        toastMessage,
        toastColor,
        isToastOpen,
        selectedCommandsList.value
    );

    responseDataDelC.value = message;
    responseTypeDelC.value = status;

    reloadPageLists();

    await delay(250);
    deleteCommandModalInstance.hide();
    await delay(250);
    selectedCommandsList.value = [];

    } catch (error) {
        responseTypeDelC.value = RESPONSE_STATUS_ERROR;

    if (error.response) {
        console.error("Server error:", error.response.status, error.response.data);
        responseDataDelC.value = error.response.data.message || "Error while deleting commands.";
    } else if (error.request) {
        console.error("No response received from the server", error.request);
        responseDataDelC.value = "The server is not responding. Please check your connection and try again.";
    } else {
        console.error("Request configuration error", error.message);
        responseDataDelC.value = "An unexpected error occurred. Please try again.";
    }

    deleteCommandModalInstance.hide();
    } finally {
    deleteOperationIsLoading.value = false;
    }
};

// --------------------- END COMMAND FORM LOGIC ----------------------

</script>

<template>
    <div :style="gradientStyle">

        <!-- DELETE ACTIONS CONFIRMATION MODAL -->
        <div class="modal fade" id="deleteActionConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div v-if="hasSelectedActions">
                        <div class="modal-header text-white bg-danger">
                            <h5 class="modal-title text-center">CONFIRMAR ELIMINACION</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div v-if="!deleteOperationIsLoading" class="modal-body text-black text-black">
                            ¿De verdad deseas eliminar las <strong>acciones seleccionadas</strong>?<br />
                            Registros seleccionados: <span>{{ selectedActionsList.length }}</span><br />
                            <span style="color: red;">Los comandos y eventos asociados a estas acciones serán
                                automaticamente
                                eliminados.<br /><strong>Esta acción no se puede deshacer.</strong></span>
                        </div>
                        <div v-if="deleteOperationIsLoading" class="modal-body text-black">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status">
                                    <span class="sr-only"></span>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <!--  <button v-if="title === 'INFO'" type="button" class="btn btn-info"
                            data-bs-dismiss="modal">Aceptar</button>-->
                            <button v-if="!deleteOperationIsLoading" type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">Cancelar</button>
                            <button v-if="!deleteOperationIsLoading" type="button" class="btn btn-danger"
                                @click="removeActionsRequest()">Eliminar</button>
                            <span v-if="deleteOperationIsLoading">
                                Esperando respuesta del servidor...
                            </span>
                        </div>

                    </div>
                    <div v-if="!hasSelectedActions">
                        <div class="modal-header text-dark bg-info">
                            <h5 class="modal-title text-center">INFORMACIÓN</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body text-black">
                            Seleccione almenos una acción.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-info" data-bs-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- END DELETE ACTIONS CONFIRMATION MODAL -->

        <!-- DELETE COMMANDS CONFIRMATION MODAL -->
        <div class="modal fade" id="deleteCommandConfirmationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div v-if="hasSelectedCommands">
                        <div class="modal-header text-white bg-danger">
                            <h5 class="modal-title text-center">CONFIRMAR ELIMINACION</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div v-if="!deleteOperationIsLoading" class="modal-body text-black">
                            ¿De verdad deseas eliminar los <strong>comandos seleccionados</strong>?<br />
                            Registros seleccionados: <span>{{ selectedCommandsList.length }}</span><br />
                            <span style="color: red;">Los eventos asociados a estos comandos serán automaticamente
                                eliminados.<br />
                                <strong>Esta acción no se puede deshacer.</strong></span>
                        </div>
                        <div v-if="deleteOperationIsLoading" class="modal-body text-black">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status">
                                    <span class="sr-only"></span>
                                </div>
                            </div>
                        </div>

                        <div class="modal-footer">
                            <button v-if="!deleteOperationIsLoading" type="button" class="btn btn-secondary"
                                data-bs-dismiss="modal">Cancelar</button>
                            <button v-if="!deleteOperationIsLoading" type="button" class="btn btn-danger"
                                @click="deleteSelectedCommandsRequest()">Eliminar</button>
                            <span v-if="deleteOperationIsLoading">
                                Esperando respuesta del servidor...
                            </span>
                        </div>

                    </div>
                    <div v-if="!hasSelectedCommands">
                        <div class="modal-header text-dark bg-info">
                            <h5 class="modal-title text-center">INFORMACIÓN</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body text-black">
                            Seleccione almenos un comando.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-info" data-bs-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- END DELETE COMMANDS CONFIRMATION MODAL -->

        <!-- Modal de Confirmación todos los registros. -->
        <div class="modal fade" id="deleteAllConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Confirmar Eliminación</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div v-if="!deleteProjectorsLoading" class="modal-body text-black">
                        ¿De verdad deseas eliminar <strong>todos los proyectores</strong>? <br /> Registros
                        a eliminar: <span>{{computed(() => pageObjectP?.totalElements || 0)}}</span><br />
                        <span style="color: red;">Los eventos asociados a estos proyectores serán automaticamente
                            eliminados.<br />
                            <strong>Esta acción no se puede deshacer.</strong></span>
                    </div>
                    <div v-if="deleteProjectorsLoading" class="modal-body text-black">
                        <div class="d-flex justify-content-center">
                            <div class="spinner-border" role="status">
                                <span class="sr-only"></span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger"
                            @click="removeAllProjectorsRequest()">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de Confirmación para eliminar los registros seleccionados. -->
        <div class="modal fade" id="deleteSelectedConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div v-if="hasSelectedProjectors">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Confirmar Eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div v-if="deleteProjectorsLoading" class="modal-body text-black">
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border" role="status">
                                    <span class="sr-only"></span>
                                </div>
                            </div>
                        </div>
                        <div v-if="!deleteProjectorsLoading" class="modal-body text-black">
                            <!-- Muestra la cantidad de proyectores seleccionados -->
                            ¿De verdad deseas eliminar <strong>los proyectores seleccionados</strong>?<br /> Registros
                            seleccionados:
                            <span>{{ selectedProjectors.length }}</span><br />
                            <span style="color: red;">Los eventos asociados a estos proyectores serán automaticamente
                                eliminados.<br />
                                <strong>Esta acción no se puede deshacer.</strong></span>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger"
                                @click="removeSelectedProjectorsRequest">Eliminar</button>
                        </div>
                    </div>
                    <div v-if="!hasSelectedProjectors">
                        <div class="modal-header text-dark bg-info">
                            <h5 class="modal-title text-center">INFORMACIÓN</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body text-black">
                            Seleccione almenos un proyector.
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-info" data-bs-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex row">

            <div class="col-12 col-md-8 mx-auto pt-0 pb-1 mb-2 mt-0 rounded-bottom-3"
                :style="{ backgroundColor: colorGradienteFondo }">
                <h1 class="text-center text-white">ADMINISTRACIÓN</h1>
            </div>

            <div class="bg-light col-lg-8 mx-auto rounded-top border-dark border mb-3 pb-4">
                <div class="row pt-3 bg-dark">
                    <div style="background-color: beige"
                        class="pt-3 border-top border-dark border-bottom pb-2 row mx-auto justify-content-center">
                        <div class="col-12 col-lg-auto d-none d-md-block">
                            <h5 class="text-black">Registros</h5>
                            <table class="col-md-auto table border table-bordered border-dark text-center">
                                <thead class="thead-dark">
                                    <tr class="table-dark">
                                        <th>Modelos</th>
                                        <th>Acciones</th>
                                        <th>Comandos</th>
                                        <th>Proyectores</th>
                                        <th>Plantas</th>
                                        <th>Aulas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{{ numberOfModels }}</td>
                                        <td>{{ numberOfActions }}</td>
                                        <td>{{ numberOfCommands }}</td>
                                        <td>{{ numberOfProjectors }}</td>
                                        <td>{{ numberOfFloors }}</td>
                                        <td>{{ numberOfClassrooms }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="col-12 col-lg-auto">
                            <h5 class="text-black">Estado de eventos</h5>
                            <table class="table border table-bordered border-dark text-center">
                                <thead class="thead-dark">
                                    <tr>
                                        <th class="table-warning table-bordered border-dark" 
                                            data-bs-toggle="tooltip"
                                            data-bs-html="true"
                                            title="<b>PENDIENTE</b><br/><em>Tarea creada correctamente, aún pendiente de entrega al proyector.</em> ">
                                            <i class="bi bi-hourglass-split text-dark"></i>
                                        </th>
                                        <th class="table-info table-bordered border-dark" data-bs-toggle="tooltip"
                                            data-bs-html="true"
                                            title="<b>ENVIADO</b><br/><em>Tarea entregada al proyector pertinente en espera de confirmación de éxito.</em> ">
                                            <i class="bi bi-upload"></i>
                                        </th>
                                        <th class="table-success table-bordered border-dark" data-bs-toggle="tooltip"
                                            data-bs-html="true"
                                            title="<b>REALIZADO</b><br/><em>Tarea ejecutada con éxito por el proyector.</em> ">
                                            <i class="bi bi-check-circle-fill"></i>
                                        </th>
                                        <th class="table-secondary table-bordered border-dark" data-bs-toggle="tooltip"
                                            data-bs-html="true" title="<b>CANCELADO</b><br/><em>Tarea cancelada.</em> ">
                                            <i class="bi bi-x-circle"></i>
                                        </th>
                                        <th class="table-danger table-bordered border-dark" data-bs-toggle="tooltip"
                                            data-bs-html="true"
                                            title="<b>ERROR</b><br/><em>La tarea no se pudo completar debido a un error, quedando sin ejecutar.</em> ">
                                            <i class="bi bi-exclamation-triangle-fill"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{{ pendingEvents }}</td>
                                        <td>{{ deliveredEvents }}</td>
                                        <td>{{ completedEvents }}</td>
                                        <td>{{ canceledEvents }}</td>
                                        <td>{{ errorEvents }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="row p-0 mt-3 mx-auto pt-3 justify-content-center">

                    <!-- PARSEO -->
                    <div class="row justify-content-center">
                        <div class="mb-4">
                            <!-- Form box for CSV Multifile parsing. -->
                            <FormBox :dataLoading="multifileLoading"
                                :subtitle="'Formulario para la carga de datos mediante ficheros CSV.'"
                                :formTitle="'CARGA DE DATOS'" :bannerBackgroundColor="'bg-primary'"
                                :bannerTextColor="'text-white'"
                                :containerBackgroundStyle="'background-color: aliceblue;'"
                                :helpText="'La estructura prevista para estos ficheros es la siguiente; <br/> <strong>COMANDOS:</strong> [acción,comando,modelo] <br/><strong>PROYECTORES:</strong> [modelo,aula,planta]'"
                                :submitButtonText="'ENVIAR FICHERO/S'" :collapseId="'id1'"
                                :responseType="responseTypeCSV" :responseData="responseDataCSV"
                                :responseTypeAlt="responseTypeAltCSV" :responseDataAlt="responseDataAltCSV"
                                @buttonClicked="parseFiles">

                                <!-- Container for CSV files input forms -->
                                <div class="row">

                                    <!-- First CSV input -->
                                    <div class="col-12 col-md-6">
                                        <label for="commandsCsvInput"
                                            class="form-label mt-3 text-black small">Seleccione un fichero CSV
                                            de <strong>COMANDOS</strong>.</label>
                                        <input ref="commandsCsvInput" class="form-control" id="commandsCsvInput"
                                            type="file" />
                                    </div>

                                    <!-- Second CSV input -->
                                    <div class="col-12 col-md-6">
                                        <label for="projectorsCsvInput"
                                            class="form-label mt-3 text-black small">Seleccione un fichero
                                            CSV de <strong>PROYECTORES.</strong></label>
                                        <input ref="projectorsCsvInput" class="form-control" id="projectorsCsvInput"
                                            type="file" />
                                    </div>

                                </div><!-- /Container for CSV files input forms -->
                            </FormBox>
                        </div>
                    </div>


                    <div class="col-lg-5 border border-dark rounded rounded-3 m-3 p-2 bg-lightg">
                        <h3 class="text-center text-black">Eliminar acción</h3>
                        <SelectableActionTable v-model="selectedActionsList" :pageObject="actionsPageObject"
                            :responseData="responseDataDelA" :responseType="responseTypeDelA"
                            @pageUpdate="loadActionsPage" @deleteRequest="showDeleteActionModal()">
                        </SelectableActionTable>
                    </div>

                    <div class="col-lg-5 border border-dark rounded rounded-3 m-3 p-2 bg-lightg">
                        <h3 class="text-center text-black">Eliminar comando</h3>
                        <SelectableCommandTable :pageObject="commandsPageObject" @pageUpdate="loadCommandsPage"
                            :responseData="responseDataDelC" :responseType="responseTypeDelC"
                            @deleteRequest="showDeleteCommandModal()" v-model="selectedCommandsList">
                        </SelectableCommandTable>

                    </div>

                    <div class="col-lg-12 border border-dark rounded rounded-3 m-2 p-2 bg-lightg">
                        <h3 class="text-center text-black">Eliminar proyectores</h3>
                        <SelectableProjectorTable v-model="selectedProjectors" :tableHeaderClass="'table-dark'"
                            :responseData="responseDataDelP" :responseType="responseTypeDelP" :pageObject="pageObjectP"
                            @filterUpdated="updateFilter"
                            @removeSelectedProjectors="showDeleteSelectedModal('deleteSelectedConfirmModal')"
                            @removeAllProjectors="showDeleteAllModal('deleteAllConfirmModal')" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal {
    z-index: 1050 !important;
    /* Default value for Bootstrap modal */
}

.modal-backdrop {
    z-index: -1 !important;
    /* Default value for backdrop */
}

.bg-lightg {
    background-color: #dbe7e4;
}


.custom-tooltip {
    background-color: #ffffff !important;
    /* Green background */
    color: white;
    /* White text */
    font-size: 14px;
    padding: 3px;
    border-radius: 4px;
    box-shadow: 0 0px 5px 5px rgba(0, 0, 0, 0.589);
}

.custom-tooltip .tooltip-arrow {
    border-top-color: #4caf50 !important;
    /* Match background color */
}
</style>
