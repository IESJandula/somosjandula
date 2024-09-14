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
import { validarUsuario } from '@/services/firebaseService.js';
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseConfig } from '@/environment/firebaseConfig';

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
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;
    const email = user.email;

    // Verificar si el email pertenece al dominio permitido
    if (!email.endsWith("@g.educaand.es") && email != "paco.benitez.chico@gmail.com")
    {
      // Acceso denegado
      signOut(auth) ; // Cierra la sesión del usuario

      // Crear toast
      crearToast(toastMessage, toastColor, isToastOpen, "danger", "Solo tienen acceso los usuarios con un correo @g.educaand.es") ;
    }
    else
    {
      // Email pertenece al dominio. Validar si está dado de alta
      await validarUsuario(router, auth, toastMessage, toastColor, isToastOpen, user.uid) ;
    }
  }
  catch (error)
  {
    // Crear toast
    crearToast(toastMessage, toastColor, isToastOpen, "danger", error.message) ;
  }
};

</script>

<style scoped>
body {
  background-color: #610851;
  font-family: 'Roboto', sans-serif;
}

.ion-padding {
  --background: linear-gradient(90deg, #3a7ca5 0%, #66a6d1 40%, #66a6d1 60%, #a2cffe 100%);
}

.form-container {
  width: 100%;
  max-width: 350px;
  background-color: #ffffff;
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
  color: #3a7ca5;
  z-index: 1;
}

.somos-container {
  position: absolute;
  top: -0.25em; /* Ajusta según necesites para colocarlo encima del título */
  width: 100%;
  height: 40px; /* Ajusta según necesites */
  overflow: hidden;
  z-index: 2;
}

.somos-text {
  position: absolute;
  left: -100%;
  top: 0;
  font-size: 24px; /* Ajusta el tamaño según lo necesites */
  font-weight: bold;
  color: #3a7ca5;
  animation: moveToCenter 5s ease-in-out forwards;
  white-space: nowrap; /* Para evitar que ocupe espacio extra */
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
  border: 2px solid #747474;
}

.google-icon {
  font-size: 18px;
  margin-bottom: 1px;
}
</style>