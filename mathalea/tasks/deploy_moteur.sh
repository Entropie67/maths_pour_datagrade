#!/bin/bash
# Publie le moteur embarquable (dist-moteur, construit par pnpm build:moteur)
# pour l'app MathALÉA mobile : https://mathalea.fr/releases/
# Mode d'emploi et clés : documentation/developpement/maintenance-moteur/architecture/publication-moteur.md
set -euo pipefail

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

REMOTE_SERVER="${REMOTE_SERVER:-}"
REMOTE_RELEASES_PATH="${REMOTE_RELEASES_PATH:?REMOTE_RELEASES_PATH manquant dans .env (dossier servi à https://mathalea.fr/releases/)}"
MOTEUR_CLE_PRIVEE="${MOTEUR_CLE_PRIVEE:?MOTEUR_CLE_PRIVEE manquant dans .env (clé créée par tasks/cles_moteur.mjs)}"
# Archives gardées sur le serveur : une app peut être en train de télécharger la précédente
ARCHIVES_GARDEES=3

[ -f dist-moteur/manifest.json ] || { echo "dist-moteur absent : lancer pnpm build:moteur" >&2; exit 1; }

# Sans REMOTE_SERVER, dépôt dans un dossier local (essais)
destination="${REMOTE_SERVER:+${REMOTE_SERVER}:}${REMOTE_RELEASES_PATH}"
distant() {
  if [ -n "$REMOTE_SERVER" ]; then ssh "$REMOTE_SERVER" "$1"; else bash -c "$1"; fi
}

publication="$(mktemp -d)"
trap 'rm -rf "$publication"' EXIT
node tasks/publier_moteur.mjs dist-moteur "$publication" "$MOTEUR_CLE_PRIVEE"

distant "mkdir -p ${REMOTE_RELEASES_PATH}"
# L'archive d'abord : une app ne doit jamais lire une annonce dont l'archive manque
rsync -az "$publication"/moteur-*.tar.gz "${destination}/"
rsync -az "$publication/mise-a-jour.json" "$publication/mise-a-jour.json.sig" "${destination}/"
distant "cd ${REMOTE_RELEASES_PATH} && ls -t moteur-*.tar.gz | tail -n +$((ARCHIVES_GARDEES + 1)) | xargs -r rm --"

echo "Moteur $(node -p "require('./dist-moteur/manifest.json').version") publié dans ${destination}."
