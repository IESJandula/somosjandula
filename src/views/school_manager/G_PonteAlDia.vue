<template>
  <h1 class="titulo-pagina">Ponte al día</h1>
  <div class="page">
    <main class="content-center">
      <div class="carousel">
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

        <!-- Botones -->
        <button class="arrow left" @click="prevSlide">‹</button>
        <button class="arrow right" @click="nextSlide">›</button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'GPonteAlDia',
  setup() {
    const currentIndex = ref(0);
    const slides = ref([
      { image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFsKkRntJMedhnBBlpc33N7EjoLcibufJ6TA&s", text: "Únete a nuestra FP de DAM o DAW." },
      { image: "https://blogsaverroes.juntadeandalucia.es/iesjandula/files/2025/06/Formacion_Profesional.png", text: "Únete a nuestro Ciclo de Grado Medio de SMR." },
      { image: "https://www.juntadeandalucia.es/educacion/portals/delegate/thumbnail/abaco_album/61885cdd-cd30-47b5-a9e5-62c0e9f9cac4", text: "No te quedes sin plaza." }
    ]);

    let intervalId = null;

    const nextSlide = () => {
      currentIndex.value = (currentIndex.value + 1) % slides.value.length;
    };

    const prevSlide = () => {
      currentIndex.value = (currentIndex.value - 1 + slides.value.length) % slides.value.length;
    };

    onMounted(() => {
      intervalId = setInterval(nextSlide, 6000);
    });

    onBeforeUnmount(() => {
      clearInterval(intervalId);
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
  background: #000;
  color: white;
}

.header {
  background: #111;
  padding: 1rem;
  text-align: center;
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
  max-width: 1100px; /* ajusta si lo quieres más ancho */
  margin: auto;
  text-align: center;
}

.carousel-content {
  width: 100%;
  height: 50vh; /* altura fija para que ocupe el rectángulo que marcaste */
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Imagen centrada y completa */
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
  object-fit: contain; /* muestra la imagen entera sin deformar */
  border-radius: 12px;
}

/* Texto debajo del carrusel */
.carousel-text {
  margin-top: 10px;
  text-align: center;
}
.carousel-text p {
  margin: 0;
  font-size: 18px; 
  font-weight: 600;
  color: white;
}

/* Botones flecha */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32px;
  color: white;
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
    height: 35vh; /* más pequeño en móviles */
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


