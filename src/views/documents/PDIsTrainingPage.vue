<template>
  <div class="carousel-container" @keydown.left.prevent="prev" @keydown.right.prevent="next" tabindex="0" role="region" aria-label="Carrusel de YouTube">
    <!-- Botón izquierdo -->
    <button 
      class="nav-button nav-left" 
      @click="prev" 
      :disabled="!hasPrev && !loop" 
      aria-label="Vídeo anterior"
    >
      ◀
    </button>

    <!-- Contenedor del vídeo -->
    <div class="video-container">
      <div class="player-aspect">
        <iframe
          v-if="currentUrl"
          class="youtube-iframe"
          :src="currentUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      <div class="video-info">
        <h2 class="title">{{ titles[currentIndex] || `Vídeo ${currentIndex + 1}` }}</h2>
        <span class="position" aria-live="polite">{{ currentIndex + 1 }} / {{ urls.length }}</span>
      </div>
    </div>

    <!-- Botón derecho -->
    <button 
      class="nav-button nav-right" 
      @click="next" 
      :disabled="!hasNext && !loop" 
      aria-label="Vídeo siguiente"
    >
      ▶
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// ✅ PON A FUEGO TUS URLS AQUÍ (pueden ser watch, youtu.be o embed). Mantén el formato array.
const urls = ref([
  // Ejemplos (cámbialos por los tuyos):
  'https://www.youtube.com/watch?v=yutK7KB5U-8',
  'https://www.youtube.com/watch?v=yu7ocJRsEk0',
  'https://www.youtube.com/watch?v=jdcqeBAgmEI',
  'https://www.youtube.com/watch?v=dNTZ9qfvpE8',
  'https://www.youtube.com/watch?v=2nrj6GW-CCQ',
  'https://www.youtube.com/watch?v=dBlIJ94AabA',
  'https://www.youtube.com/watch?v=gn8Ea8IXdhk',
  'https://www.youtube.com/watch?v=Wmuuz1tnx-A',
  'https://www.youtube.com/watch?v=WjmMe8keYQM',
  'https://www.youtube.com/watch?v=UlXTc9QkzwQ',
  'https://www.youtube.com/watch?v=qpNPIVsMLEQ',
  'https://www.youtube.com/watch?v=VO-XyTXxs5g',
  'https://www.youtube.com/watch?v=WUVzuGGnrkM',
  'https://www.youtube.com/watch?v=ktNN2PmLaWY',
  'https://www.youtube.com/watch?v=VFSl-_xlEyc',
  'https://www.youtube.com/watch?v=vazS2-xTJn4',
  'https://www.youtube.com/watch?v=FdNtOp5cW74',
  'https://www.youtube.com/watch?v=T_SOQSXRN9o',
  'https://www.youtube.com/watch?v=Gl2q4O9Q19M',
])

// (Opcional) Títulos para cada vídeo (mismo orden). Déjalo vacío si no quieres títulos manuales.
const titles = ref([
  'Introducción',
  'Selección del sistema operativo',
  'Características principales',
  'Encendido y apagado',
  'Características',
  'Ajustes del sistema',
  'Inicio de sesión en el panel interactivo',
  'Personalizando nuestro entorno personal',
  'Pizarra blanca: escribir, mover y borrar',
  'Pizarra blanca: añadir páginas y otras herramientas',
  'Pizarra blanca: añadir imágenes y vídeos',
  'Pizarra blanca: herramientas matemáticas',
  'Compartiendo la pantalla con nuestro alumnado (parte 1)',
  'Compartiendo la pantalla con nuestro alumnado (parte 2)',
  'Trabajando con archivos en el panel interactivo',
  'Compartiendo pantalla Smart Mirror',
  'Smart Ink: instalación tinta digital',
  'Smart Ink: Aspectos principales de la tinta digital',
  'Smart Ink: grabadora',
])

// Configuración
const loop = ref(true)
const autoplayMs = ref(0) // 0 = sin autoavance

const currentIndex = ref(0)
const autoplayTimer = ref(null)

const currentUrl = computed(() => normalizeEmbedUrl(urls.value[currentIndex.value]))
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < urls.value.length - 1)

function prev () {
  if (hasPrev.value) currentIndex.value -= 1
  else if (loop.value) currentIndex.value = urls.value.length - 1
}
function next () {
  if (hasNext.value) currentIndex.value += 1
  else if (loop.value) currentIndex.value = 0
}
function restartAutoplay () {
  clearInterval(autoplayTimer.value)
  if (autoplayMs.value > 0 && urls.value.length > 1) {
    autoplayTimer.value = setInterval(next, autoplayMs.value)
  }
}

// 🔎 Utilidades
function extractVideoId (url) {
  if (!url) return null
  try {
    // Acepta formatos: watch?v=, youtu.be/, embed/, shorts/
    const u = new URL(url, window.location.origin)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.split('/').filter(Boolean)[0] || null
    }
    if (u.searchParams.get('v')) return u.searchParams.get('v')
    const parts = u.pathname.split('/')
    const idx = parts.findIndex(p => ['embed', 'v', 'shorts'].includes(p))
    if (idx >= 0 && parts[idx+1]) return parts[idx+1]
  } catch (e) {
    // Si llega un id crudo o una URL sin protocolo
    if (/^[A-Za-z0-9_-]{10,}$/.test(url)) return url
  }
  return null
}
function normalizeEmbedUrl (url) {
  // Devuelve un src listo para <iframe>. Si ya es embed, respeta query; si es watch/shorts/youtu.be, lo convierte a embed con modestbranding & rel=0.
  try {
    const id = extractVideoId(url)
    if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1`
    // Si no es un vídeo (p.ej. playlist /videoseries), dejar tal cual
    return url
  } catch (_) {
    return url
  }
}

watch(autoplayMs, restartAutoplay, { immediate: true })

onMounted(() => {
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  })
  restartAutoplay()
})

onBeforeUnmount(() => {
  clearInterval(autoplayTimer.value)
})
</script>

<style scoped>
.carousel-container {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--form-bg-light);
  overflow: hidden;
  gap: 2rem;
  padding: 2rem;
}

.nav-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  background: #fff;
  color: #3b82f6;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-button:hover:not(:disabled) {
  background: #3b82f6;
  color: #fff;
  transform: scale(1.1);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.video-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 800px;
  width: 100%;
}

.player-aspect {
  position: relative;
  width: 100%;
  max-width: 600px;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.youtube-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.title {
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0;
  color: var(--text-color);
}

.position {
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  opacity: 0.8;
}

@media (prefers-color-scheme: dark) {
  .carousel-container {
    background-color: var(--form-bg-dark);
  }
  
  .nav-button {
    background: var(--form-bg-dark);
    border-color: #60a5fa;
    color: #60a5fa;
  }
  
  .nav-button:hover:not(:disabled) {
    background: #60a5fa;
    color: var(--form-bg-dark);
  }
}

@media (max-width: 768px) {
  .carousel-container {
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-button {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .video-container {
    max-width: 100%;
  }
  
  .title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .carousel-container {
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .nav-button {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }
}
</style>