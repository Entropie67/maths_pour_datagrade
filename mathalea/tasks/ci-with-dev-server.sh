#!/usr/bin/env bash
# Réserve le serveur Vite à la commande Playwright, puis libère tout son groupe
# de processus (pnpm, Vite, esbuild), y compris en cas d'échec ou d'interruption.
set -euo pipefail

server_pid=''
test_pid=''
server_url="${PLAYWRIGHT_SERVER_URL:-http://localhost:80/alea/}"
server_log="${VITE_SERVER_LOG:-artifacts/ci-vite.log}"
start_timeout="${VITE_START_TIMEOUT:-180}"

stop_group() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  kill -TERM -- "-$pid" 2>/dev/null || true
  for ((attempt = 0; attempt < 30; attempt++)); do
    kill -0 -- "-$pid" 2>/dev/null || break
    sleep 0.1
  done
  kill -KILL -- "-$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
}

cleanup() {
  local status=$?
  trap - EXIT HUP INT TERM
  stop_group "$test_pid"
  stop_group "$server_pid"
  exit "$status"
}

trap cleanup EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

if [ "$#" -eq 0 ]; then
  echo 'Indiquer la commande de test à exécuter.' >&2
  exit 2
fi
command -v setsid >/dev/null
mkdir -p "$(dirname "$server_log")"
setsid pnpm start >"$server_log" 2>&1 &
server_pid=$!
started_at=$SECONDS

until curl --silent --fail --head --max-time 2 "$server_url" >/dev/null; do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "Le serveur Vite s'est arrêté. Voir $server_log." >&2
    exit 1
  fi
  if ((SECONDS - started_at >= start_timeout)); then
    echo "Le serveur Vite n'est pas prêt après ${start_timeout}s. Voir $server_log." >&2
    exit 1
  fi
  sleep 1
done

# Attendre un processus en arrière-plan permet aux traps de s'exécuter dès
# réception du signal, sans attendre la fin de la commande Playwright.
setsid "$@" &
test_pid=$!
wait "$test_pid"
