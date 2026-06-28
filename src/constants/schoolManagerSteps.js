export const SCHOOL_MANAGER_STEPS = [
  {
    path: '/school_manager/cursosEtapasEspacios',
    name: 'A_CursosEtapasEspacios',
    label: 'Configuración básica',
  },
  {
    path: '/school_manager/cargaMatriculas',
    name: 'B_CargaMatriculas',
    label: 'Carga de Matriculas',
  },
  {
    path: '/school_manager/asignaturaYBloque',
    name: 'C_AsignaturaYBloque',
    label: 'Asignaturas y bloques',
  },
  {
    path: '/school_manager/crearGrupos',
    name: 'D_CrearGrupos',
    label: 'Creación de grupos',
  },
  {
    path: '/school_manager/tablaResumen',
    name: 'E_TablaResumen',
    label: 'Resumen por asignatura',
  },
  {
    path: '/school_manager/departamentos',
    name: 'F_DepartamentosYHoras',
    label: 'Asignaturas y departamentos',
  },
  {
    path: '/school_manager/reducciones',
    name: 'G_ReduccionesProfesores',
    label: 'Reducciones',
  },
];

export function getSchoolManagerStepIndex(route) {
  const byPath = SCHOOL_MANAGER_STEPS.findIndex((step) => route.path === step.path);
  if (byPath >= 0) return byPath;

  const byName = SCHOOL_MANAGER_STEPS.findIndex((step) => route.name === step.name);
  return byName >= 0 ? byName : -1;
}
