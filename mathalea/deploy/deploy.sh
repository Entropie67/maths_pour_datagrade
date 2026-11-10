#!/bin/sh
# Bascule un conteneur Serverless sur une version déjà recopiée dans le registry
# Scaleway (voir copie-image.sh). La vérification du site est faite ensuite par
# le job monitor (deploy/smoke.sh).
# Usage : deploy.sh <version> <container_id>
set -eu

version="${1:?usage: deploy.sh <version> <container_id>}"
container_id="${2:?usage: deploy.sh <version> <container_id>}"

if [ -z "${SCW_ACCESS_KEY:-}" ] || [ -z "${SCW_SECRET_KEY:-}" ] || [ -z "${SCW_REGISTRY:-}" ] || [ -z "$container_id" ]; then
  echo "DRY-RUN : variables SCW_* absentes, aucun déploiement (version $version)"
  exit 0
fi

# La version est injectée en variable d'environnement plutôt que gravée dans
# l'image : /health annonce la version déployée sans reconstruction.
# L'argument s'appelle registry-image jusqu'au CLI 2.52 et image à partir
# de la 2.61 : on tente la forme récente, puis l'ancienne.
basculer() {
  scw container container update "$container_id" \
    "$1=$SCW_REGISTRY/mathalea:$version" \
    "environment-variables.APP_VERSION=$version" \
    --wait
}

basculer image || basculer registry-image

echo "OK : conteneur $container_id basculé sur $version"
