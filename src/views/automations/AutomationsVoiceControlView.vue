<template>
  <div class="container">

    <!-- TÍTULO -->
    <h1 class="title" style="color: #7edfd0;">
      🎙️ Asistente Inteligente de Control por Voz
    </h1>

    <!-- SUBTÍTULO -->
    <p class="subtitle" style="color: #7edfd0;">
      Controla aulas, puertas y dispositivos mediante comandos de voz
    </p>

    <!-- HISTORIAL -->
    <div class="history-container" ref="historyContainer">

      <div class="history-header">
        <button class="clear-history-btn" @click="limpiarHistorial">
          🗑 Limpiar historial
        </button>
      </div>

      <div v-for="(comando, index) in historial" :key="index" class="history-item">
        <div class="history-label">
          Has dicho:
        </div>

        <div class="history-bubble">
          "{{ comando }}"
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

        <input v-model="textoManual" type="text" placeholder="Introduce un comando, por ejemplo: Enciende aula 2.13"
          @keyup.enter="enviarTextoManual" />

        <!-- MIC -->
        <button class="mic-inline" :class="{ listening: escuchando }" @click="manejarClickPC"
          @mousedown="iniciarGrabacionMovil" @mouseup="detenerGrabacionMovil" @mouseleave="detenerGrabacionMovil"
          @touchstart.prevent="iniciarGrabacionMovil" @touchend.prevent="detenerGrabacionMovil">
          <span v-if="!escuchando" class="mic-emoji">🎙️</span>

          <div v-else class="sound-bars-inline">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <!-- BOTÓN ENVIAR -->
        <button class="send-button" :disabled="!puedeEnviar" :class="{ disabled: !puedeEnviar }"
          @click="enviarTextoManual">
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
import { ref, watch, nextTick } from 'vue'
import { crearOrdenSimpleTexto, crearOrdenSimpleAudio } from '@/services/automations'

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

/* ACTIVAR MICRO */
async function activarMicrofono() {
  error.value = ''

  if ('webkitSpeechRecognition' in window) {
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

    // 🔥 Mostrar en tiempo real
    textoManual.value = (textoFinal + textoIntermedio).trim()
    puedeEnviar.value = textoManual.value !== ''

    // 🔥 Solo reiniciar temporizador cuando hay resultado FINAL
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

/* FALLBACK AUDIO */
async function grabarAudioFallback() {
  try {
    globalStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    audioContext = new AudioContext({ sampleRate: 16000 })
    input = audioContext.createMediaStreamSource(globalStream)
    processor = audioContext.createScriptProcessor(4096, 1, 1)

    processor.onaudioprocess = (e) => {
      const channelData = e.inputBuffer.getChannelData(0)
      audioData.push(new Float32Array(channelData))
    }

    input.connect(processor)
    processor.connect(audioContext.destination)

    escuchando.value = true
    setTimeout(detenerGrabacion, 4000)

  } catch {
    error.value = 'No se pudo acceder al micrófono'
  }
}

/* DETENER GRABACIÓN */
async function detenerGrabacion() {

  if (recognition) {
    recognition.stop()
    recognition = null
  }

  escuchando.value = false

  if (processor) processor.disconnect()
  if (input) input.disconnect()
  if (globalStream) globalStream.getTracks().forEach(track => track.stop())

  if (audioData.length === 0) return

  const wavBlob = crearWav(audioData)
  audioData = []

  try {
    const data = await crearOrdenSimpleAudio(
      toastMessage,
      toastColor,
      isToastOpen,
      wavBlob
    )

    texto.value = data.frase
    historial.value.push(data.frase)
    await nextTick()

    if (historyContainer.value) {
      historyContainer.value.scrollTop =
        historyContainer.value.scrollHeight
    }

  } catch {
    error.value = 'Error enviando audio al servidor'
  }
}

/* ENVIAR TEXTO */
async function enviarTextoManual() {
  error.value = ''

  if (!textoManual.value || textoManual.value.trim() === '') {
    error.value = 'Debes introducir un comando válido'
    return
  }

  if (!puedeEnviar.value) return

  try {
    texto.value = textoManual.value
    historial.value.push(textoManual.value)

    await nextTick()

    if (historyContainer.value) {
      historyContainer.value.scrollTop =
        historyContainer.value.scrollHeight
    }

    await crearOrdenSimpleTexto(
      toastMessage,
      toastColor,
      isToastOpen,
      textoManual.value
    )

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

    textoManual.value = ''

  } catch {
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

/* DETECTAR DISPOSITIVO */
function esMovil() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/* PC → modo toggle */
function manejarClickPC() {

  if (esMovil()) return

  if (!escuchando.value) {
    usarReconocimientoNavegador()
  } else {
    if (recognition) {
      recognition.stop()
      recognition = null
    }
    escuchando.value = false
  }
}

/* MÓVIL → mantener pulsado */
function iniciarGrabacionMovil() {
  if (!esMovil()) return
  if (!escuchando.value) activarMicrofono()
}

function detenerGrabacionMovil() {
  if (!esMovil()) return
  if (escuchando.value) detenerGrabacion()
}

function limpiarHistorial() {
  historial.value = []
  localStorage.removeItem('historialComandos')
}
</script>

<style scoped>
/* =========================================================
   🔥 NUEVO BLOQUE → INPUT CON MICRO DENTRO
   (NO modifica nada anterior)
========================================================= */

.manual-input-wrapper {
  width: 90vw;
  max-width: 1000px;
  margin-left: 50%;
  transform: translateX(-50%);
}

.manual-input {
  display: flex;
  align-items: center;
  gap: 10px;

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

/* 🎤 Micro */
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

/* 🚀 Botón enviar dentro */
.send-inline {
  padding: 8px 14px;

  border-radius: 10px;
  border: none;

  background: #7edfd0;
  color: #000;

  font-weight: 600;
  font-size: 14px;

  cursor: pointer;
  transition: all 0.25s ease;
}

.send-inline:hover {
  background: #5fd2c2;
  transform: translateY(-1px);
}

/* 🎵 Animación barras */
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

/* =========================================
   CONTENEDOR GENERAL
========================================= */

.container {
  max-width: 600px;
  margin: auto;
  padding: 30px 20px;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

/* =========================================
   TÍTULOS
========================================= */

.title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 25px;
}

/* =========================================
   CONTENEDOR BOTÓN MICRÓFONO (CENTRADO)
========================================= */

.mic-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

/* =========================================
   BOTÓN MICRÓFONO NORMAL
========================================= */

.mic-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;

  border: none;
  background: #7edfd0;
  /* verde agua */

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: all 0.25s ease;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.mic-button:hover {
  transform: scale(1.08);
}

.mic-button:active {
  transform: scale(0.95);
}

/* =========================================
   ESTADO ESCUCHANDO (ROJO)
========================================= */

.mic-button.listening {
  background: #ff3b3b;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

/* =========================================
   ICONO MICRÓFONO
========================================= */

.mic-icon {
  font-size: 24px;
  color: #000;
}

/* =========================================
   ANIMACIÓN BARRAS SONIDO
========================================= */

.sound-bars {
  display: flex;
  gap: 4px;
  align-items: center;
}

.sound-bars span {
  width: 4px;
  height: 12px;
  background: white;
  animation: sound 0.8s infinite ease-in-out;
}

.sound-bars span:nth-child(2) {
  animation-delay: 0.1s;
}

.sound-bars span:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes sound {
  0% {
    height: 8px;
  }

  50% {
    height: 18px;
  }

  100% {
    height: 8px;
  }
}

/* =========================================
   TARJETA DE RESULTADO
========================================= */

.result-card {
  margin-top: 25px;
  padding: 20px;
  border-radius: 12px;

  /* ✅ Verde agua más intenso pero elegante */
  background: #7edfd0;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.recognized-text {
  font-size: 18px;
  font-weight: 500;
  color: #000;
}

/* =========================================
   MENSAJE DE ERROR
========================================= */

.error-box {
  margin-top: 20px;
  padding: 12px;
  border-radius: 8px;
  background-color: #ffe5e5;
  color: #cc0000;
  font-weight: bold;
}

/* =========================================
   INPUT MANUAL
========================================= */

.manual-input {
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 16px;
  /* 🔥 separación real entre input y botón */
}

.manual-input input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
}

/* =========================================
   RESPONSIVE MÓVIL
========================================= */

@media (max-width: 480px) {

  .title {
    font-size: 20px;
  }

  .mic-button {
    font-size: 16px;
  }

  .recognized-text {
    font-size: 16px;
  }

}

.send-button {
  margin-left: 12px;
  padding: 12px 20px;

  border-radius: 12px;
  border: none;

  background: #7edfd0;
  /* MISMO VERDE QUE LAS CAJAS */
  color: #000;

  font-weight: 600;
  font-size: 15px;

  cursor: pointer;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.25s ease;
}

/* Hover elegante */
.send-button:hover {
  background: #5fd2c2;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

/* Click */
.send-button:active {
  transform: translateY(0);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

/* =========================================
   ESTADO DESHABILITADO BOTÓN ENVIAR
========================================= */

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

/* =========================================
   HISTORIAL GRANDE TIPO CHAT
========================================= */

/* Contenedor principal */
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

/* Cada bloque */
.history-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 20px;
}

/* Texto superior */
.history-label {
  font-size: 14px;
  color: #8fded4;
  /* diferente tono */
  text-align: left;
}

/* Burbuja del comando */
.history-bubble {
  background: rgba(126, 223, 208, 0.15);
  padding: 14px 18px;
  border-radius: 12px;
  color: #7edfd0;
  font-weight: 500;
  text-align: left;
  font-size: 16px;
}
.history-header {
  padding: 15px 20px;
}

/* Scroll bonito */
.history-container::-webkit-scrollbar {
  width: 6px;
}

.history-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

/* =========================================
   BOTÓN LIMPIAR HISTORIAL
========================================= */

/* Header fijo dentro del historial */
.history-header {
  position: sticky;
  top: 0;
  z-index: 20;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  padding: 10px 20px; /* 👈 solo ajustamos padding lateral */

  background: #2a2a2a;
}

/* Botón elegante integrado */
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
</style>