# Contenedorización de somosjandula (Docker + Dokploy)

Frontend **Vue 3 + Ionic + Vite** del ecosistema Reaktor. Se despliega como una
SPA de ficheros estáticos servida con **Nginx**. Este documento resume cómo se
construye la imagen y cómo configurarla en Dokploy.

## Datos detectados del proyecto

| Dato | Valor |
|------|-------|
| Framework | Vue 3 + Ionic 8 + Vite 6 |
| Node (build) | 20 (`node:20-alpine`) |
| Script de build | `npm run build` → `vue-tsc && vite build --mode production` |
| Salida del build | `dist/` (estáticos) |
| Servidor runtime | Nginx (`nginx:1.27-alpine`) con fallback SPA |
| Puerto expuesto | `80` (Nginx) |
| Base href | `/` (`VITE_BASE_URL`) |
| Dominio | `prointranet.iesjandula.es` (subdominio `prointranet`) |

> **Vite inyecta la configuración en tiempo de BUILD.** Las variables `VITE_*`
> se "hornean" en el bundle durante `vite build`; NO se leen en runtime. Por eso
> se pasan como **Build Args** en Dokploy. Vite prioriza las `VITE_*` de
> `process.env` sobre los ficheros `.env*`, así que los Build Args siempre ganan.

> **Sin secretos en el repo.** El `Dockerfile` NO contiene valores de Firebase:
> se declaran como `ARG` sin valor y se inyectan desde Dokploy. El fichero base
> `.env` (config Firebase local) está en `.gitignore` y además excluido en
> `.dockerignore`, por lo que nunca entra en la imagen.

## URLs de los microservicios: una sola fuente de verdad

No se define una URL por microservicio. El frontend **deriva** cada host a
partir del entorno (`src/environment/apiUrls.ts`):

```
https://<VITE_ENVIRONMENT><slug-servicio>.<VITE_API_DOMAIN>
```

- `VITE_ENVIRONMENT` = `pro` (producción) o `pre` (preproducción).
- `VITE_API_DOMAIN` = `iesjandula.es` (por defecto).
- Ejemplo: `VITE_ENVIRONMENT=pro` → `bookings` = `https://probookings.iesjandula.es`.

En **desarrollo local** (`npm run dev`, `VITE_ENVIRONMENT=development`) se usan
las URLs `http://localhost:PUERTO` de `.env.development`.

### Mapeo servicio → spring.application.name → slug de host

| Servicio (frontend) | `spring.application.name` | slug host | Host `pro` | Host `pre` |
|---------------------|---------------------------|-----------|------------|------------|
| admin | `admin` | `admin` | `proadmin.iesjandula.es` | `preadmin.iesjandula.es` |
| printers | `printers` | `printers` | `proprinters.iesjandula.es` | `preprinters.iesjandula.es` |
| bookings | `bookings` | `bookings` | `probookings.iesjandula.es` ✅ | `prebookings.iesjandula.es` |
| issues | `issues` | `issues` | `proissues.iesjandula.es` | `preissues.iesjandula.es` |
| schoolManager | `schoolManager` | `schoolmanager` ⚠️ | `proschoolmanager.iesjandula.es` | `preschoolmanager.iesjandula.es` |
| notifications | `notifications` | `notifications` | `pronotifications.iesjandula.es` | `prenotifications.iesjandula.es` |
| events | `events` | `events` | `proevents.iesjandula.es` | `preevents.iesjandula.es` |
| strikes | `strikes` | `strikes` | `prostrikes.iesjandula.es` | `prestrikes.iesjandula.es` |
| automations | `automations` | `automations` | `proautomations.iesjandula.es` | `preautomations.iesjandula.es` |
| imagesCloner | `images-cloner` | `imagescloner` ⚠️ | `proimagescloner.iesjandula.es` | `preimagescloner.iesjandula.es` |
| audit | `audits` (plural) | `audits` ⚠️ | `proaudits.iesjandula.es` | `preaudits.iesjandula.es` |

- ✅ `probookings` confirmado por el usuario. El resto sigue el patrón
  `pro`/`pre` + slug.
- ⚠️ **Pendiente de confirmar** el slug exacto (Dokploy es la fuente real):
  `schoolmanager` (camelCase → minúsculas), `imagescloner` (¿con guion
  `images-cloner`?), `audits` (¿plural o `audit`?). Si algún host difiere, se
  cambia SOLO su `slug` en `API_SERVICE_SLUGS` dentro de `apiUrls.ts`.

## Construir la imagen (local)

Contexto de build = raíz del repo `somosjandula`:

```powershell
docker build `
  --build-arg VITE_ENVIRONMENT=pro `
  --build-arg VITE_FIREBASE_API_KEY=... `
  --build-arg VITE_FIREBASE_AUTH_DOMAIN=... `
  --build-arg VITE_FIREBASE_PROJECT_ID=... `
  --build-arg VITE_FIREBASE_STORAGE_BUCKET=... `
  --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=... `
  --build-arg VITE_FIREBASE_APP_ID=... `
  -t somosjandula:latest .

docker run -d --name somosjandula -p 8080:80 somosjandula:latest   # http://localhost:8080
```

> El build **falla rápido** (fail-fast) si `VITE_ENVIRONMENT` no es `pre`/`pro` o
> si falta algún Build Arg de Firebase obligatorio (solo se listan los NOMBRES
> que faltan, nunca valores).

## Desplegar en Dokploy

Crear una aplicación de tipo **Dockerfile**:

- **Build Type:** Dockerfile · **Dockerfile Path:** `Dockerfile` · **Context:** raíz del repo
- **Container Port:** `80`
- **Dominio:** `prointranet.iesjandula.es` + HTTPS (Let's Encrypt)

### Build Args a configurar en Dokploy

**(a) Entorno / dominio / base** (no sensibles):

| Build Arg | Valor producción | Valor preproducción |
|-----------|------------------|---------------------|
| `VITE_ENVIRONMENT` | `pro` | `pre` |
| `VITE_API_DOMAIN` | `iesjandula.es` | `iesjandula.es` |
| `VITE_BASE_URL` | `/` | `/` |

**(b) Firebase web** (los define el usuario en Dokploy; aquí solo los nombres):

- `VITE_FIREBASE_API_KEY` *(obligatorio)*
- `VITE_FIREBASE_AUTH_DOMAIN` *(obligatorio)*
- `VITE_FIREBASE_PROJECT_ID` *(obligatorio)*
- `VITE_FIREBASE_STORAGE_BUCKET` *(obligatorio)*
- `VITE_FIREBASE_MESSAGING_SENDER_ID` *(obligatorio)*
- `VITE_FIREBASE_APP_ID` *(obligatorio)*
- `VITE_FIREBASE_MEASUREMENT_ID` *(opcional)*
- `VITE_FIREBASE_COLECCION_USUARIOS` *(opcional, marcado DEPRECATED en el código)*

> Ya **no** hace falta definir `VITE_*_API_BASE_URL` en Dokploy: los hosts se
> derivan de `VITE_ENVIRONMENT`. Esas variables solo existen en `.env.development`
> para el desarrollo local.

## CORS

El usuario ya configuró `CORS_ALLOWED_ORIGINS=https://prointranet.iesjandula.es` en
el AdminServer de Dokploy. Si otros microservicios restringen CORS, deben incluir
también ese origen.

## Migración firebase → admin (ya aplicada en el frontend)

Coherente con el backend: `/firebase/...` → `/admin/...` y
`VITE_FIREBASE_API_BASE_URL`/`firebaseApiUrl` → `VITE_ADMIN_API_BASE_URL`/`adminApiUrl`.
Los nombres "Firebase" que permanecen (SDK de Firebase Auth, ruta UI
`/admin/firebase`, `firebaseService.js`, `AdminFirebasePage.vue`) son
intencionados y NO se renombran.
