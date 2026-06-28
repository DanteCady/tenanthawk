#!/usr/bin/env bash
# Trigger local cron endpoints for QA. Loads CRON_SECRET from .env when set.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^(CRON_SECRET|NEXT_PUBLIC_APP_URL|BETTER_AUTH_URL)=' .env | sed 's/^/export /')
  set +a
fi

BASE="${NEXT_PUBLIC_APP_URL:-${BETTER_AUTH_URL:-http://localhost:3000}}"
BASE="${BASE%/}"

endpoint="${1:-scan}"
case "$endpoint" in
  scan|digest) ;;
  *)
    echo "Usage: $0 [scan|digest]" >&2
    exit 1
    ;;
esac

echo "→ GET ${BASE}/api/cron/${endpoint}"
if [[ -n "${CRON_SECRET:-}" ]]; then
  curl -sS -H "Authorization: Bearer ${CRON_SECRET}" "${BASE}/api/cron/${endpoint}" | (command -v jq >/dev/null && jq . || cat)
else
  curl -sS "${BASE}/api/cron/${endpoint}" | (command -v jq >/dev/null && jq . || cat)
fi
echo
