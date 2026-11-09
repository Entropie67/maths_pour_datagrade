# syntax=docker/dockerfile:1
# Image du site MathALÉA : Node construit le site (premier stage), nginx le
# sert (second stage). En CI, le job build:site la construit avec docker.
# Le contexte de construction est la racine du dépôt, les exclusions sont dans
# Dockerfile.dockerignore à côté de ce fichier :
#   docker build -f deploy/Dockerfile -t mathalea:dev .

# --- Construction du site ---
FROM node:24-alpine AS build
WORKDIR /app
# apigeom est une dépendance installée depuis la forge en git.
RUN apk add --no-cache git && npm install -g pnpm@12.6.0
# Pas de hooks git ni de navigateurs Playwright dans l'image.
ENV HUSKY=0 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
# Fichiers compressés une fois pour toutes : nginx les sert tels quels
# (gzip_static) au lieu de compresser à chaque requête.
RUN find dist -type f -size +1k \( -name '*.js' -o -name '*.mjs' -o -name '*.css' -o -name '*.html' -o -name '*.svg' -o -name '*.json' -o -name '*.wasm' -o -name '*.ttf' -o -name '*.txt' \) \
    -exec sh -c 'for f; do gzip -9 -c "$f" > "$f.gz"; done' sh {} +

# --- Service ---
FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime
# Remplacées dans la configuration au démarrage (dossier /etc/nginx/templates
# de l'image nginx officielle). Le déploiement fixe APP_VERSION au SHA court.
ENV BUCKET_HOST=mathalea-static.s3-website.fr-par.scw.cloud \
    APP_VERSION=dev
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/nginx/entetes.conf /etc/nginx/entetes.conf
COPY --from=build /app/dist /usr/share/nginx/html/alea
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD ["wget", "-qO-", "http://127.0.0.1:8080/health"]
