<script setup>
import { defineProps, computed, defineEmits, ref, watch, onMounted } from "vue";
import ComboBoxClassroom from "@/components/projectors/ComboBoxClassroom.vue";
import ComboBoxFloor from "@/components/projectors/ComboBoxFloor.vue";
import ComboBoxModel from "@/components/projectors/ComboBoxModel.vue";
import { RESPONSE_STATUS_ERROR, RESPONSE_STATUS_INFO, RESPONSE_STATUS_SUCCESS, RESPONSE_STATUS_WARNING } from '@/utils/constants';
import {fetchFloorsList,fetchSelectedFloorClassrooms,fetchProjectorModelsList} from '@/services/projectors';


// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');


// Llamar a la función al montar el componente
onMounted(() => {
  loadFloorsList();
  loadProjectorModels();
});

// Props
const props = defineProps({
  pageObject: {
    type: Object,
    required: true,
  },
  remarkClass: {
    type: String,
    default: "table-info",
  },
  tableHeaderClass: {
    type: String,
    default: "table-primary",
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  responseType: {
    type: String,
    default: ""
  },
  responseData: {
    type: String,
    default: ""
  },
});

// Emit events
const emit = defineEmits(["update:modelValue", "filterUpdated", "removeSelectedProjectors", "removeAllProjectors"]);

// Computed properties for pagination and table data
const projectorsList = computed(() => props.pageObject?.content || []);
const numberOfPages = computed(() => props.pageObject?.totalPages || 0);
const totalElements = computed(() => props.pageObject?.totalElements || 0);
const firstPage = computed(() => props.pageObject?.first || false);
const lastPage = computed(() => props.pageObject?.last || false);

const currentPage = ref(props.pageObject?.number || 0); // Default page size
const pageSize = ref(props.pageObject?.size || 15); // Default page size
const orderCriteria = ref("floor");

const modelOrder = computed(() => orderCriteria.value === "modelname");
const floorOrder = computed(() => orderCriteria.value === "floor");

// --------------------- SELECTED PROJECTOR LOGIC


// Store selected projectors as an array (sync with v-model)
const selectedProjectors = ref(props.modelValue);

// Watch selectedProjectors for changes and emit to parent
watch(selectedProjectors, (newValue) => {
  emit("update:modelValue", newValue);  // Emit changes to the parent
}, { deep: true });  // Use deep watch to track changes within the array

// Watch modelValue to sync changes from parent to child
watch(() => props.modelValue, (newModelValue) => {
  selectedProjectors.value = newModelValue;  // Sync with parent modelValue
}, { immediate: true, deep: true });  // immediate: true ensures it triggers immediately on mount

// When the page object changes reload the comboboxes.
watch(() => props.pageObject, () => {
  loadFloorsList();
  loadProjectorModels();
});


// Function to handle projector selection
const toggleProjectorSelection = (projector) => {
  const updatedSelection = [...selectedProjectors.value]; // Copiar la lista

  const selectedIndex = updatedSelection.findIndex(
    (p) => p.model === projector.model && p.classroom === projector.classroom
  );

  if (selectedIndex > -1) {
    updatedSelection.splice(selectedIndex, 1);
  } else {
    updatedSelection.push(projector);
  }

  selectedProjectors.value = updatedSelection; // Reasignar para reactividad
  emit("update:modelValue", updatedSelection); // Emitir evento
};


// Check if a projector is selected
const isProjectorSelected = (projector) => {
  return selectedProjectors.value.some(
    (p) => p.model === projector.model && p.classroom === projector.classroom
  );
};

const discardSelection = () => {
  selectedProjectors.value = [];
};

// --------------------- FILTER PAGES LOGIC

// When the order criteria is changed a new filter is emited.
const orderBy = (criteria) => {
  console.log("Requesting order by " + criteria);
  orderCriteria.value = criteria;
};

// Update page size and request a new page
const pageBy = (pageSizeParam) => {
  pageSize.value = pageSizeParam; // Update the page size
  pageNumber(0);
};

const pageNumber = (pageNumberParam) => {
  currentPage.value = pageNumberParam; // Update the page size
};

// --------- FLOOR COMBOBOX LOGIC --------------------------

// Stores the list of floors for the combobox options.
const floorsList = ref([]);
const selectedFloor = ref("default");

const classroomsForSelectedFloor = ref([]);
const selectedClassroom = ref("default");

const loadFloorsList = async () => {
  try {

    const response = await fetchFloorsList();

    floorsList.value = response;

    console.log("Listado plantas obtenido.\n" + response);

  } catch (error) {

    console.error("Error loading list of values", error);

  }
};

// Fetch classrooms for the selected floor.
const loadSelectedFloorClassrooms = async (floorParam) => {
  try {

    // Ensure floor is selected
    if (floorParam === "default") return;

    const response = await fetchSelectedFloorClassrooms(toastMessage, toastColor, isToastOpen, floorParam);

    // List of the classrooms for the selected floor.
    classroomsForSelectedFloor.value = response;

    // Reset selected classroom
    selectedClassroom.value = "default";

  } catch (error) {
    console.error("Error loading classroom list", error);
  }
};

// Stores the list of projectors for the table.
const projectorModels = ref([]);
const selectedModel = ref("default");

// Function to fetch projectors for a specific classroom.
const loadProjectorModels = async () => {
  try {

    projectorModels.value = await fetchProjectorModelsList(toastMessage, toastColor, isToastOpen);

  } catch (error) {
    console.error("Error loading projector list.", error);
  }
};

// Emits a filter object.
const emitFilter = () => {
  const filterObject = {
    orderCriteriaF: orderCriteria.value,
    pageSizeF: pageSize.value,
    pageNumberF: currentPage.value,
    selectedFloorF: selectedFloor.value,
    selectedClassroomF: selectedClassroom.value,
    selectedModelF: selectedModel.value,
  };
  console.log("Emitting new filterObject", filterObject);
  emit("filterUpdated", filterObject);
};


// Watched all the important values and when one changes emits the new filter.
watch(
  [selectedFloor, selectedClassroom, selectedModel, currentPage, pageSize, orderCriteria],
  () => {
    console.log("Un filtro ha cambiado. Emitiendo actualización...");
    emitFilter();
  }
);

const resetFilters = () => {
  selectedFloor.value = "default";
  selectedClassroom.value = "default";
  selectedModel.value = "default";
  orderCriteria.value = "floor";
  pageSize.value = 15;
  currentPage.value = 0;

  console.log("Filters reset to default values.");
};

const deleteSelectedProjectors = () => {
  emit("removeSelectedProjectors");
};

const deleteAllProjectors = () => {
  emit("removeAllProjectors");
}; 
</script>

<template>
  <div>
    <!-- PAGE NAVIGATION AND ORDER SECTION -->
    <div class="container mb-2">
      <div class="row justify-content-center gy-2">
        <!-- Select Floor -->
        <div class="col">
          <ComboBoxFloor :labelValue="'Planta:'" :optionsList="floorsList" v-model="selectedFloor"
            @selectUpdate="loadSelectedFloorClassrooms" />
        </div>

        <!-- Select Classroom -->
        <div class="col">
          <ComboBoxClassroom v-model="selectedClassroom" :labelValue="'Aula:'" :key="selectedClassroom"
            :optionsList="classroomsForSelectedFloor" />
        </div>

        <!-- Select Model -->
        <div class="col">
          <ComboBoxModel v-model="selectedModel" :labelValue="'Modelo:'" :key="selectedModel"
            :optionsList="projectorModels" />
        </div>

        <!-- Reset Filters Button -->
        <div class="col-auto d-flex align-items-end">
          <button class="btn btn-warning w-100 border border-dark" @click="resetFilters" style="margin-bottom: 2px">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <div>
      <nav aria-label="Pages" class="d-flex justify-content-between">
        <!-- ORDER BY BUTTONS -->
        <div class="small">
          <label for="ordenadores" class="text-black">Ordenar por:</label>
          <ul id="ordenadores" class="pagination">
            <li class="page-item">
              <button @click="orderBy('floor')" type="button"
                class="btn btn-sm rounded-0 rounded-start btn-outline-dark btn-light"
                :class="{ 'btn-active': floorOrder }">
                Aula/Planta
              </button>
            </li>
            <li class="page-item">
              <button @click="orderBy('modelname')" type="button"
                class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
                :class="{ 'btn-active': modelOrder }">
                Modelo
              </button>
            </li>
          </ul>
        </div>

        <!-- RECORDS BY PAGE BUTTONS -->
        <div class="small">
          <label for="ordenadores" class="text-black">Por pagina:</label>
          <ul id="ordenadores" class="pagination">
            <li class="page-item">
              <button @click="pageBy(15)" type="button"
                class="btn btn-sm rounded-0 rounded-start btn-outline-dark btn-light"
                :class="{ 'btn-active': pageSize === 15 }">
                15
              </button>
            </li>
            <li class="page-item">
              <button @click="pageBy(25)" type="button" class="btn btn-sm rounded-0 btn-outline-dark btn-light"
                :class="{ 'btn-active': pageSize === 25 }">
                25
              </button>
            </li>
            <li class="page-item">
              <button @click="pageBy(50)" type="button"
                class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
                :class="{ 'btn-active': pageSize === 50 }">
                50
              </button>
            </li>
          </ul>
        </div>

        <!-- PAGINATION BUTTONS -->
        <div class="small">
          <label for="ordenadores" class="text-black">Pagina:</label>
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
                  class="btn btn-sm rounded-0 btn-outline-dark btn-light"
                  :class="{ 'btn-active': index === currentPage + 1 }">
                  {{ index }}
                </button>
              </li>
            </span>

            <li class="page-item">
              <button @click="pageNumber(numberOfPages - 1)" type="button"
                class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light "
                :class="{ 'btn-active': lastPage }">
                <i class="bi bi-chevron-bar-right"></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <!-- TABLE -->
    <div v-if="projectorsList.length">
      <table class="table table-sm border border-1 border-dark text-center align-middle">
        <thead>
          <tr>

            <th :class="tableHeaderClass" class="col-3">Classroom</th>
            <th :class="tableHeaderClass" class="col-3">Floor</th>
            <th :class="tableHeaderClass" class="col-4">Model</th>
            <th :class="tableHeaderClass" class="col-1">Select.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(projector, index) in projectorsList" :key="index"
            :class="{ 'table-info': isProjectorSelected(projector) }" class="clickable-row"
            @click="toggleProjectorSelection(projector)">

            <td>{{ projector.classroom }}</td>
            <td>{{ projector.floorname }}</td>
            <td>{{ projector.model }}</td>
            <td>
              <div class="form-check form-switch ms-4">
                <input class="form-check-input" type="checkbox" role="switch"
                  :checked="isProjectorSelected(projector)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- IN CAS THERE ARE NO RECORDS -->
    <table v-else class="table table-sm table-hover border border-1 border-dark text-center align-middle">
      <thead>
        <tr>
          <td col-span="4"><strong>No se han encontrado registros de proyector.</strong></td>
        </tr>
      </thead>
    </table>

    <!-- AFTER-TABLE CONTROLS -->
    <div class="text-center row">
      <div class="col">
        <!-- Button to discard all selections -->
        <button class="btn btn-outline-danger bg-light btn-custom popup-shadow " @click="deleteAllProjectors">
          <i class="bi bi-trash3-fill"></i> <i class="bi bi-exclamation-diamond"></i> Eliminar <strong>todos.</strong>
        </button>
      </div>

      <div class="col">
        <!-- Button to discard all selections -->
        <button class="btn btn-warning" @click="discardSelection">
          <i class="bi bi-x-diamond"></i> Descartar selección.
        </button>
      </div>

      <div class="col">
        <!-- Button to discard all selections -->
        <button class="btn btn-danger  " @click="deleteSelectedProjectors">
          <i class="bi bi-trash3-fill"></i> Eliminar seleccionados.
        </button>
      </div>

      <p class="pt-3 text-black">Total registros recuperados: {{ totalElements }}</p>

      <!-- ALERT BANNERS FOR OPERATION RESULTT -->
      <div class="pt-3">
        <div v-if="props.responseType === RESPONSE_STATUS_ERROR" class="alert alert-danger ms-3 me-3 p-3"
          role="alert">
          {{ props.responseData }}
        </div>
        <div v-if="props.responseType === RESPONSE_STATUS_INFO" class="alert alert-primary ms-3 me-3 p-3"
          role="alert">
          {{ props.responseData }}
        </div>
        <div v-if="props.responseType === RESPONSE_STATUS_SUCCESS" class="alert alert-success ms-3 me-3 p-3"
          role="alert">
          {{ props.responseData }}
        </div>
        <div v-if="props.responseType === RESPONSE_STATUS_WARNING" class="alert alert-warning ms-3 me-3 p-3"
          role="alert">
          {{ props.responseData }}
        </div>
        <div v-if="props.dataLoading" class="alert alert-info ms-3 me-3 p-3 text-center" role="alert">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.btn-active {
  background-color: #007bff !important;
  color: white !important;
  border-color: #0056b3 !important;
}

.btn-active:hover {
  background-color: #0056b3 !important;
}

.btn-custom:hover {
  color: white;
  background-color: red !important;
}

.btn-warn:hover {
  color: black;
  background-color: yellow !important;
}

.popup-shadow:hover {
  box-shadow: 4px 4px 4px 0px rgb(63, 94, 104);
}

.custom-danger:hover {
  color: rgb(255, 255, 255);
  background-color: rgb(255, 0, 0) !important;
}

/* Make rows clickable */
.clickable-row {
  cursor: pointer;
}
</style>
