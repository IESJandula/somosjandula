// Utilidades para el "selector de rol" del layout principal.
//
// Un usuario puede tener varios roles en su JWT (p.ej. ADMINISTRADOR + DIRECCION).
// El menú del Home no depende de "tener el rol" sino del rol ACTUALMENTE SELECCIONADO.
// Aquí centralizamos: la jerarquía de fuerza de los roles, el nombre visible de cada
// rol, la persistencia en localStorage y la propagación del cambio mediante un evento
// de window (mismo patrón que 'curso-academico-cambiado').

// Clave de localStorage donde se persiste el rol seleccionado.
export const ROL_SELECCIONADO_KEY = "rolSeleccionado";

// Nombre del evento de window que se emite al cambiar de rol (patrón replicado de
// 'curso-academico-cambiado'). El detalle del evento lleva { rol }.
export const EVENTO_ROL_CAMBIADO = "rol-cambiado";

// Orden de prioridad de MAYOR a MENOR "fuerza". El primero es el más fuerte.
// Cualquier rol no listado se considera menos prioritario que estos, pero por
// encima de PROFESOR se resuelve por su posición aquí.
export const ORDEN_PRIORIDAD_ROLES: string[] = [
  "ADMINISTRADOR",
  "DIRECCION",
  "DEPARTAMENTO_INFORMATICA",
  "PROFESOR",
];

// Nombres visibles de cada rol para mostrarlos en el desplegable.
const ETIQUETAS_ROLES: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DIRECCION: "Dirección",
  DEPARTAMENTO_INFORMATICA: "Departamento de Informática",
  PROFESOR: "Profesor",
};

// Devuelve el nombre visible de un rol; si es desconocido, devuelve el propio código.
export function etiquetaRol(rol: string): string {
  return ETIQUETAS_ROLES[rol] ?? rol;
}

// Índice de prioridad de un rol (menor = más fuerte). Los desconocidos van al final.
function indicePrioridad(rol: string): number {
  const indice = ORDEN_PRIORIDAD_ROLES.indexOf(rol);
  return indice === -1 ? ORDEN_PRIORIDAD_ROLES.length : indice;
}

// Fuerza numérica de un rol (mayor = más fuerte). Permite comparaciones jerárquicas
// del tipo "mayor o igual" para la visibilidad acumulativa del menú:
//   ADMINISTRADOR=4 > DIRECCION=3 > DEPARTAMENTO_INFORMATICA=2 > PROFESOR=1
// Un rol desconocido o vacío tiene fuerza 0 (el más restringido).
export function fuerzaRol(rol: string): number {
  if (!rol) {
    return 0;
  }
  return ORDEN_PRIORIDAD_ROLES.length - indicePrioridad(rol);
}

// Ordena la lista de roles del usuario de más fuerte a menos fuerte.
export function ordenarRolesPorPrioridad(roles: string[]): string[] {
  return [...roles].sort((a, b) => indicePrioridad(a) - indicePrioridad(b));
}

// Rol por defecto (el más fuerte) de un conjunto de roles.
export function obtenerRolPorDefecto(roles: string[]): string {
  if (!roles || roles.length === 0) {
    return "";
  }
  return ordenarRolesPorPrioridad(roles)[0];
}

// Devuelve el rol seleccionado válido para el usuario actual:
//  - Si hay uno guardado y sigue perteneciendo a sus roles, se respeta.
//  - En caso contrario se inicializa con el rol por defecto (más fuerte) y se persiste.
export function obtenerRolSeleccionado(roles: string[]): string {
  const guardado = localStorage.getItem(ROL_SELECCIONADO_KEY);
  if (guardado && roles.includes(guardado)) {
    return guardado;
  }

  const porDefecto = obtenerRolPorDefecto(roles);
  if (porDefecto) {
    localStorage.setItem(ROL_SELECCIONADO_KEY, porDefecto);
  }
  return porDefecto;
}

// Persiste el rol seleccionado y notifica al resto de la app mediante el evento window.
export function seleccionarRol(rol: string): void {
  localStorage.setItem(ROL_SELECCIONADO_KEY, rol);
  window.dispatchEvent(new CustomEvent(EVENTO_ROL_CAMBIADO, { detail: { rol } }));
}
