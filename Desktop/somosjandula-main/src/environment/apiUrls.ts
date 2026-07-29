/**
 * URLs base de los microservicios backend.
 *
 * FUENTE ÚNICA DE VERDAD: la variable de build `VITE_ENVIRONMENT`.
 *   - 'pro'  -> https://pro<servicio>.<dominio>   (producción)
 *   - 'pre'  -> https://pre<servicio>.<dominio>   (preproducción)
 *   - otro   -> desarrollo local: se usan las URLs localhost de `.env.development`.
 *
 * El dominio base es configurable con `VITE_API_DOMAIN` (por defecto
 * `iesjandula.es`). Como Vite hornea estas variables en tiempo de BUILD, basta
 * con definir `VITE_ENVIRONMENT` (y opcionalmente `VITE_API_DOMAIN`) en Dokploy
 * para fijar de golpe todos los hosts, sin repetir una URL por microservicio.
 */

// Entorno de despliegue ('pre' | 'pro'); vacío/otro => desarrollo local.
const environment = (import.meta.env.VITE_ENVIRONMENT as string | undefined)?.trim().toLowerCase()

// Dominio base de los microservicios (sin protocolo).
const apiDomain = ((import.meta.env.VITE_API_DOMAIN as string) || 'iesjandula.es').trim()

// En 'pre'/'pro' los hosts se derivan por convención; en local se usan las URLs explícitas.
const esEntornoDesplegado = environment === 'pre' || environment === 'pro'

/**
 * Slug de host por microservicio. El host se construye como
 * `${environment}${slug}.${apiDomain}` (p. ej. `pro` + `bookings` -> `probookings.iesjandula.es`).
 *
 * NOTA: algunos slugs están PENDIENTES DE CONFIRMAR contra la config real de
 * Dokploy (ver comentarios). Si un microservicio se publica con otro host, basta
 * con cambiar aquí su slug: es el único punto a tocar.
 */
const API_SERVICE_SLUGS = {
  admin: 'admin',
  printers: 'printers',
  bookings: 'bookings',
  issues: 'issues',
  schoolManager: 'schoolmanager', // ? confirmar (spring.application.name: schoolManager)
  notifications: 'notifications',
  events: 'events',
  strikes: 'strikes',
  automations: 'automations',
  imagesCloner: 'imagescloner',   // ? confirmar (spring.application.name: images-cloner)
  audit: 'audits',                // ? confirmar (spring.application.name: audits, en plural)
} as const

type ApiService = keyof typeof API_SERVICE_SLUGS

// URLs localhost para desarrollo (fallback cuando NO hay entorno pre/pro).
const LOCAL_API_URLS: Record<ApiService, string> = {
  admin: import.meta.env.VITE_ADMIN_API_BASE_URL as string,
  printers: import.meta.env.VITE_PRINTERS_API_BASE_URL as string,
  bookings: import.meta.env.VITE_BOOKINGS_API_BASE_URL as string,
  issues: import.meta.env.VITE_ISSUES_API_BASE_URL as string,
  schoolManager: import.meta.env.VITE_SCHOOLMANAGER_API_BASE_URL as string,
  notifications: import.meta.env.VITE_NOTIFICATIONS_API_BASE_URL as string,
  events: import.meta.env.VITE_EVENTS_API_BASE_URL as string,
  strikes: import.meta.env.VITE_STRIKES_API_BASE_URL as string,
  automations: import.meta.env.VITE_AUTOMATIONS_API_BASE_URL as string,
  imagesCloner: import.meta.env.VITE_IMAGES_CLONER_API_BASE_URL as string,
  audit: import.meta.env.VITE_AUDIT_API_BASE_URL as string,
}

/**
 * Resuelve la URL base de un microservicio según el entorno.
 * @param service clave lógica del microservicio
 * @returns URL base sin barra final (las llamadas ya prefijan la ruta con '/')
 */
function resolveApiUrl(service: ApiService): string {
  if (esEntornoDesplegado) {
    return `https://${environment}${API_SERVICE_SLUGS[service]}.${apiDomain}`
  }
  return LOCAL_API_URLS[service]
}

export const bookingsApiUrl = resolveApiUrl('bookings')
export const printersApiUrl = resolveApiUrl('printers')
export const adminApiUrl = resolveApiUrl('admin')
export const schoolManagerApiUrl = resolveApiUrl('schoolManager')
export const notificationsApiUrl = resolveApiUrl('notifications')
export const eventsApiUrl = resolveApiUrl('events')
export const strikesApiUrl = resolveApiUrl('strikes')
export const issuesApiUrl = resolveApiUrl('issues')
export const automationsApiUrl = resolveApiUrl('automations')
export const imagesClonerApiUrl = resolveApiUrl('imagesCloner')
export const auditApiUrl = resolveApiUrl('audit')
