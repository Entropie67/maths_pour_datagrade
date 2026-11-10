#!/bin/sh
# Recopie l'image du site de la forge vers le registry Scaleway, registry à
# registry (sans pull local) : l'image déployée est exactement celle construite
# sur main.
# Usage : copie-image.sh <version>
set -eu

version="$1"
src="${CI_REGISTRY_IMAGE:-registry.apps.education.fr/coopmaths/mathalea}/site:$version"

if [ -z "${SCW_SECRET_KEY:-}" ] || [ -z "${SCW_REGISTRY:-}" ]; then
  echo "DRY-RUN : variables SCW_* absentes, aucune recopie (version $version)"
  exit 0
fi

dst="$SCW_REGISTRY/mathalea:$version"

skopeo copy \
  --src-creds "${CI_REGISTRY_USER:-}:${CI_REGISTRY_PASSWORD:-}" \
  --dest-creds "nologin:$SCW_SECRET_KEY" \
  "docker://$src" "docker://$dst"

echo "OK : $src recopié vers $dst"
