// Importamos la dirección desde el fichero de entorno.
import { projectorsApiUrl } from '@/environment/apiUrls';

/****************************************/
/************** APP Version *************/
/****************************************/

export const APP_VERSION = '1.0.3' ;

/****************************************/
/**************** Session ***************/
/****************************************/

export const SESSION_JWT_TOKEN = 'tokenJwt' ;


// Statuses for the responses from the server.
export const RESPONSE_STATUS_SUCCESS = "EXITO";
export const RESPONSE_STATUS_ERROR = "ERROR";
export const RESPONSE_STATUS_INFO = "INFO";
export const RESPONSE_STATUS_WARNING = "ATENCION";

// Statuses for the actions in the server events table.
export const EVENT_STATUS_PENDING = "PENDIENTE";
export const EVENT_STATUS_EXECUTED = "REALIZADO";
export const EVENT_STATUS_SERVED = "ENVIADO";
export const EVENT_STATUS_ERROR = "ERROR";
export const EVENT_STATUS_CANCELED = "CANCELADO";

// Status posibles de los proyectores.
export const PROJECTOR_STATUS_ON = "Encendido";
export const PROJECTOR_STATUS_TURNING_ON = "Encendiendo";
export const PROJECTOR_STATUS_OFF = "Apagado";
export const PROJECTOR_STATUS_TURNING_OFF = "Apagando";

// Constantes para endpoints de proyectores.
export const FLOORS = projectorsApiUrl + "/projectors/floors";
export const CLASSROOMS = projectorsApiUrl + "/projectors/classrooms";
export const CLASSROOM_PROJECTORS = projectorsApiUrl + "/projectors/classroom-projectors";
export const COMMANDS = projectorsApiUrl + "/projectors/commands";
export const PROJECTORS = projectorsApiUrl + "/projectors/projectors";
export const PROJECTORS_ALL = projectorsApiUrl + "/projectors/projectors-all";
export const ACTIONS = projectorsApiUrl + "/projectors/actions";
export const EVENTS_BATCH = projectorsApiUrl + "/projectors/server-events-batch";
export const MODELS = projectorsApiUrl + "/projectors/projector-models";
export const SERVER_EVENT = projectorsApiUrl + "/projectors/server-events";
export const PROJECTOR_OVERVIEW = projectorsApiUrl + "/projectors/general-overview";
export const EVENTS_OVERVIEW = projectorsApiUrl + "/projectors/events-overview";
export const MODELS_OVERVIEW = projectorsApiUrl + "/projectors/models-overview";
export const ACTIONS_PAGE = projectorsApiUrl + "/projectors/actions-page";
export const COMMANDS_PAGE = projectorsApiUrl + "/projectors/commands-page";
export const PARSE_MULTIFILE = projectorsApiUrl + "/projectors/parse-multifile";
export const EVENT_STATES = projectorsApiUrl + "/projectors/event-states";

