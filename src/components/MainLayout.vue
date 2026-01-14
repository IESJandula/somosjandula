<template>
  <ion-app>
    <!-- Menú lateral -->
    <ion-menu content-id="main-content" side="start" id="main-menu">
      <ion-content>
        <!-- Menú Administración -->
        <ion-list>
          <ion-item v-if="mostrarAdmin" button @click="toggleSubMenuAdmin">
            Administración general
            <ion-icon slot="end" :icon="adminSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="adminSubmenuVisible" class="submenu">
            <ion-item v-if="mostrarAdminFirebase" button @click="navigateAndCloseMenu('/admin/firebase')">Firebase</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/printers/admin')">Impresión</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/bookings/admin')">Reservas</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/notifications/admin')">Notificaciones</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/projectors/ControlPanel')">Proyectores</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/issues/admin')">Incidencias</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/automations/admin')">Domótica</ion-item>
          </ion-list>
        </ion-list>

        <!-- Menú de Cola de impresión -->
        <ion-list>
          <ion-item v-if="mostrarTimetableAdmin" button @click="toggleSubMenuTimetableAdmin">
            Administración de horarios
            <ion-icon slot="end" :icon="timetableAdminSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="timetableAdminSubmenuVisible" class="submenu">
            <ion-item v-if="mostrarTimetableAdmin" button @click="navigateAndCloseMenu('/timetable_admin/admin')">1. Administrar</ion-item>
            <ion-item v-if="mostrarTimetableAdmin" button @click="navigateAndCloseMenu('/timetable_admin/validation')">2. Validación de datos</ion-item>
            <ion-item v-if="mostrarTimetableAdmin" button @click="navigateAndCloseMenu('/timetable_admin/generator')">3. Generador de horarios</ion-item>
          </ion-list>
        </ion-list>
        <ion-list>
          <ion-item v-if="mostrarSchoolManager" button @click="toggleSubMenuSchoolManager">
            Gestión de matriculas
            <ion-icon slot="end"
              :icon="schoolManagerSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="schoolManagerSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/school_manager/cargaMatriculas')">1. Carga de matrículas</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/school_manager/asignaturaYBloque')">2. Asignaturas y bloques</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/school_manager/crearGrupos')">3. Creación de grupos</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/school_manager/tablaResumen')">4. Resumen por asignatura</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/school_manager/departamentos')">5. Asignaturas y departamentos</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/school_manager/reducciones')">6. Reducciones</ion-item>
          </ion-list>
        </ion-list>
        <!-- Últimas noticias -->
        <ion-list>
          <ion-item button @click="toggleSubMenuNotifications">
            Últimas noticias
            <ion-icon slot="end" :icon="notificationsSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="notificationsSubmenuVisible" class="submenu">
          <!--  <ion-item button @click="navigateAndCloseMenu('/notifications/latestNews')">¡Últimas noticias!</ion-item> -->
            <ion-item button @click="navigateAndCloseMenu('/notifications/manager')">Avisa de algo importante</ion-item>
          </ion-list>
        </ion-list>
        <ion-list>
          <ion-item button @click="toggleSubMenuUtilities">
            Mis utilidades
            <ion-icon slot="end" :icon="utilitiesSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="utilitiesSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/printers/print')">Imprime documentos</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/projectors/RemoteControl')">Controla proyectores en remoto</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/documents/teacherGuide')">Lee la guía del profesorado</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/documents/pdisTraining')">Formación PDIs</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/automations/map')">Vista de pájaro</ion-item>
          </ion-list>
        </ion-list>
        <!-- Reservas -->
        <ion-list>
          <ion-item button @click="toggleSubMenuBookings">
            Reservas
            <ion-icon slot="end" :icon="bookingsSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="bookingsSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/bookings/fixed')">Realiza reservas fijas</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/bookings/temporary')">Realiza reservas temporales</ion-item>
          </ion-list>
        </ion-list>
        <!-- Guardias -->
        <ion-list>
          <ion-item button @click="toggleSubMenuAbsences">
            Guardias
            <ion-icon slot="end" :icon="absencesSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="absencesSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/absences/review')">Comprueba tus guardias</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/absences/tasks')">Revisa las tareas de guardia</ion-item>
          </ion-list>
        </ion-list>
        <ion-list>
          <ion-item v-if="mostrarTimetableTeachers" button @click="toggleSubMenuTimetableTeachers">
            Horarios
            <ion-icon slot="end" :icon="timetableTeachersSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="timetableTeachersSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/timetable_teachers/choice')">1. Elección de horarios</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/timetable_teachers/personal')">2. Horario personal</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/timetable_teachers/groups')">3. Horario de grupos</ion-item>
          </ion-list>
        </ion-list>
        <!--Incidencias-->
        <ion-list>
          <ion-item button @click="toggleSubMenuIssues">
            <ion-icon slot="end" name="alert-circle-outline"></ion-icon>
            <ion-label>Incidencias</ion-label>
            <ion-icon
              slot="end"
              :icon="issuesSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"
            ></ion-icon>
          </ion-item>

          <ion-list v-if="issuesSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/issues')">
              Gestiona tus incidencias
            </ion-item>
            <ion-item button @click="navigateAndCloseMenu('/issues/stats')">
              Visualiza estadísticas
            </ion-item>
          </ion-list>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Contenido principal de la página -->
    <ion-page id="main-content">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-menu-button autoHide="false"></ion-menu-button>
          </ion-buttons>

          <div class="notificacionesSoloTexto-carousel">
            <div class="notificacionesSoloTexto">
              <transition name="fade">
                <div
                  v-if="notificacionesSoloTexto.length > 0 && notificacionesSoloTextoIndex < notificacionesSoloTexto.length"
                  :key="notificacionesSoloTextoIndex"
                  class="notificacion-container"
                  :ref="el => { if (el) notificationRefs[notificacionesSoloTextoIndex] = el }"
                  @mouseenter="handleMouseEnter(notificacionesSoloTextoIndex, $event)"
                  @mouseleave="showNotificationTooltip = null; tooltipPosition = null"
                >
                  <p>{{ notificacionesSoloTexto[notificacionesSoloTextoIndex]?.texto }}</p>
                </div>
              </transition>
            </div>
          </div>
          <teleport to="body">
            <div 
              v-if="showNotificationTooltip !== null && notificacionesSoloTexto[showNotificationTooltip]?.creador" 
              class="notification-tooltip"
              :style="tooltipPosition"
            >
              {{ notificacionesSoloTexto[showNotificationTooltip].creador }}
            </div>
          </teleport>

          <div class="end-section" slot="end">
            <div class="top-bar">
              <div
                class="button-container"
                @mouseenter="showTooltip = true"
                @mouseleave="showTooltip = false"
              >
                <ion-button @click="desconectar">Desconectar</ion-button>
                <div v-if="showTooltip && userName" class="tooltip">
                  {{ userName }}
                </div>
              </div>
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
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonApp,
} from "@ionic/vue";
import { defineComponent, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { menuController } from "@ionic/vue";
import { getAuth, signOut } from "firebase/auth";
import { validarRolesMenu, obtenerNombreYApellidosUsuario } from "@/services/firebaseService";
import { SESSION_JWT_TOKEN } from "@/utils/constants";
import { obtenerNotificacionesVigentesPorTipo } from "@/services/notifications";

export default defineComponent({
  name: "MainLayout",
  components: {
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonPage,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonApp,
  },
  setup() {
    const router = useRouter();
    const userName = ref("");
    const showTooltip = ref(false);
    const mostrarAdmin = ref(false);
    const mostrarAdminFirebase = ref(false);
    const mostrarTimetableAdmin = ref(false);
    const mostrarTimetableTeachers = ref(false);
    const mostrarSchoolManager = ref(false);

    const adminSubmenuVisible = ref(false);
    const timetableAdminSubmenuVisible = ref(false);
    const schoolManagerSubmenuVisible = ref(false);
    const timetableTeachersSubmenuVisible = ref(false);
    const notificationsSubmenuVisible = ref(false);
    const utilitiesSubmenuVisible = ref(false);
    const bookingsSubmenuVisible = ref(false);
    const absencesSubmenuVisible = ref(false);

    const issuesSubmenuVisible = ref(false);

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
      //actualizarNotificacionesSoloTexto();
      //notificacionesSoloTextoInterval = setInterval(actualizarNotificacionesSoloTexto, 60000);
      //setInterval(nextNotificacionesSoloTexto, 5000);

      obtenerNombreYApellidosUsuario().then((userInfo) => {
        userName.value = userInfo.nombre;
      });

      validarRolesMenu()
        .then((rolesMenu) => {
          mostrarAdmin.value = rolesMenu.mostrarAdmin;
          mostrarTimetableAdmin.value = rolesMenu.mostrarDireccion;
          mostrarSchoolManager.value = rolesMenu.mostrarDireccion;
        })
        .catch((error) => {
          console.error(error);
        });
    });

    onBeforeUnmount(() => {
      clearInterval(notificacionesSoloTextoInterval);
    });

    const desconectar = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        localStorage.removeItem(SESSION_JWT_TOKEN);
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

    // Toggle submenus
    const toggleSubMenuAdmin = () => {
      adminSubmenuVisible.value = !adminSubmenuVisible.value;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuTimetableAdmin = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = !timetableAdminSubmenuVisible.value;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuTimetableTeachers = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = !timetableTeachersSubmenuVisible.value;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = false;
    };
    const toggleSubMenuSchoolManager = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = !schoolManagerSubmenuVisible.value;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
    };

    const toggleSubMenuNotifications = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = !notificationsSubmenuVisible.value;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuUtilities = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = !utilitiesSubmenuVisible.value;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuBookings = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = !bookingsSubmenuVisible.value;
      absencesSubmenuVisible.value = false;
       issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuAbsences = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      notificationsSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = !absencesSubmenuVisible.value;
      issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuIssues = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = !issuesSubmenuVisible.value;
    };

    onMounted(async () => {
      try {
        const userInfo = await obtenerNombreYApellidosUsuario(toastMessage, toastColor, isToastOpen);
        userName.value = userInfo.nombre;

        const rolesMenu = await validarRolesMenu(isToastOpen, toastMessage, toastColor);

        mostrarAdmin.value = rolesMenu.mostrarDireccion;
        mostrarAdminFirebase.value = rolesMenu.mostrarAdmin;
        mostrarTimetableAdmin.value = rolesMenu.mostrarDireccion;
        mostrarTimetableTeachers.value = rolesMenu.mostrarDireccion;
        mostrarSchoolManager.value = rolesMenu.mostrarDireccion;
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
      userName,
      showTooltip,
      desconectar,
      navigateAndCloseMenu,
      mostrarAdmin,
      mostrarAdminFirebase,
      mostrarSchoolManager,
      mostrarTimetableAdmin,
      mostrarTimetableTeachers,
      adminSubmenuVisible,
      schoolManagerSubmenuVisible,
      timetableAdminSubmenuVisible,
      timetableTeachersSubmenuVisible,
      notificationsSubmenuVisible,
      utilitiesSubmenuVisible,
      bookingsSubmenuVisible,
      absencesSubmenuVisible,
      issuesSubmenuVisible,
      toggleSubMenuAdmin,
      toggleSubMenuTimetableAdmin,
      toggleSubMenuTimetableTeachers,
      toggleSubMenuSchoolManager,
      toggleSubMenuNotifications,
      toggleSubMenuUtilities,
      toggleSubMenuBookings,
      toggleSubMenuAbsences,
      notificacionesSoloTexto,
      notificacionesSoloTextoIndex,
      showNotificationTooltip,
      tooltipPosition,
      notificationRefs,
      handleMouseEnter,
      toggleSubMenuIssues
    };
  },
});
</script>

<style scoped>
.submenu {
  padding-left: 20px;
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE y Edge */
  width: 100%;
  text-align: center;
  position: relative;
  min-height: 1.5em;
}
.notificacionesSoloTexto::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
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
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
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

@media (prefers-color-scheme: dark) {
  .notification-tooltip {
    background: #1a1a1a;
    color: #fff;
  }
  .notification-tooltip::before {
    border-bottom-color: #1a1a1a;
  }
}
</style>
