import { createRouter, createWebHistory } from '@ionic/vue-router';
import { ref } from 'vue';
import LoginPage from '@/views/LoginPage.vue';
import MainLayout from '@/components/MainLayout.vue';
import AdminFirebasePage from '@/views/admin/AdminFirebasePage.vue';
import PrintersAdminPage from '@/views/printers/PrintersAdminPage.vue';
import PrintersPrintPage from '@/views/printers/PrintersPrintPage.vue';
import BookingsAdminPage from '@/views/bookings/BookingsAdminPage.vue';
import BookingsFixedPage from '@/views/bookings/BookingsFixedPage.vue';
import BookingsTemporaryPage from '@/views/bookings/BookingsTemporaryPage.vue';
import AbsencesPage from '@/views/documents/AbsencesPage.vue';
import TeacherGuidePage from '@/views/documents/TeacherGuidePage.vue';
import ITIssuesPage from '@/views/documents/ITIssuesPage.vue';
import AccessDeniedPage from '@/views/error/AccessDeniedPage.vue';
import ControlPanel from '@/views/projectors/ControlPanel.vue';
import RemoteControl from '@/views/projectors/RemoteControl.vue';
import EventsTable from '@/views/projectors/EventsTable.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { obtenerRolesUsuario } from '@/services/firebaseService';
import A_CargaMatriculas from '@/views/school_manager/A_CargaMatriculas.vue';
import B_AsignaturaYBloque from '@/views/school_manager/B_AsignaturaYBloque.vue';
import C_CrearGrupos from '@/views/school_manager/C_CrearGrupos.vue';
import D_TablaResumen from '@/views/school_manager/D_TablaResumen.vue';
import E_DepartamentosYHoras from '@/views/school_manager/E_DepartamentosYHoras.vue';
import F_ReduccionesProfesores from '@/views/school_manager/F_ReduccionesProfesores.vue';
import G_EleccionDeHorarios from '@/views/school_manager/G_EleccionDeHorarios.vue';
import H_ValidadorDatos from '@/views/school_manager/H_ValidadorDatos.vue';
import I_GeneradorHorarios from '@/views/school_manager/I_GeneradorHorarios.vue';
import J_Administracion from '@/views/school_manager/J_Administracion.vue';

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
        path: 'documents/absences',
        component: AbsencesPage,
        name: 'DocumentsAbsences',
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
        path: 'school_manager/cargaMatriculas',
        component: A_CargaMatriculas,
        name: 'A_CargaMatriculas',
        meta: {
          role: 'DIRECCION'
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
        path: 'school_manager_staff/profesores',
        component: G_EleccionDeHorarios,
        name: 'G_EleccionDeHorarios',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'school_manager/validadorDatos',
        component: H_ValidadorDatos,
        name: 'H_ValidadorDatos',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/generadorHorarios',
        component: I_GeneradorHorarios,
        name: 'I_GeneradorHorarios',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/administracion',
        component: J_Administracion,
        name: 'J_Administracion',
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
