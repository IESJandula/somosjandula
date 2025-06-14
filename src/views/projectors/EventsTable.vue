<script setup>
import { ref, onMounted, computed, watch } from "vue";
import ComboBoxClassroom from "@/components/projectors/ComboBoxClassroom.vue";
import ComboBoxFloor from "@/components/projectors/ComboBoxFloor.vue";
import ComboBoxModel from "@/components/projectors/ComboBoxModel.vue";
import ComboBoxState from "@/components/projectors/ComboBoxState.vue";
import { EVENT_STATUS_ERROR, EVENT_STATUS_PENDING, EVENT_STATUS_EXECUTED, EVENT_STATUS_SERVED, EVENT_STATUS_CANCELED } from '@/utils/constants';
import {fetchFloorsList, fetchSelectedFloorClassrooms,fetchProjectorModelsList, fetchEventStates,fetchEvents } from '@/services/projectors';

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

// Define the filter object.
const filterModelName = ref('default');
const filterClassroomName = ref('default');
const filterFloorName = ref('default');
const filterActionStatus = ref('default');
// posibles futuras implementaciones.
const filterActionName = ref(null);
const filterUser = ref(null);
const filterDateTime = ref(null);

// Properties for pagination.
const pageObject = ref();
const currentPage = ref(0); // Default page size
const pageSize = ref(10); // Default page size
const numberOfPages = ref(0);
const lastPage = ref(false);
const firstPage = ref(false);
const serverEventsList = ref([]);

// Call the filtered fetch method.
onMounted(() => {
    loadEvents();
    loadFloorsList();
    loadProjectorModels();
    loadEventStates();
});

const dateArrayToDate = (dateArray) => 
{  
    if (!Array.isArray(dateArray) || dateArray.length < 6) return null;

    const [year, month, day, hour, minute, second, microsecond = 0] = dateArray;

    const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(microsecond / 1000));

    return date;
}

const formatDate = (date) => {
    return dateArrayToDate(date).toLocaleDateString(); // O usa .toLocaleDateString() si solo quieres la fecha
};

const formatTime = (date) => {
    return dateArrayToDate(date).toLocaleTimeString();
};

const getStatusClass = (status) => {
    switch (status) {
        case EVENT_STATUS_ERROR:
            return "table-danger border border-dark light-red";
        case EVENT_STATUS_PENDING:
            return "table-warning border border-dark light-yellow";
        case EVENT_STATUS_EXECUTED:
            return "table-success border border-dark light-green";
        case EVENT_STATUS_SERVED:
            return "table-info border border-dark light-cyan";
        case EVENT_STATUS_CANCELED:
            return "table-secondary border border-dark light-grey";
        default:
            return "";
    }
};


// ----------------  FILTROS DROPDOWN ----------------
// Stores the list of floors for the combobox options.
const floorsList = ref([]);

const selectedFloorClassroomsList = ref([]);

// Stores the list of projectors for the table.
const projectorModels = ref([]);
const eventStatesList = ref([]);


const loadFloorsList = async () => {
    console.log("Loading floors list.");
    try {

        floorsList.value = await fetchFloorsList();

    }
    catch (error) {
        console.error('Error loading list of values', error);
    }
};

// Fetch classrooms for the selected floor.
const loadClassroomsForSelectedFloor = async (floorParam) => {
    try {

        console.log('loading classrooms for ' + floorParam);

        // Ensure floor is selected
        if (floorParam.value === 'default') return;

        const response = await fetchSelectedFloorClassrooms(toastMessage, toastColor, isToastOpen, floorParam );

        // List of the classrooms for the selected floor.
        selectedFloorClassroomsList.value = await response;

        // Reset selected classroom
        filterClassroomName.value = 'default';

    } catch (error) {
        console.error('Error loading classroom list', error);
    }
};

// Function to fetch projectors for a specific classroom.
const loadProjectorModels = async () => {

    console.log('Fetching projector models');

    try {

        const response = await fetchProjectorModelsList(toastMessage, toastColor, isToastOpen);

        projectorModels.value = response;

        filterModelName.value = "default";

    } catch (error) {
        console.error('Error loading projector list.', error);
    }
};

// Function to fetch projectors for a specific classroom.
const loadEventStates = async () => {

    console.log('Fetching event states');

    try {

        const response = await fetchEventStates(toastMessage, toastColor, isToastOpen);

        eventStatesList.value = response;

        filterActionStatus.value = "default";

    } catch (error) {
        console.error('Error loading projector list.', error);
    }
};

// FILTER FUNCTIONS.

// Watched all the important values and when one changes emits the new filter.
watch(
    [filterClassroomName, filterModelName, filterActionStatus, filterFloorName],
    () => {
        console.log("Un filtro ha cambiado. Emitiendo actualización...");
        loadEvents();
    }
);

const resetFilters = () => {
    filterClassroomName.value = 'default';
    filterFloorName.value = 'default';
    filterModelName.value = 'default';
    filterActionStatus.value = 'default';
};

// ---------------- END FILTROS DROPDOWN ----------------

const loadEvents = async () => {
  const requestBody = {
    eventId: null,
    actionName: filterActionName.value,
    modelName: filterModelName.value,
    classroomName: filterClassroomName.value,
    floorName: filterFloorName.value,
    user: filterUser.value,
    dateTime: filterDateTime.value,
    actionStatus: filterActionStatus.value
  };

  try {
    const responseData = await fetchEvents(
      toastMessage,
      toastColor,
      isToastOpen,
      currentPage.value,
      pageSize.value,
      requestBody
    );

    console.log('API Response:', responseData);

    pageObject.value = responseData;
    serverEventsList.value = pageObject.value.content;
    numberOfPages.value = pageObject.value.totalPages;
    lastPage.value = pageObject.value.last;
    firstPage.value = pageObject.value.first;

  } catch (error) {
    console.error('Error fetching events:', error);
    alert('Hubo un error al obtener los eventos. Intenta de nuevo.');
  }
};

// Update page size and request a new page
const pageBy = (pageSizeParam) => {
    pageSize.value = pageSizeParam; // Update the page size
    pageNumber(0);
    loadEvents();
};

//
const pageNumber = (pageNumberParam) => {
    currentPage.value = pageNumberParam; // Update the page size
    loadEvents();
    console.log(currentPage.value);
    console.log(numberOfPages.value);
};

const colorGradienteInicio = '#ebedf5';
const colorGradienteFondo = '#0F2557';

// Computed para generar dinámicamente el gradiente
const gradientStyle = computed(() => ({
    background: `linear-gradient(to bottom, ${colorGradienteInicio}, ${colorGradienteFondo})`
}));

</script>

<template>
    <div style="width: 100%;" :style="gradientStyle" class="p-0 pb-3">

        <div class="col-12 col-md-8 mx-auto pt-2 pb-1 mb-2 mt-0 rounded-bottom-3"
            :style="{ backgroundColor: colorGradienteFondo }">
            <h3 class="text-center text-white">Registro eventos</h3>
        </div>
        

        <div class="container bg-light rounded-top-3 border-dark border p-2 col-12 col-lg-8">



            <div class="row justify-content-center">
                <div class="row justify-content-center gy-2 small">
                    <!-- Select Floor -->
                    <div class="col-12 col-md-3">
                        <ComboBoxFloor :labelValue="'Planta:'" :optionsList="floorsList" v-model="filterFloorName"
                            @selectUpdate="loadClassroomsForSelectedFloor" />
                    </div>

                    <!-- Select Classroom -->
                    <div class="col-12 col-md-3">
                        <ComboBoxClassroom v-model="filterClassroomName" :labelValue="'Aula:'"
                            :key="filterClassroomName" :optionsList="selectedFloorClassroomsList" />
                    </div>

                    <!-- Select Model -->
                    <div class="col-12 col-md-3">
                        <ComboBoxModel v-model="filterModelName" :labelValue="'Modelo:'" :key="filterModelName"
                            :optionsList="projectorModels" />
                    </div>

                    <div class="col-12 col-md-3">
                        <ComboBoxState v-model="filterActionStatus" :labelValue="'Estado:'" :key="filterActionStatus"
                            :optionsList="eventStatesList"></ComboBoxState>
                    </div>

                    <!-- Reset Filters Button -->
                    <div class="col-auto d-flex flex-column justify-content-end mt-4 mb-2" style="max-width: 220px;">
                        <button class="btn btn-warning w-100 border border-dark" @click="resetFilters">
                            <i class="bi bi-x-diamond"></i>  Descartar filtro
                        </button>
                    </div>
                </div>
            </div>

            <div class="mx-auto"> <!-- /pagination-->
                <nav aria-label="Pages" class="d-flex justify-content-center row">

                    <!-- RECORDS BY PAGE BUTTONS -->
                    <div class="small col-12 col-md-auto">
                        <label for="ordenadores" class="text-black">Por pagina:</label>
                        <ul id="ordenadores" class="pagination">
                            <li class="page-item">
                                <button @click="pageBy(10)" type="button"
                                    class="btn btn-sm rounded-0 rounded-start btn-outline-dark btn-light"
                                    :class="{ 'btn-active': (pageSize === 10) }">
                                    10
                                </button>
                            </li>
                            <li class="page-item">
                                <button @click="pageBy(15)" type="button"
                                    class="btn btn-sm rounded-0 btn-outline-dark btn-light"
                                    :class="{ 'btn-active': (pageSize === 15) }">
                                    15
                                </button>
                            </li>
                            <li class="page-item">
                                <button @click="pageBy(25)" type="button"
                                    class="btn btn-sm rounded-0 btn-outline-dark btn-light"
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

                    <div style="height:16px; width: 16px;;"></div>

                    <!-- PAGINATION BUTTONS -->
                    <div class="small col-12 col-md-auto">
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
                                    class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
                                    :class="{ 'btn-active': lastPage }">
                                    <i class="bi bi-chevron-bar-right"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div> <!-- /pagination-->

            <!-- Card or record where the information is displayed -->
            <div class="col-12 col-lg-auto mx-auto">
                <div>
                    <div class="d-none d-md-block p-0 m-0">
                        <table class="table table-primary border border-black table-auto">
                            <thead>
                                <tr>
                                    <th scope="col" class="w-auto text-nowrap">Fecha - Hora</th>
                                    <th scope="col" class="w-auto text-nowrap">User</th>
                                    <th scope="col" class="w-auto text-nowrap">Accion</th>
                                    <th scope="col" class="w-auto text-nowrap">Estado</th>
                                    <th scope="col" class="w-auto text-nowrap">Planta</th>
                                    <th scope="col" class="w-auto text-nowrap">Aula</th>
                                    <th scope="col" class="w-auto text-nowrap">Modelo</th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider small">
                                <tr v-for="event in serverEventsList" :key="event.eventId"
                                    :class="getStatusClass(event.actionStatus)">
                                    <td class="align-middle w-auto text-nowrap">
                                        {{ formatDate(event.dateTime) }}
                                        <br/>
                                        {{ formatTime(event.dateTime) }}
                                    </td>
                                    <td class="align-middle w-auto">{{ event.user }}</td>
                                    <td class="align-middle w-auto text-nowrap">{{ event.action }}</td>
                                    <td class="align-middle w-auto text-nowrap">{{ event.actionStatus }}</td>
                                    <td class="align-middle w-auto text-nowrap">{{ event.floor }}</td>
                                    <td class="align-middle w-auto text-nowrap">{{ event.classroom }}</td>
                                    <td class="align-middle w-auto text-nowrap">{{ event.model }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>



                    <!-- card view -->
                    <div class="d-block d-md-none">
                        <div class="container mb-2 p-0" v-for="event in serverEventsList" :key="event.eventId">
                            <div class="card">
                                <div class="card-body m-0 p-0 border rounded-2"
                                    :class="getStatusClass(event.actionStatus)">
                                    <div class="d-flex flex-column p-2">
                                        <div class="d-flex justify-content-between border-bottom border-dark py-1">
                                            <span class="fw-bold">Fecha - Hora:</span> <span>{{
                                                formatDate(event.dateTime) }} - {{
                                                    formatTime(event.dateTime) }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between border-bottom border-dark py-1">
                                            <span class="fw-bold">User:</span> <span>{{ event.user }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between border-bottom border-dark py-1">
                                            <span class="fw-bold">Action:</span> <span>{{ event.action }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between border-bottom border-secondary py-1">
                                            <span class="fw-bold">Action Status:</span> <span>{{ event.actionStatus
                                                }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between border-bottom border-dark py-1">
                                            <span class="fw-bold">Classroom:</span> <span>{{ event.classroom }}</span>
                                        </div>
                                        <div class="d-flex justify-content-between border-bottom border-dark py-1">
                                            <span class="fw-bold">Model:</span> <span>{{ event.model }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>


</template>

<style scoped>
body {
    margin: 0;
    padding: 0;
}

.btn-active {
    background-color: #294a97 !important;
    color: white !important;
    border-color: #000000 !important;
}

.btn-active:hover {
    background-color: #0d064e !important;
}

.btn-active2 {
    box-shadow: inset 0 0 3px 3px #ffffff;
    /* Inner blue border */
    margin-top: -5px !important;
}

.light-green {
    background-color: rgb(181, 236, 181);
}

.light-grey {
    background-color: rgba(204, 204, 204);
}

.light-red {
    background-color: rgba(219, 169, 173);
}

.light-yellow {
    background-color: rgb(247, 239, 181);
}

.light-cyan {
    background-color: rgba(163, 212, 214);
}

.table td,
.table th {
    text-align: center;
}
</style>
