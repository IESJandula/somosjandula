<template>
  <div class="cnt__login">
    <div class="login__content">

      <div>
        <h1 class="login__title">
          <div class="">Somos</div>
          <div class="">Jándula</div>
        </h1>
      </div>

      <div class="login__extra-info">
        <transition name="fade">
          <span v-if="fade" :key="dynamicInfo">{{ dynamicInfo }}</span>
        </transition>
      </div>

      <div class="login__action">
        <button class="login__button login__button--default" @click="loginWithGoogle">
          Conecta con Google
        </button>

        <button class="login__button login__button--lince" @click="verCocheLince">
          ¡Descubre nuestro Eco-Jándula!
        </button>
      </div>

    </div>

    <div class="login__photo">
      <img src="../assets/img/login/login.jpg" alt="login image">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithPopup, getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from '@/environment/firebaseConfig';
import { obtenerRolesUsuario } from '@/services/firebaseService.js';
import { crearToast } from '@/utils/toast.js';
import { setLoggingInStatus } from '@/main';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const router = useRouter();

const mensajes = [
  "Impresión remota",
  "Reserva de recursos",
  "Matriculaciones y agrupamientos",
  "Gestión de alumnado y profesorado",
  "Asignación de materias y reducciones",
  "Próximamente... uso de proyectos"
];

const dynamicInfo = ref(mensajes[0]);
const currentIndex = ref(0);
const fade = ref(true);

onMounted(() => {
  setInterval(() => {
    fade.value = false;
    setTimeout(() => {
      currentIndex.value = (currentIndex.value + 1) % mensajes.length;
      dynamicInfo.value = mensajes[currentIndex.value];
      fade.value = true;
    }, 300);
  }, 3000);
});

const loginWithGoogle = async () => {
  try {
    setLoggingInStatus(true);
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRoles = await obtenerRolesUsuario();
    const redirectPath = router.currentRoute.value.query.redirect || '/printers/print';
    router.push({ path: redirectPath });
  } catch (error) {
    crearToast("Error", "danger", true, error.message);
  } finally {
    setLoggingInStatus(false);
  }
};

const verCocheLince = () => {
  window.open('https://telemetrialince.iesjandula.es/', '_blank');
};
</script>

<style scoped>
body * {
  box-sizing: border-box;
}

body {
  height: 100dvh;
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
  overflow: hidden;
}

ul, ol {
  list-style: none;
  padding: 0;
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cnt__login {
  display: flex;
  color: white;
  background-color: #0B2E47;
  min-height: 100dvh;
}

.login__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
}

.login__content > * {
  width: 100%;
  margin-bottom: 70px;
  padding: 0 76px 0;
}

.login__content > :last-child {
  margin-bottom: 0;
}

.login__title {
  display: flex;
  font-size: 54px;
}

.login__title--w2 {
  text-transform: uppercase;
}

h1 {
  margin: 0;
}

.login__extra-info {
  font-size: 22px;
  min-height: 30px;
}

.login__action {
  display: flex;
  gap: 25px;
}

.login__button {
  padding: 15px 30px;
  border-radius: 12px;
  border: solid 1px black;
  color: white;
  font-size: 22px;
}

.login__button:hover {
  cursor: pointer;
  transition: 0.4s;
}

.login__button--default {
  background-color: #269AED;
}

.login__button--default:hover {
  background-color: #1a4769;
  border: solid 1px rgba(255, 255, 255, 0.21);
}

.login__button--lince {
  background-color: transparent;
  border: solid 1px rgba(255, 255, 255, 0.21);
}

.login__button--lince:hover {
  background-color: #67aee5;
}

.login__photo {
  width: 50%;
}

/* Animación de fade */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsivo */
@media (max-width: 1200px) {
  .login__title {
    font-size: 38px;
  }

  .login__extra-info {
    font-size: 18px;
  }

  .login__button {
    font-size: 18px;
  }
}

@media (max-width: 1024px) {
  .login__title {
    font-size: 34px;
  }

  .login__extra-info {
    font-size: 16px;
  }

  .login__button {
    padding: 10px 25px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .cnt__login {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .login__content {
    width: 100%;
    margin: 40px 0;
  }

  .login__photo {
    width: 100%;
  }

  .login__title {
    font-size: 34px;
  }

  .login__extra-info {
    font-size: 16px;
  }

  .login__button {
    font-size: 16px;
  }
}

@media (max-width: 452px) {
  .login__content {
    margin: 80px 0;
  }

  .login__title {
    font-size: 28px;
  }

  .login__extra-info {
    font-size: 12px;
  }

  .login__button {
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .login__title {
    font-size: 22px;
  }

  .login__extra-info {
    font-size: 10px;
  }

  .login__button {
    padding: 8px 15px;
    font-size: 10px;
  }
}
</style>
