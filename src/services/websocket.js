import { Client } from "@stomp/stompjs";
import { automationsApiUrl } from "@/environment/apiUrls";
import { obtenerTokenJWTValido } from "@/services/firebaseService";

// Cliente STOMP global
let stompClient = null;

/**
 * Función para conectar el WebSocket
 */
export const conectarWebSocket = async (
  toastMessage,
  toastColor,
  isToastOpen,
  onMessage
) => {

  // Obtenemos el JWT válido desde Firebase
  const token = await obtenerTokenJWTValido(
    toastMessage,
    toastColor,
    isToastOpen
  );

  // Ponemos el prefijo de automations
  let wsUrl = automationsApiUrl + "/automations";

  // Construimos la URL WS a partir de la API
  wsUrl = wsUrl.startsWith("https") ? wsUrl.replace("https", "wss") + "/ws" 
                                    : wsUrl.replace("http", "ws") + "/ws";

  // Creamos el cliente STOMP
  stompClient = new Client({
    brokerURL: wsUrl,

    // Enviamos el JWT al backend
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },

    debug: () => { },

    // Cuando conecta correctamente
    onConnect: () => {

      console.log("WebSocket conectado a Automations");

      // Nos suscribimos al canal de respuestas
      stompClient.subscribe("/user/queue/automations/respuestas", (msg) => {
        const data = JSON.parse(msg.body);
        console.log(data);

        if (onMessage) {
          onMessage(data);
        }
      });
    },

    // Manejo de errores
    onStompError: (frame) => {
      console.error("Error WS:", frame);
    }
  });

  // Activamos la conexión
  stompClient.activate();
};

/**
 * Enviar mensaje al backend
 */
export const enviarMensajeWebSocket = (servicio, mensaje) => {

  if (stompClient && stompClient.connected) {

    stompClient.publish({
      destination: `/app/${servicio}`,
      body: JSON.stringify(mensaje)
    });

  } else {
    console.error("WebSocket no conectado");
  }
};