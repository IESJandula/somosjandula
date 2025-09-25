<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ponte al día</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding content-center">
      <div class="carousel">
        <div class="carousel-content">
          <!-- Grid: imagen arriba, texto debajo -->
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
        <ion-button fill="clear" class="arrow left" @click="prevSlide">‹</ion-button>
        <ion-button fill="clear" class="arrow right" @click="nextSlide">›</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/vue';
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'GPonteAlDia',
  components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton },
  setup() {
    /** 📌 Carrusel principal */
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
      intervalId = setInterval(() => {
        nextSlide();
      }, 6000);
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
});
</script>

<style scoped>
.content-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

.carousel {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: auto;
  text-align: center;
}

.carousel-content {
  width: 100%;
  height: 50vh;
  background: #000;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Grid 1 columna, 2 filas */
.carousel-grid {
  display: grid;
  grid-template-rows: 1fr 60px; 
  width: 100%;
  height: 100%;
}

/* Imagen arriba */
.carousel-image {
  display: flex;
  justify-content: center;
  align-items: center;
}
.carousel-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

/* Texto debajo con espacio fijo */
.carousel-text {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #111;
  border-radius: 8px;
  margin-top: 5px;
}
.carousel-text p {
  margin: 0;
  font-size: 16px; 
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Botones flecha */
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32px;
  --color: white;
  z-index: 10;
}
.left {
  left: 10px;
}
.right {
  right: 10px;
}

/* Responsive */
@media (max-width: 600px) {
  .carousel-content {
    height: 40vh;
  }
  .carousel-text p {
    font-size: 12px;
  }
  .arrow {
    font-size: 24px;
  }
}
</style>
