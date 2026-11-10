#!/usr/bin/env bash
# Lance localement les jobs CI consolidés Playwright/ExoModified
# Usage:
#   ./tasks/ci-local.sh [target] [--start-server] [--skip-install]
# Exemples:
#   ./tasks/ci-local.sh exomodified --start-server
#   ./tasks/ci-local.sh console --start-server
#   ./tasks/ci-local.sh caneleve --start-server
#   ./tasks/ci-local.sh pdf --start-server
#   ./tasks/ci-local.sh all --start-server

set -u

TARGETS=()
START_SERVER=false
SKIP_INSTALL=false
SERVER_URL="${CI_LOCAL_SERVER_URL:-}"

for arg in "$@"; do
  case "$arg" in
    --start-server) START_SERVER=true ;;
    --skip-install) SKIP_INSTALL=true ;;
    --server-url=*) SERVER_URL="${arg#*=}" ;;
    -h|--help|help) TARGETS+=("help") ;;
    *) TARGETS+=("$arg") ;;
  esac
done

if [ "${#TARGETS[@]}" -eq 0 ]; then
  TARGETS=("all")
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEV_PID=""
RUN_FAIL=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

RESULTS=()

add_result() {
  local name="$1"
  local status="$2"
  RESULTS+=("$name|$status")
}

print_summary() {
  local ok=0
  local ko=0
  echo ""
  echo "═══════════════════════════════════════════"
  echo "📊 Résumé local CI"
  echo "═══════════════════════════════════════════"

  for line in "${RESULTS[@]}"; do
    local name="${line%%|*}"
    local status="${line##*|}"
    if [ "$status" = "ok" ]; then
      echo -e "${GREEN}✅${NC} $name"
      ok=$((ok + 1))
    else
      echo -e "${RED}❌${NC} $name"
      ko=$((ko + 1))
    fi
  done

  local total=$((ok + ko))
  echo ""
  echo "Résultat global: $ok/$total OK"
  echo "═══════════════════════════════════════════"

  if [ "$ko" -gt 0 ]; then
    RUN_FAIL=1
  fi
}

cleanup() {
  if [ -n "$DEV_PID" ]; then
    echo ""
    echo "Arrêt du serveur local (PID: $DEV_PID)..."
    kill "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

preflight() {
  if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${RED}Erreur: pnpm introuvable.${NC}"
    exit 1
  fi

  if [ "$SKIP_INSTALL" = false ]; then
    echo -e "${BLUE}Installation des dépendances...${NC}"
    NODE_OPTIONS=--max-old-space-size=4096 pnpm install
  fi
}

start_server_if_needed() {
  if [ "$START_SERVER" = false ]; then
    return
  fi

  # Priorité locale: Vite en 5173, puis fallback CI historique
  local url_local="http://localhost:5173"
  local url_ci="http://localhost:80/alea/"
  local probe_url="${SERVER_URL:-$url_local}"
  local fallback_url=""

  if [ "$probe_url" != "$url_ci" ]; then
    fallback_url="$url_ci"
  fi

  echo -e "${BLUE}Démarrage du serveur local...${NC}"
  nohup pnpm start >/tmp/mathalea-ci-local-server.log 2>&1 &
  DEV_PID=$!

  echo "Attente de disponibilité de ${probe_url}..."
  if [ -n "$fallback_url" ]; then
    echo "Fallback activé: ${fallback_url}"
  fi
  local ready=false
  for _ in {1..45}; do
    if curl --output /dev/null --head --fail "$probe_url" 2>/dev/null; then
      ready=true
      break
    fi
    if [ -n "$fallback_url" ] && curl --output /dev/null --head --fail "$fallback_url" 2>/dev/null; then
      ready=true
      break
    fi
    sleep 2
  done

  if [ "$ready" = false ]; then
    echo -e "${RED}Le serveur n'est pas prêt.${NC}"
    echo "Log: /tmp/mathalea-ci-local-server.log"
    exit 1
  fi

  echo -e "${GREEN}Serveur prêt.${NC}"
}

run_cmd() {
  local label="$1"
  shift

  echo ""
  echo -e "${BLUE}🧪 $label${NC}"
  if "$@"; then
    add_result "$label" ok
  else
    add_result "$label" ko
  fi
}

report_contains_changed_exercise_issues() {
  local report_file="$1"
  local changed_files="$2"
  local offenders=""

  if [ ! -f "$report_file" ]; then
    echo "Rapport introuvable: $report_file"
    return 1
  fi

  while IFS= read -r file; do
    [ -z "$file" ] && continue
    case "$file" in
      src/exercices/*.ts|src/exercices/*.js)
        if grep -Fq "[$file](" "$report_file"; then
          offenders="${offenders}${file}\n"
        fi
        ;;
    esac
  done <<EOF
$changed_files
EOF

  if [ -n "$offenders" ]; then
    echo "Fichiers modifiés présents dans le rapport d'issues:"
    printf '%b' "$offenders"
    return 0
  fi

  return 1
}

run_console_group() {
  local changed_files
  changed_files="$(compute_changed_files)"

  echo ""
  echo "📋 Fichiers modifiés détectés (console):"
  echo "$changed_files"

  run_cmd "console: CHANGED_FILES" env CHANGED_FILES="$changed_files" pnpm test:e2e:console_errors
}

run_caneleve_group() {
  run_cmd "caneleve: views" pnpm test:e2e:views
  run_cmd "caneleve: consistency" pnpm test:e2e:consistency
  run_cmd "caneleve: interactivity" pnpm test:e2e:interactivity
}

compute_changed_files() {
  local commit_count
  local max_commits=5
  local diff_base

  commit_count="$(git rev-list --count HEAD)"

  if [ "$commit_count" -lt "$max_commits" ]; then
    diff_base="HEAD~$((commit_count - 1))"
  else
    diff_base="HEAD~$max_commits"
  fi

  if git rev-parse --verify "$diff_base" >/dev/null 2>&1; then
    git diff --name-only "$diff_base"..HEAD
  else
    git diff --name-only "${CI_COMMIT_BEFORE_SHA:-HEAD~1}" "${CI_COMMIT_SHA:-HEAD}"
  fi
}

run_exomodified_group() {
  local changed_files
  changed_files="$(compute_changed_files)"

  echo ""
  echo "📋 Fichiers modifiés détectés:"
  echo "$changed_files"

  run_cmd "exomodified: console_errors" env CHANGED_FILES="$changed_files" pnpm test:e2e:console_errors
  run_cmd "exomodified: all_exercises_vitest" env CI=1 CHANGED_FILES="$changed_files" pnpm vitest --config tests/e2e/vitest.config.all_exercises.js --run
  run_cmd "exomodified: interactivity_all" env CHANGED_FILES="$changed_files" pnpm vitest tests/integration/interactivity_all.test.ts --run

  echo ""
  echo -e "${BLUE}🧪 exomodified: report-interactif${NC}"
  if INTERACTIF_REPORT=1 CHANGED_FILES="$changed_files" pnpm vitest src/lib/amc/report-interactif.test.ts --run; then
    if report_contains_changed_exercise_issues "reports/interactif-report.md" "$changed_files"; then
      echo -e "${RED}Le rapport interactif contient des exercices modifiés en issue.${NC}"
      add_result "exomodified: report-interactif" ko
    else
      add_result "exomodified: report-interactif" ok
    fi
  else
    add_result "exomodified: report-interactif" ko
  fi

  echo ""
  echo -e "${BLUE}🧪 exomodified: report-amcnum${NC}"
  if AMCNUM_REPORT=1 CHANGED_FILES="$changed_files" pnpm vitest src/lib/amc/report-amcnum.test.ts --run; then
    if report_contains_changed_exercise_issues "reports/amcnum-report.md" "$changed_files"; then
      echo -e "${RED}Le rapport AMCNum contient des exercices modifiés en issue.${NC}"
      add_result "exomodified: report-amcnum" ko
    else
      add_result "exomodified: report-amcnum" ok
    fi
  else
    add_result "exomodified: report-amcnum" ko
  fi
}

run_pdf_group() {
  local changed_files
  changed_files="$(compute_changed_files)"

  if ! command -v lualatex >/dev/null 2>&1; then
    echo -e "${YELLOW}Avertissement: lualatex introuvable (les tests PDF peuvent échouer).${NC}"
  fi

  echo ""
  echo "📋 Fichiers modifiés détectés (pdf):"
  echo "$changed_files"

  run_cmd "pdf: CHANGED_FILES" env CHANGED_FILES="$changed_files" pnpm test:e2e:pdfexports
}

run_pdf_dnb_group() {
  run_cmd "pdf-dnb: 2013-2015" env NIV="dnb_2013^dnb_2014^dnb_2015" pnpm test:e2e:pdfexports
  run_cmd "pdf-dnb: 2016-2019" env NIV="dnb_2016^dnb_2017^dnb_2018^dnb_2019" pnpm test:e2e:pdfexports
  run_cmd "pdf-dnb: 2020-2024" env NIV="dnb_2020^dnb_2021^dnb_2022^dnb_2023^dnb_2024" pnpm test:e2e:pdfexports
}

run_pdf_bac_group() {
  run_cmd "pdf-bac: e3c_2021-2024" env NIV="e3c_2024^e3c_2023^e3c_2022^e3c_2021" pnpm test:e2e:pdfexports
  run_cmd "pdf-bac: bac_2021-2024" env NIV="bac_2024^bac_2023^bac_2022^bac_2021" pnpm test:e2e:pdfexports
}

usage() {
  cat <<EOF
Usage: ./tasks/ci-local.sh [target ...] [--start-server] [--skip-install]

Targets:
  console       Rejoue playwright-console-consolidated
  caneleve      Rejoue playwright-caneleve-consolidated
  exomodified   Rejoue testExosModifiedConsolidated
  pdf           Rejoue playwright-pdf-consolidated
  pdf-dnb       Rejoue playwright-pdf-dnb-consolidated
  pdf-bac       Rejoue playwright-pdf-bac-consolidated
  all           Lance tous les groupes ci-dessus

Exemples:
  ./tasks/ci-local.sh console pdf exomodified --start-server --skip-install
  ./tasks/ci-local.sh all --start-server

Options:
  --start-server   Démarre pnpm start et attend le serveur (défaut: http://localhost:5173)
  --skip-install   N'exécute pas pnpm install
  --server-url=URL URL de healthcheck serveur (défaut local: http://localhost:5173)

Variable d'environnement:
  CI_LOCAL_SERVER_URL=URL  Définit l'URL de healthcheck (prioritaire sur le défaut)
EOF
}

main() {
  local target
  local expanded_targets=()

  for target in "${TARGETS[@]}"; do
    case "$target" in
      -h|--help|help)
        usage
        exit 0
        ;;
      all)
        expanded_targets+=("console" "caneleve" "exomodified" "pdf" "pdf-dnb" "pdf-bac")
        ;;
      console|caneleve|exomodified|pdf|pdf-dnb|pdf-bac)
        expanded_targets+=("$target")
        ;;
      *)
        echo -e "${RED}Target inconnu: $target${NC}"
        usage
        exit 2
        ;;
    esac
  done

  preflight
  start_server_if_needed

  for target in "${expanded_targets[@]}"; do
    case "$target" in
      console)
        run_console_group
        ;;
      caneleve)
        run_caneleve_group
        ;;
      exomodified)
        run_exomodified_group
        ;;
      pdf)
        run_pdf_group
        ;;
      pdf-dnb)
        run_pdf_dnb_group
        ;;
      pdf-bac)
        run_pdf_bac_group
        ;;
    esac
  done

  print_summary

  if [ "$RUN_FAIL" -ne 0 ]; then
    exit 1
  fi
}

main
