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
import { obtenerNotificacionesHoy } from '@/services/firebaseService.js';

export default {
  name: 'GPonteAlDia',
  setup() {
    const currentIndex = ref(0);
    const slides = ref([]);

    let carouselInterval = null;
    let fetchInterval = null;

    // Función para obtener las notificaciones del servidor
    const fetchNotificaciones = async () => {
      try {
        const notis = await obtenerNotificacionesHoy(
          ref(''), 
          ref(''), 
          ref(false),
          'GLOBAL'
        );

        // Vaciar la lista actual y actualizar con las nuevas notificaciones
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

.content-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel {
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: auto;
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

.carousel-text {
  margin-top: 10px;
  text-align: center;
}
.carousel-text p {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: black;
}

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
}
.left {
  left: 10px;
}
.right {
  right: 10px;
}

.titulo-pagina {
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 30px;
}

/* Responsive */
@media (max-width: 600px) {
  .carousel-content {
    height: 35vh;
  }
  .carousel-text p {
    font-size: 14px;
  }
  .arrow {
    font-size: 24px;
  }
  .titulo-pagina {
    margin-bottom: 20px;
  }
}
</style>
