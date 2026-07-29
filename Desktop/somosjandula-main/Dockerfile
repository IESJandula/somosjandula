# =============================================================================
# Dockerfile multi-stage STANDALONE para el frontend somosjandula (para Dokploy)
# -----------------------------------------------------------------------------
# App Vue 3 + Ionic + Vite (NO es Spring Boot: no hay application.yaml). El
# resultado del build es una SPA de ficheros estaticos (carpeta dist/) que se
# sirve con Nginx.
#
# IMPORTANTE sobre la configuracion (Vite inyecta en tiempo de BUILD):
#   En Vite, las variables VITE_* se "hornean" en el bundle durante `vite build`,
#   NO en tiempo de ejecucion. Por eso se pasan como Build Args / ENV en la etapa
#   builder y Vite las prioriza por encima de los ficheros .env* del repo
#   (Vite da preferencia a las VITE_* presentes en process.env).
#
#   URLs de los microservicios (fuente unica de verdad):
#     No se define una URL por microservicio. El frontend deriva cada host desde
#     VITE_ENVIRONMENT ('pre' | 'pro') como:
#         https://<VITE_ENVIRONMENT><servicio>.<VITE_API_DOMAIN>
#     (p. ej. VITE_ENVIRONMENT=pro -> https://probookings.iesjandula.es).
#     Ver src/environment/apiUrls.ts.
#
#   SIN SECRETOS EN ESTE FICHERO:
#     La config de Firebase web se declara como ARG SIN valor. Sus valores se
#     definen EN DOKPLOY (Build Args) y se inyectan al construir. Al ser build
#     multi-stage, ningun Build Arg de la etapa "builder" queda en la imagen
#     final servida por Nginx.
#
#   Comando de build (PowerShell), contexto = raiz del repo somosjandula:
#       docker build `
#         --build-arg VITE_ENVIRONMENT=pro `
#         --build-arg VITE_FIREBASE_API_KEY=xxxx `
#         --build-arg VITE_FIREBASE_AUTH_DOMAIN=xxxx `
#         --build-arg VITE_FIREBASE_PROJECT_ID=xxxx `
#         --build-arg VITE_FIREBASE_STORAGE_BUCKET=xxxx `
#         --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx `
#         --build-arg VITE_FIREBASE_APP_ID=xxxx `
#         -t somosjandula:latest .
# =============================================================================

# -----------------------------------------------------------------------------
# Etapa 1: builder (Node 20) -> instala dependencias y compila la SPA (dist/)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# --- Entorno de despliegue: 'pre' (preproduccion) o 'pro' (produccion) ---------
# Unica fuente de verdad para los hosts de todos los microservicios.
ARG VITE_ENVIRONMENT=pro
ARG VITE_API_DOMAIN=iesjandula.es

# --- Ruta base de la SPA (base href). "/" al servir en su propio subdominio ----
ARG VITE_BASE_URL=/

# --- Config de Firebase web -> SE DEFINE EN DOKPLOY (Build Args) ---------------
# Declaradas SIN valor a proposito: este fichero NO debe contener secretos ni
# credenciales. Dokploy inyecta sus valores en tiempo de build.
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIREBASE_COLECCION_USUARIOS

# Promovemos los Build Args a variables de entorno para que Vite (que prioriza
# las VITE_* de process.env sobre los .env*) las inyecte en el bundle.
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT \
    VITE_API_DOMAIN=$VITE_API_DOMAIN \
    VITE_BASE_URL=$VITE_BASE_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID \
    VITE_FIREBASE_COLECCION_USUARIOS=$VITE_FIREBASE_COLECCION_USUARIOS

# Validacion fail-fast: aborta el build si la configuracion es incompleta.
# Solo se imprimen NOMBRES de variables, nunca sus valores (no se filtran secretos).
RUN set -e; \
    case "$VITE_ENVIRONMENT" in \
      pre|pro) ;; \
      *) echo "ERROR: VITE_ENVIRONMENT debe ser 'pre' o 'pro' (recibido: '$VITE_ENVIRONMENT')"; exit 1 ;; \
    esac; \
    missing=""; \
    for v in VITE_FIREBASE_API_KEY VITE_FIREBASE_AUTH_DOMAIN VITE_FIREBASE_PROJECT_ID \
             VITE_FIREBASE_STORAGE_BUCKET VITE_FIREBASE_MESSAGING_SENDER_ID VITE_FIREBASE_APP_ID; do \
      eval "val=\$$v"; \
      [ -z "$val" ] && missing="$missing $v"; \
    done; \
    if [ -n "$missing" ]; then \
      echo "ERROR: faltan Build Args de Firebase (defínelos en Dokploy):$missing"; \
      exit 1; \
    fi

# Instalamos dependencias primero (mejor cacheo de capas). El repo NO versiona
# package-lock.json (gitignored), por eso usamos `npm install` en lugar de
# `npm ci`, que exige lockfile.
COPY package.json ./
RUN npm install --no-audit --no-fund

# Copiamos el resto del proyecto y compilamos la SPA de produccion.
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# Etapa 2: runtime (Nginx ligero) -> sirve los estaticos de dist/
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Config de Nginx con fallback SPA (todas las rutas -> index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Estaticos compilados
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx escucha en el puerto 80 (es el que debe exponer/mapear Dokploy)
EXPOSE 80

# La imagen base de nginx ya define el CMD adecuado (nginx -g 'daemon off;')
