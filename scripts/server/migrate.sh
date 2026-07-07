#!/usr/bin/env bash
# Apply idempotent app schema migrations on the production host.
# Uses DATABASE_URL from /var/www/tenanthawk/.env (local Postgres on Lightsail).
set -euo pipefail

APP_ROOT="/var/www/tenanthawk"
ENV_FILE="$APP_ROOT/.env"
SCHEMA="${1:-$APP_ROOT/app/db/schema.sql}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "→ DATABASE_URL not set; skipping app schema migration."
  exit 0
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "→ psql not found; skipping app schema migration."
  exit 1
fi

if [[ ! -f "$SCHEMA" ]]; then
  echo "→ Schema file missing at $SCHEMA; skipping app schema migration."
  exit 0
fi

echo "→ Applying app schema from $SCHEMA..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA"
echo "→ App schema up to date."
