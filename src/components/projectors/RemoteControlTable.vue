<script setup>
import { defineProps, computed, defineEmits, ref, watch, onMounted } from 'vue';
import ComboBoxClassroom from '@/components/projectors/ComboBoxClassroom.vue';
import ComboBoxFloor from '@/components/projectors/ComboBoxFloor.vue';
import ComboBoxModel from '@/components/projectors/ComboBoxModel.vue';
import {fetchFloorsList,fetchSelectedFloorClassrooms,fetchProjectorModelsList} from '@/services/projectors';
import ComboBoxTurnOnStatus from '@/components/projectors/ComboBoxTurnOnStatus.vue';
import { PROJECTOR_STATUS_ON, PROJECTOR_STATUS_TURNING_ON, PROJECTOR_STATUS_OFF, PROJECTOR_STATUS_TURNING_OFF } from '@/utils/constants.ts';

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
    default: 'table-info',
  },
  tableHeaderClass: {
    type: String,
    default: 'table-primary',
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  enableDelete: {
    type: Boolean,
    default: true
  }
});

// Emit events
const emit = defineEmits(['update:modelValue', 'filterUpdated','removeProjectors']);

// Computed properties for pagination and table data
const projectorsList = computed(() => props.pageObject?.content || []);
const numberOfPages = computed(() => props.pageObject?.totalPages || 0);
const totalElements = computed(() => props.pageObject?.totalElements || 0);
const firstPage = computed(() => props.pageObject?.first || false);
const lastPage = computed(() => props.pageObject?.last || false);

const currentPage = ref(props.pageObject?.number || 0); // Default page size
const pageSize = ref(props.pageObject?.size || 15); // Default page size
const orderCriteria = ref('floor');

const modelOrder = computed(() => orderCriteria.value === 'modelname');
const floorOrder = computed(() => orderCriteria.value === 'floor');

// --------------------- SELECTED PROJECTOR LOGIC

// Store selected projectors as an array (sync with v-model)
const selectedProjectors = ref(props.modelValue);

// Watch selectedProjectors for changes and emit to parent
watch(selectedProjectors, (newValue) => {
  emit('update:modelValue', newValue);
  console.log("selection changed in child component");
});

// Function to handle projector selection
const toggleProjectorSelection = (projector) => {
  const key = projector.model + '-' + projector.classroom;
  const selectedIndex = selectedProjectors.value.findIndex(p => p.model + '-' + p.classroom === key);

  if (selectedIndex > -1) {
    selectedProjectors.value.splice(selectedIndex, 1);
  } else {
    selectedProjectors.value.push(projector);
  }

  // Emit the updated selected projectors list
  emit('update:modelValue', selectedProjectors.value);
};


// Check if a projector is selected
const isProjectorSelected = (projector) => {
  return selectedProjectors.value.some(p => p.model === projector.model && p.classroom === projector.classroom);
};

const discardSelection = () => {
  selectedProjectors.value = [];
}

const selectAll = () => {
  // Iterate over each projector in the projectorsList
  for (const projector of projectorsList.value) {
    const key = projector.model + '-' + projector.classroom;
    const selectedIndex = selectedProjectors.value.findIndex(p => p.model + '-' + p.classroom === key);

    // Only add the projector if it's not already selected
    if (selectedIndex === -1) {
      selectedProjectors.value.push(projector);
    }
  }

  // Emit the updated selected projectors list
  emit('update:modelValue', selectedProjectors.value);
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
const selectedFloor = ref('default');

const classroomsForSelectedFloor = ref([]);
const selectedClassroom = ref('default');

const loadFloorsList = async () => {
  console.log("Loading floors list for remote control.");
  try {
    floorsList.value = await fetchFloorsList(toastMessage, toastColor, isToastOpen);
  }
  catch (error) {
    console.error('Error loading list of values', error);
  }
};

// Fetch classrooms for the selected floor.
const loadSelectedFloorClassrooms = async (floorParam) => {
  try {

    // Ensure floor is selected
    if (floorParam.value === 'default') return;

    const response = await fetchSelectedFloorClassrooms(toastMessage, toastColor, isToastOpen, floorParam);

    // List of the classrooms for the selected floor.
    classroomsForSelectedFloor.value = await response;

    // Reset selected classroom
    selectedClassroom.value = 'default';

  } catch (error) {
    console.error('Error loading classroom list', error);
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

const selectedStatus = ref("default");

// Emits a filter object.
const emitFilter = () => {

  const filterObject = {
    orderCriteriaF: orderCriteria,
    pageSizeF: pageSize,
    pageNumberF: currentPage,
    selectedFloorF: selectedFloor,
    selectedClassroomF: selectedClassroom,
    selectedModelF: selectedModel,
    selectedStatusF: selectedStatus
  }
  console.log('Emitting new filterObject' + filterObject);
  emit('filterUpdated', filterObject);

}

// Watched all the important values and when one changes emits the new filter.
watch(
  [selectedFloor, selectedClassroom, selectedModel, currentPage, pageSize, orderCriteria, selectedStatus],
  () => {
    console.log("Un filtro ha cambiado. Emitiendo actualización...");
    emitFilter();
  }
);

const resetFilters = () => {
  selectedFloor.value = 'default';
  selectedClassroom.value = 'default';
  selectedModel.value = 'default';
  selectedStatus.value = 'default';
  orderCriteria.value = 'floor';
  pageSize.value = 15;
  currentPage.value = 0;

  console.log("Filters reset to default values.");
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

        <!-- Select Status -->
        <div class="col">
          <ComboBoxTurnOnStatus v-model="selectedStatus" :labelValue="'Estado proyector:'" :key="selectedStatus"
          :optionsList="[PROJECTOR_STATUS_ON, PROJECTOR_STATUS_TURNING_ON, PROJECTOR_STATUS_OFF, PROJECTOR_STATUS_TURNING_OFF]" />
        </div>

        <!-- Reset Filters Button -->
        <div class="col-auto d-flex align-items-end" >
          <button class="btn btn-warning w-100 border border-dark" @click="resetFilters" style="margin-bottom: 2px;">
            <i class="bi bi-x-diamond"></i> Descartar filtro
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
                class="btn  btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
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
                :class="{ 'btn-active': (pageSize === 15) }">
                15
              </button>
            </li>
            <li class="page-item">
              <button @click="pageBy(25)" type="button" class="btn btn-sm rounded-0 btn-outline-dark btn-light"
                :class="{ 'btn-active': (pageSize === 25) }">
                25
              </button>
            </li>
            <li class="page-item">
              <button @click="pageBy(50)" type="button"
                class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
                :class="{ 'btn-active': (pageSize === 50) }">
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
                  class="btn  btn-sm rounded-0 btn-outline-dark btn-light"
                  :class="{ 'btn-active': index === (currentPage + 1) }">
                  {{ index }}
                </button>
              </li>
            </span>

            <li class="page-item">
              <button @click="pageNumber(numberOfPages - 1)" type="button"
                class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light" :class="{ 'btn-active': lastPage }">
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
            <th :class="tableHeaderClass" class="col-1">Select.</th>
            <th :class="tableHeaderClass" class="col-3">Floor</th>
            <th :class="tableHeaderClass" class="col-3">Classroom</th>
            <th :class="tableHeaderClass" class="col-2">Model</th>
            <th :class="tableHeaderClass" class="col-auto">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(projector, index) in projectorsList" :key="index"
            :class="{ 'table-info': isProjectorSelected(projector) }" class="clickable-row"
            @click="toggleProjectorSelection(projector)">
            <td>
              <div class="form-check form-switch ms-4">
                <input class="form-check-input" type="checkbox" role="switch" :checked="isProjectorSelected(projector)"/>
              </div>
            </td>
            <td>{{ projector.floorname }}</td>
            <td>{{ projector.classroom }}</td>
            <td>{{ projector.model }}</td>
            <td v-if="projector.status===PROJECTOR_STATUS_OFF">
              <div class="proj-off rounded rounded- p-0 m-0" data-bs-toggle="tooltip" title="El proyector está apagado.">
                <i class="bi bi-projector"></i> <span style="font-size:15px;">{{PROJECTOR_STATUS_OFF}}</span>
              </div>
            </td>
            <td v-if="projector.status===PROJECTOR_STATUS_TURNING_OFF">
              <div class="proj-turning-off rounded rounded- p-0 m-0" data-bs-toggle="tooltip" title="El proyector está en proceso de apagado.">
                <i class="bi bi-projector"></i> <span style="font-size:15px;">{{PROJECTOR_STATUS_TURNING_OFF}}..</span>
              </div>
            </td>
            <td v-if="projector.status===PROJECTOR_STATUS_ON" data-bs-toggle="tooltip" title="El proyector está encendido.">
              <div class="proj-on rounded rounded-2 p-0 m-0">
                <i class="bi bi-projector-fill"></i> <span style="font-size:15px;">{{PROJECTOR_STATUS_ON}}</span>
              </div>
            </td>
            <td v-if="projector.status===PROJECTOR_STATUS_TURNING_ON" data-bs-toggle="tooltip" title="El proyector está en proceso de encendido.">
              <div class="proj-turning-on rounded rounded-2 p-0 m-0">
                <i class="bi bi-projector-fill"></i> <span style="font-size:15px;">{{PROJECTOR_STATUS_TURNING_ON}}..</span>
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
        <button class="btn btn-info border border-dark" @click="selectAll"><i class="bi bi-file-earmark-fill"></i> Seleccionar todo</button>
      </div>

      <div v-if="enableDelete" class="col">
        <!-- Button to discard all selections -->
        <button class="btn btn-danger border border-dark" @click="deleteSelectedProjectors"><i class="bi bi-trash3-fill"></i> Eliminar seleccionados
        </button>
      </div>

      <div class="col">
        <!-- Button to discard all selections -->
        <button class="btn btn-warning border border-dark" @click="discardSelection"><i class="bi bi-x-lg"></i> Descartar selección ({{selectedProjectors.length}})
        </button>
      </div>
      <p class="pt-3">Total registros recuperados: {{ totalElements }}</p>

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

/* Make rows clickable */
.clickable-row {
  cursor: pointer;
}

.proj-on{
  background-color: rgb(213, 255, 213);
  color: rgb(15, 87, 24);
  border: rgb(16, 102, 23) 1px solid;
  font-size: 18px;
}

.proj-off{
  background-color: rgb(255, 194, 194);
  color: rgb(114, 12, 12);
  border: rgb(115, 12, 12) 1px solid;
  font-size: 18px;
}

.proj-turning-on{
  background-color: rgb(0, 248, 215);
  color: rgb(15, 82, 87);
  border: rgb(16, 102, 23) 1px solid;
  font-size: 18px;
}

.proj-turning-off{
  background-color: rgb(248, 176, 94);
  color: rgb(131, 56, 13);
  border: rgb(115, 12, 12) 1px solid;
  font-size: 18px;
}
</style>
