import { Client } from "@stomp/stompjs"

let stompClient = null

export function conectarWebSocket(callback) {

  stompClient = new Client({brokerURL: "ws://localhost:8092/ws", reconnectDelay: 5000, debug: () => {}})

  stompClient.onConnect = () => {

    console.log("WebSocket conectado")

    stompClient.subscribe("/topic/respuestas", (mensaje) => {

      const respuesta = mensaje.body

      if (callback) {
        callback(respuesta)
      }

    })

  }

  stompClient.activate()
}