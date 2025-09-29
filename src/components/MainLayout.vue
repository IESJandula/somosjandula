<template>
  <ion-app>
    <!-- Menú lateral -->
    <ion-menu content-id="main-content" side="start" id="main-menu">
      <ion-content>
        <ion-list>
          <ion-item v-if="mostrarAdmin" button @click="toggleSubMenuAdmin">
            Administración
            <ion-icon slot="end" :icon="adminSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="adminSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/admin/firebase')">Firebase</ion-item>
          </ion-list>
          <ion-list v-if="adminSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/admin/notificaciones')">Notificaciones</ion-item>
          </ion-list>
        </ion-list>

        <ion-list>
          <ion-item button @click="toggleSubMenuPrinters">
            Cola de impresión
            <ion-icon slot="end"
              :icon="printersSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="printersSubmenuVisible" class="submenu">
            <ion-item v-if="mostrarPrintersAdmin" button
              @click="navigateAndCloseMenu('/printers/admin')">Administrar</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/printers/print')">Imprimir</ion-item>
          </ion-list>
        </ion-list>

        <ion-list>
          <ion-item button @click="toggleSubMenuBookings">
            Reservas
            <ion-icon slot="end"
              :icon="bookingsSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="bookingsSubmenuVisible" class="submenu">
            <ion-item v-if="mostrarBookingsAdmin" button
              @click="navigateAndCloseMenu('/bookings/admin')">Administrar</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/bookings/fixed')">Fijas</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/bookings/temporary')">Temporales</ion-item>
          </ion-list>
        </ion-list>

        <ion-list>
          <ion-item button @click="toggleSubMenuProjectors">
            Proyectores
            <ion-icon slot="end"
              :icon="projectorsSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="projectorsSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/projectors/RemoteControl')">Control remoto</ion-item>
            <ion-item v-if="mostrarProjectorsAdmin" button @click="navigateAndCloseMenu('/projectors/ControlPanel')">Administración</ion-item>
          </ion-list>
        </ion-list>

        <ion-list>
          <ion-item button @click="toggleSubMenuTimetable">
            Horarios
            <ion-icon slot="end" :icon="timetableSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="timetableSubmenuVisible" class="submenu">
            <ion-item v-if="mostrarTimetableAdmin" button @click="navigateAndCloseMenu('/timetable/admin')">Administrar</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/timetable/choice')">Elección de horarios</ion-item>
            <ion-item v-if="mostrarTimetableAdmin" button @click="navigateAndCloseMenu('/timetable/validation')">Validación de datos</ion-item>
            <ion-item v-if="mostrarTimetableAdmin" button @click="navigateAndCloseMenu('/timetable/generator')">Generador de horarios</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/timetable/teachers')">Horario individual</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/timetable/course')">Horario curso</ion-item>
          </ion-list>
        </ion-list>

        <ion-list>
          <ion-item button @click="toggleSubMenuDocuments">
            Documentos
            <ion-icon slot="end"
              :icon="documentsSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="documentsSubmenuVisible" class="submenu">
            <ion-item button @click="navigateAndCloseMenu('/documents/absences')">Ausencias</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/documents/teacherGuide')">Guía del profesorado</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/documents/itIssues')">Crear incidencia TIC</ion-item>
          </ion-list>
        </ion-list>

        <ion-list>
          <ion-item v-if="mostrarSchoolManager" button @click="toggleSubMenuSchoolManager">
            Gestión de matriculas
            <ion-icon slot="end"
              :icon="schoolManagerSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-item button @click="navigateAndCloseMenu('/school_manager/ponteAlDia')">
            Ponte al día
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
      </ion-content>
    </ion-menu>

    <!-- Contenido principal de la página -->
    <ion-page id="main-content">
      <ion-header>
        <ion-toolbar>
          <!-- Botón de Menú -->
          <ion-buttons slot="start">
            <ion-menu-button autoHide="false"></ion-menu-button>
          </ion-buttons>

          <!-- 🎯 Carrusel secundario de mensajes -->
          <div class="secondary-carousel">
            <transition-group name="fade" tag="div" class="messages">
              <p :key="secondaryIndex">{{ secondaryMessages[secondaryIndex] }}</p>
            </transition-group>
          </div>

          <!-- Contenedor de usuario y botón de desconectar -->
          <div class="end-section" slot="end">
            <span v-if="userName" class="user-name">{{ userName }}</span>
            <div class="top-bar">
              <!-- <div class="button-container">
                <ion-button @click="desconectar">Desconectar</ion-button>
              </div> -->
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <!-- Contenido con outlet debajo del header -->
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
} from '@ionic/vue';
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { menuController } from '@ionic/vue';
import { getAuth, signOut } from 'firebase/auth';
import { validarRolesMenu, obtenerNombreYApellidosUsuario } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast';
import { SESSION_JWT_TOKEN } from '@/utils/constants';

export default defineComponent({
  name: 'MainLayout',
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
    const userName = ref('');
    const mostrarAdmin = ref(false);
    const mostrarBookingsAdmin = ref(false);
    const mostrarPrintersAdmin = ref(false);
    const mostrarSchoolManager = ref(false);
    const mostrarProjectorsAdmin = ref(false);
    const mostrarTimetableAdmin = ref(false);
    const adminSubmenuVisible = ref(false);
    const printersSubmenuVisible = ref(false);
    const bookingsSubmenuVisible = ref(false);
    const documentsSubmenuVisible = ref(false);
    const schoolManagerSubmenuVisible = ref(false);
    const timetableSubmenuVisible = ref(false);
    const projectorsSubmenuVisible = ref(false);

    // Variables para el toast
    const isToastOpen = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('success');

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
      }, 4000);

      obtenerNombreYApellidosUsuario(toastMessage, toastColor, isToastOpen).then(userInfo => {
        userName.value = userInfo.nombre;
      });

      validarRolesMenu(isToastOpen, toastMessage, toastColor).then(rolesMenu => {
        mostrarAdmin.value = rolesMenu.mostrarAdmin;
        mostrarPrintersAdmin.value = rolesMenu.mostrarDireccion;
        mostrarBookingsAdmin.value = rolesMenu.mostrarDireccion;
        mostrarSchoolManager.value = rolesMenu.mostrarDireccion;
        mostrarProjectorsAdmin.value = rolesMenu.mostrarAdmin;
        mostrarTimetableAdmin.value = rolesMenu.mostrarDireccion;
      }).catch(error => {
        crearToast(
          toastMessage,
          toastColor,
          isToastOpen,
          'danger',
          `Error al obtener los roles del usuario: ${error.message}`
        );
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
        router.replace({ name: 'Login' });
        window.location.reload();
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    const navigateAndCloseMenu = async (path) => {
      await router.push(path);
      await menuController.close('main-menu');
    };

    const toggleSubMenuAdmin = () => {
      adminSubmenuVisible.value = !adminSubmenuVisible.value;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      timetableSubmenuVisible.value = false;
      projectorsSubmenuVisible.value = false;
    };

    const toggleSubMenuPrinters = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = !printersSubmenuVisible.value;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      timetableSubmenuVisible.value = false;
      projectorsSubmenuVisible.value = false;
    };

    const toggleSubMenuBookings = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = !bookingsSubmenuVisible.value;
      documentsSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      timetableSubmenuVisible.value = false;
      projectorsSubmenuVisible.value = false;
    };

    const toggleSubMenuDocuments = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      projectorsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = !documentsSubmenuVisible.value;
      schoolManagerSubmenuVisible.value = false;
      timetableSubmenuVisible.value = false;
    };

    const toggleSubMenuSchoolManager = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = !schoolManagerSubmenuVisible.value;
      timetableSubmenuVisible.value = false;
      projectorsSubmenuVisible.value = false;
    };

    const toggleSubMenuTimetable = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      timetableSubmenuVisible.value = !timetableSubmenuVisible.value;
      projectorsSubmenuVisible.value = false;
    };

    const toggleSubMenuProjectors = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      timetableSubmenuVisible.value = false;
      projectorsSubmenuVisible.value = !projectorsSubmenuVisible.value;
    };

    return {
      userName,
      desconectar,
      navigateAndCloseMenu,
      mostrarAdmin,
      mostrarPrintersAdmin,
      mostrarBookingsAdmin,
      mostrarSchoolManager,
      mostrarProjectorsAdmin,
      mostrarTimetableAdmin,
      adminSubmenuVisible,
      printersSubmenuVisible,
      bookingsSubmenuVisible,
      documentsSubmenuVisible,
      schoolManagerSubmenuVisible,
      timetableSubmenuVisible,
      projectorsSubmenuVisible,
      toggleSubMenuAdmin,
      toggleSubMenuPrinters,
      toggleSubMenuBookings,
      toggleSubMenuDocuments,
      toggleSubMenuSchoolManager,
      toggleSubMenuTimetable,
      toggleSubMenuProjectors,
      secondaryIndex,
      secondaryMessages
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

.user-name {
  font-size: 16px;
  font-weight: bold;
}

ion-menu {
  z-index: 9999 !important;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.button-container {
  display: flex;
  gap: 10px;
}

ion-content {
  padding-top: 60px;
}

/* 🎯 Carrusel secundario dentro del header */
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
