#!/bin/bash
# Script to run e2e tests with dev server
# Usage: ./tasks/run-e2e-test.sh [test-config] [timeout-minutes]
# Examples:
#   ./tasks/run-e2e-test.sh consistency      # Run with 5 min timeout
#   ./tasks/run-e2e-test.sh views 10         # Run with 10 min timeout
#   ./tasks/run-e2e-test.sh interactivity

set -e

TEST_CONFIG=${1:-consistency}
TIMEOUT_MINUTES=${2:-5}
TIMEOUT_SECONDS=$((TIMEOUT_MINUTES * 60))

LOG_DIR="/tmp/mathalea-e2e-tests"
mkdir -p "$LOG_DIR"
DEV_LOG="$LOG_DIR/dev-server.log"
TEST_LOG="$LOG_DIR/test-output.log"

echo "=== E2E Test Runner ==="
echo "Test: $TEST_CONFIG"
echo "Timeout: ${TIMEOUT_MINUTES} minutes"
echo ""

# Cleanup function
cleanup() {
  echo ""
  echo "=== Cleaning up ==="
  # Kill dev server
  if [ -n "$DEV_PID" ]; then
    kill $DEV_PID 2>/dev/null || true
  fi
  # Kill any remaining processes on port 5173
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  echo "Done."
}
trap cleanup EXIT

# Kill any existing dev server on port 5173
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Start dev server in background, redirect output to log file
echo "Starting dev server..."
pnpm dev > "$DEV_LOG" 2>&1 &
DEV_PID=$!

# Wait for dev server to be ready
echo "Waiting for dev server to start..."
SERVER_READY=false
for i in {1..60}; do
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "Dev server is ready! (took ${i}s)"
    SERVER_READY=true
    break
  fi
  sleep 1
done

if [ "$SERVER_READY" = false ]; then
  echo "ERROR: Dev server failed to start after 60 seconds"
  echo "Dev server log:"
  cat "$DEV_LOG"
  exit 1
fi

# Run the test with timeout
echo ""
echo "=== Running test: $TEST_CONFIG (timeout: ${TIMEOUT_MINUTES}m) ==="
echo ""

# Use perl for timeout since macOS doesn't have timeout command
# This runs the test and captures output to both file and stdout
perl -e "
  alarm $TIMEOUT_SECONDS;
  exec @ARGV;
" pnpm vitest --config tests/e2e/vitest.config.$TEST_CONFIG.js --run 2>&1 | tee "$TEST_LOG"

EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "=== Test finished ==="
echo "Exit code: $EXIT_CODE"
echo "Test log saved to: $TEST_LOG"
echo "Dev server log: $DEV_LOG"

exit $EXIT_CODE
