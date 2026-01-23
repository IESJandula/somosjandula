import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { IonicVue, IonToast } from "@ionic/vue";
import { ref } from 'vue';
import { signOut } from "firebase/auth";

/* Importaciones de CSS */
import '@ionic/vue/css/core.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


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
  chevronUpOutline,
  refreshOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  newspaperOutline,
  megaphone,
  heartOutline,
  print,
  book,
  browsers,
  eye,
  calendarOutline,
  infinite,
  gitCommit,  
  bagAddOutline,
  bandage,
  barChart,
} from "ionicons/icons";

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { obtenerRolesUsuario } from '@/services/firebaseService';
import { firebaseConfig } from '@/environment/firebaseConfig';
import { APP_VERSION, SESSION_JWT_TOKEN } from '@/utils/constants';

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
  "refresh-outline": refreshOutline,
  "newspaper-outline": newspaperOutline,
  "close-circle-outline": closeCircleOutline,
  "checkmark-circle-outline": checkmarkCircleOutline,
  "megaphone": megaphone,
  "heart-outline": heartOutline,
  "print": print,
  "book": book,
  "browsers": browsers,
  "eye": eye,
  "calendar-outline": calendarOutline,
  "infinite": infinite,
  "git-commit": gitCommit,
  "bag-add-outline": bagAddOutline,
  "bandage": bandage,
  "bar-chart": barChart,
});

// Variables para el toast
const isToastOpen = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');

const app = createApp(App).use(IonicVue).use(router);

let isLoggingIn = false; // Variable para detectar el estado de login

const auth = getAuth();
onAuthStateChanged(auth, (user) =>
{

  if (user && !isLoggingIn)
  {
    (async () => {
      
      try
      {
        const isToastOpen = ref(false);
        const toastMessage = ref('');
        const toastColor = ref('success');

        // Solo ejecuta si no está en proceso de login
        const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);

        // Verifica si hay una redirección pendiente
        const redirectPath = router.currentRoute.value.query.redirect || '/printers/print'; // '/dashboard' es la ruta por defecto
        if (router.currentRoute.value.name === 'Login') {
          router.push({ path: redirectPath });
        }
      }
      catch (error)
      {
        // Cerramos la sesión si algo falla
        signOut(auth);
    
        console.error("Error obteniendo el token JWT o validando usuario:", error) ;
      }
    })();
  }
});

export function setLoggingInStatus(status: boolean) {
  isLoggingIn = status; // Función para actualizar el estado
}

// Montar la aplicación cuando el router esté listo
router.isReady().then(() => {

  const cachedVersion = localStorage.getItem('app_version');

  if (cachedVersion && cachedVersion !== APP_VERSION)
  {
    localStorage.setItem('app_version', APP_VERSION);

    // Eliminamos el token de la sesión previa
    localStorage.removeItem(SESSION_JWT_TOKEN) ;

    console.log('[App] Nueva versión detectada, recargando...') ;
    location.reload() ; // fuerza recarga completa
  }
  else if (!cachedVersion)
  {
    localStorage.setItem('app_version', APP_VERSION);
  }

  app.mount("#app");
});
