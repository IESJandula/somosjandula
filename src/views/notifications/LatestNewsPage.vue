<template>
  <h1 class="titulo-pagina">Ponte al día</h1>
  <div class="page">
    <main class="content-center">
      <div class="carousel" v-if="slides.length > 0">
        <div class="carousel-content">
          <div class="carousel-grid">
            <div class="carousel-image">
              <img :src="slides[currentIndex].image" alt="slide" />
            </div>
            <div class="carousel-text">
              <p>{{ slides[currentIndex].text }}</p>
            </div>
          </div>
        </div>

        <!-- Botones de navegación -->
        <button class="arrow left" @click="prevSlide">‹</button>
        <button class="arrow right" @click="nextSlide">›</button>
      </div>
      <p v-else>No hay notificaciones activas</p>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { obtenerNotificacionesVigentesPorTipo } from '@/services/notifications.js';

export default {
  name: 'LatestNewsPage',
  setup() {
    const currentIndex = ref(0);
    const slides = ref([]);

    let carouselInterval = null;
    let fetchInterval = null;

    // Variables para el toast
    const isToastOpen = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('success');

    // Función para obtener las notificaciones del servidor
    // GPonteAlDia.vue - setup
    const fetchNotificaciones = async () => {
      try {
        const notis = await obtenerNotificacionesVigentesPorTipo(toastMessage, toastColor, isToastOpen, 'Texto e imagen');

        slides.value = notis.map(n => ({
          text: n.texto,
          image: n.imagen || 'https://via.placeholder.com/800x400?text=Imagen+Dummy'
        }));

        currentIndex.value = 0;
      } catch (err) {
        console.error('Error obteniendo notificaciones:', err);
      }
    };


    // Funciones de navegación del carrusel
    const nextSlide = () => {
      if (slides.value.length > 0) {
        currentIndex.value = (currentIndex.value + 1) % slides.value.length;
      }
    };

    const prevSlide = () => {
      if (slides.value.length > 0) {
        currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
      }
    };

    onMounted(() => {
      fetchNotificaciones();

      fetchInterval = setInterval(fetchNotificaciones, 60000);

      carouselInterval = setInterval(nextSlide, 6000);
    });

    onBeforeUnmount(() => {
      clearInterval(carouselInterval);
      clearInterval(fetchInterval);
    });

    return {
      currentIndex,
      slides,
      nextSlide,
      prevSlide
    };
  }
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  color: black;
}

/* 🔹 Centrado del contenido principal */
.content-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* antes estaba 'center', bajaba el carrusel */
  align-items: center;
  padding-top: 10px; /* 🔹 pequeño margen superior */
}

/* 🔹 Título principal */
.titulo-pagina {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px; /* 🔹 antes 30px, reducido para subir la imagen */
}

/* 🔹 Carrusel */
.carousel {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.carousel-content {
  width: 100%;
  height: 50vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 🔹 Imagen */
.carousel-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

/* 🔹 Texto del carrusel */
.carousel-text {
  margin-top: 8px;
  text-align: center;
}

.carousel-text p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: black;
}

/* 🔹 Flechas de navegación */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32px;
  color: black;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s ease;
}

.arrow:hover {
  color: #007bff;
}

.left {
  left: 10px;
}

.right {
  right: 10px;
}

/* 🔹 Responsive */
@media (max-width: 768px) {
  .carousel-content {
    height: 40vh;
  }

  .carousel-text p {
    font-size: 15px;
  }

  .arrow {
    font-size: 26px;
  }

  .titulo-pagina {
    font-size: 24px;
    margin-top: 16px;
    margin-bottom: 6px; /* 🔹 aún más compacto en móvil */
  }
}

@media (max-width: 480px) {
  .carousel-content {
    height: 35vh;
  }

  .carousel-text p {
    font-size: 14px;
  }

  .arrow {
    font-size: 22px;
  }

  .titulo-pagina {
    font-size: 22px;
    margin-bottom: 4px;
  }
}
</style>

