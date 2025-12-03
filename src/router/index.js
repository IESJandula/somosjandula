import { createRouter, createWebHistory } from '@ionic/vue-router';
import { ref } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { obtenerRolesUsuario } from '@/services/firebaseService';

import LoginPage from '@/views/LoginPage.vue';
import MainLayout from '@/components/MainLayout.vue';

import AccessDeniedPage from '@/views/error/AccessDeniedPage.vue';

import AdminFirebasePage from '@/views/admin/AdminFirebasePage.vue';

import PrintersAdminPage from '@/views/printers/PrintersAdminPage.vue';
import PrintersPrintPage from '@/views/printers/PrintersPrintPage.vue';

import BookingsAdminPage from '@/views/bookings/BookingsAdminPage.vue';
import BookingsFixedPage from '@/views/bookings/BookingsFixedPage.vue';
import BookingsTemporaryPage from '@/views/bookings/BookingsTemporaryPage.vue';

import AbsencesReviewPage from '@/views/absences/AbsencesReviewPage.vue';
import AbsencesTasksPage from '@/views/absences/AbsencesTasksPage.vue';

import TeacherGuidePage from '@/views/documents/TeacherGuidePage.vue';
import ITIssuesPage from '@/views/documents/ITIssuesPage.vue';
import PDIsTrainingPage from '@/views/documents/PDIsTrainingPage.vue';

import ControlPanel from '@/views/projectors/ControlPanel.vue';
import RemoteControl from '@/views/projectors/RemoteControl.vue';
import EventsTable from '@/views/projectors/EventsTable.vue';

import A_CargaMatriculas from '@/views/school_manager/A_CargaMatriculas.vue';
import B_AsignaturaYBloque from '@/views/school_manager/B_AsignaturaYBloque.vue';
import C_CrearGrupos from '@/views/school_manager/C_CrearGrupos.vue';
import D_TablaResumen from '@/views/school_manager/D_TablaResumen.vue';
import E_DepartamentosYHoras from '@/views/school_manager/E_DepartamentosYHoras.vue';
import F_ReduccionesProfesores from '@/views/school_manager/F_ReduccionesProfesores.vue';

import A_Administracion from '@/views/timetable_admin/A_Administracion.vue';
import B_ValidadorDatos from '@/views/timetable_admin/B_ValidadorDatos.vue';
import C_GeneradorHorarios from '@/views/timetable_admin/C_GeneradorHorarios.vue';

import A_EleccionDeHorarios from '@/views/timetable_teachers/A_EleccionDeHorarios.vue';
import B_HorarioPersonal from '@/views/timetable_teachers/B_HorarioPersonal.vue';
import C_HorarioGrupos from '@/views/timetable_teachers/C_HorarioGrupos.vue';

import LatestNewsPage from '@/views/notifications/LatestNewsPage.vue';
import ManageNotificationsPage from '@/views/notifications/ManageNotificationsPage.vue';
import NotificationsAdminPage from '@/views/notifications/NotificationsAdminPage.vue';

import AutomationsSchoolAdminPage from '@/views/automationsSchool/AutomationsSchoolAdminPage.vue'

const routes = [  
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: LoginPage,
    name: 'Login',
    meta: {
      requiresAuth: false
    },
  },
  {
    path: '/:pathMatch(.*)*',
    component: AccessDeniedPage,
    name: 'AccessDenied',
  },
  {
    path: '/',
    component: MainLayout,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'admin/firebase',
        component: AdminFirebasePage,
        name: 'AdminFirebase',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
      {
        path: 'printers/admin',
        component: PrintersAdminPage,
        name: 'PrintersAdmin',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'printers/print',
        component: PrintersPrintPage,
        name: 'PrintersPrint',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'bookings/admin',
        component: BookingsAdminPage,
        name: 'BookingsAdmin',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'bookings/fixed',
        component: BookingsFixedPage,
        name: 'BookingsFixed',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'bookings/temporary',
        component: BookingsTemporaryPage,
        name: 'BookingsTemporary',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'absences/review',
        component: AbsencesReviewPage,
        name: 'AbsencesReview',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'absences/tasks',
        component: AbsencesTasksPage,
        name: 'AbsencesTasks',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'documents/teacherGuide',
        component: TeacherGuidePage,
        name: 'DocumentsTeacherGuidePage',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'documents/itIssues',
        component: ITIssuesPage,
        name: 'DocumentsITIssuesPage',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'documents/pdisTraining',
        component: PDIsTrainingPage,
        name: 'DocumentsPDIsTrainingPage',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'school_manager/cargaMatriculas',
        component: A_CargaMatriculas,
        name: 'A_CargaMatriculas',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'notifications/latestNews',
        component: LatestNewsPage,
        name: 'LatestNews',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'notifications/manager',
        component: ManageNotificationsPage,
        name: 'ManageNotificationsPage',
        meta: {
          role: 'PROFESOR', 
        },
      },
      {
        path: 'notifications/admin',
        component: NotificationsAdminPage,
        name: 'NotificationsAdminPage',
        meta: {
          role: 'ADMINISTRADOR',
        },
      },
      {
        path: 'school_manager/asignaturaYBloque',
        component: B_AsignaturaYBloque,
        name: 'B_AsignaturaYBloque',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/crearGrupos',
        component: C_CrearGrupos,
        name: 'C_CrearGrupos',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/tablaResumen',
        component: D_TablaResumen,
        name: 'D_TablaResumen',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/departamentos',
        component: E_DepartamentosYHoras,
        name: 'E_DepartamentosYHoras',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/reducciones',
        component: F_ReduccionesProfesores,
        name: 'F_ReduccionesProfesores',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'projectors/ControlPanel',
        component: ControlPanel,
        name: 'ControlPanel',
        meta: { 
          role: 'ADMINISTRADOR' 
        },
      },
      {
        path: 'projectors/RemoteControl',
        component: RemoteControl,
        name: 'RemoteControl',
        meta: { 
          role: 'PROFESOR' 
        },
      },
      {
        path: 'projectors/EventsTable',
        component: EventsTable,
        name: 'EventsTable',
        meta: { 
          role: 'PROFESOR' 
        },
      },
      {
        path: 'timetable_admin/admin',
        component: A_Administracion,
        name: 'A_Administracion',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'timetable_admin/validation',
        component: B_ValidadorDatos,
        name: 'B_ValidadorDatos',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'timetable_admin/generator',
        component: C_GeneradorHorarios,
        name: 'C_GeneradorHorarios',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'timetable_teachers/choice',
        component: A_EleccionDeHorarios,
        name: 'A_EleccionDeHorarios',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'timetable_teachers/personal',
        component: B_HorarioPersonal,
        name: 'B_HorarioPersonal',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'timetable_teachers/groups',
        component: C_HorarioGrupos,
        name: 'C_HorarioGrupos',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'automationsSchool/admin',
        component: AutomationsSchoolAdminPage,
        name: 'AutomationsSchoolAdmin',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  let user = auth.currentUser;

  if (!user) {
    user = await waitForAuthReady(auth); // Espera a que Firebase termine de inicializar el estado de autenticación
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      return next({ name: 'Login' });
    }

    try {
      const isToastOpen = ref(false);
      const toastMessage = ref('');
      const toastColor = ref('success');

      const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen); // Obtiene los roles del usuario
      const requiredRole = to.meta.role;

      // Si la ruta requiere un rol específico y el usuario no lo tiene, redirige a Login o muestra un error.
      if (requiredRole && !userRoles.includes(requiredRole)) {
        return next({ name: 'AccessDenied' });
      }
      else {
        return next(); // Permite el acceso a la ruta solicitada
      }
    }
    catch (error) {
      console.error("Error during navigation guard:", error);
      return next({ name: 'Login' });
    }
  }
  else {
    return next(); // Si no requiere autenticación, continúa normalmente
  }
});


function waitForAuthReady(auth) {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Nos desuscribimos después de obtener el usuario
      resolve(user);
    });
  });
}


export default router;
