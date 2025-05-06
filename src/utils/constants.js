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
    FLOORS: API_BASE_URL_PROJECTORS + "/projectors/floors",
    CLASSROOMS: API_BASE_URL_PROJECTORS + "/projectors/classrooms",
    CLASSROOM_PROJECTORS: API_BASE_URL_PROJECTORS + "/projectors/classroom-projectors",
    COMMANDS: API_BASE_URL_PROJECTORS + "/projectors/commands",
    PROJECTORS: API_BASE_URL_PROJECTORS + "/projectors/projectors",
    PROJECTORS_ALL: API_BASE_URL_PROJECTORS + "/projectors/projectors-all",
    ACTIONS: API_BASE_URL_PROJECTORS + "/projectors/actions",
    EVENTS_BATCH: API_BASE_URL_PROJECTORS + "/projectors/server-events-batch",
    MODELS: API_BASE_URL_PROJECTORS + "/projectors/projector-models",
    SERVER_EVENT: API_BASE_URL_PROJECTORS + "/projectors/server-events",
    PROJECTOR_OVERVIEW: API_BASE_URL_PROJECTORS + "/projectors/general-overview",
    EVENTS_OVERVIEW: API_BASE_URL_PROJECTORS + "/projectors/events-overview",
    MODELS_OVERVIEW: API_BASE_URL_PROJECTORS + "/projectors/models-overview",
    ACTIONS_PAGE:API_BASE_URL_PROJECTORS + "/projectors/actions-page",
    COMMANDS_PAGE: API_BASE_URL_PROJECTORS + "/projectors/commands-page",
    PARSE_MULTIFILE: API_BASE_URL_PROJECTORS + "/projectors/parse-multifile",
    EVENT_STATES: API_BASE_URL_PROJECTORS + "/projectors/event-states",

};

