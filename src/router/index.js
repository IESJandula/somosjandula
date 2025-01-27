import { createRouter, createWebHistory } from '@ionic/vue-router';
import { ref } from 'vue';
import LoginPage from '@/views/LoginPage.vue';
import MainLayout from '@/components/MainLayout.vue';
import AdminFirebasePage from '@/views/admin/AdminFirebasePage.vue';
import PrintersAdminPage from '@/views/printers/PrintersAdminPage.vue';
import PrintersPrintPage from '@/views/printers/PrintersPrintPage.vue';
import BookingsAdminPage from '@/views/bookings/BookingsAdminPage.vue';
import BookingsFixedPage from '@/views/bookings/BookingsFixedPage.vue';
import AbsencesPage from '@/views/documents/AbsencesPage.vue';
import TeacherGuidePage from '@/views/documents/TeacherGuidePage.vue';
import ITIssuesPage from '@/views/documents/ITIssuesPage.vue';
import { getAuth } from 'firebase/auth';
import { obtenerRolesUsuario } from '@/services/firebaseService';

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
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => 
{
  const auth = getAuth();
  const user = auth.currentUser;

  if (to.matched.some((record) => record.meta.requiresAuth)) 
  {
    if (!user) 
    {
      return next({ 
        name: 'Login' 
      });
    }

    try 
    {
      const isToastOpen = ref(false);
      const toastMessage = ref('');
      const toastColor = ref('success');

      // Obtengo los roles del usuario
      const userRoles = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);

      // Obtengo el role que necesito para ejecutarme aquí
      const requiredRole = to.meta.role;

      if (requiredRole && !userRoles.includes(requiredRole)) 
      {
        return next({ 
          name: 'PrintersPrint' 
        });
      } 
      else 
      {
        return next();
      }
    } 
    catch (error) 
    {
      console.error("Error during navigation guard:", error);
      return next({ 
        name: 'Login' 
      });
    }
  } 
  else 
  {
    return next();
  }
});

export default router;
