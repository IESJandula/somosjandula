<template>
  <ion-app>
    <!-- Menú lateral -->
    <ion-menu content-id="main-content" side="start" id="main-menu">
      <ion-content>
        <!-- Menú Administración -->
        <ion-list>
          <ion-item v-if="mostrarAdmin" button @click="toggleSubMenuAdmin">
            Administración
            <ion-icon
              slot="end"
              :icon="
                adminSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="adminSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/admin/firebase')"
              >Firebase</ion-item
            >
          </ion-list>
        </ion-list>

        <!-- Menú Notificaciones -->
        <ion-list>
          <ion-item button @click="toggleSubMenuNotificaciones">
            Notificaciones
            <ion-icon
              slot="end"
              :icon="
                notificacionesSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="notificacionesSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/admin/notificaciones')">
              Crea tus notificaciones
            </ion-item>
            <ion-item button @click="navigateAndCloseMenu('/admin/ponte-al-dia')">
              Ponte al día
            </ion-item>
          </ion-list>
        </ion-list>

        <!-- Menú de Cola de impresión -->
        <ion-list>
          <ion-item button @click="toggleSubMenuPrinters">
            Cola de impresión
            <ion-icon
              slot="end"
              :icon="
                printersSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="printersSubmenuVisible" class="submenu">
            <ion-item
              v-if="mostrarPrintersAdmin"
              button
              @click="navigateAndCloseMenu('/printers/admin')"
              >Administrar</ion-item
            >
            <ion-item button @click="navigateAndCloseMenu('/printers/print')"
              >Imprimir</ion-item
            >
          </ion-list>
        </ion-list>

        <!-- Menú Reservas -->
        <ion-list>
          <ion-item button @click="toggleSubMenuBookings">
            Reservas
            <ion-icon
              slot="end"
              :icon="
                bookingsSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="bookingsSubmenuVisible" class="submenu">
            <ion-item
              v-if="mostrarBookingsAdmin"
              button
              @click="navigateAndCloseMenu('/bookings/admin')"
              >Administrar</ion-item
            >
            <ion-item button @click="navigateAndCloseMenu('/bookings/fixed')"
              >Fijas</ion-item
            >
            <ion-item
              button
              @click="navigateAndCloseMenu('/bookings/temporary')"
              >Temporales</ion-item
            >
          </ion-list>
        </ion-list>

        <!-- Menú Proyectores -->
        <ion-list>
          <ion-item button @click="toggleSubMenuProjectors">
            Proyectores
            <ion-icon
              slot="end"
              :icon="
                projectorsSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="projectorsSubmenuVisible" class="submenu">
            <ion-item
              button
              @click="navigateAndCloseMenu('/projectors/RemoteControl')"
              >Control remoto</ion-item
            >
            <ion-item
              v-if="mostrarProjectorsAdmin"
              button
              @click="navigateAndCloseMenu('/projectors/ControlPanel')"
              >Administración</ion-item
            >
          </ion-list>
        </ion-list>

        <!-- Menú Horarios -->
        <ion-list>
          <ion-item button @click="toggleSubMenuTimetable">
            Horarios
            <ion-icon
              slot="end"
              :icon="
                timetableSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="timetableSubmenuVisible" class="submenu">
            <ion-item
              v-if="mostrarTimetableAdmin"
              button
              @click="navigateAndCloseMenu('/timetable/admin')"
              >Administrar</ion-item
            >
            <ion-item button @click="navigateAndCloseMenu('/timetable/choice')"
              >Elección de horarios</ion-item
            >
            <ion-item
              v-if="mostrarTimetableAdmin"
              button
              @click="navigateAndCloseMenu('/timetable/validation')"
              >Validación de datos</ion-item
            >
            <ion-item
              v-if="mostrarTimetableAdmin"
              button
              @click="navigateAndCloseMenu('/timetable/generator')"
              >Generador de horarios</ion-item
            >
            <ion-item
              button
              @click="navigateAndCloseMenu('/timetable/teachers')"
              >Horario individual</ion-item
            >
            <ion-item button @click="navigateAndCloseMenu('/timetable/course')"
              >Horario curso</ion-item
            >
          </ion-list>
        </ion-list>

        <!-- Menú Documentos -->
        <ion-list>
          <ion-item button @click="toggleSubMenuDocuments">
            Documentos
            <ion-icon
              slot="end"
              :icon="
                documentsSubmenuVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
            ></ion-icon>
          </ion-item>
          <ion-list v-if="documentsSubmenuVisible" class="submenu">
            <ion-item
              button
              @click="navigateAndCloseMenu('/documents/absences')"
              >Ausencias</ion-item
            >
            <ion-item
              button
              @click="navigateAndCloseMenu('/documents/teacherGuide')"
              >Guía del profesorado</ion-item
            >
            <ion-item
              button
              @click="navigateAndCloseMenu('/documents/itIssues')"
              >Crear incidencia TIC</ion-item
            >
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

          <div class="secondary-carousel">
            <transition-group name="fade" tag="div" class="messages">
              <p
                v-for="(msg, index) in secondaryMessages"
                :key="index"
                v-show="index === secondaryIndex"
              >
                {{ msg }}
              </p>
            </transition-group>
          </div>

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
import {
  validarRolesMenu,
  obtenerNombreYApellidosUsuario,
  obtenerNotificacionesHoy,
  obtenerEmailUsuario,
} from "@/services/firebaseService";
import { crearToast } from "@/utils/toast";
import { SESSION_JWT_TOKEN } from "@/utils/constants";

export default defineComponent({
  name: "MainLayout",
  components: {
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonPage,
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
    const mostrarBookingsAdmin = ref(false);
    const mostrarPrintersAdmin = ref(false);
    const mostrarProjectorsAdmin = ref(false);
    const mostrarTimetableAdmin = ref(false);

    const adminSubmenuVisible = ref(false);
    const printersSubmenuVisible = ref(false);
    const bookingsSubmenuVisible = ref(false);
    const documentsSubmenuVisible = ref(false);
    const schoolManagerSubmenuVisible = ref(false);
    const timetableSubmenuVisible = ref(false);
    const projectorsSubmenuVisible = ref(false);
    const notificacionesSubmenuVisible = ref(false);

    const secondaryIndex = ref(0);
    const secondaryMessages = ref([]);
    let secondaryInterval = null;

    const nextSecondary = () => {
      if (secondaryMessages.value.length > 0) {
        secondaryIndex.value =
          (secondaryIndex.value + 1) % secondaryMessages.value.length;
      }
    };

    const actualizarMensajes = async () => {
      try {
        const usuarioEmail = await obtenerEmailUsuario();
        const notificaciones = await obtenerNotificacionesHoy(
          "SECUNDARIO",
          usuarioEmail
        );
        secondaryMessages.value = notificaciones.map((n) => n.texto);
        secondaryIndex.value = 0;
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      }
    };

    onMounted(() => {
      actualizarMensajes();
      secondaryInterval = setInterval(actualizarMensajes, 60000);
      setInterval(nextSecondary, 5000);

      obtenerNombreYApellidosUsuario().then((userInfo) => {
        userName.value = userInfo.nombre;
      });

      validarRolesMenu()
        .then((rolesMenu) => {
          mostrarAdmin.value = rolesMenu.mostrarAdmin;
          mostrarPrintersAdmin.value = rolesMenu.mostrarDireccion;
          mostrarBookingsAdmin.value = rolesMenu.mostrarDireccion;
          mostrarProjectorsAdmin.value = rolesMenu.mostrarAdmin;
          mostrarTimetableAdmin.value = rolesMenu.mostrarDireccion;
        })
        .catch((error) => {
          console.error(error);
        });
    });

    onBeforeUnmount(() => {
      clearInterval(secondaryInterval);
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
      closeOthers("admin");
    };
    const toggleSubMenuPrinters = () => {
      printersSubmenuVisible.value = !printersSubmenuVisible.value;
      closeOthers("printers");
    };
    const toggleSubMenuBookings = () => {
      bookingsSubmenuVisible.value = !bookingsSubmenuVisible.value;
      closeOthers("bookings");
    };
    const toggleSubMenuDocuments = () => {
      documentsSubmenuVisible.value = !documentsSubmenuVisible.value;
      closeOthers("documents");
    };
    const toggleSubMenuSchoolManager = () => {
      schoolManagerSubmenuVisible.value = !schoolManagerSubmenuVisible.value;
      closeOthers("schoolManager");
    };
    const toggleSubMenuTimetable = () => {
      timetableSubmenuVisible.value = !timetableSubmenuVisible.value;
      closeOthers("timetable");
    };
    const toggleSubMenuProjectors = () => {
      projectorsSubmenuVisible.value = !projectorsSubmenuVisible.value;
      closeOthers("projectors");
    };
    const toggleSubMenuNotificaciones = () => {
      notificacionesSubmenuVisible.value = !notificacionesSubmenuVisible.value;
      closeOthers("notificaciones");
    };

    const closeOthers = (current) => {
      if (current !== "admin") adminSubmenuVisible.value = false;
      if (current !== "printers") printersSubmenuVisible.value = false;
      if (current !== "bookings") bookingsSubmenuVisible.value = false;
      if (current !== "documents") documentsSubmenuVisible.value = false;
      if (current !== "schoolManager")
        schoolManagerSubmenuVisible.value = false;
      if (current !== "timetable") timetableSubmenuVisible.value = false;
      if (current !== "projectors") projectorsSubmenuVisible.value = false;
      if (current !== "notificaciones")
        notificacionesSubmenuVisible.value = false;
    };

    return {
      userName,
      showTooltip,
      desconectar,
      navigateAndCloseMenu,
      mostrarAdmin,
      mostrarPrintersAdmin,
      mostrarBookingsAdmin,
      mostrarProjectorsAdmin,
      mostrarTimetableAdmin,
      adminSubmenuVisible,
      printersSubmenuVisible,
      bookingsSubmenuVisible,
      documentsSubmenuVisible,
      schoolManagerSubmenuVisible,
      timetableSubmenuVisible,
      projectorsSubmenuVisible,
      notificacionesSubmenuVisible,
      toggleSubMenuAdmin,
      toggleSubMenuPrinters,
      toggleSubMenuBookings,
      toggleSubMenuDocuments,
      toggleSubMenuSchoolManager,
      toggleSubMenuTimetable,
      toggleSubMenuProjectors,
      toggleSubMenuNotificaciones,
      secondaryIndex,
      secondaryMessages,
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
ion-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.end-section {
  display: flex;
  align-items: center;
  gap: 10px;
}
.secondary-carousel {
  flex: 1;
  text-align: center;
  overflow: hidden;
  color: #000;
}
.secondary-carousel p {
  margin: 0;
  color: #000;
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
</style>
