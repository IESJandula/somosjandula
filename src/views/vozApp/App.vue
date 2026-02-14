<template>
  <div class="container">

    <!-- =========================================
         TÍTULO PRINCIPAL DEL SISTEMA
    ========================================== -->
    <h1 class="title" style="color: #7edfd0;">
      🎙️ Asistente Inteligente de Control por Voz
    </h1>

    <!-- =========================================
         SUBTÍTULO DESCRIPTIVO
    ========================================== -->
    <p class="subtitle" style="color: #7edfd0;">
      Controla aulas, puertas y dispositivos mediante comandos de voz
    </p>

    <!-- =========================================
         BOTÓN PRINCIPAL DE ACTIVACIÓN
         (visual dinámico según estado)
    ========================================== -->
    <button class="mic-button" :class="{ listening: escuchando }" @click="manejarClickPC"
      @mousedown="iniciarGrabacionMovil" @mouseup="detenerGrabacionMovil" @mouseleave="detenerGrabacionMovil"
      @touchstart.prevent="iniciarGrabacionMovil" @touchend.prevent="detenerGrabacionMovil">
      <span v-if="!escuchando" style="color: black;">🎤 Mantener para hablar</span>
      <span v-else style="color: black;">🔴 Escuchando...</span>
    </button>

    <!-- =========================================
         FRASE RECONOCIDA (ESTILO TARJETA)
    ========================================== -->
    <div v-if="texto" class="result-card">
      <h3 style="color: black;">Comando detectado:</h3>
      <p class="recognized-text">“{{ texto }}”</p>
    </div>

    <!-- =========================================
         MENSAJE DE ERROR VISUAL
    ========================================== -->
    <div v-if="error" class="error-box">
      ⚠ {{ error }}
    </div>

    <!-- =========================================
         INPUT MANUAL DE TEXTO
         (por si el usuario quiere escribir)
    ========================================== -->
    <div class="manual-input">
      <input v-model="textoManual" type="text" placeholder="Introduce el comando que deseas ejecutar..."
        @keyup.enter="enviarTextoManual" />

      <button class="send-button" @click="enviarTextoManual">
        Enviar
      </button>
    </div>

    <!-- =========================================
         CAJA DE EJEMPLOS DE COMANDOS
    ========================================== -->
    <div class="examples" style="text-align: left;">
      <h4>Ejemplos de comandos:</h4>
      <ul>
        <li>Enciende el aula 2.13</li>
        <li>Abre la puerta del aula 2.13</li>
        <li>Enciende el proyector de la biblioteca</li>
        <li>Apaga las luces del laboratorio</li>
      </ul>
    </div>

  </div>
</template>

<script setup>

/* =========================================================
   IMPORTACIONES
========================================================= */

import { ref } from 'vue'
import { crearOrdenSimpleTexto, crearOrdenSimpleAudio } from '@/services/automations'

/* =========================================================
   VARIABLES REACTIVAS
========================================================= */

// Texto reconocido que mostramos en pantalla
const texto = ref('')

// Controla si estamos escuchando o no
const escuchando = ref(false)

// Mensaje de error visual
const error = ref('')

// Variables necesarias para el sistema de toasts
// (ya que automations.js necesita estos refs)
const toastMessage = ref('')
const toastColor = ref('')
const isToastOpen = ref(false)

const textoManual = ref('')

/* =========================================================
   VARIABLES DE AUDIO (NO REACTIVAS)
========================================================= */

let audioContext
let processor
let input
let globalStream
let audioData = []

/* =========================================================
   1️⃣ ACTIVAR MICRÓFONO
   Decide si usamos reconocimiento del navegador
   o fallback a grabación manual
========================================================= */

async function activarMicrofono() {

  // Limpiamos mensajes anteriores
  error.value = ''
  texto.value = ''

  // Si el navegador soporta reconocimiento nativo
  if ('webkitSpeechRecognition' in window) {

    usarReconocimientoNavegador()

  } else {

    // Si no lo soporta → usamos fallback
    grabarAudioFallback()
  }
}

/* =========================================================
   2️⃣ RECONOCIMIENTO NATIVO DEL NAVEGADOR
   (Más rápido y ligero si funciona)
========================================================= */

function usarReconocimientoNavegador() {

  const recognition = new webkitSpeechRecognition()

  recognition.lang = 'es-ES'
  recognition.interimResults = false

  escuchando.value = true

  // Cuando el navegador devuelve texto
  recognition.onresult = async (event) => {

    const fraseReconocida = event.results[0][0].transcript

    // Mostramos la frase bonita en pantalla
    texto.value = fraseReconocida

    try {

      // 🔥 Enviamos texto al backend usando automations.js
      await crearOrdenSimpleTexto(
        toastMessage,
        toastColor,
        isToastOpen,
        fraseReconocida
      )

    } catch (e) {

      console.error(e)

      // Si falla el texto → fallback a audio
      error.value = 'Error enviando texto, usando audio...'
      grabarAudioFallback()
    }

    escuchando.value = false
  }

  // Si el reconocimiento falla directamente
  recognition.onerror = () => {

    escuchando.value = false
    grabarAudioFallback()
  }

  recognition.start()
}

/* =========================================================
   3️⃣ FALLBACK → GRABAMOS AUDIO WAV 16kHz
   Compatible con Vosk
========================================================= */

async function grabarAudioFallback() {

  try {

    // Pedimos permiso al micrófono
    globalStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Forzamos 16kHz (requisito de Vosk)
    audioContext = new AudioContext({ sampleRate: 16000 })

    input = audioContext.createMediaStreamSource(globalStream)

    processor = audioContext.createScriptProcessor(4096, 1, 1)

    // Capturamos datos PCM crudos
    processor.onaudioprocess = (e) => {

      const channelData = e.inputBuffer.getChannelData(0)

      audioData.push(new Float32Array(channelData))
    }

    input.connect(processor)
    processor.connect(audioContext.destination)

    escuchando.value = true

    // Grabamos durante 4 segundos
    setTimeout(detenerGrabacion, 4000)

  } catch (err) {

    error.value = 'No se pudo acceder al micrófono'
  }
}

/* =========================================================
   4️⃣ DETENER GRABACIÓN Y ENVIAR AUDIO
========================================================= */

async function detenerGrabacion() {

  escuchando.value = false

  // Cerramos conexiones
  processor.disconnect()
  input.disconnect()
  globalStream.getTracks().forEach(track => track.stop())

  // Convertimos buffers a WAV válido
  const wavBlob = crearWav(audioData)

  audioData = []

  try {

    // 🔥 Enviamos audio usando automations.js
    const data = await crearOrdenSimpleAudio(
      toastMessage,
      toastColor,
      isToastOpen,
      wavBlob
    )

    // Mostramos frase reconocida por Vosk
    texto.value = data.frase

  } catch (err) {

    console.error(err)
    error.value = 'Error enviando audio al servidor'
  }
}

/* =========================================================
   5️⃣ CONVERTIR PCM FLOAT → WAV 16kHz 16bit
========================================================= */

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

/* =========================================================
   6️⃣ ESCRIBIR CABECERA WAV
========================================================= */

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
async function enviarTextoManual() {

  error.value = ''

  if (!textoManual.value || textoManual.value.trim() === '') {
    error.value = 'Debes introducir un comando válido'
    return
  }

  try {

    // Mostramos el texto en la tarjeta
    texto.value = textoManual.value

    // Llamamos a tu endpoint actual
    await crearOrdenSimpleTexto(
      toastMessage,
      toastColor,
      isToastOpen,
      textoManual.value
    )

    // Limpiamos el input
    textoManual.value = ''

  } catch (err) {
    console.error(err)
    error.value = 'Error enviando el comando escrito'
  }
}

function esMovil() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/* ===========================
   PC → modo toggle
=========================== */
function manejarClickPC() {

  if (esMovil()) return  // en móvil no usamos click

  if (!escuchando.value) {
    activarMicrofono()
  } else {
    detenerGrabacion()
  }
}

/* ===========================
   MÓVIL → mantener pulsado
=========================== */
function iniciarGrabacionMovil() {

  if (!esMovil()) return

  if (!escuchando.value) {
    activarMicrofono()
  }
}

function detenerGrabacionMovil() {

  if (!esMovil()) return

  if (escuchando.value) {
    detenerGrabacion()
  }
}

</script>

<style scoped>
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
   BOTÓN DE MICRÓFONO
========================================= */

.mic-button {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  border-radius: 12px;
  border: none;

  /* 🔥 MISMO VERDE QUE LAS CAJAS */
  background: #7edfd0;

  color: #000;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Estado cuando está escuchando */
.mic-button.listening {
  background: linear-gradient(135deg, #ff4d4d, #ff0000);
  animation: pulse 1s infinite;
}

/* Animación de pulso */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }

  100% {
    transform: scale(1);
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
   CAJA DE EJEMPLOS
========================================= */

.examples {
  margin-top: 30px;
  padding: 20px;
  border-radius: 12px;

  /* 🔥 MISMO VERDE QUE result-card */
  background: #7edfd0;

  color: #000;
  color-scheme: light;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* Forzamos texto negro */
.examples h4,
.examples li {
  color: #000;
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
</style>