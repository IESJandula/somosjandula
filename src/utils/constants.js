// Importamos la dirección desde el fichero de entorno.
import { projectorsApiUrl } from '@/environment/apiUrls';

/****************************************/
/**************** Session ***************/
/****************************************/

export const SESSION_JWT_TOKEN = 'tokenJwt' ;


// Creamos la constante de dirección base.
const API_BASE_URL_PROJECTORS = projectorsApiUrl;

export default {
    // Statuses for the responses from the server.
    RESPONSE_STATUS_SUCCESS: "SUCCESS",
    RESPONSE_STATUS_ERROR: "ERROR",
    RESPONSE_STATUS_INFO: "INFO",
    RESPONSE_STATUS_WARNING: "WARNING",
    // Statuses for the actions in the server events table.
    EVENT_STATUS_PENDING: "PENDING",
	EVENT_STATUS_EXECUTED: "EXECUTED",
	EVENT_STATUS_SERVED: "SERVED",
    EVENT_STATUS_ERROR: "ERROR",
	EVENT_STATUS_CANCELED: "CANCELED",

    // Constantes para endpoints de proyectores.
    FLOORS: API_BASE_URL_PROJECTORS + "/floors",
    CLASSROOMS: API_BASE_URL_PROJECTORS + "/classrooms",
    CLASSROOM_PROJECTORS: API_BASE_URL_PROJECTORS + "/classroom-projectors",
    COMMANDS: API_BASE_URL_PROJECTORS + "/commands",
    PROJECTORS: API_BASE_URL_PROJECTORS + "/projectors",
    PROJECTORS_ALL: API_BASE_URL_PROJECTORS + "/projectors-all",
    ACTIONS: API_BASE_URL_PROJECTORS + "/actions",
    EVENTS_BATCH: API_BASE_URL_PROJECTORS + "/server-events-batch",
    MODELS: API_BASE_URL_PROJECTORS + "/projector-models",
    SERVER_EVENT: API_BASE_URL_PROJECTORS + "/server-events",
    PROJECTOR_OVERVIEW: API_BASE_URL_PROJECTORS + "/general-overview",
    EVENTS_OVERVIEW: API_BASE_URL_PROJECTORS + "/events-overview",
    MODELS_OVERVIEW: API_BASE_URL_PROJECTORS + "/models-overview",
    ACTIONS_PAGE:API_BASE_URL_PROJECTORS + "/actions-page",
    COMMANDS_PAGE: API_BASE_URL_PROJECTORS + "/commands-page",
    PARSE_MULTIFILE: API_BASE_URL_PROJECTORS + "/parse-multifile",
    EVENT_STATES: API_BASE_URL_PROJECTORS + "/event-states",

};

