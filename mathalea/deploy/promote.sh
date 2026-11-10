#!/bin/sh
# Met en production une version déjà passée par main : pose le tag protégé
# "production" sur le commit, ce qui déclenche le déploiement. Revenir en
# arrière, c'est promouvoir le commit d'avant.
# Les tags protégés ne se déplacent que par l'API : on passe par glab.
# Usage : promote.sh <commit>   (un SHA, ou une référence comme origin/main)
set -eu

ref="${1:?usage: promote.sh <commit>}"
project="coopmaths%2Fmathalea"

git fetch --quiet origin
sha=$(git rev-parse --verify "$ref^{commit}")

# Seul un commit passé par main a une image construite.
if ! git merge-base --is-ancestor "$sha" origin/main; then
  echo "$ref n'est pas sur main : pas d'image à déployer." >&2
  exit 1
fi

glab api -X DELETE "projects/$project/repository/tags/production" >/dev/null 2>&1 || true
glab api -X POST "projects/$project/repository/tags" -f tag_name=production -f ref="$sha" >/dev/null

echo "OK : production -> $(git rev-parse --short=8 "$sha"), déploiement déclenché"
