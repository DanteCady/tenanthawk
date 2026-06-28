#!/usr/bin/env bash
# Reload env + restart PM2 after a deploy. Runs on the Lightsail host via SSH.
set -euo pipefail

APP_ROOT="/var/www/tenanthawk"
ENV_FILE="$APP_ROOT/.env"
ECOSYSTEM="$APP_ROOT/ecosystem.config.cjs"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

cd "$APP_ROOT/app"

if pm2 describe tenanthawk >/dev/null 2>&1; then
  pm2 restart tenanthawk --update-env
else
  pm2 start "$ECOSYSTEM"
fi

pm2 save

echo "→ tenanthawk running on port ${PORT:-3000}"
