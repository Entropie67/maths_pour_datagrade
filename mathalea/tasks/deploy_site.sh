#!/bin/bash

# Load environment variables from a .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set paths from environment variables or use defaults
LOCAL_DIST_PATH="${LOCAL_DIST_PATH:-/absolute/path/to/local/dist}"
LOCAL_DOCS_PATH="${LOCAL_DOCS_PATH:-/absolute/path/to/local/docs}"
LOCAL_PUBLIC_PATH="${LOCAL_PUBLIC_PATH:-/absolute/path/to/local/public}"
REMOTE_SERVER="${REMOTE_SERVER:-user@server}"
REMOTE_BUILDS_PATH="${REMOTE_BUILDS_PATH:-~/remote/builds/path}"
REMOTE_DIST_PATH="${REMOTE_DIST_PATH:-~/remote/dist/path}"
REMOTE_STATIC_PATH="${REMOTE_STATIC_PATH:-~/remote/static/path}"
REMOTE_PUBLIC_PATH="${REMOTE_PUBLIC_PATH:-~/remote/public-assets/path}"
REMOTE_DOCS_PATH="${REMOTE_DOCS_PATH:-~/remote/docs/path}"

# Contenu de public/ recopié tel quel par Vite dans dist/ : au lieu de le
# dupliquer dans chaque release, on l'exclut du rsync par release et on le
# lie vers REMOTE_PUBLIC_PATH (partagé entre releases, comme REMOTE_STATIC_PATH)
PUBLIC_TOP_LEVEL_ITEMS=(anki blockly favicon favicon.ico fonts images scratch-blocks sounds styles videos)
PUBLIC_ASSETS_SUBDIRS=(externalJs fonts icons images pdf puzzlesGeom sounds svg)

# Set the new build path
TIMESTAMP=$(date +"%Y_%m_%d_%Hh%Mmin%Ss")
REMOTE_CURRENT_BUILD_PATH="${REMOTE_BUILDS_PATH}/${TIMESTAMP}"

# Build the --exclude arguments so the shared public/ assets aren't re-sent with every release
EXCLUDE_ARGS=()
for item in "${PUBLIC_TOP_LEVEL_ITEMS[@]}"; do
  EXCLUDE_ARGS+=(--exclude "/${item}")
done
for item in "${PUBLIC_ASSETS_SUBDIRS[@]}"; do
  EXCLUDE_ARGS+=(--exclude "/assets/${item}")
done

# Keep the shared public assets directory in sync (persistent across releases)
rsync -avz ${LOCAL_PUBLIC_PATH}/ ${REMOTE_SERVER}:${REMOTE_PUBLIC_PATH}/

# Send files to the remote server (build output only, shared public assets excluded)
rsync -avz "${EXCLUDE_ARGS[@]}" ${LOCAL_DIST_PATH}/ ${REMOTE_SERVER}:${REMOTE_CURRENT_BUILD_PATH}/
rsync -avz ${LOCAL_DOCS_PATH}/ ${REMOTE_SERVER}:${REMOTE_DOCS_PATH}/

# Build the symlink commands pointing the release back at the shared public assets
PUBLIC_LINK_CMDS=""
for item in "${PUBLIC_TOP_LEVEL_ITEMS[@]}"; do
  PUBLIC_LINK_CMDS+="ln -s ${REMOTE_PUBLIC_PATH}/${item} ${REMOTE_CURRENT_BUILD_PATH}/${item} && "
done
for item in "${PUBLIC_ASSETS_SUBDIRS[@]}"; do
  PUBLIC_LINK_CMDS+="ln -s ${REMOTE_PUBLIC_PATH}/assets/${item} ${REMOTE_CURRENT_BUILD_PATH}/assets/${item} && "
done

# Edit the symbolic link to point to the new build
ssh ${REMOTE_SERVER} "${PUBLIC_LINK_CMDS}rm ${REMOTE_DIST_PATH} && \
ln -s ${REMOTE_CURRENT_BUILD_PATH}/ ${REMOTE_DIST_PATH} && \
ln -s ${REMOTE_STATIC_PATH}/ ${REMOTE_DIST_PATH}/static"

echo "Déploiement terminé.\
Le site est disponible dans ${REMOTE_CURRENT_BUILD_PATH} et lié à ${REMOTE_DIST_PATH}.\
Les ressources statiques de public/ sont partagées depuis ${REMOTE_PUBLIC_PATH}.\
Le dossier des statiques ${REMOTE_STATIC_PATH} est lié à ${REMOTE_DIST_PATH}/static.\
La documentation est disponible dans ${REMOTE_DOCS_PATH}."
