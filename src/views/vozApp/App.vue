<template>
  <div class="container">
    <h1>Asistente de Voz en PC 🎤</h1>

    <button @click="iniciarReconocimiento" :disabled="escuchando">
      {{ escuchando ? "Escuchando..." : "Hablar" }}
    </button>

    <p v-if="texto">
      <strong>Has dicho:</strong> {{ texto }}
    </p>

    <p v-if="error" class="error">
      ⚠️ {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const texto = ref('')
const escuchando = ref(false)
const error = ref('')

let recognition = null

function iniciarReconocimiento() {
  error.value = ''
  texto.value = ''

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    error.value = "Tu navegador no soporta reconocimiento de voz"
    return
  }

  recognition = new SpeechRecognition()
  recognition.lang = 'es-ES'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  escuchando.value = true
  recognition.start()

  recognition.onresult = (event) => {
    texto.value = event.results[0][0].transcript
  }

  recognition.onerror = (event) => {
    console.error("Error de reconocimiento:", event.error)

    if (event.error === "not-allowed") {
      error.value = "Permiso del micrófono denegado"
    } else if (event.error === "no-speech") {
      error.value = "No se detectó ninguna voz"
    } else if (event.error === "audio-capture") {
      error.value = "No se encontró micrófono"
    } else {
      error.value = "Error: " + event.error
    }

    escuchando.value = false
  }

  recognition.onend = () => {
    escuchando.value = false
  }
}
</script>

<style>
.container {
  text-align: center;
  margin-top: 60px;
  font-family: Arial, sans-serif;
}

button {
  padding: 12px 24px;
  font-size: 18px;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 20px;
  font-weight: bold;
}
</style>