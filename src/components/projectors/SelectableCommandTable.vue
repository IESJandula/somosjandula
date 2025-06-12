<script setup>
import { computed, onMounted, defineProps, ref, defineEmits, watch } from "vue";
import ComboBoxModel from "@/components/projectors/ComboBoxModel.vue";
import {
	RESPONSE_STATUS_ERROR,
	RESPONSE_STATUS_INFO,
	RESPONSE_STATUS_SUCCESS,
	RESPONSE_STATUS_WARNING,
} from "@/utils/constants";
import { fetchProjectorModelsList } from "@/services/projectors";

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref("");
const toastColor = ref("success");

// ----------------- PROPS DEFINITION -----------------
const props = defineProps({
	pageObject: {
		type: Object,
		required: true,
	},
	responseType: {
		type: String,
		default: "",
	},
	responseData: {
		type: String,
		default: "",
	},
	modelValue: {
		type: Array,
		default: () => [],
	},
});

// Emit events
const emit = defineEmits(["update:modelValue", "pageUpdate", "deleteRequest"]);

const numberOfPages = computed(() => props.pageObject?.totalPages || 0);
const totalElements = computed(() => props.pageObject?.totalElements || 0);
const firstPage = computed(() => props.pageObject?.first || false);
const lastPage = computed(() => props.pageObject?.last || false);

const currentPage = ref(props.pageObject?.number || 0); // Default page size

const pageNumber = (pageNumberParam) => {
	currentPage.value = pageNumberParam; // Update the page size
};

// When the page object changes reload the comboboxes.
watch(
	() => props.pageObject,
	() => {
		loadProjectorModels();
	}
);

// ----------------- SELECT ACTIONS -----------------

// List comes from pageObject.
const commandsList = computed(() => props.pageObject?.content || []);

const selectedCommands = computed(() => props.modelValue); // Directly reference the prop

// Watch for changes to selectedActions and emit the new value to the parent
watch(
	selectedCommands,
	(newValue) => {
		console.log("Comandos seleccionadas XX: " + newValue);
		emit("update:modelValue", newValue);
	},
	{ deep: true }
);

// Check if a action is selected
const isCommandSelected = (command) => {
	return selectedCommands.value.some(
		(c) => c.modelName + c.action === command.modelName + command.action
	);
};

// Function to handle action selection
const toggleCommandSelection = (command) => {
	const key = command.modelName + command.action;
	const selectedIndex = selectedCommands.value.findIndex(
		(c) => c.modelName + c.action === key
	);

	if (selectedIndex > -1) {
		// Si ya está seleccionado, lo eliminamos
		selectedCommands.value.splice(selectedIndex, 1);
	} else {
		// Si no está seleccionado, lo agregamos
		selectedCommands.value.push(command);
	}

	// Emitir actualización
	emit("update:modelValue", [...selectedCommands.value]);
	console.log(selectedCommands.value);
};

const discardSelection = () => {
	emit("update:modelValue", []);
};

onMounted(() => {
	loadProjectorModels();
});

const emitDeletionRequest = () => {
	emit("deleteRequest");
	console.log(selectedCommands.value);
};

const selectedCommandModel = ref("default");
const selectedCommandAction = ref("default");

// Watched the page, changes emits the new page.
// Watch for changes in page, command model, and command action.
watch([currentPage, selectedCommandModel, selectedCommandAction], () => {
	const commandModelFilter =
		selectedCommandModel.value !== "default"
			? selectedCommandModel.value
			: null;
	const commandActionFilter =
		selectedCommandAction.value !== "default"
			? selectedCommandAction.value
			: null;

	emit(
		"pageUpdate",
		currentPage.value,
		5,
		commandModelFilter,
		commandActionFilter
	);
});

const modelsList = ref([]);

// Function to fetch projectors for a specific classroom.
const loadProjectorModels = async () => {
	try {
		modelsList.value = await fetchProjectorModelsList(
			toastMessage,
			toastColor,
			isToastOpen
		);
	} catch (error) {
		console.error("Error loading projector list.", error);
	}
};

// ------- mecanismo seleccion
</script>

<template>
	<div>
		<!-- Select Model -->
		<div class="col pb-3 mx-auto">
			<ComboBoxModel
				v-model="selectedCommandModel"
				:labelValue="'Modelo:'"
				:key="selectedCommandModel"
				:optionsList="modelsList"
			/>
		</div>

		<!-- PAGINATION BUTTONS -->
		<div class="small justify-content-center d-flex">
			<div>
				<!--<label for="ordenadores">Pagina:</label>-->
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
		</div>

		<table class="table border table-bordered border-dark text-center m-0">
			<thead>
				<tr class="table-dark">
					<th>Modelo</th>
					<th>Acción</th>
					<th>Insrtucción</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="command in commandsList"
					:key="command.modelName + command.action"
					@click="toggleCommandSelection(command)"
					class="clickable-row"
					:class="{ 'table-danger': isCommandSelected(command) }"
				>
					<td>
						{{ command.modelName }}
					</td>
					<td class="d-flex justify-content-between">
						{{ command.action }}
						<div class="form-check form-switch ms-4">
							<input
								class="form-check-input"
								type="checkbox"
								role="switch"
								:checked="isCommandSelected(command)"
							/>
						</div>
					</td>
					<td>
						{{ command.command }}
					</td>
				</tr>
				<tr v-if="commandsList.length === 0">
					<td colspan="3">
						<strong>No se han encontrado registros de comando.</strong>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="d-flex justify-content-evenly m-2">
			<button
				class="btn btn-warning m-1 popup-shadow"
				@click="discardSelection"
			>
				<i class="bi bi-x-lg"></i> Descartar selección
			</button>
			<button
				class="btn btn-danger m-1 popup-shadow"
				@click="emitDeletionRequest"
			>
				<i class="bi bi-trash3-fill"></i> Eliminar
			</button>
		</div>
		<p class="pt-3 small text-center p-0 m-0 text-black">
			Total registros recuperados: {{ totalElements }}
		</p>

		<!-- ALERT BANNERS FOR OPERATION RESULTT -->
		<div class="pt-3">
			<div
				v-if="props.responseType === RESPONSE_STATUS_ERROR"
				class="alert alert-danger ms-3 me-3 p-3"
				role="alert"
			>
				{{ props.responseData }}
			</div>
			<div
				v-if="props.responseType === RESPONSE_STATUS_INFO"
				class="alert alert-primary ms-3 me-3 p-3"
				role="alert"
			>
				{{ props.responseData }}
			</div>
			<div
				v-if="props.responseType === RESPONSE_STATUS_SUCCESS"
				class="alert alert-success ms-3 me-3 p-3"
				role="alert"
			>
				{{ props.responseData }}
			</div>
			<div
				v-if="props.responseType === RESPONSE_STATUS_WARNING"
				class="alert alert-warning ms-3 me-3 p-3"
				role="alert"
			>
				{{ props.responseData }}
			</div>
			<div
				v-if="props.dataLoading"
				class="alert alert-info ms-3 me-3 p-3 text-center"
				role="alert"
			>
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