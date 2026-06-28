<template>
  <ion-app>
    <!-- Contenido principal de la página -->
    <ion-page id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button class="home-button" fill="solid" @click="irAInicio" aria-label="Ir al inicio">
              <ion-icon :icon="homeOutline" aria-hidden="true"></ion-icon>
            </ion-button>
          </ion-buttons>

          <div class="notificacionesSoloTexto-carousel">
            <div class="notificacionesSoloTexto">
              <transition name="fade">
                <div
                  v-if="notificacionesSoloTexto.length > 0 && notificacionesSoloTextoIndex < notificacionesSoloTexto.length"
                  :key="notificacionesSoloTextoIndex" class="notificacion-container"
                  :ref="el => { if (el) notificationRefs[notificacionesSoloTextoIndex] = el }"
                  @mouseenter="handleMouseEnter(notificacionesSoloTextoIndex, $event)"
                  @mouseleave="showNotificationTooltip = null; tooltipPosition = null">
                  <p>{{ notificacionesSoloTexto[notificacionesSoloTextoIndex]?.texto }}</p>
                </div>
              </transition>
            </div>
          </div>
          <teleport to="body">
            <div v-if="showNotificationTooltip !== null && notificacionesSoloTexto[showNotificationTooltip]?.creador"
              class="notification-tooltip" :style="tooltipPosition">
              {{ notificacionesSoloTexto[showNotificationTooltip].creador }}
            </div>
          </teleport>

          <div class="end-section" slot="end">
            <div class="top-bar">
              <div class="button-container" @mouseenter="handleLogoutEnter($event)" @mouseleave="showTooltip = false">
                <ion-button class="logout-button" fill="solid" @click="desconectar"
                  :aria-label="userName ? `Desconectar (${userName})` : 'Desconectar'">
                  <ion-icon :icon="powerOutline" aria-hidden="true"></ion-icon>
                </ion-button>
              </div>
              <teleport to="body">
                <div v-if="showTooltip && userName" class="logout-tooltip" :style="logoutTooltipPosition">
                  {{ userName }}
                </div>
              </teleport>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding" fullscreen>
        <router-view></router-view>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script>
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonApp,
} from "@ionic/vue";
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { homeOutline, powerOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { menuController } from "@ionic/vue";
import { getAuth, signOut } from "firebase/auth";
import { obtenerNombreYApellidosUsuario } from "@/services/firebaseService";
import { SESSION_JWT_TOKEN } from "@/utils/constants";
import { obtenerNotificacionesVigentesPorTipo } from "@/services/notifications";
import { crearToast } from "@/utils/toast.js";

export default defineComponent({
  name: "MainLayout",
  components: {
    IonContent,
    IonList,
    IonItem,
    IonPage,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonApp,
  },
  setup() {
    const router = useRouter();
    const userName = ref("");
    const showTooltip = ref(false);

    // Variables para el toast
    const isToastOpen = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('success');

    const notificacionesSoloTextoIndex = ref(0);
    const notificacionesSoloTexto = ref([]);
    const showNotificationTooltip = ref(null);
    const tooltipPosition = ref(null);
    const notificationRefs = ref({});
    let notificacionesSoloTextoInterval = null;

    const nextNotificacionesSoloTexto = () => {
      if (notificacionesSoloTexto.value.length > 0) {
        notificacionesSoloTextoIndex.value =
          (notificacionesSoloTextoIndex.value + 1) % notificacionesSoloTexto.value.length;
      }
    };

    const handleMouseEnter = (index, event) => {
      showNotificationTooltip.value = index;
      const rect = event.currentTarget.getBoundingClientRect();
      tooltipPosition.value = {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.bottom + 5}px`,
        transform: 'translateX(-50%)'
      };
    };

    const logoutTooltipPosition = ref(null);

    const handleLogoutEnter = (event) => {
      showTooltip.value = true;
      const rect = event.currentTarget.getBoundingClientRect();
      // Anclado a la derecha del botón: crece hacia la izquierda y no se sale por el borde derecho
      logoutTooltipPosition.value = {
        top: `${rect.bottom + 6}px`,
        right: `${Math.max(window.innerWidth - rect.right, 8)}px`,
        left: 'auto'
      };
    };

    const actualizarNotificacionesSoloTexto = async () => {
      try {
        const notificacionesPorTipoSoloTexto = await obtenerNotificacionesVigentesPorTipo(toastMessage, toastColor, isToastOpen, "Solo texto");
        notificacionesSoloTexto.value = notificacionesPorTipoSoloTexto.map(({
          creador,
          texto
        }) => ({ creador, texto }));
        notificacionesSoloTextoIndex.value = 0;
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      }
    };

    onMounted(() => {
      // Obtener notificaciones solo texto.
      actualizarNotificacionesSoloTexto();

      // Actualizar notificaciones cada 5 minutos.
      notificacionesSoloTextoInterval = setInterval(actualizarNotificacionesSoloTexto, 60000 * 5);

      // Pasar a la siguiente notificación cada 5 segundos.
      setInterval(nextNotificacionesSoloTexto, 5000);

      obtenerNombreYApellidosUsuario().then((userInfo) => {
        userName.value = `${userInfo.nombre ?? ""} ${userInfo.apellidos ?? ""}`.trim();
      });
    });

    onBeforeUnmount(() => {
      clearInterval(notificacionesSoloTextoInterval);
    });

    const desconectar = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);

        // El JWT de sesión se persiste en sessionStorage (ver firebaseService)
        sessionStorage.removeItem(SESSION_JWT_TOKEN);
        // Limpieza defensiva por si quedara en localStorage
        localStorage.removeItem(SESSION_JWT_TOKEN);
        // Evitar redirección automática a una ruta previa tras el próximo login
        localStorage.removeItem("redirectAfterLogin");

        router.replace({ name: "Login" });
        window.location.reload();
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    };

    const navigateAndCloseMenu = async (path) => {
      await router.push(path);
      await menuController.close("main-menu");
    };

    const irAInicio = () => {
      router.push("/home");
    };

    onMounted(async () => {
      try {
        const userInfo = await obtenerNombreYApellidosUsuario(toastMessage, toastColor, isToastOpen);
        userName.value = `${userInfo.nombre ?? ""} ${userInfo.apellidos ?? ""}`.trim();
      }
      catch (error) {
        crearToast(
          toastMessage,
          toastColor,
          isToastOpen,
          'danger',
          `Error al obtener los roles del usuario: ${error.message}`
        );
      }
    });

    return {
      homeOutline,
      powerOutline,
      logoutTooltipPosition,
      handleLogoutEnter,
      userName,
      showTooltip,
      desconectar,
      navigateAndCloseMenu,
      irAInicio,
      notificacionesSoloTexto,
      notificacionesSoloTextoIndex,
      showNotificationTooltip,
      tooltipPosition,
      notificationRefs,
      handleMouseEnter,
    };
  },
});
</script>

<style scoped>
.submenu {
  padding-left: 20px;
}

.home-button {
  --background: #3880ff;
  --color: #ffffff;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  width: 44px;
  height: 44px;
  min-width: 44px;
  padding: 0 !important;
  border-radius: 50%;
}

.home-button ion-icon {
  width: 26px !important;
  height: 26px !important;
  font-size: 26px !important;
  color: #ffffff !important;
}

.logout-button {
  --background: #3880ff;
  --color: #ffffff;
  color: #ffffff;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  width: 44px;
  height: 44px;
  min-width: 44px;
  padding: 0 !important;
  border-radius: 50%;
}

.logout-button ion-icon {
  width: 26px !important;
  height: 26px !important;
  font-size: 26px !important;
  color: #ffffff !important;
}

ion-button {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  padding: 10px 20px;
  --background: #3880ff;
  --color: white;
  border-radius: 8px;
  opacity: 1;
}

ion-icon {
  font-size: 24px;
}

ion-header {
  overflow: visible !important;
  z-index: 1000;
}

ion-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: visible !important;
  position: relative;
  z-index: 1000;
}

.end-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notificacionesSoloTexto-carousel {
  flex: 1;
  text-align: center;
  overflow: visible;
  color: #000;
  position: relative;
}

.notificacionesSoloTexto {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE y Edge */
  width: 100%;
  text-align: center;
  position: relative;
  min-height: 1.5em;
}

.notificacionesSoloTexto::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.notificacion-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: inline-block;
  cursor: pointer;
  touch-action: pan-x;
  white-space: nowrap;
  width: 100%;
  text-align: center;
}

.notificacionesSoloTexto-carousel p {
  margin: 0;
  color: #000;
  font-size: 14px;
  white-space: nowrap;
  display: inline-block;
}

.fade-enter-active {
  transition: opacity 0.6s ease-in;
}

.fade-leave-active {
  transition: opacity 0.6s ease-out;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.tooltip {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  left: auto;
  transform: none;
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  max-width: 90vw;
  pointer-events: none;
  z-index: 10000;
  opacity: 0.95;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.button-container {
  position: relative;
  display: inline-block;
}

@media (min-width: 768px) {
  ion-button {
    padding: 10px 30px;
    font-size: 18px;
  }

  ion-icon {
    font-size: 28px;
  }
}

/* Estilos para modo oscuro */
@media (prefers-color-scheme: dark) {
  .notificacionesSoloTexto-carousel {
    color: #fff;
  }

  .notificacionesSoloTexto-carousel p {
    color: #fff;
  }

  ion-button {
    --background: #4c8dff;
    --color: white;
  }

  .home-button,
  .logout-button {
    --background: #4c8dff;
    --color: #ffffff;
    color: #ffffff;
  }

  .home-button ion-icon,
  .logout-button ion-icon {
    color: #ffffff !important;
  }

  .tooltip {
    background: #1a1a1a;
    color: #fff;
  }
}
</style>

<style>
.notification-tooltip {
  position: fixed;
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 99999;
  opacity: 0.95;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.notification-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: #333;
}

.logout-tooltip {
  position: fixed;
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  max-width: 90vw;
  pointer-events: none;
  z-index: 99999;
  opacity: 0.95;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  .notification-tooltip {
    background: #1a1a1a;
    color: #fff;
  }

  .notification-tooltip::before {
    border-bottom-color: #1a1a1a;
  }

  .logout-tooltip {
    background: #1a1a1a;
    color: #fff;
  }
}
</style>
