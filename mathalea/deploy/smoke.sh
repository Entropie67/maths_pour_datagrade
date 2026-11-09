#!/bin/sh
# Vérifie qu'un déploiement répond comme coopmaths.fr aujourd'hui.
# Usage : smoke.sh <url de base> [version attendue]
# Écrit pour le wget de busybox (image scaleway/cli), fonctionne aussi avec GNU wget.
set -eu

base="${1:?usage: smoke.sh <url> [version]}"
version="${2:-}"

page() { wget -q -O - "$base$1"; }
ok() { echo "ok  $1"; }
ko() { echo "KO  $1 : $2" >&2; exit 1; }

health=$(page /health) || ko /health "pas de réponse"
echo "$health" | grep -q '"status":"ok"' || ko /health "$health"
if [ -n "$version" ]; then
  echo "$health" | grep -q "\"version\":\"$version\"" || ko /health "version attendue $version, reçu $health"
fi
ok "/health $health"

page /alea/ | grep -q '/alea/assets/' || ko /alea/ "index.html sans assets"
ok /alea/

page /alea/static/dnb/2013/tex/png/dnb_2013_04_pondichery_1.png >/dev/null || ko /alea/static/ "scan dnb 2013 inaccessible"
ok "/alea/static/ (scan dnb 2013)"

# La racine : l'application sur un nom mathalea (staging.mathalea.education-nationale.eu,
# mathalea.fr), la vitrine partout ailleurs, avec son lien MathALÉA réécrit en
# /alea. wget suit les redirections : on regarde la page où l'on arrive.
racine=$(page /) || ko / "pas de réponse"
case "$base" in
  *://mathalea.*|*://*.mathalea.*)
    echo "$racine" | grep -q '/alea/assets/' || ko / "la racine ne mène pas à l'application"
    ok "/ (renvoyée vers /alea/)" ;;
  *)
    echo "$racine" | grep -q '_astro/' || ko / "la racine n'affiche pas la vitrine"
    if echo "$racine" | grep -q 'https://coopmaths.fr/alea'; then ko / "le lien MathALÉA pointe encore sur coopmaths.fr"; fi
    ok "/ (vitrine)"
    # L'ancienne adresse de la vitrine est renvoyée vers la racine.
    page /www/ | grep -q '_astro/' || ko /www/ "l'ancienne adresse ne mène plus à la vitrine"
    ok "/www/ (renvoyée vers /)" ;;
esac

echo "OK : $base répond"
