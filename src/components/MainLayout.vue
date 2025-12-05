<template>
  <ion-app>
    <!-- Menú lateral -->
    <ion-menu content-id="main-content" side="start" id="main-menu">
      <ion-content>
        <ion-list>
          <ion-item v-if="mostrarAdmin" button @click="toggleSubMenuAdmin">
            Administración general
            <ion-icon slot="end" :icon="adminSubmenuVisible ? 'chevron-up-outline' : 'chevron-down-outline'"></ion-icon>
          </ion-item>
          <ion-list v-if="adminSubmenuVisible" class="submenu">
            <ion-item v-if="mostrarAdminFirebase" button @click="navigateAndCloseMenu('/admin/firebase')">Firebase</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/printers/admin')">Impresión</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/bookings/admin')">Reservas</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/projectors/ControlPanel')">Proyectores</ion-item>
            <ion-item button @click="navigateAndCloseMenu('/issues/admin')">Incidencias</ion-item>
          </ion-list>
        </ion-list>
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
    const mostrarAdminFirebase = ref(false);
    const mostrarTimetableAdmin = ref(false);
    const mostrarTimetableTeachers = ref(false);
    const mostrarSchoolManager = ref(false);

    const adminSubmenuVisible = ref(false);
    const timetableAdminSubmenuVisible = ref(false);
    const schoolManagerSubmenuVisible = ref(false);
    const timetableTeachersSubmenuVisible = ref(false);

    const utilitiesSubmenuVisible = ref(false);
    const bookingsSubmenuVisible = ref(false);
    const absencesSubmenuVisible = ref(false);

    const issuesSubmenuVisible = ref(false);

    // Variables para el toast
    const isToastOpen = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('success');

    const desconectar = async () => {
      try {
        const auth = getAuth();
        await signOut(auth);

        // Eliminamos el token de la sesión previa
        localStorage.removeItem(SESSION_JWT_TOKEN) ;

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
      timetableAdminSubmenuVisible.value = false;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
      utilitiesSubmenuVisible.value = false;
      absencesSubmenuVisible.value = false;
      issuesSubmenuVisible.value = false;
    };

    const toggleSubMenuTimetableAdmin = () => {
      adminSubmenuVisible.value = false;
      timetableAdminSubmenuVisible.value = !timetableAdminSubmenuVisible.value;
      timetableTeachersSubmenuVisible.value = false;
      schoolManagerSubmenuVisible.value = false;
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
      utilitiesSubmenuVisible,
      bookingsSubmenuVisible,
      absencesSubmenuVisible,
      issuesSubmenuVisible,
      toggleSubMenuAdmin,
      toggleSubMenuTimetableAdmin,
      toggleSubMenuTimetableTeachers,
      toggleSubMenuSchoolManager,
      toggleSubMenuUtilities,
      toggleSubMenuBookings,
      toggleSubMenuAbsences,
      toggleSubMenuIssues,
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
