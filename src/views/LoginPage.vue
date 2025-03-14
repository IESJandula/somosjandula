<template>
  <ion-page>
    <ion-content class="ion-padding" fullscreen>
      <div class="form-container">
        <!-- Añadimos el texto "SOMOS" con la clase animada por encima del título -->
        <div class="somos-container">
          <span class="somos-text">SOMOS</span>
        </div>
        <h1 class="title">J&aacute;ndula</h1>
        <div class="buttons-container">
          <div class="google-login-button" @click="loginWithGoogle">
            <ion-icon :icon="googleIcon" class="google-icon"></ion-icon>
            <span>Conecta con Google</span>
          </div>
        </div>
      </div>

      <ion-toast :is-open="isToastOpen" :message="toastMessage" :color="toastColor" duration="2500"
          @did-dismiss="() => isToastOpen = false" position="top"></ion-toast>
      </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonToast, IonPage } from '@ionic/vue';
import { logoGoogle as googleIcon } from 'ionicons/icons';
import { signInWithPopup, signOut } from "firebase/auth";
import { crearToast } from '@/utils/toast.js';
import { obtenerRolesUsuario } from '@/services/firebaseService.js';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from '@/environment/firebaseConfig';
import { setLoggingInStatus } from '@/main'; // Importa la función del estado

// Inicializa Firebase
const app = initializeApp(firebaseConfig) ;
const auth = getAuth(app) ;

const googleProvider = new GoogleAuthProvider() ;

// Inicializar el servicio de mensajería
// const messaging = getMessaging(app) ;

const router = useRouter();

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const loginWithGoogle = async () =>
{
  try
  {
    // Indicamos que el usuario está iniciando sesión
    setLoggingInStatus(true);

    // Login a través de Google
    const result    = await signInWithPopup(auth, googleProvider);

    // Obtenemos el token JWT
    const user      = result.user ;

    // Validamos el usuario en el sistema
    const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen) ;

    // Verificamos si hay una redirección pendiente (guardada en el router)
    const redirectPath = router.currentRoute.value.query.redirect || '/printers/print'; // 'Dashboard' es la ruta por defecto
    router.push({ path: redirectPath });
  }
  catch (error)
  {
    // Crear toast
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message) ;
  }
  finally
  {
    // Restablecemos el estado después del login
    setLoggingInStatus(false); 
  }
};

</script>

<style scoped>
/* Estilos generales */
body {
  background-color: var(--background-light);
  font-family: 'Roboto', sans-serif;
}

.ion-padding {
  --background: var(--ion-padding-bg-light);
}

/* Modo claro */
.form-container {
  width: 100%;
  max-width: 350px;
  background-color: var(--form-bg-light);
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px 30px;
  margin: auto;
  margin-top: 20%;
  font-family: 'Roboto', sans-serif;
  position: relative;
}

.title {
  text-align: center;
  margin: 10px 0 30px 0;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-color-light);
  z-index: 1;
}

.somos-container {
  position: absolute;
  top: -0.25em;
  width: 100%;
  height: 40px;
  overflow: hidden;
  z-index: 2;
}

.somos-text {
  position: absolute;
  left: -100%;
  top: 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color-light);
  animation: moveToCenter 5s ease-in-out forwards;
  white-space: nowrap;
}

@keyframes moveToCenter {
  0% {
    left: -100%;
    opacity: 1;
  }
  50% {
    left: 50%;
    transform: translateX(-85%);
    opacity: 1;
  }
  70% {
    left: 50%;
    transform: translateX(-85%);
    opacity: 1;
  }
  100% {
    left: 50%;
    transform: translateX(-85%);
    opacity: 0;
  }
}

.buttons-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 20px;
  gap: 15px;
}

.google-login-button {
  border-radius: 20px;
  box-sizing: border-box;
  padding: 10px 15px;
  background-color: var(--button-bg-light);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
    rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  gap: 5px;
}

.google-login-button {
  border: 2px solid var(--button-border-light);
}

.google-icon {
  font-size: 18px;
  margin-bottom: 1px;
  color: var(--google-icon-light);
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  body {
    background-color: var(--background-dark);
  }

  .ion-padding {
    --background: var(--ion-padding-bg-dark);
  }

  .form-container {
    background-color: var(--form-bg-dark);
    box-shadow: rgba(255, 255, 255, 0.1) 0px 5px 15px;
    border: 1px solid #444;
  }

  .title {
    color: var(--text-color-dark);
  }

  .somos-text {
    color: var(--text-color-dark);
  }

  .google-login-button {
    background-color: var(--button-bg-dark);
    border: 2px solid var(--button-border-dark);
  }

  .google-icon {
    color: var(--google-icon-dark);
  }
}
</style>
