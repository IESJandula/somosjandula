<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ponte al día</ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- ion-content centrado -->
    <ion-content class="ion-padding content-center">

      <div class="carousel">
        <div class="carousel-content">
          <img :src="slides[currentIndex].image" alt="slide" />
          <p>{{ slides[currentIndex].text }}</p>
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
      }, 6000); // cada 6s pasa de slide
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
/* Centrado del contenido dentro de ion-content */
.content-center {
  display: flex;
  justify-content: center;  /* centro horizontal */
  align-items: center;      /* centro vertical */
  min-height: 100%;
}

.carousel {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: auto;
  text-align: center;
}

.carousel-content {
  width: 100%;
  height: 400px; /* altura fija */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #000; /* fondo para las franjas */
  border-radius: 10px;
}

.carousel-content img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* encuadra la imagen completa */
  border-radius: 10px;
}

.carousel-content p {
  margin-top: 12px;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.arrow {
  position: absolute;
  top: 45%;
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
</style>
