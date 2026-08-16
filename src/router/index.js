import { createRouter, createWebHistory } from '@ionic/vue-router';
import { ref } from 'vue';
import { getAuth } from 'firebase/auth';
import { obtenerRolesUsuario } from '@/services/adminService';
import { obtenerRolSeleccionado } from '@/utils/roles';

const LoginPage = () => import('@/views/LoginPage.vue');
const MainLayout = () => import('@/components/MainLayout.vue');
const HomeView = () => import('@/views/home/HomeView.vue');
const AccessDeniedPage = () => import('@/views/error/AccessDeniedPage.vue');

// Las vistas se cargan al entrar en su ruta para reducir el bundle inicial.
const UsersAppsAdminPage = () => import('@/views/admin/UsersAppsAdminPage.vue');
const InfrastructureAdminPage = () => import('@/views/admin/InfrastructureAdminPage.vue');
const MetricsAdminPage = () => import('@/views/admin/MetricsAdminPage.vue');
const BookingsAdminPage = () => import('@/views/admin/BookingsAdminPage.vue');
const EventsSchoolAdminPage = () => import('@/views/admin/EventsSchoolAdminPage.vue');
const StrikesSchoolAdminPage = () => import('@/views/admin/StrikesSchoolAdminPage.vue');
const Core = () => import('@/views/admin/Core.vue');

const PrintersPrintPage = () => import('@/views/printers/PrintersPrintPage.vue');
const PrintersManagementPage = () => import('@/views/printers/PrintersManagementPage.vue');
const BookingsFixedPage = () => import('@/views/bookings/BookingsFixedPage.vue');
const BookingsTemporaryPage = () => import('@/views/bookings/BookingsTemporaryPage.vue');
const TeacherGuidePage = () => import('@/views/documents/TeacherGuidePage.vue');

const B_CargaMatriculas = () => import('@/views/school_manager/B_CargaMatriculas.vue');
const C_AsignaturaYBloque = () => import('@/views/school_manager/C_AsignaturaYBloque.vue');
const D_CrearGrupos = () => import('@/views/school_manager/D_CrearGrupos.vue');
const E_TablaResumen = () => import('@/views/school_manager/E_TablaResumen.vue');
const F_DepartamentosYHoras = () => import('@/views/school_manager/F_DepartamentosYHoras.vue');
const G_ReduccionesProfesores = () => import('@/views/school_manager/G_ReduccionesProfesores.vue');

const A_Administracion = () => import('@/views/timetable_admin/A_Administracion.vue');
const B_ValidadorDatos = () => import('@/views/timetable_admin/B_ValidadorDatos.vue');
const C_GeneradorHorarios = () => import('@/views/timetable_admin/C_GeneradorHorarios.vue');
const A_EleccionDeHorarios = () => import('@/views/timetable_teachers/A_EleccionDeHorarios.vue');
const B_HorarioPersonal = () => import('@/views/timetable_teachers/B_HorarioPersonal.vue');
const C_HorarioGrupos = () => import('@/views/timetable_teachers/C_HorarioGrupos.vue');

const LatestNewsPage = () => import('@/views/notifications/LatestNewsPage.vue');
const IncidenciasTicPage = () => import('@/views/issues/IssuesView.vue');
const AutomationsMapView = () => import('@/views/automations/AutomationsMapView.vue');
const ClonezillaImagesAdminPage = () => import('@/views/clonezilla/ClonezillaImagesAdminPage.vue');
const StatisticsView = () => import('@/views/statistics/StatisticsView.vue');
const IAView = () => import('@/views/ia/IAView.vue');
const StrikesSchoolPage = () => import('@/views/strikes/StrikesSchoolPage.vue');

const routes = [
  {
    path: '/',
    redirect: '/home'
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
        path: 'home',
        component: HomeView,
        name: 'Home',
        meta: {
          role: ['PROFESOR', 'CONSERJERIA']
        },
      },
      {
        path: 'admin',
        component: UsersAppsAdminPage,
        name: 'UsersAppsAdmin',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
      {
        path: 'admin/infrastructure',
        component: InfrastructureAdminPage,
        name: 'InfrastructureAdmin',
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
        path: 'printers/management',
        component: PrintersManagementPage,
        name: 'PrintersManagement',
        meta: {
          role: 'CONSERJERIA',
          selectedRole: 'CONSERJERIA'
        },
      },
      {
        path: 'admin/bookings',
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
        path: 'documents/teacherGuide',
        component: TeacherGuidePage,
        name: 'DocumentsTeacherGuidePage',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'admin/core',
        component: Core,
        name: 'CoreAdmin',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
      {
        path: 'school_manager/cargaMatriculas',
        component: B_CargaMatriculas,
        name: 'B_CargaMatriculas',
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
        path: 'school_manager/asignaturaYBloque',
        component: C_AsignaturaYBloque,
        name: 'C_AsignaturaYBloque',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/crearGrupos',
        component: D_CrearGrupos,
        name: 'D_CrearGrupos',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/tablaResumen',
        component: E_TablaResumen,
        name: 'E_TablaResumen',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/departamentos',
        component: F_DepartamentosYHoras,
        name: 'F_DepartamentosYHoras',
        meta: {
          role: 'DIRECCION'
        },
      },
      {
        path: 'school_manager/reducciones',
        component: G_ReduccionesProfesores,
        name: 'G_ReduccionesProfesores',
        meta: {
          role: 'DIRECCION'
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
        path: 'admin/events',
        component: EventsSchoolAdminPage,
        name: 'EventsSchoolAdmin',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
      {
        path: 'issues',
        component: IncidenciasTicPage,
        name: 'Issues',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'automations/map',
        component: AutomationsMapView,
        name: 'AutomationsMapView',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'clonezilla/admin',
        component: ClonezillaImagesAdminPage,
        name: 'ClonezillaImagesAdmin',
        meta: {
          role: 'DEPARTAMENTO_INFORMATICA'
        },
      },
      {
        path: 'statistics',
        component: StatisticsView,
        name: 'Statistics',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'admin/metrics',
        component: MetricsAdminPage,
        name: 'MetricsAdmin',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
      {
        path: 'ia',
        component: IAView,
        name: 'IAView',
        meta: {
          role: 'PROFESOR'
        },
      },
      {
        path: 'admin/strikes',
        component: StrikesSchoolAdminPage,
        name: 'StrikesSchoolAdmin',
        meta: {
          role: 'ADMINISTRADOR'
        },
      },
	  {
		path: '/strikes/users',
		component: StrikesSchoolPage,
		name: 'StrikesSchoolPage',
		meta: {
			role: 'PROFESOR'
		},
	  } 
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

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!user) {
      // GUARDAR URL ORIGINAL
      localStorage.setItem("redirectAfterLogin", to.fullPath)
      return next({ name: 'Login' });
    }

    try {
      const isToastOpen = ref(false);
      const toastMessage = ref('');
      const toastColor = ref('success');

      const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen); // Obtiene los roles del usuario
      // En router.beforeEach, busca esta sección y asegúrate de que maneje arrays:
      const requiredRole = to.meta.role;
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (requiredRoles.length > 0 && !requiredRoles.some(role => userRoles.includes(role))) {
        return next({ name: 'AccessDenied' });
      }
      if (to.meta.selectedRole && obtenerRolSeleccionado(userRoles) !== to.meta.selectedRole) {
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


export default router;
