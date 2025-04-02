// Importamos la dirección desde el fichero de entorno.
import { projectorsApiUrl } from '@/environment/apiUrls';

// Creamos la constante de dirección base.
const API_BASE_URL = projectorsApiUrl;

// Definimos las constantes utilizadas en las llamadas a backend. 
// Diseñado en ese modo para no tener que ir tocando 
// direcciones en el codigo en caso de cambios.
export default {
    FLOORS: `${API_BASE_URL}/projectors/floors`,
    CLASSROOMS: `${API_BASE_URL}/projectors/classrooms`,
    CLASSROOM_PROJECTORS: `${API_BASE_URL}/projectors/classroom-projectors`,
    COMMANDS: `${API_BASE_URL}/projectors/commands`,
    PROJECTORS: `${API_BASE_URL}/projectors/projectors`,
    PROJECTORS_ALL: `${API_BASE_URL}/projectors/projectors-all`,
    ACTIONS: `${API_BASE_URL}/actions`,
    EVENTS_BATCH: `${API_BASE_URL}/server-events-batch`,
    MODELS: `${API_BASE_URL}/projector-models`,
    SERVER_EVENT: `${API_BASE_URL}/server-events`,
    PROJECTOR_OVERVIEW: `${API_BASE_URL}/general-overview`,
    EVENTS_OVERVIEW: `${API_BASE_URL}/events-overview`,
    MODELS_OVERVIEW: `${API_BASE_URL}/models-overview`,
    ACTIONS_PAGE:`${API_BASE_URL}/actions-page`,
    COMMANDS_PAGE: `${API_BASE_URL}/commands-page`,
    PARSE_MULTIFILE: `${API_BASE_URL}/projectors/parse-multifile`,
    EVENT_STATES: `${API_BASE_URL}/event-states`,
};