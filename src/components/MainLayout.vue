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

          <!-- Contenedor de usuario y botón de desconectar -->
          <div class="end-section" slot="end">
            <span v-if="userName" class="user-name">{{ userName }}</span>
            <div class="top-bar">
              <div class="button-container">
                <ion-button @click="desconectar">Desconectar</ion-button>
              </div>
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
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { menuController } from '@ionic/vue'; // Importa el controlador del menú
import { getAuth, signOut } from 'firebase/auth';
import { validarRolesMenu, obtenerNombreYApellidosUsuario } from '@/services/firebaseService';
import { crearToast } from '@/utils/toast';

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
    const adminSubmenuVisible = ref(false);
    const printersSubmenuVisible = ref(false);
    const bookingsSubmenuVisible = ref(false);
    const documentsSubmenuVisible = ref(false);

    // Variables para el toast
    const isToastOpen = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('success');

    const desconectar = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);
        router.replace({ name: 'Login' });
        window.location.reload(); // Forzar la recarga para limpiar cualquier estado residual
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
    };

    const toggleSubMenuPrinters = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = !printersSubmenuVisible.value;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = false;
    };

    const toggleSubMenuBookings = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = !bookingsSubmenuVisible.value;
      documentsSubmenuVisible.value = false;
    };

    const toggleSubMenuDocuments = () => {
      adminSubmenuVisible.value = false;
      printersSubmenuVisible.value = false;
      bookingsSubmenuVisible.value = false;
      documentsSubmenuVisible.value = !documentsSubmenuVisible.value;
    };

    onMounted(async () => {
      try {
        const userInfo = await obtenerNombreYApellidosUsuario(toastMessage, toastColor, isToastOpen);
        userName.value = userInfo.nombre;

        const rolesMenu = await validarRolesMenu(isToastOpen, toastMessage, toastColor);

        mostrarAdmin.value = rolesMenu.mostrarAdmin;
        mostrarPrintersAdmin.value = rolesMenu.mostrarDireccion;
        mostrarBookingsAdmin.value = rolesMenu.mostrarDireccion;
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
      desconectar,
      navigateAndCloseMenu,
      mostrarAdmin,
      mostrarPrintersAdmin,
      mostrarBookingsAdmin,
      adminSubmenuVisible,
      printersSubmenuVisible,
      bookingsSubmenuVisible,
      documentsSubmenuVisible,
      toggleSubMenuAdmin,
      toggleSubMenuPrinters,
      toggleSubMenuBookings,
      toggleSubMenuDocuments,
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
  /* Asegúrate de que sea visible */
}

ion-icon {
  font-size: 24px;
}

.menu-button {
  margin-right: auto;
  /* Empuja el botón de menú hacia la izquierda */
}

ion-toolbar {
  display: flex;
  justify-content: space-between;
  /* Distribuye los elementos entre los extremos */
  align-items: center;
  /* Alinea verticalmente en el centro */
}

.end-section {
  display: flex;
  /* Utiliza flexbox para alinear elementos horizontalmente */
  align-items: center;
  /* Alinea los elementos verticalmente al centro */
  gap: 10px;
  /* Espacio entre el nombre del usuario y el botón de Logout */
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
  /* Alinea los botones a la derecha */
  align-items: center;
  /* Centrar los botones verticalmente */
  padding: 0 10px;
  /* Espacio alrededor del contenido */
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  /* Sombra para dar separación */
}

.button-container {
  display: flex;
  gap: 10px;
  /* Espacio entre los botones */
}

/* Ajuste del contenido principal */
ion-content {
  padding-top: 60px;
  /* Ajusta este valor según la altura de tu toolbar */
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
