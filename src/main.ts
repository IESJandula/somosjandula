import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { IonicVue, IonToast } from "@ionic/vue";
import { ref } from 'vue';


/* Importaciones de CSS */
import '@ionic/vue/css/core.css';

/* Tema básico de Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import "@ionic/vue/css/palettes/dark.system.css";

/* Temas opcionales */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Tu archivo CSS personalizado */
import './theme/variables.css';

/* Importar IonIcons */
import { addIcons } from "ionicons";
import {
  arrowBackCircleOutline,
  cashOutline,
  locationOutline,
  timeOutline,
  trainOutline,
  menuOutline,
  chevronDownOutline,
  chevronUpOutline
} from "ionicons/icons";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { validarUsuario } from '@/services/firebaseService';
import { firebaseConfig } from '@/environment/firebaseConfig';

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Registrar iconos
addIcons({
  "arrow-back-circle-outline": arrowBackCircleOutline,
  "train-outline": trainOutline,
  "location-outline": locationOutline,
  "time-outline": timeOutline,
  "cash-outline": cashOutline,
  "menu-outline": menuOutline,
  "chevron-down-outline": chevronDownOutline,
  "chevron-up-outline": chevronUpOutline,
});

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const app = createApp(App).use(IonicVue).use(router);

const auth = getAuth();
onAuthStateChanged(auth, (user) =>
{
  if (user)
  {
    validarUsuario(router, auth, toastMessage, toastColor, isToastOpen, user.uid) ;
  }
});  

// Montar la aplicación cuando el router esté listo
router.isReady().then(() => {
  app.mount("#app");
});
