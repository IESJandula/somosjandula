<template>
  <div class="container">

    <!-- TÍTULO -->
    <h1 class="title" style="color: #7edfd0;">
      Jandu-GPT: tu asistente de Inteligencia Artificial
    </h1>

    <!-- SUBTÍTULO -->
    <p class="subtitle" style="color: #7edfd0;">
      Apertura de puertas en remoto. Próximamente: reservas, impresión, noticias, ...
    </p>

    <!-- HISTORIAL -->
    <div class="history-container" ref="historyContainer">

      <div class="history-header">
        <button class="clear-history-btn" @click="limpiarHistorial">
          🗑 Limpiar historial
        </button>
      </div>

      <div v-for="(item, index) in historial" :key="index" class="history-item">

        <!-- TEXTO USUARIO -->
        <div class="history-label">
          Has dicho:
        </div>

        <div class="history-bubble">
          "{{ item.pregunta }}"
        </div>

        <!-- RESPUESTA IA -->
        <div class="history-label ia">
          Respuesta Jandu-GPT:
        </div>

        <div class="history-bubble ia">
          "{{ item.respuesta }}"
        </div>

      </div>

    </div>

    <!-- ERROR -->
    <div v-if="error" class="error-box">
      ⚠ {{ error }}
    </div>

    <!-- INPUT -->
    <div class="manual-input-wrapper">
      <div class="manual-input">

        <input v-model="textoManual" type="text" placeholder="Introduce un comando, por ejemplo: Abre el aula 1.10"
          @keyup.enter="enviarTextoManual" />

        <!-- MIC -->
        <button class="mic-inline" :class="{ listening: escuchando }" @click="manejarClickPC">
          <span v-if="!escuchando" class="mic-emoji">🎙️</span>

          <div v-else class="sound-bars-inline">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <!-- BOTÓN ENVIAR -->
        <button class="send-button" :disabled="!puedeEnviar || escuchando || enviando"
          :class="{ disabled: !puedeEnviar || escuchando || enviando }" @click="enviarTextoManual">
          <span v-if="contador > 0">
            {{ contador }}s
          </span>
          <span v-else>
            Enviar
          </span>
        </button>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { crearOrdenSimpleTexto, crearOrdenSimpleAudio } from '@/services/automations'
import { conectarWebSocket } from "@/services/websocket"

/* VARIABLES */
const texto = ref('')
const escuchando = ref(false)
const error = ref('')
const historial = ref([])
const historialGuardado = localStorage.getItem('historialComandos')

if (historialGuardado) {
  historial.value = JSON.parse(historialGuardado)
}

const historyContainer = ref(null)
const toastMessage = ref('')
const toastColor = ref('')
const isToastOpen = ref(false)
const textoManual = ref('')
const esperandoRespuesta = ref(false)
const enviando = ref(false)

onMounted(() => {

  conectarWebSocket(async (mensaje) => {

    esperandoRespuesta.value = false
    enviando.value = false

    const data = typeof mensaje === "string"
      ? JSON.parse(mensaje)
      : mensaje

    const index = historial.value.findIndex(
      item => item.pregunta === data.pregunta
    )

    if (index !== -1) {
      historial.value[index].respuesta = data.respuesta
    }

    await nextTick()

    historyContainer.value.scrollTo({
      top: historyContainer.value.scrollHeight,
      behavior: "smooth"
    })

  })

})

/* AUTO SCROLL SUAVE */
watch(historial, async () => {
  await nextTick()

  if (historyContainer.value) {
    historyContainer.value.scrollTop =
      historyContainer.value.scrollHeight
  }
})

watch(historial, (nuevoHistorial) => {
  localStorage.setItem(
    'historialComandos',
    JSON.stringify(nuevoHistorial)
  )
}, { deep: true })

/* CONTROL ENVÍO */
const puedeEnviar = ref(false)
const contador = ref(0)
let intervalo = null

watch(textoManual, (nuevoValor) => {
  if (contador.value > 0) return
  puedeEnviar.value = nuevoValor && nuevoValor.trim() !== ''
})

/* AUDIO VARIABLES */
let audioContext
let processor
let input
let globalStream
let audioData = []
let recognition = null
let silenceTimer = null
let silenceStart = null
let grabacionActiva = false

/* Detecta iPhone/iPad/iPod */
function esIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/* ACTIVAR MICRO */
async function activarMicrofono() {

  error.value = ''

  if (typeof window.webkitSpeechRecognition !== "undefined" && !esIOS()) {
    usarReconocimientoNavegador()
  } else {
    grabarAudioFallback()
  }

}

/* RECONOCIMIENTO NATIVO */
function usarReconocimientoNavegador() {

  recognition = new webkitSpeechRecognition()

  recognition.lang = 'es-ES'
  recognition.interimResults = true
  recognition.continuous = true

  textoManual.value = ''
  escuchando.value = true

  recognition.onresult = (event) => {

    let textoIntermedio = ''
    let textoFinal = ''

    for (let i = 0; i < event.results.length; i++) {

      const resultado = event.results[i]

      if (resultado.isFinal) {
        textoFinal += resultado[0].transcript
      } else {
        textoIntermedio += resultado[0].transcript
      }
    }

    textoManual.value = (textoFinal + textoIntermedio).trim()
    puedeEnviar.value = textoManual.value !== ''

    if (textoFinal.trim() !== '') {

      if (silenceTimer) clearTimeout(silenceTimer)

      silenceTimer = setTimeout(() => {
        if (recognition) recognition.stop()
      }, 2000)
    }
  }

  recognition.onend = () => {
    escuchando.value = false
    if (silenceTimer) clearTimeout(silenceTimer)
  }

  recognition.onerror = () => {
    escuchando.value = false
    if (silenceTimer) clearTimeout(silenceTimer)
  }

  recognition.start()
}

/* FALLBACK AUDIO (Firefox / iPhone) */
async function grabarAudioFallback() {

  try {

    globalStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    audioContext = new AudioContext({ sampleRate: 16000 })
    input = audioContext.createMediaStreamSource(globalStream)
    processor = audioContext.createScriptProcessor(2048, 1, 1)

    audioData = []
    silenceStart = null
    grabacionActiva = true

    processor.onaudioprocess = (e) => {

      if (!grabacionActiva) return

      const channelData = e.inputBuffer.getChannelData(0)

      audioData.push(new Float32Array(channelData))

      // 🔊 cálculo RMS (mucho más preciso)
      let sumSquares = 0

      for (let i = 0; i < channelData.length; i++) {
        sumSquares += channelData[i] * channelData[i]
      }

      const rms = Math.sqrt(sumSquares / channelData.length)

      const threshold = 0.008

      // silencio detectado
      if (rms < threshold) {

        if (!silenceStart) {
          silenceStart = Date.now()
        }

        // 2 segundos de silencio
        if (Date.now() - silenceStart > 2000 && grabacionActiva) {

          grabacionActiva = false
          detenerGrabacion()

        }

      } else {

        // hay voz → reset silencio
        silenceStart = null

      }

    }

    input.connect(processor)
    processor.connect(audioContext.destination)

    escuchando.value = true

  } catch {

    error.value = 'No se pudo acceder al micrófono'

  }

}

/* DETENER GRABACIÓN */
async function detenerGrabacion() {

  grabacionActiva = false
  escuchando.value = false

  if (recognition) {
    recognition.stop()
    recognition = null
  }

  if (processor) {
    processor.disconnect()
    processor = null
  }

  if (input) {
    input.disconnect()
    input = null
  }

  if (globalStream) {
    globalStream.getTracks().forEach(track => track.stop())
    globalStream = null
  }

  if (audioContext) {
    audioContext.close()
    audioContext = null
  }

  silenceStart = null

  if (audioData.length === 0) return

  if (audioData.length > 2) {
    audioData = audioData.slice(0, audioData.length - 2)
  }

  const wavBlob = crearWav(audioData)
  audioData = []

  try {

    const data = await crearOrdenSimpleAudio(
      toastMessage,
      toastColor,
      isToastOpen,
      wavBlob
    )
    if (!data || !data.frase || data.frase.trim() === "") {
      return
    }
    escribirTextoGradual(data.frase)
    puedeEnviar.value = false

  } catch {

    error.value = 'No se pudo transcribir el audio'

  }

}

// Escribe el texto poco a poco para simular reconocimiento en tiempo real
function escribirTextoGradual(texto) {

  textoManual.value = ''

  let i = 0

  const intervalo = setInterval(() => {

    textoManual.value += texto[i]

    i++

    if (i >= texto.length) {

      clearInterval(intervalo)

      // habilitamos botón enviar cuando termina
      puedeEnviar.value = true

    }

  }, 10)

}

/* ENVIAR TEXTO */
async function enviarTextoManual() {

  error.value = ''

  if (!textoManual.value || textoManual.value.trim() === '') {
    error.value = 'Debes introducir un comando válido'
    return
  }

  if (!puedeEnviar.value || enviando.value) return

  try {

    enviando.value = true

    const pregunta = textoManual.value
    texto.value = pregunta

    historial.value.push({
      pregunta: pregunta,
      respuesta: "Pensando..."
    })

    esperandoRespuesta.value = true

    await crearOrdenSimpleTexto(
      toastMessage,
      toastColor,
      isToastOpen,
      pregunta
    )

    textoManual.value = ''

    // activamos contador de bloqueo
    puedeEnviar.value = false
    contador.value = 5

    intervalo = setInterval(() => {

      contador.value--

      if (contador.value <= 0) {

        clearInterval(intervalo)

        if (textoManual.value.trim() !== '') {
          puedeEnviar.value = true
        }

      }

    }, 1000)

  } catch {
    enviando.value = false
    esperandoRespuesta.value = false

    error.value = 'Error enviando el comando escrito'
  }
}

/* WAV */
function crearWav(buffers) {

  let length = 0
  buffers.forEach(b => length += b.length)

  const pcmData = new Float32Array(length)

  let offset = 0

  buffers.forEach(b => {
    pcmData.set(b, offset)
    offset += b.length
  })

  const wavBuffer = new ArrayBuffer(44 + pcmData.length * 2)
  const view = new DataView(wavBuffer)

  escribirCabeceraWav(view, pcmData.length)

  let index = 44

  for (let i = 0; i < pcmData.length; i++, index += 2) {

    let sample = Math.max(-1, Math.min(1, pcmData[i]))

    view.setInt16(
      index,
      sample < 0 ? sample * 0x8000 : sample * 0x7FFF,
      true
    )

  }

  return new Blob([view], { type: 'audio/wav' })

}

function escribirCabeceraWav(view, samples) {

  const sampleRate = 16000
  const channels = 1

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, samples * 2, true)

}

/* BOTÓN MIC */
function manejarClickPC() {

  if (!escuchando.value) {

    activarMicrofono()

  } else {

    if (recognition) {
      recognition.stop()
      recognition = null
    }

    detenerGrabacion()

  }

}

/* LIMPIAR HISTORIAL */
function limpiarHistorial() {

  historial.value = []
  localStorage.removeItem('historialComandos')

}
</script>

<style scoped>
/* =========================================================
   CONTENEDOR GENERAL
========================================================= */

.container {
  max-width: 600px;
  margin: auto;
  padding: 30px 20px;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

/* =========================================================
   TÍTULOS
========================================================= */

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 25px;
}

/* =========================================================
   INPUT + MIC + BOTÓN
========================================================= */

.manual-input-wrapper {
  width: 90vw;
  max-width: 1000px;
  margin-left: 50%;
  transform: translateX(-50%);
}

.manual-input {
  margin-top: 30px;

  display: flex;
  align-items: center;
  gap: 16px;

  background: #2a2a2a;
  border-radius: 14px;
  padding: 6px 10px;

  border: 2px solid #7edfd0;
}

.manual-input input {
  flex: 1;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 15px;
  padding: 10px;
  outline: none;
}

/* =========================================================
   BOTÓN MICRÓFONO
========================================================= */

.mic-inline {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
  border: none;

  background: #7edfd0;
  color: #000;

  cursor: pointer;
  transition: all 0.25s ease;
}

.mic-inline:hover {
  transform: scale(1.1);
}

.mic-inline.listening {
  background: #ff3b3b;
  color: white;
  box-shadow: 0 0 12px rgba(255, 0, 0, 0.6);
}

.mic-emoji {
  font-size: 18px;
  filter: grayscale(100%) brightness(0);
}

/* =========================================================
   ANIMACIÓN BARRAS SONIDO
========================================================= */

.sound-bars-inline {
  display: flex;
  gap: 3px;
  align-items: flex-end;
}

.sound-bars-inline span {
  width: 3px;
  height: 12px;
  background: white;
  animation: soundWaveInline 0.8s infinite ease-in-out;
}

.sound-bars-inline span:nth-child(2) {
  animation-delay: 0.2s;
}

.sound-bars-inline span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes soundWaveInline {
  0% {
    height: 6px;
  }

  50% {
    height: 16px;
  }

  100% {
    height: 6px;
  }
}

/* =========================================================
   BOTÓN ENVIAR
========================================================= */

.send-button {
  margin-left: 12px;
  padding: 12px 20px;

  border-radius: 12px;
  border: none;

  background: #7edfd0;
  color: #000;

  font-weight: 600;
  font-size: 15px;

  cursor: pointer;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.25s ease;
}

.send-button:hover {
  background: #5fd2c2;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

.send-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.send-button:disabled {
  background: #999;
  color: #444;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.send-button.disabled {
  background: #999;
}

/* =========================================================
   MENSAJE ERROR
========================================================= */

.error-box {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  background-color: #ffe5e5;
  color: #cc0000;
  font-weight: bold;
}

/* =========================================================
   HISTORIAL CHAT
========================================================= */

.history-container {
  margin-top: 30px;

  width: 90vw;
  max-width: 1000px;
  margin-left: 50%;
  transform: translateX(-50%);

  height: 50vh;
  overflow-y: auto;

  background: #2a2a2a;
  border: 2px solid #7edfd0;
  border-radius: 16px;

  padding: 0px 20px 20px 20px;

  display: flex;
  flex-direction: column;
  gap: 18px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.history-container::-webkit-scrollbar {
  width: 6px;
}

.history-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

/* =========================================================
   HEADER HISTORIAL
========================================================= */

.history-header {
  position: sticky;
  top: 0;
  z-index: 20;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  padding: 10px 20px;

  background: #2a2a2a;
}

/* =========================================================
   BOTÓN LIMPIAR HISTORIAL
========================================================= */

.clear-history-btn {
  background: rgba(126, 223, 208, 0.15);
  border: 1px solid #7edfd0;
  color: #7edfd0;

  padding: 6px 12px;
  border-radius: 8px;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
  transition: all 0.25s ease;
}

.clear-history-btn:hover {
  background: #7edfd0;
  color: #000;
}

.clear-history-btn:active {
  transform: scale(0.96);
}

/* =========================================================
   MENSAJES CHAT
========================================================= */

.history-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 20px;
  align-items: flex-start;
}

.history-label {
  font-size: 14px;
  color: #8fded4;
  text-align: left;
}

.history-bubble {
  background: rgba(126, 223, 208, 0.15);
  padding: 14px 18px;
  border-radius: 12px;
  color: #7edfd0;
  font-weight: 500;
  text-align: left;
  font-size: 16px;

  display: fit-content;
  max-width: 80%;
}

/* =========================================================
   RESPUESTA IA
========================================================= */

.history-label.ia {
  color: #66cbbd;
  align-self: flex-end;
  text-align: right;
}

.history-bubble.ia {
  background: rgba(40, 140, 130, 0.35);
  color: #bffaf2;
  text-align: left;
  align-self: flex-end;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 480px) {

  .title {
    font-size: 20px;
  }

}
</style>