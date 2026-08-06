// El endpoint de categorías está restringido a administración en EventsServer.
// Este catálogo replica las categorías fijas que inicializa el backend para que
// las pantallas de profesor puedan representarlas y crear solicitudes.
export const EVENT_CATEGORIES = Object.freeze([
  { nombre: 'Gestión y coordinación académica', color: '#1D4ED8' },
  { nombre: 'Familias y tutorías', color: '#DB2777' },
  { nombre: 'Acogida e inicio de curso', color: '#16A34A' },
  { nombre: 'Actividades culturales y educativas', color: '#DC2626' },
  { nombre: 'Viajes e intercambios', color: '#0284C7' },
  { nombre: 'Pruebas externas', color: '#4F46E5' },
  { nombre: 'Festivos y periodos no lectivos', color: '#64748B' },
  { nombre: 'Convivencia y actos sociales', color: '#9333EA' },
]);
