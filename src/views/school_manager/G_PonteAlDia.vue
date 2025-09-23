<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ponte al día</ion-title>
      </ion-toolbar>

      <!-- Carrusel secundario de mensajes -->
      <ion-toolbar class="secondary-toolbar">
        <div class="secondary-carousel">
          <transition-group name="fade" tag="div" class="messages">
            <p :key="secondaryIndex">{{ secondaryMessages[secondaryIndex] }}</p>
          </transition-group>
        </div>
      </ion-toolbar>
    </ion-header>

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

    /** 📌 Carrusel de mensajes secundarios */
    const secondaryIndex = ref(0);
    const secondaryMessages = ref([
      "⚡ Nueva convocatoria de becas disponible.",
      "📢 Jornada de puertas abiertas el próximo lunes.",
      "✅ Consulta los horarios de tutoría actualizados.",
      "🎉 ¡Bienvenidos al nuevo curso académico!"
    ]);
    let secondaryInterval = null;

    const nextSecondary = () => {
      secondaryIndex.value = (secondaryIndex.value + 1) % secondaryMessages.value.length;
    };

    onMounted(() => {
      secondaryInterval = setInterval(() => {
        nextSecondary();
      }, 4000); // cada 4 segundos cambia
    });

    onBeforeUnmount(() => {
      clearInterval(secondaryInterval);
    });

    return {
      currentIndex,
      slides,
      nextSlide,
      prevSlide,
      secondaryIndex,
      secondaryMessages
    };
  }
});
</script>

<style scoped>
/* Centrado dentro de ion-content */
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #000;
  border-radius: 12px;
  padding: 10px;
}

.carousel-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.carousel-content p {
  margin-top: 12px;
  font-size: 2.5vw;
  font-weight: bold;
  color: white;
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

/* 🎯 Carrusel secundario */
.secondary-toolbar {
  --background: #222;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.secondary-carousel {
  overflow: hidden;
  text-align: center;
  flex: 1;
}
.secondary-carousel p {
  margin: 0;
  color: #fff;
  font-size: 14px;
  white-space: nowrap;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 📱 Responsive */
@media (max-width: 600px) {
  .carousel-content {
    height: 40vh;
  }
  .carousel-content p {
    font-size: 14px;
    padding: 0 8px;
  }
  .arrow {
    font-size: 24px;
  }
  .secondary-carousel p {
    font-size: 12px;
  }
}
</style>
