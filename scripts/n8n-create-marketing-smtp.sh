#!/usr/bin/env bash
# Create the Tenant Hawk Marketing SMTP credential in n8n via REST API.
# Requires N8N_API_KEY (Settings → n8n API → Create API key) in .env or env.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
N8N_BASE="${N8N_BASE_URL:-http://localhost:5680}"

if [[ -z "${N8N_API_KEY:-}" && -f "$ROOT/.env" ]]; then
  N8N_API_KEY="$(grep -m1 '^N8N_API_KEY=' "$ROOT/.env" | cut -d= -f2- || true)"
fi

if [[ -z "${N8N_API_KEY:-}" ]]; then
  echo "Missing N8N_API_KEY. Add it to .env (from n8n Settings → n8n API)." >&2
  exit 1
fi

for var in SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS; do
  if [[ -z "${!var:-}" ]]; then
    val="$(grep -m1 "^${var}=" "$ROOT/.env" | cut -d= -f2- || true)"
    export "$var=$val"
  fi
done

SMTP_SECURE="${SMTP_SECURE:-true}"
FROM_EMAIL="${MARKETING_FROM_EMAIL:-Tenant Hawk <hello@tenanthawk.io>}"

payload=$(python3 <<PY
import json, os
print(json.dumps({
  "name": "Tenant Hawk Marketing SMTP",
  "type": "smtp",
  "data": {
    "user": os.environ["SMTP_USER"],
    "password": os.environ["SMTP_PASS"],
    "host": os.environ["SMTP_HOST"],
    "port": int(os.environ["SMTP_PORT"]),
    "secure": os.environ.get("SMTP_SECURE", "true").lower() in ("1", "true", "yes"),
    "disableStartTls": False,
  },
}))
PY
)

resp=$(curl -sS -X POST "$N8N_BASE/api/v1/credentials" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$payload")

cred_id=$(python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))" <<<"$resp")

if [[ -z "$cred_id" ]]; then
  echo "Failed to create credential:" >&2
  echo "$resp" >&2
  exit 1
fi

echo "Created SMTP credential: $cred_id"
echo "Attach it to workflow rDJs4EQrV0DHFsOh email nodes in n8n, or run:"
echo "  WORKFLOW_ID=rDJs4EQrV0DHFsOh CRED_ID=$cred_id bash scripts/n8n-attach-smtp-to-workflow.sh"
