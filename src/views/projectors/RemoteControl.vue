<script setup>
import { onMounted, ref, watch, computed } from "vue";
import MassiveControlTable from "@/components/projectors/RemoteControlTable.vue";
import FormBox from "@/components/projectors/FormBox.vue";
import { RESPONSE_STATUS_ERROR } from "@/utils/constants";
import { Modal } from "bootstrap";
import {
	fetchActionsList,
	sendServerEventBatchService,
	fetchProjectorList,
} from "@/services/projectors";
import ComboBoxClassroom from "@/components/projectors/ComboBoxClassroom.vue";
import ComboBoxFloor from "@/components/projectors/ComboBoxFloor.vue";
import ComboBoxModel from "@/components/projectors/ComboBoxModel.vue";
import ComboBoxState from "@/components/projectors/ComboBoxState.vue";
import {
	EVENT_STATUS_ERROR,
	EVENT_STATUS_PENDING,
	EVENT_STATUS_EXECUTED,
	EVENT_STATUS_SERVED,
	EVENT_STATUS_CANCELED,
} from "@/utils/constants";
import {
	fetchFloorsList,
	fetchSelectedFloorClassrooms,
	fetchProjectorModelsList,
	fetchEventStates,
	fetchEvents,
} from "@/services/projectors";

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// Define the filter object.
const filterModelName = ref("default");
const filterClassroomName = ref("default");
const filterFloorName = ref("default");
const filterActionStatus = ref("default");
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

// Load projector list when component is mounted
onMounted(() => {
	loadProjectorList();
	loadActionsList();
	const modalElement = document.getElementById("actionModal");
	modalInstance = new Modal(modalElement,
		{
			backdrop: false, keyboard: false
		}
	);
	const saved = localStorage.getItem("buttonDisabledUntil");
	if (saved) {
		const expireAt = parseInt(saved);
		if (Date.now() < expireAt) {
			startCountdown(expireAt);
		} else {
			// Expiró, limpiar estado
			localStorage.removeItem("buttonDisabledUntil");
		}
	}
	loadEvents();
	loadFloorsList();
	loadProjectorModels();
	loadEventStates();
});

const dateArrayToDate = (dateArray) => {
	if (!Array.isArray(dateArray) || dateArray.length < 6) return null;

	const [year, month, day, hour, minute, second, microsecond = 0] = dateArray;

	const date = new Date(
		year,
		month - 1,
		day,
		hour,
		minute,
		second,
		Math.floor(microsecond / 1000)
	);

	return date;
};

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
	} catch (error) {
		console.error("Error loading list of values", error);
	}
};

// Fetch classrooms for the selected floor.
const loadClassroomsForSelectedFloor = async (floorParam) => {
	try {
		console.log("loading classrooms for " + floorParam);

		// Ensure floor is selected
		if (floorParam.value === "default") return;

		const response = await fetchSelectedFloorClassrooms(
			toastMessage,
			toastColor,
			isToastOpen,
			floorParam
		);

		// List of the classrooms for the selected floor.
		selectedFloorClassroomsList.value = await response;

		// Reset selected classroom
		filterClassroomName.value = "default";
	} catch (error) {
		console.error("Error loading classroom list", error);
	}
};

// Function to fetch projectors for a specific classroom.
const loadProjectorModels = async () => {
	console.log("Fetching projector models");

	try {
		const response = await fetchProjectorModelsList(
			toastMessage,
			toastColor,
			isToastOpen
		);

		projectorModels.value = response;

		filterModelName.value = "default";
	} catch (error) {
		console.error("Error loading projector list.", error);
	}
};

// Function to fetch projectors for a specific classroom.
const loadEventStates = async () => {
	console.log("Fetching event states");

	try {
		const response = await fetchEventStates(
			toastMessage,
			toastColor,
			isToastOpen
		);

		eventStatesList.value = response;

		filterActionStatus.value = "default";
	} catch (error) {
		console.error("Error loading projector list.", error);
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
	filterClassroomName.value = "default";
	filterFloorName.value = "default";
	filterModelName.value = "default";
	filterActionStatus.value = "default";
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
		actionStatus: filterActionStatus.value,
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

		console.log("API Response:", responseData);

		pageObject.value = responseData;
		serverEventsList.value = pageObject.value.content;
		numberOfPages.value = pageObject.value.totalPages;
		lastPage.value = pageObject.value.last;
		firstPage.value = pageObject.value.first;
	} catch (error) {
		console.error("Error fetching events:", error);
		alert("Hubo un error al obtener los eventos. Intenta de nuevo.");
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

// ----------------- MODAL FOR ACTIONS -----------------
const modalMessage = ref("");
const modalTitle = ref("");
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
	localStorage.setItem("buttonDisabledUntil", expireAt.toString());

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
			localStorage.removeItem("buttonDisabledUntil");
		}
	};

	updateCountdown(); // Update immediately
	interval = setInterval(updateCountdown, 1000);
};

// ----------------- PROJECTOR ACTIONS -----------------
const actionsList = ref([]);

const loadActionsList = async () => {
	actionsList.value = await fetchActionsList(
		toastMessage,
		toastColor,
		isToastOpen
	);
};

// ----------------- END PROJECTOR ACTIONS -----------------

// ----------------- PROJECTORS TABLE -----------------

// Variables for projector removal process

const unassignmentLoading = ref(false);
const pageObjectP = ref();

const filterObject = ref({
	orderCriteriaF: "default",
	pageNumberF: 0,
	pageSizeF: 15,
	selectedClassroomF: "default",
	selectedFloorF: "default",
	selectedModelF: "default",
	selectedStatusF: "default",
});

const updateFilter = (newFilterObject) => {
	filterObject.value = newFilterObject;
	loadProjectorList();
};

const loadProjectorList = async () => {
	try {
		const orderCriteria = filterObject.value.orderCriteriaF;
		const page = filterObject.value.pageNumberF;
		const size = filterObject.value.pageSizeF;
		const classroom = filterObject.value.selectedClassroomF;
		const floor = filterObject.value.selectedFloorF;
		const isTurnedOn = filterObject.value.selectedStatusF;
		const model = filterObject.value.selectedModelF;

		console.log("llamando backend.");

		const response = await fetchProjectorList(
			toastMessage,
			toastColor,
			isToastOpen,
			orderCriteria,
			page,
			size,
			classroom,
			floor,
			isTurnedOn,
			model
		);

		pageObjectP.value = response;
	} catch (error) {
		console.error("Error while retrieving projector list", error);

		if (error.response) {
			console.error("Error code:", error.response.status);
			console.error("Server message:", error.response.data.message);
		} else if (error.request) {
			console.error("No response received from the server", error.request);
		} else {
			console.error("Request configuration error", error.message);
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
	console.log("Updated selectedProjectorsList:", newVal);
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
			projectorList: selectedProjectorsList.value,
		};

		const response = await sendServerEventBatchService(
			toastMessage,
			toastColor,
			isToastOpen,
			requestBody
		);

		responseTypeCMD.value = response.status;
		responseDataCMD.value = response.message;

		disableButtonTemporarily();

		loadEvents(); // Recarga los eventos una vez enviada la orden.
		loadProjectorList();

		showModal(response.status, response.message);
	} catch (error) {
		responseTypeCMD.value = RESPONSE_STATUS_ERROR;

		console.error("Error while sending server event batch", error);
		if (error.response) {
			console.error("Error code:", error.response.status);
			console.error("Server message:", error.response.message);
			responseDataCMD.value = error.response.message;
		} else if (error.request) {
			responseDataCMD.value = error.request;
			console.error("No response received from the server", error.request);
		} else {
			responseDataCMD.value = error.message;
			console.error("Request configuration error", error.message);
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
	background: `linear-gradient(to bottom, ${colorGradienteInicio}, ${colorGradienteFondo})`,
}));

const alertClass = computed(() => {
	switch (modalTitle.value) {
		case "ERROR":
			return "bg-danger";
		case "INFO":
			return "bg-primary";
		case "EXITO":
			return "bg-success";
		case "ATENCION":
			return "bg-warning";
		default:
			return ""; // Default case if no match
	}
});
</script>

<!-- ------------------- TEMPLATE ------------------- -->

<template>
	<div style="width: 100%" :style="gradientStyle" class="p-0">
		<!-- Bootstrap Modal -->
		<div class="modal fade" id="actionModal" tabindex="-1" aria-hidden="true">
			<div class="modal-dialog modal-dialog-centered pt-0">
				<div class="modal-content pt-0">
					<div class="modal-header text-white  pt-0" :class="alertClass">
						<h5 class="modal-title text-center pt-0">{{ modalTitle }}</h5>
						<button
							type="button"
							class="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div class="modal-body text-center text-black">
						{{ modalMessage }}
					</div>
					<div class="modal-footer justify-content-center">
						<button
							type="button"
							class="btn btn-secondary"
							data-bs-dismiss="modal"
							@click="loadEvents"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="row d-flex flex-grow-1 justify-content-center p-3">
			<div class="col-12 col-md-10 col-lg-8 p-0">
				<!-- Form box -->
				<div>
					<FormBox
						:dataLoading="unassignmentLoading"
						:formTitle="'SELECCION DE PROYECTORES'"
						:subtitle="'Formulario para enviar ordenes a uno o más proyectores. Permite flitrado por ubicación y/ modelo.'"
						:helpText="'Deste esta pantalla puede enviar ordenes a los proyectores seleccionados.'"
						:submitButtonText="'REGISTER MODEL'"
						:collapseId="'id5'"
						:enableButton="false"
						:responseType="responseTypeDelP"
						:responseData="responseDataDelP"
						:bannerBackgroundColor="'bg-primary'"
						:containerBackgroundStyle="'background-color: azure;'"
					>
						<div class="row p-0">
							<div class="col-12 col-md-12 col-lg-8 small p-3">
								<MassiveControlTable
									v-model="selectedProjectorsList"
									:tableHeaderClass="'table-primary'"
									:pageObject="pageObjectP"
									:enableDelete="false"
									@filterUpdated="updateFilter"
								/>
							</div>

							

							<!-- Actions formbox. -->
							<div class="col-12 col-md-12 col-lg-4">
								<div class="m-3">
									<FormBox
										:formTitle="'ACCIONES'"
										:subtitle="'Listado de acciones que se pueden enviar a los proyectores.'"
										:enableButton="false"
										:responseType="responseTypeCMD"
										:responseData="responseDataCMD"
										:bannerBackgroundColor="'bg-info'"
										:bannerTextColor="'text-dark'"
										:containerBackgroundStyle="'background-color: white;'"
									>
										<div class="text-center">
											<div
												v-if="isButtonDisabled"
												class="alert alert-danger"
												role="alert"
											>
												<span class=""
													><strong>Podrá reenviar un comando en: </strong
													>{{ actionCountdown }} s</span
												>
											</div>
										</div>

										<!-- Projector commands container -->
										<div class="rounded-top p-1">
											<!-- cards will be rendered within this one.-->
											<div
												class="d-flex flex-wrap justify-content-center gap-3"
											>
												<div
													v-for="(action, index) in actionsList"
													:key="index"
													class="col-auto"
												>
													<div class="card-body p-0">
														<div
															class="border border-dark p-2 pt-0 rounded"
															:disabled="isButtonDisabled"
															style="background-color: aliceblue"
														>
															<h5
																class="card-title pb-2 pt-0 text-center text-black"
															>
																{{ action.actionName }}
															</h5>
															<button
																@click="sendServerEventBatch(action)"
																:disabled="isButtonDisabled"
																class="btn btn-info fw-bold"
															>
																ENVIAR
															</button>
														</div>
													</div>
												</div>
											</div>
										</div>
									</FormBox>
								</div>
							</div>
							<!-- /Actions formbox. -->
						</div>
					</FormBox>
				</div>
			</div>
		</div>

		<!-- SERVER EVENTS -->

		<div class="row d-flex flex-grow-1 justify-content-center p-3 pb-5">
			<div class="col-12 col-md-10 col-lg-8 p-0">
				<div
					class="mx-auto pt-1 pb-1 mb-0 mt-0 rounded-top-3 border-dark border"
					:style="{ backgroundColor: colorGradienteFondo }"
				>
					<h3 class="text-center text-white">
						ORDENES ENVIADAS A LOS PROYECTORES
					</h3>
				</div>
			</div>
			<div class="container bg-light rounded-top-0 border-dark border col-12 col-md-10 col-lg-8 p-0">
				<div class="row justify-content-center">
					<div class="row justify-content-center gy-2 small">
						<!-- Select Floor -->
						<div class="col-12 col-md-2">
							<ComboBoxFloor
								:labelValue="'Planta:'"
								:optionsList="floorsList"
								v-model="filterFloorName"
								@selectUpdate="loadClassroomsForSelectedFloor"
							/>
						</div>

						<!-- Select Classroom -->
						<div class="col-12 col-md-2">
							<ComboBoxClassroom
								v-model="filterClassroomName"
								:labelValue="'Aula:'"
								:key="filterClassroomName"
								:optionsList="selectedFloorClassroomsList"
							/>
						</div>

						<!-- Select Model -->
						<div class="col-12 col-md-2">
							<ComboBoxModel
								v-model="filterModelName"
								:labelValue="'Modelo:'"
								:key="filterModelName"
								:optionsList="projectorModels"
							/>
						</div>

						<div class="col-12 col-md-2">
							<ComboBoxState
								v-model="filterActionStatus"
								:labelValue="'Estado orden:'"
								:key="filterActionStatus"
								:optionsList="eventStatesList"
							></ComboBoxState>
						</div>

						<div class="col-12 col-md-2 pt-4">
							<button
								class="btn btn-warning w-100 border border-dark"
								@click="resetFilters"
							>
								<i class="bi bi-x-diamond"></i> Descartar filtro
							</button>
						</div>
					</div>
				</div>

				<div class="mx-auto">
					<!-- /pagination-->
					<nav
						aria-label="Pages"
						class="d-flex justify-content-evenly row pt-2"
					>
						<!-- RECORDS BY PAGE BUTTONS -->
						<div class="small col-12 col-md-auto">
							<label for="ordenadores" class="text-black">Por pagina:</label>
							<ul id="ordenadores" class="pagination">
								<li class="page-item">
									<button
										@click="pageBy(10)"
										type="button"
										class="btn btn-sm rounded-0 rounded-start btn-outline-dark btn-light"
										:class="{ 'btn-active': pageSize === 10 }"
									>
										10
									</button>
								</li>
								<li class="page-item">
									<button
										@click="pageBy(15)"
										type="button"
										class="btn btn-sm rounded-0 btn-outline-dark btn-light"
										:class="{ 'btn-active': pageSize === 15 }"
									>
										15
									</button>
								</li>
								<li class="page-item">
									<button
										@click="pageBy(25)"
										type="button"
										class="btn btn-sm rounded-0 btn-outline-dark btn-light"
										:class="{ 'btn-active': pageSize === 25 }"
									>
										25
									</button>
								</li>
								<li class="page-item">
									<button
										@click="pageBy(50)"
										type="button"
										class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
										:class="{ 'btn-active': pageSize === 50 }"
									>
										50
									</button>
								</li>
							</ul>
						</div>

						<div style="height: 16px; width: 16px"></div>

						<!-- PAGINATION BUTTONS -->
						<div class="small col-12 col-md-auto">
							<label for="ordenadores" class="text-black">Pagina:</label>
							<ul id="ordenadores" class="pagination d-flex flex-wrap">
								<li class="page-item">
									<button
										@click="pageNumber(0)"
										type="button"
										class="btn btn-sm rounded-0 rounded-start btn-outline-dark btn-light"
										:class="{ 'btn-active': firstPage }"
									>
										<i class="bi bi-chevron-bar-left"></i>
									</button>
								</li>

								<span v-for="index in numberOfPages" :key="index">
									<li class="page-item">
										<button
											@click="pageNumber(index - 1)"
											type="button"
											class="btn btn-sm rounded-0 btn-outline-dark btn-light"
											:class="{ 'btn-active': index === currentPage + 1 }"
										>
											{{ index }}
										</button>
									</li>
								</span>

								<li class="page-item">
									<button
										@click="pageNumber(numberOfPages - 1)"
										type="button"
										class="btn btn-sm rounded-0 rounded-end btn-outline-dark btn-light"
										:class="{ 'btn-active': lastPage }"
									>
										<i class="bi bi-chevron-bar-right"></i>
									</button>
								</li>
							</ul>
						</div>

						<div class="small col-12 col-md-auto pt-3">
							<button
								class="btn btn-primary w-100 border border-dark"
								@click="loadEvents"
							>
								<i class="bi bi-arrow-clockwise"></i> Refrescar
							</button>
						</div>
					</nav>
				</div>
				<!-- /pagination-->

				<!-- Card or record where the information is displayed -->
				<div class="col-12 col-lg-auto mx-auto p-3">
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
									<tr
										v-for="event in serverEventsList"
										:key="event.eventId"
										:class="getStatusClass(event.actionStatus)"
									>
										<td class="align-middle w-auto text-nowrap">
											{{ formatDate(event.dateTime) }}
											<br />
											{{ formatTime(event.dateTime) }}
										</td>
										<td class="align-middle w-auto">{{ event.user }}</td>
										<td class="align-middle w-auto text-nowrap">
											{{ event.action }}
										</td>
										<td class="align-middle w-auto text-nowrap">
											{{ event.actionStatus }}
										</td>
										<td class="align-middle w-auto text-nowrap">
											{{ event.floor }}
										</td>
										<td class="align-middle w-auto text-nowrap">
											{{ event.classroom }}
										</td>
										<td class="align-middle w-auto text-nowrap">
											{{ event.model }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<!-- card view -->
						<div class="d-block d-md-none">
							<div
								class="container mb-2 p-0"
								v-for="event in serverEventsList"
								:key="event.eventId"
							>
								<div class="card">
									<div
										class="card-body m-0 p-0 border rounded-2"
										:class="getStatusClass(event.actionStatus)"
									>
										<div class="d-flex flex-column p-2">
											<div
												class="d-flex justify-content-between border-bottom border-dark py-1"
											>
												<span class="fw-bold">Fecha - Hora:</span>
												<span
													>{{ formatDate(event.dateTime) }} -
													{{ formatTime(event.dateTime) }}</span
												>
											</div>
											<div
												class="d-flex justify-content-between border-bottom border-dark py-1"
											>
												<span class="fw-bold">User:</span>
												<span>{{ event.user }}</span>
											</div>
											<div
												class="d-flex justify-content-between border-bottom border-dark py-1"
											>
												<span class="fw-bold">Action:</span>
												<span>{{ event.action }}</span>
											</div>
											<div
												class="d-flex justify-content-between border-bottom border-secondary py-1"
											>
												<span class="fw-bold">Action Status:</span>
												<span>{{ event.actionStatus }}</span>
											</div>
											<div
												class="d-flex justify-content-between border-bottom border-dark py-1"
											>
												<span class="fw-bold">Classroom:</span>
												<span>{{ event.classroom }}</span>
											</div>
											<div
												class="d-flex justify-content-between border-bottom border-dark py-1"
											>
												<span class="fw-bold">Model:</span>
												<span>{{ event.model }}</span>
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
	</div>
</template>


<style scoped>
</style>