#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -z "${N8N_MCP_TOKEN:-}" && -f "$ROOT/.env" ]]; then
  N8N_MCP_TOKEN="$(grep -m1 '^N8N_MCP_TOKEN=' "$ROOT/.env" | cut -d= -f2-)"
  export N8N_MCP_TOKEN
fi

: "${N8N_MCP_TOKEN:?N8N_MCP_TOKEN is not set. Add it to .env or export it in your shell.}"

exec npx -y supergateway \
  --streamableHttp "http://localhost:5680/mcp-server/http" \
  --header "Authorization:Bearer ${N8N_MCP_TOKEN}"
