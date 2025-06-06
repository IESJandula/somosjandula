<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import MassiveControlTable from '@/components/projectors/RemoteControlTable.vue';
import FormBox from '@/components/projectors/FormBox.vue';
import { RESPONSE_STATUS_ERROR } from '@/utils/constants';
import { Modal } from 'bootstrap';
import { fetchActionsList, sendServerEventBatchService, fetchProjectorList } from '@/services/projectors';

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Load projector list when component is mounted
onMounted(() => {
    loadProjectorList();
    loadActionsList();
    const modalElement = document.getElementById('actionModal');
    modalInstance = new Modal(modalElement);
    const saved = localStorage.getItem('buttonDisabledUntil');
    if (saved) {
        const expireAt = parseInt(saved);
        if (Date.now() < expireAt) {
        startCountdown(expireAt);
        } else {
        // Expiró, limpiar estado
        localStorage.removeItem('buttonDisabledUntil');
        }
    }
});

// ----------------- MODAL FOR ACTIONS -----------------
const modalMessage = ref('');
const modalTitle = ref('');
let modalInstance = null;

// Función para mostrar el modal con un mensaje personalizado
const showModal = (title, message) => {
    modalMessage.value = message;
    modalTitle.value = title;
    modalInstance.show(); // Abre el modal manualmente
};

// ------------------ buttons

const isButtonDisabled = ref(false);
const actionCountdown = ref(20);
let interval = null;

const disableButtonTemporarily = () => {
  const now = Date.now();
  const expireAt = now + 20000; // 20 segundos en milisegundos
  localStorage.setItem('buttonDisabledUntil', expireAt.toString());

  startCountdown(expireAt);
};

const startCountdown = (expireAt) => {
  clearInterval(interval);

  const updateCountdown = () => {
    const now = Date.now();
    const remaining = Math.ceil((expireAt - now) / 1000);

    if (remaining > 0) {
      isButtonDisabled.value = true;
      actionCountdown.value = remaining;
    } else {
      clearInterval(interval);
      isButtonDisabled.value = false;
      actionCountdown.value = 0;
      localStorage.removeItem('buttonDisabledUntil');
    }
  };

  updateCountdown(); // Update immediately
  interval = setInterval(updateCountdown, 1000);
};


// ----------------- PROJECTOR ACTIONS -----------------
const actionsList = ref([]);

const loadActionsList = async () =>
{
 actionsList.value = await fetchActionsList( toastMessage, toastColor, isToastOpen );
}

// ----------------- END PROJECTOR ACTIONS -----------------

// ----------------- PROJECTORS TABLE -----------------

// Variables for projector removal process

const unassignmentLoading = ref(false);
const pageObjectP = ref();

const filterObject = ref(
    {
        orderCriteriaF: 'default',
        pageNumberF: 0,
        pageSizeF: 15,
        selectedClassroomF: 'default',
        selectedFloorF: 'default',
        selectedModelF: 'default'
    });

const updateFilter = (newFilterObject) => {
    filterObject.value = newFilterObject;
    loadProjectorList();
}

const loadProjectorList = async () => {
    try {

        const orderCriteria = filterObject.value.orderCriteriaF;
        const page = filterObject.value.pageNumberF;
        const size = filterObject.value.pageSizeF;
        const classroom = filterObject.value.selectedClassroomF;
        const floor = filterObject.value.selectedFloorF;
        const model = filterObject.value.selectedModelF;
        
        const response = await fetchProjectorList(toastMessage, toastColor, isToastOpen, orderCriteria, page, size, classroom, floor, model );

        pageObjectP.value = response;

    } catch (error) {
        console.error('Error while retrieving projector list', error);

        if (error.response) {
            console.error('Error code:', error.response.status);
            console.error('Server message:', error.response.data.message);
        } else if (error.request) {
            console.error('No response received from the server', error.request);
        } else {
            console.error('Request configuration error', error.message);
        }
    }
};

// ----------------- END PROJECTORS TABLE -----------------

// ----------------- SEND SERVER EVENT -----------------

const selectedProjectorsList = ref([]);

const responseTypeCMD = ref();
const responseDataCMD = ref();

// Watch the selectedProjectorsList for changes and log the updated value
watch(selectedProjectorsList, (newVal) => {
    console.log('Updated selectedProjectorsList:', newVal);
});

const sendServerEventBatch = async (actionParam) => {
    try {

        responseTypeCMD.value = null;
        responseDataCMD.value = null;

        if (selectedProjectorsList.value.length === 0) {
            showModal("INFO", "Seleccione almenos un proyector.");
            return;
        }

        const requestBody = {
            action: actionParam.actionName,
            projectorList: selectedProjectorsList.value
        }

        const response = await sendServerEventBatchService( toastMessage, toastColor, isToastOpen, requestBody );

        responseTypeCMD.value = response.status;
        responseDataCMD.value = response.message;

        disableButtonTemporarily();
        showModal(response.status, response.message);

    } catch (error) {
        responseTypeCMD.value = RESPONSE_STATUS_ERROR;

        console.error('Error while sending server event batch', error);
        if (error.response) {
            console.error('Error code:', error.response.status);
            console.error('Server message:', error.response.message);
            responseDataCMD.value = error.response.message;

        } else if (error.request) {
            responseDataCMD.value = error.request;
            console.error('No response received from the server', error.request);
        } else {
            responseDataCMD.value = error.message;
            console.error('Request configuration error', error.message);
        }

        showModal(responseTypeCMD.value, responseDataCMD.value);
    }
};

// ----------------- END SEND SERVER EVENT -----------------

const responseTypeDelP = ref();
const responseDataDelP = ref();

const colorGradienteInicio = "#f4edf5";
const colorGradienteFondo = "#2247ab";

// Computed para generar dinámicamente el gradiente
const gradientStyle = computed(() => ({
    background: `linear-gradient(to bottom, ${colorGradienteInicio}, ${colorGradienteFondo})`
}));


const alertClass = computed(() => {
    switch (modalTitle.value) {
        case 'ERROR':
            return 'bg-danger'
        case 'INFO':
            return 'bg-primary'
        case 'SUCCESS':
            return 'bg-success'
        case 'WARNING':
            return 'bg-warning'
        default:
            return ''  // Default case if no match
    }
})
</script>

<!-- ------------------- TEMPLATE ------------------- -->

<template>
    <div style="width: 100%;" :style="gradientStyle" class="p-0">

        <!-- Bootstrap Modal -->
        <div class="modal fade" id="actionModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header text-white" :class="alertClass">
                        <h5 class="modal-title text-center">{{ modalTitle }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center text-black">
                        {{ modalMessage }}
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row d-flex flex-grow-1 justify-content-center p-3">
            <div class="col-12 col-md-10 col-lg-8 p-0">

                <!-- Form box -->
                <div>
                    <FormBox :dataLoading="unassignmentLoading" :formTitle="'SELECCION DE PROYECTORES'"
                        :subtitle="'Formulario para enviar ordenes a uno o más proyectores. Permite flitrado por ubicación y/ modelo.'"
                        :helpText="'Deste esta pantalla puede enviar ordenes a los proyectores seleccionados.'"
                        :submitButtonText="'REGISTER MODEL'" :collapseId="'id5'" :enableButton="false"
                        :responseType="responseTypeDelP" :responseData="responseDataDelP"
                        :bannerBackgroundColor="'bg-primary'" :containerBackgroundStyle="'background-color: azure;'">

                        <div class="row p-0">
                            <div class="col-12 col-md-12 col-lg-7 small p-3">
                                <MassiveControlTable v-model="selectedProjectorsList"
                                    :tableHeaderClass="'table-primary'" :pageObject="pageObjectP" :enableDelete="false"
                                    @filterUpdated="updateFilter" />
                            </div>

                            <!-- Actions formbox. -->
                            <div class="col-12 col-md-12 col-lg-5">
                                <div class="m-3">
                                    <FormBox :formTitle="'ACCIONES'"
                                        :subtitle="'Listado de acciones que se pueden enviar a los proyectores.'"
                                        :enableButton="false" :responseType="responseTypeCMD"
                                        :responseData="responseDataCMD" :bannerBackgroundColor="'bg-info'"
                                        :bannerTextColor="'text-dark'"
                                        :containerBackgroundStyle="'background-color: white;'">
                                        <div class="text-center">
                                            <div v-if="isButtonDisabled" class="alert alert-danger" role="alert">
                                                <span  class=""><strong>Podrá reenviar un comando en: </strong>{{actionCountdown}} s</span>
                                            </div>

                                        </div>

                                        <!-- Projector commands container -->
                                        <div class="rounded-top p-1">
                                            <!-- cards will be rendered within this one.-->
                                            <div class="d-flex flex-wrap justify-content-center gap-3">
                                                <div v-for="(action, index) in actionsList" :key="index"
                                                    class="col-auto">
                                                    <div class="card-body p-0">
                                                        <div class="border border-dark p-2 pt-0 rounded"
                                                            :disabled="isButtonDisabled"
                                                            style="background-color: aliceblue;">
                                                            <h5 class="card-title pb-2 pt-0 text-center text-black">{{ action.actionName
                                                            }}</h5>
                                                            <button @click="sendServerEventBatch(action)"
                                                                :disabled="isButtonDisabled"
                                                                class="btn btn-info fw-bold">ENVIAR</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </FormBox>
                                </div>
                            </div><!-- /Actions formbox. -->

                        </div>

                    </FormBox>

                </div>

            </div>


        </div>

        <div v-if="selectedProjectorsList" class="col bg-light d-flex justify-content-center py-3 mt-3">

            <div class="d-flex flex-column align-items-center">
                <div class="text-center">
                    <h5>SELECCIONADOS</h5>
                </div>
                <div v-for="projector in selectedProjectorsList" :key="projector.model" class="mb-2">
                    <span>{{ projector.model }} - {{ projector.classroom }}</span>
                </div>
            </div>
        </div>

    </div>
</template>
