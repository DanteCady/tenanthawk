#!/usr/bin/env bash
# Attach an SMTP credential to all emailSend nodes in the post-scan workflow.
set -euo pipefail

WORKFLOW_ID="${WORKFLOW_ID:-rDJs4EQrV0DHFsOh}"
CRED_ID="${CRED_ID:?Set CRED_ID to the n8n SMTP credential id}"
CRED_NAME="${CRED_NAME:-Tenant Hawk Marketing SMTP}"
N8N_BASE="${N8N_BASE_URL:-http://localhost:5680}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -z "${N8N_API_KEY:-}" && -f "$ROOT/.env" ]]; then
  N8N_API_KEY="$(grep -m1 '^N8N_API_KEY=' "$ROOT/.env" | cut -d= -f2- || true)"
fi
: "${N8N_API_KEY:?Missing N8N_API_KEY}"

curl -sS "$N8N_BASE/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -o /tmp/wf-current.json

python3 <<PY
import json, os
with open("/tmp/wf-current.json") as f:
    wf = json.load(f)
for node in wf.get("nodes", []):
    if "emailSend" in node.get("type", ""):
        node["credentials"] = {
            "smtp": {"id": os.environ["CRED_ID"], "name": os.environ["CRED_NAME"]}
        }
payload = {
    "name": wf["name"],
    "nodes": wf["nodes"],
    "connections": wf["connections"],
    "settings": wf.get("settings", {}),
}
with open("/tmp/wf-patch.json", "w") as f:
    json.dump(payload, f)
print(f"Patched {sum(1 for n in wf['nodes'] if 'emailSend' in n.get('type',''))} email nodes")
PY

curl -sS -X PUT "$N8N_BASE/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/wf-patch.json \
  -o /tmp/wf-updated.json

python3 -c "import json; d=json.load(open('/tmp/wf-updated.json')); print('Saved workflow:', d.get('name', d))"

if docker ps --format '{{.Names}}' | grep -q '^n8n-enterprise-e2e$'; then
  docker exec n8n-enterprise-e2e n8n publish:workflow --id="$WORKFLOW_ID"
  docker restart n8n-enterprise-e2e >/dev/null
  echo "Republished and restarted n8n."
fi
