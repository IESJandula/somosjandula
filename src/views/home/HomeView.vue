<template>
  <div class="page-home">
    <div
      v-for="seccion in secciones"
      :key="seccion.titulo"
      class="home-section-layout"
      :class="{ 'favorites-events-row': seccion.tipo === 'favoritos' }"
    >
      <section class="panel-section">
        <div class="section-header">
          <span class="section-icon-wrap" aria-hidden="true">
            <ion-icon :icon="seccion.icono" class="section-icon" />
          </span>
          <h2 class="section-title">{{ seccion.titulo }}</h2>
        </div>

        <div class="cards-grid">
          <template v-for="item in seccion.items" :key="item.label">
            <!-- Tarjeta especial informativa "SABÍAS QUÉ ...": ocupa 2 columnas y no navega. -->
            <div v-if="item.tipo === 'tip'" class="tip-card">
              <span class="tip-title">SABÍAS QUÉ ...</span>
              <transition name="fade" mode="out-in">
                <span :key="tipKey(item)" class="tip-text">{{ tipTexto(item) }}</span>
              </transition>
            </div>

            <!-- Tarjetas normales de acceso directo. -->
            <component
              v-else
              :is="item.disabled ? 'div' : item.external ? 'a' : item.to ? 'router-link' : 'div'"
              :to="!item.disabled && !item.external ? item.to : undefined"
              :href="!item.disabled && item.external ? item.href : undefined"
              :target="!item.disabled && item.external ? '_blank' : undefined"
              :rel="!item.disabled && item.external ? 'noopener noreferrer' : undefined"
              class="shortcut-card"
              :class="{ 'is-disabled': item.disabled || (!item.to && !item.external) }"
              :aria-disabled="item.disabled || (!item.to && !item.external) ? 'true' : undefined"
              :title="!item.disabled && (item.to || item.external) ? item.label : `${item.label} (próximamente)`"
            >
              <span class="card-icon-wrap">
                <ion-icon :icon="item.icono" class="card-icon" />
              </span>
              <span class="card-label">{{ item.label }}</span>
            </component>
          </template>
        </div>
      </section>

      <WeeklyEventsCard v-if="seccion.tipo === 'favoritos'" />
    </div>
  </div>
</template>

<script setup>
import { IonIcon } from "@ionic/vue";
import { ref, computed, onMounted, onUnmounted } from "vue";
import WeeklyEventsCard from "@/components/home/WeeklyEventsCard.vue";
import { obtenerRolesUsuario, obtenerConstantes } from "@/services/adminService";
import { obtenerRolSeleccionado, EVENTO_ROL_CAMBIADO, fuerzaRol } from "@/utils/roles";
import {
  starOutline,
  printOutline,
  copyOutline,
  calendarOutline,
  alertCircleOutline,
  eyeOutline,
  appsOutline,
  barChartOutline,
  megaphoneOutline,
  calendarNumberOutline,
  shieldCheckmarkOutline,
  peopleOutline,
  briefcaseOutline,
  heartOutline,
  cloudUploadOutline,
  gridOutline,
  peopleCircleOutline,
  documentTextOutline,
  businessOutline,
  timeOutline,
  listOutline,
  checkmarkDoneOutline,
  optionsOutline,
  personOutline,
  logoElectron,
  shieldOutline,
  serverOutline,
  analyticsOutline,
} from "ionicons/icons";

// Rol actualmente SELECCIONADO en el desplegable de perfil (MainLayout.vue).
// El menú del Home depende de este rol, no de "tener el rol".
const rolSeleccionado = ref("");

// Visibilidad JERÁRQUICA/acumulativa según la FUERZA del rol SELECCIONADO: cada rol
// ve su nivel y todo lo inferior. Se compara por rango numérico (fuerzaRol), no con
// igualdades encadenadas. Fuerza: ADMINISTRADOR > DIRECCION > DEPARTAMENTO_INFORMATICA > PROFESOR.
//  - Administración: visible si fuerza >= ADMINISTRADOR (solo admin).
//  - Dirección: visible si fuerza >= DIRECCION (admin o dirección).
//  - Ítem "Imágenes Clonezilla": visible si fuerza >= DEPARTAMENTO_INFORMATICA (admin, dirección o informática).
const mostrarAdmin = computed(
  () => fuerzaRol(rolSeleccionado.value) >= fuerzaRol("ADMINISTRADOR")
);
const mostrarDireccion = computed(
  () => fuerzaRol(rolSeleccionado.value) >= fuerzaRol("DIRECCION")
);
const mostrarDepartamentoInformatica = computed(
  () => fuerzaRol(rolSeleccionado.value) >= fuerzaRol("DEPARTAMENTO_INFORMATICA")
);
const mostrarReprografia = computed(
  () => ["ADMINISTRADOR", "CONSERJERIA"].includes(rolSeleccionado.value)
);

const toastMessage = ref("");
const toastColor = ref("");
const isToastOpen = ref(false);

// Destino DINÁMICO del ítem "Reserva" de Favoritos. Por defecto apunta a reservas
// temporales; si la constante 'bookings.reservasFijasHabilitadas' es "true" pasa a
// reservas fijas. Se resuelve en onMounted leyendo la constante desde el Admin Server.
const reservaTo = ref({ name: "BookingsTemporary" });

// Lee la constante 'bookings.reservasFijasHabilitadas' del proyecto 'bookings' y
// decide el destino del ítem "Reserva". Cualquier fallo (incluido 403 para usuarios
// sin rol ADMINISTRADOR/DIRECCION) cae de forma SILENCIOSA al destino por defecto
// (reservas temporales). Se usan refs de toast desechables para no mostrar avisos ruidosos.
const resolverDestinoReserva = async () => {
  try {
    const silentToastMessage = ref("");
    const silentToastColor = ref("");
    const silentToastOpen = ref(false);

    const constantes = await obtenerConstantes(
      silentToastMessage,
      silentToastColor,
      silentToastOpen,
      "bookings",
      "bookings.reservasFijasHabilitadas"
    );

    const constante = Array.isArray(constantes)
      ? constantes.find((c) => c.clave === "bookings.reservasFijasHabilitadas")
      : null;

    reservaTo.value =
      constante?.valor === "true"
        ? { name: "BookingsFixed" }
        : { name: "BookingsTemporary" };
  } catch {
    // Fallback silencioso: sin permisos o error de red => reservas temporales.
    reservaTo.value = { name: "BookingsTemporary" };
  }
};

// Listas de tips independientes por sección. No comparten textos.
// Favoritos: tips sobre los servicios de esa sección (imprimir, reservar, incidencias,
// vista de pájaro, guardias, horarios...).
const tipsFavoritos = [
  "Imprime tus documentos PDF desde cualquier lugar y dispositivo con la sección «Imprime».",
  "Reserva un aula, carrito u otro recurso con la sección de «Reserva».",
  "¿Algo no funciona? usa la sección de «Incidencias» para que tu problema se resuelva.",
  "Imprime documentos con y sin grapa en la impresora Blanco y Negro.",
  "¿Buscas un profe o aula? Usa la «Vista de pájaro» para encontrarlos fácilmente.",
  "¿Falta algún profe? En «Guardias» podrás ver si tienes hacer alguna sustitución.",
  "Puedes realizar reservas periódicas durante varias semanas consecutivas."
];

// Utilidades: tips sobre estadísticas, avisos, eventos, huelgas, Clonezilla...
const tipsUtilidades = [
  "En «Estadísticas» puedes ver gráficos relacionados con la impresión, reservas e incidencias.",
  "«Alumnado en huelga» te indica los diferentes grupos de alumnos que están en huelga.",
];

// Índices de rotación independientes para cada lista (pueden tener distinta longitud).
const tipIndexFavoritos = ref(0);
const tipIndexUtilidades = ref(0);
const tipFavoritosActual = computed(() => tipsFavoritos[tipIndexFavoritos.value]);
const tipUtilidadesActual = computed(() => tipsUtilidades[tipIndexUtilidades.value]);

// Devuelve el texto/clave de rotación según la fuente de la tarjeta de tips.
const tipTexto = (item) =>
  item.fuente === "utilidades" ? tipUtilidadesActual.value : tipFavoritosActual.value;
const tipKey = (item) =>
  item.fuente === "utilidades" ? `u-${tipIndexUtilidades.value}` : `f-${tipIndexFavoritos.value}`;

let tipInterval = null;

// Reacciona al cambio de rol emitido desde el desplegable de perfil (MainLayout.vue).
const onRolCambiado = (event) => {
  const nuevoRol = event?.detail?.rol;
  if (nuevoRol) {
    rolSeleccionado.value = nuevoRol;
  }
};

onMounted(async () => {
  // Rotación automática de los tips cada 4 segundos; cada lista avanza sobre su longitud.
  tipInterval = setInterval(() => {
    tipIndexFavoritos.value = (tipIndexFavoritos.value + 1) % tipsFavoritos.length;
    tipIndexUtilidades.value = (tipIndexUtilidades.value + 1) % tipsUtilidades.length;
  }, 5000);

  // Escuchamos el cambio de rol para recomponer el menú sin recargar.
  window.addEventListener(EVENTO_ROL_CAMBIADO, onRolCambiado);

  try {
    // Inicializamos el rol seleccionado según lo guardado o la jerarquía de fuerza.
    // Todas las secciones/ítems dependientes de rol (incluido Clonezilla) son computeds
    // reactivas sobre `rolSeleccionado`, así que basta con mantenerlo actualizado.
    const rolesUsuario = await obtenerRolesUsuario(toastMessage, toastColor, isToastOpen);
    rolSeleccionado.value = obtenerRolSeleccionado(rolesUsuario || []);
  } catch (error) {
    console.error("Error al obtener los roles del usuario:", error);
  }

  // Resolvemos el destino dinámico del ítem "Reserva" (no bloquea el resto del Home).
  await resolverDestinoReserva();
});

// Limpiamos el intervalo y el listener al desmontar para evitar fugas de memoria.
onUnmounted(() => {
  if (tipInterval) clearInterval(tipInterval);
  window.removeEventListener(EVENTO_ROL_CAMBIADO, onRolCambiado);
});

const seccionAdministracion = computed(() => ({
  titulo: "Administración",
  icono: shieldCheckmarkOutline,
  items: [
    { label: "Core", icono: heartOutline, to: "/admin/core" },
    { label: "Usuarios y apps", icono: peopleOutline, to: "/admin" },
    { label: "Infra", icono: serverOutline, to: "/admin/infrastructure" },
    { label: "Reservas", icono: calendarOutline, to: "/admin/bookings" },
    { label: "Eventos", icono: calendarNumberOutline, to: "/admin/events" },
    // Huelgas cede peopleOutline a "Usuarios y apps" para no repetir icono dentro de la sección
    { label: "Huelgas", icono: megaphoneOutline, to: "/admin/strikes" },
    { label: "Métricas", icono: analyticsOutline, to: "/admin/metrics" },
  ],
}));

const seccionDireccion = computed(() => ({
  titulo: "Dirección",
  icono: briefcaseOutline,
  items: [
    { label: "1. Carga de matrículas", icono: cloudUploadOutline, to: "/school_manager/cargaMatriculas" },
    { label: "2. Asignaturas y bloques", icono: gridOutline, to: "/school_manager/asignaturaYBloque" },
    { label: "3. Creación de grupos", icono: peopleCircleOutline, to: "/school_manager/crearGrupos" },
    { label: "4. Resumen por asignatura", icono: documentTextOutline, to: "/school_manager/tablaResumen" },
    { label: "5. Asignaturas y departamentos", icono: businessOutline, to: "/school_manager/departamentos" },
    { label: "6. Reducciones", icono: timeOutline, to: "/school_manager/reducciones" },
    { label: "7. Administrar", icono: listOutline, to: "/timetable_admin/admin" },
    { label: "8. Validación de datos", icono: checkmarkDoneOutline, to: "/timetable_admin/validation" },
    { label: "9. Generador de horarios", icono: calendarNumberOutline, to: "/timetable_admin/generator" },
  ],
}));

const seccionFavoritos = computed(() => ({
  titulo: "Favoritos",
  tipo: "favoritos",
  icono: starOutline,
  items: [
    { label: "sabiasQue-favoritos", tipo: "tip", fuente: "favoritos" },
    ...(mostrarReprografia.value
      ? [{ label: "Reprografía", icono: copyOutline, to: { name: "PrintersManagement" } }]
      : []),
    ...(rolSeleccionado.value !== "CONSERJERIA"
      ? [
          { label: "Imprime", icono: printOutline, to: { name: "PrintersPrint" } },
          { label: "Reserva", icono: calendarOutline, to: reservaTo.value },
        ]
      : []),
    { label: "Incidencias", icono: alertCircleOutline, to: { name: "Issues" } },
    { label: "Vista de pájaro", icono: eyeOutline, to: { name: "AutomationsMapView" } },
    { label: "Guardias", icono: shieldOutline, href: "https://guardias.iesjandula.es/", external: true },
  ],
}));

const seccionUtilidades = computed(() => ({
  titulo: "Utilidades",
  icono: appsOutline,
  items: [
    { label: "sabiasQue-utilidades", tipo: "tip", fuente: "utilidades" },
    { label: "Estadísticas", icono: barChartOutline, to: { name: "Statistics" } },
    { label: "Alumnado en huelga", icono: peopleOutline, to: "/strikes/users", disabled: true },
    // Solo visible con rol DEPARTAMENTO_INFORMATICA (mismo texto que MainLayout.vue).
    ...(mostrarDepartamentoInformatica.value
      ? [{ label: "Imágenes Clonezilla", icono: serverOutline, to: "/clonezilla/admin" }]
      : []),
    { label: "Jandu-GPT", icono: logoElectron, to: "/ia", disabled: true },
    { label: "Elección de horarios", icono: optionsOutline, to: "/timetable_teachers/choice", disabled: true },
    { label: "Horario personal", icono: personOutline, to: "/timetable_teachers/personal", disabled: true },
    { label: "Horario de grupos", icono: gridOutline, to: "/timetable_teachers/groups", disabled: true },
  ],
}));

const secciones = computed(() => {
  const visibles = [];

  // Si el usuario tiene el rol de administrador, se muestra la sección de administración.
  if (mostrarAdmin.value) 
  {
    visibles.push(seccionAdministracion.value);
  }
  
  // Se muestra la sección de favoritos.
  visibles.push(seccionFavoritos.value);
  
  // Si el usuario tiene el rol de dirección, se muestra la sección de dirección.
  if (mostrarDireccion.value)
  {
    visibles.push(seccionDireccion.value);
  }
  
  // Se muestra la sección de utilidades.
  visibles.push(seccionUtilidades.value);
  
  return visibles;
});
</script>

<style scoped>
.page-home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1rem 1.5rem;
  font-family: "Roboto", sans-serif;
}

.home-section-layout {
  min-width: 0;
}

.favorites-events-row {
  display: grid;
  grid-template-columns: minmax(440px, 5fr) minmax(620px, 8fr);
  align-items: stretch;
  gap: 1rem;
  margin-bottom: 1rem;
}

.favorites-events-row > .panel-section {
  margin-bottom: 0;
}

.favorites-events-row .cards-grid {
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
}

.page-header {
  margin-bottom: 1rem;
  width: 100%;
  text-align: center;
}

.t-1 {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
}

.page-subtitle {
  margin: 0;
  color: #555;
}

.panel-section {
  background-color: var(--form-bg-light);
  border: 1px solid #cfd8e3;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.08) 0 6px 18px;
  padding: 0.9rem 1.1rem 1.1rem;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.85rem;
}

.section-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(33, 150, 243, 0.12);
  color: #2196f3;
  flex-shrink: 0;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-color-light);
}

.cards-grid {
  display: grid;
  /* `auto-fill` (no `auto-fit`) para que las tarjetas conserven su ancho base y NO se
     estiren a lo ancho cuando una sección tiene pocas tarjetas (p. ej. Utilidades).
     Así todas las secciones renderizan tarjetas del mismo tamaño. */
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.7rem;
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  aspect-ratio: 1 / 1;
  padding: 0.7rem;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.shortcut-card:hover {
  transform: translateY(-3px);
  border-color: #2196f3;
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.18);
}

.card-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2196f3;
}

.card-icon {
  font-size: 30px;
}

.card-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  text-align: center;
  color: #4a5568;
}

/* Tarjeta especial "SABÍAS QUÉ ...": ocupa 2 columnas, altura adaptada al contenido. */
.tip-card {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.85rem 1rem;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.08);
}

.tip-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #2196f3;
}

.tip-text {
  font-size: 0.82rem;
  line-height: 1.35;
  color: #4a5568;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.shortcut-card.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.shortcut-card.is-disabled:hover {
  transform: none;
  border-color: #e2e8f0;
  box-shadow: none;
}

@media (prefers-color-scheme: dark) {
  .page-subtitle { color: #c8c8c8; }

  .panel-section {
    background-color: var(--form-bg-dark);
    border-color: #444;
    box-shadow: rgba(255, 255, 255, 0.06) 0 6px 18px;
  }

  .section-title { color: var(--text-color-dark); }

  .shortcut-card {
    background-color: #2a302b;
    border-color: #555;
  }

  .shortcut-card:hover {
    border-color: #2196f3;
  }

  .card-label { color: #d8dee4; }

  .tip-card {
    background-color: #2a302b;
    border-color: #555;
  }

  .tip-text { color: #d8dee4; }
}

@media (max-width: 1120px) {
  .favorites-events-row {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .page-home { padding-inline: 0.75rem; }
  .t-1 { font-size: 1.45rem; }
  .panel-section { padding: 0.85rem; }
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
  .card-icon { font-size: 28px; }
  /* En pantallas estrechas, la tarjeta de tips ocupa toda la fila de forma elegante. */
  .tip-card { grid-column: 1 / -1; }
}

/* Modo informativo para monitores grandes: se conserva la cabecera global y
   el componente de eventos semanales pasa a ocupar todo el espacio restante. */
@media (min-width: 1600px) and (min-height: 900px) {
  .page-home {
    max-width: none;
    min-height: calc(100dvh - 56px);
    padding: 0;
    overflow: hidden;
  }

  .home-section-layout {
    display: none;
  }

  .home-section-layout.favorites-events-row {
    display: block;
    min-height: calc(100dvh - 56px);
    margin: 0;
  }

  .favorites-events-row > .panel-section {
    display: none;
  }

  .favorites-events-row :deep(.weekly-events-card) {
    min-height: calc(100dvh - 56px);
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
