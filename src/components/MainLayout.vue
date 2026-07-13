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
              <div class="button-container" @mouseenter="handleProfileEnter($event)" @mouseleave="showTooltip = false">
                <ion-button class="profile-button" fill="solid" @click="toggleDropdown($event)"
                  aria-haspopup="true" :aria-expanded="showDropdown ? 'true' : 'false'"
                  :aria-label="userName ? `Perfil (${userName})` : 'Perfil'">
                  <ion-icon :icon="personCircleOutline" aria-hidden="true"></ion-icon>
                </ion-button>
              </div>
              <teleport to="body">
                <div v-if="showTooltip && userName && !showDropdown" class="logout-tooltip"
                  :style="logoutTooltipPosition">
                  {{ userName }}
                </div>
              </teleport>

              <teleport to="body">
                <div v-if="showDropdown" class="perfil-dropdown-backdrop" @click="closeDropdown"></div>
                <div v-if="showDropdown" class="perfil-dropdown" :style="dropdownPosition" role="menu">
                  <!-- Sección "Perfil": selector de rol. Se muestra siempre que haya al menos
                       un rol. Si solo hay uno, aparece marcado y bloqueado (no desmarcable). -->
                  <template v-if="puedeSeleccionarRol">
                    <div class="perfil-dropdown-header">Perfil</div>
                    <button v-for="rol in rolesOrdenados" :key="rol"
                      class="perfil-dropdown-item perfil-rol-item" type="button" role="menuitemradio"
                      :class="{ 'is-locked': rolUnico }"
                      :aria-checked="rol === rolSeleccionado ? 'true' : 'false'"
                      :disabled="rolUnico"
                      @click="seleccionarRolEnMenu(rol)">
                      <ion-icon class="perfil-check" :class="{ 'is-visible': rol === rolSeleccionado }"
                        :icon="checkmarkOutline" aria-hidden="true"></ion-icon>
                      <span>{{ etiquetaRol(rol) }}</span>
                    </button>
                    <div class="perfil-dropdown-separator"></div>
                  </template>

                  <!-- Ítem "Desconectar": conserva la acción actual. -->
                  <button class="perfil-dropdown-item perfil-desconectar" type="button" role="menuitem"
                    @click="desconectarDesdeMenu">
                    <ion-icon class="perfil-item-icon" :icon="logOutOutline" aria-hidden="true"></ion-icon>
                    <span>Desconectar</span>
                  </button>
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
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { homeOutline, personCircleOutline, checkmarkOutline, logOutOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { menuController } from "@ionic/vue";
import { getAuth, signOut } from "firebase/auth";
import { obtenerNombreYApellidosUsuario, obtenerRolesUsuario } from "@/services/firebaseService";
import { SESSION_JWT_TOKEN } from "@/utils/constants";
import {
  etiquetaRol,
  ordenarRolesPorPrioridad,
  obtenerRolSeleccionado,
  seleccionarRol,
} from "@/utils/roles";
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

    // Estado del selector de rol / dropdown de perfil.
    const roles = ref([]);
    const rolSeleccionado = ref("");
    const showDropdown = ref(false);
    const dropdownPosition = ref(null);

    // El ítem "Perfil" (selector de rol) se muestra siempre que el usuario tenga al
    // menos un rol. Con un único rol, se muestra ese rol marcado y bloqueado.
    const puedeSeleccionarRol = computed(() => roles.value.length > 0);
    // Indica si el usuario solo tiene un rol: en ese caso el check queda fijo/no desmarcable.
    const rolUnico = computed(() => roles.value.length === 1);
    // Roles ordenados de más fuerte a menos fuerte para mostrarlos en el desplegable.
    const rolesOrdenados = computed(() => ordenarRolesPorPrioridad(roles.value));

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

    const handleProfileEnter = (event) => {
      showTooltip.value = true;
      const rect = event.currentTarget.getBoundingClientRect();
      // Anclado a la derecha del botón: crece hacia la izquierda y no se sale por el borde derecho
      logoutTooltipPosition.value = {
        top: `${rect.bottom + 6}px`,
        right: `${Math.max(window.innerWidth - rect.right, 8)}px`,
        left: 'auto'
      };
    };

    // Abre/cierra el desplegable del botón de perfil. Se ancla a la derecha del botón
    // (posición fixed vía teleport) para que no se recorte dentro del toolbar.
    const toggleDropdown = (event) => {
      if (showDropdown.value) {
        closeDropdown();
        return;
      }
      showTooltip.value = false;
      const rect = event.currentTarget.getBoundingClientRect();
      dropdownPosition.value = {
        top: `${rect.bottom + 8}px`,
        right: `${Math.max(window.innerWidth - rect.right, 8)}px`,
        left: 'auto'
      };
      showDropdown.value = true;
    };

    const closeDropdown = () => {
      showDropdown.value = false;
    };

    // Selecciona un rol (comportamiento tipo radio): siempre queda exactamente un rol
    // seleccionado. Pulsar el rol ya activo NO lo desmarca, solo cierra el desplegable.
    // Al cambiar de rol, se actualiza estado local, se persiste y se emite 'rol-cambiado'.
    const seleccionarRolEnMenu = (rol) => {
      if (rol === rolSeleccionado.value) {
        closeDropdown();
        return;
      }
      rolSeleccionado.value = rol;
      seleccionarRol(rol);
      closeDropdown();
    };

    const desconectarDesdeMenu = () => {
      closeDropdown();
      desconectar();
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

      // Cargamos los roles del usuario e inicializamos el rol seleccionado según la
      // jerarquía de fuerza (o el valor persistido si sigue siendo válido).
      obtenerRolesUsuario(toastMessage, toastColor, isToastOpen)
        .then((rolesUsuario) => {
          roles.value = rolesUsuario || [];
          rolSeleccionado.value = obtenerRolSeleccionado(roles.value);
        })
        .catch((error) => {
          console.error("Error al obtener los roles del usuario:", error);
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
      personCircleOutline,
      checkmarkOutline,
      logOutOutline,
      logoutTooltipPosition,
      handleProfileEnter,
      userName,
      showTooltip,
      desconectar,
      navigateAndCloseMenu,
      irAInicio,
      roles,
      rolSeleccionado,
      showDropdown,
      dropdownPosition,
      puedeSeleccionarRol,
      rolUnico,
      rolesOrdenados,
      etiquetaRol,
      toggleDropdown,
      closeDropdown,
      seleccionarRolEnMenu,
      desconectarDesdeMenu,
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

.profile-button {
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

.profile-button ion-icon {
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
  .profile-button {
    --background: #4c8dff;
    --color: #ffffff;
    color: #ffffff;
  }

  .home-button ion-icon,
  .profile-button ion-icon {
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

/* Capa transparente a pantalla completa: cierra el dropdown al pulsar fuera. */
.perfil-dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: transparent;
}

/* Menú desplegable del botón de perfil (teleportado a body, position fixed). */
.perfil-dropdown {
  position: fixed;
  min-width: 220px;
  max-width: 90vw;
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 6px;
  z-index: 99999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}

.perfil-dropdown-header {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.perfil-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.perfil-dropdown-item:hover {
  background-color: rgba(56, 128, 255, 0.12);
}

.perfil-check {
  width: 16px;
  height: 16px;
  min-width: 16px;
  font-size: 16px;
  color: #3880ff;
  visibility: hidden;
}

.perfil-check.is-visible {
  visibility: visible;
}

/* Rol único: aparece marcado y bloqueado (no desmarcable). Se mantiene legible
   con el check visible, pero sin efecto hover ni cursor de acción. El :disabled
   nativo tendería a atenuar el texto; forzamos el color para conservar legibilidad. */
.perfil-dropdown-item.is-locked {
  cursor: default;
  opacity: 1;
  color: #1f2937;
}

.perfil-dropdown-item.is-locked:hover {
  background-color: transparent;
}

.perfil-item-icon {
  width: 18px;
  height: 18px;
  min-width: 18px;
  font-size: 18px;
  color: #64748b;
}

.perfil-desconectar {
  color: #dc2626;
}

.perfil-desconectar .perfil-item-icon {
  color: #dc2626;
}

.perfil-dropdown-separator {
  height: 1px;
  margin: 6px 4px;
  background-color: #e2e8f0;
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

  .perfil-dropdown {
    background: #1f2622;
    color: #e5e7eb;
    border-color: #3a3f3b;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .perfil-dropdown-header {
    color: #94a3b8;
  }

  .perfil-dropdown-item:hover {
    background-color: rgba(76, 141, 255, 0.18);
  }

  .perfil-dropdown-item.is-locked {
    color: #e5e7eb;
  }

  .perfil-dropdown-item.is-locked:hover {
    background-color: transparent;
  }

  .perfil-check {
    color: #4c8dff;
  }

  .perfil-item-icon {
    color: #94a3b8;
  }

  .perfil-desconectar,
  .perfil-desconectar .perfil-item-icon {
    color: #f87171;
  }

  .perfil-dropdown-separator {
    background-color: #3a3f3b;
  }
}
</style>
