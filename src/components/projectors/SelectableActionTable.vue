<script setup>
import { computed, onMounted, defineProps, ref, defineEmits, watch } from "vue";
import { RESPONSE_STATUS_ERROR, RESPONSE_STATUS_INFO, RESPONSE_STATUS_SUCCESS, RESPONSE_STATUS_WARNING } from '@/utils/constants';

// ----------------- PROPS DEFINITION -----------------
const props = defineProps({
    pageObject: {
        type: Object,
        required: true,
    },
    modelValue: {
        type: Array,
        default: () => [],
    },
    responseType:{
        type: String,
        default: ""
    },
    responseData:{
        type: String,
        default: ""
    },

});

// Emit events
const emit = defineEmits(['update:modelValue', 'pageUpdate', 'deleteRequest']);

const numberOfPages = computed(() => props.pageObject?.totalPages || 0);
const totalElements = computed(() => props.pageObject?.totalElements || 0);
const firstPage = computed(() => props.pageObject?.first || false);
const lastPage = computed(() => props.pageObject?.last || false);

const currentPage = ref(props.pageObject?.number || 0); // Default page size

const pageNumber = (pageNumberParam) => {
    currentPage.value = pageNumberParam; // Update the page size
};

// ----------------- SELECT ACTIONS -----------------

// List comes from pageObject.
const actionsList = computed(() => props.pageObject?.content || []);

// ---------------------- ACTUALIZACIÓN ----------------------

// Store selected actions (sync with v-model)
const selectedActions = computed(() => props.modelValue); // Directly reference the prop

// Watch for changes to selectedActions and emit the new value to the parent
watch(selectedActions, (newValue) => {
    console.log("Acciones seleccionadas XX: " + newValue);
    emit('update:modelValue', newValue);
}, { deep: true });


// ---------------------- END ACTUALIZACIÓN ----------------------

// Check if a action is selected
const isActionSelected = (action) => {
    return selectedActions.value.includes(action); // Check if the action is in the selectedActions list
};


// Function to handle action selection
const toggleActionSelection = (action) => {
    const selectedIndex = selectedActions.value.indexOf(action); // Find the index of the string

    if (selectedIndex > -1) {
        selectedActions.value.splice(selectedIndex, 1); // Deselect the action
    } else {
        selectedActions.value.push(action); // Select the action
    }
};



const discardSelection = () => {
    emit('update:modelValue', []);
}

onMounted(() => {
});

// Watched the page, changes emits the new page.
watch(
    [currentPage],
    () => {
        console.log("La página ha cambiado...");
        emit('pageUpdate', currentPage.value, 5);
    }
);



const emitDeletionRequest = () => {
    emit('deleteRequest', actionsList.value);
};



// ------- mecanismo seleccion
</script>

<template>
    <div>
        <!-- PAGINATION BUTTONS -->
        <div class="small justify-content-center d-flex">
            <div>
                <!-- <label for="ordenadores">Pagina:</label> -->
                <ul id="ordenadores" class="pagination d-flex flex-wrap">
                    <li class="page-item">
                        <button @click="pageNumber(0)" type="button"
                            class="btn btn-sm rounded-0 rounded-start btn-outline-dark btn-light"
                            :class="{ 'btn-active': firstPage }">
                            <i class="bi bi-chevron-bar-left"></i>
                        </button>
                    </li>

                    <span v-for="index in numberOfPages" :key="index">
                        <li class="page-item">
                            <button @click="pageNumber(index - 1)" type="button"
                                class="btn  btn-sm rounded-0 btn-outline-dark btn-light"
                                :class="{ 'btn-active': index === (currentPage + 1) }">
                                {{ index }}
                            </button>
                        </li>
                    </span>

                    <li class="page-item">
                        <button @click="pageNumber(numberOfPages - 1)" type="button"
                            class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
                            :class="{ 'btn-active': lastPage }">
                            <i class="bi bi-chevron-bar-right"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        <table class="table border table-bordered border-dark text-center m-0">

            <thead>
                <tr class="table-dark">
                    <th>Acción</th>
                </tr>

            </thead>
            <tbody>
                <tr v-for="(action, index) in actionsList" :key="index" @click="toggleActionSelection(action)"
                    class="clickable-row" :class="{ 'table-danger': isActionSelected(action) }">
                    <td class="d-flex justify-content-between">
                        {{ action }}
                        <div class="form-check form-switch ms-4">
                            <input class="form-check-input" type="checkbox" role="switch"
                                :checked="isActionSelected(action)"/>
                        </div>
                    </td>
                </tr>
                <tr v-if="actionsList.length === 0">
                    <td colspan="3"><strong>No se han encontrado registros de acción.</strong></td>

                </tr>

            </tbody>
            

        </table>
        
<div class="d-flex justify-content-evenly m-2">
    <button class="btn btn-warning m-1 popup-shadow" @click="discardSelection"><i class="bi bi-x-lg"></i> Descartar selección</button>
    <button class="btn btn-danger m-1 popup-shadow" @click="emitDeletionRequest"> <i class="bi bi-trash3-fill"></i> Eliminar </button>
</div>
        
        <p class="pt-3 small text-center p-0 m-0 text-black">Total registros recuperados: {{ totalElements }}</p>

        <!-- ALERT BANNERS FOR OPERATION RESULTT -->
        <div class="pt-3"> 
            <div v-if="props.responseType === RESPONSE_STATUS_ERROR" class="alert alert-danger ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseType === RESPONSE_STATUS_INFO" class="alert alert-primary ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseType === RESPONSE_STATUS_SUCCESS" class="alert alert-success ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.responseType === RESPONSE_STATUS_WARNING" class="alert alert-warning ms-3 me-3 p-3" role="alert">
                {{ props.responseData }}
            </div>
            <div v-if="props.dataLoading" class="alert alert-info ms-3 me-3 p-3 text-center" role="alert">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    </div>


</template>
<style scoped>
/* Make rows clickable */
.clickable-row {
    cursor: pointer;
}

.btn-active:hover {
  background-color: #0056b3 !important;
}

.btn-custom:hover{
  color: white;
  background-color: red !important;
}

.btn-warn:hover{
  color: black;
  background-color: yellow !important;
}

.popup-shadow:hover{
  box-shadow: 5px 5px 5px 0px rgb(63, 94, 104);
}
</style>
