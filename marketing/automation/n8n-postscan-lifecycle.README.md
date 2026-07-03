# Post-Scan Lifecycle - Setup

This wires Tenant Hawk → n8n so every completed scan kicks off the right email
sequence (admin Sequence A, MSP Sequence B), skipping anyone who's already paid.

## How it flows

```
runScan() completes
   └─ fireMarketingWebhook()  (src/lib/marketing/webhook.ts, gated on env var)
        └─ POST {event, plan, isLikelyMsp, user, tenant, scan} → n8n Webhook
             ├─ Verify secret (x-th-signature)
             ├─ Is free plan?            paid → stop
             └─ Is likely MSP?  (>1 connected tenant)
                  ├─ yes → B1 → wait → B2 → wait → B3   (MSP)
                  └─ no  → A1 → wait → A2 → … → A5       (admin)
```

The payload the app sends (compute happens app-side from real scan data):
`plan` (free/pro), `isLikelyMsp`, `user.email`, `user.name`, `tenant.name`,
`scan.score`, `scan.severityHighCount`, `scan.topFinding`,
`scan.licenseWasteMonthly`, `scan.expiringSoonCount`.

## Status: live in n8n (imported 2026-07-03)

- **Workflow ID:** `rDJs4EQrV0DHFsOh`
- **URL:** http://localhost:5680/workflow/rDJs4EQrV0DHFsOh
- **Webhook path:** `tenanthawk-scan-completed`
- **Published:** yes (active)

`n8n-postscan-lifecycle.json` is the portable backup. The live workflow is in n8n;
edit there or via MCP.

## Finish setup (one item left: SMTP)

1. **Create the SMTP credential** (if not done):
   - n8n UI: *Credentials → New → SMTP*, name **Tenant Hawk Marketing SMTP**
   - Host/user/pass from PurelyMail (same server as app alerts; use `hello@tenanthawk.io` as From)
   - Or: add `N8N_API_KEY` to `.env` and run `bash scripts/n8n-create-marketing-smtp.sh`
2. **Attach credential** to the workflow email nodes (open any email node in the
   workflow and pick the credential), or run:
   `CRED_ID=<id> bash scripts/n8n-attach-smtp-to-workflow.sh`
3. **Shared secret** is set in the **Verify secret** node (must match app env).
   Generate with `openssl rand -hex 24` if rotating.
4. **Point production at n8n.** Production (Lightsail) cannot reach `localhost`.
   ngrok is running for now:
   ```
   MARKETING_WEBHOOK_URL=https://<ngrok-host>/webhook/tenanthawk-scan-completed
   MARKETING_WEBHOOK_SECRET=<same as Verify secret node>
   ```
   Add those to `/var/www/tenanthawk/.env` on Lightsail, then `pm2 restart tenanthawk --update-env`.
   GitHub secrets `MARKETING_WEBHOOK_*` are set for CI; runtime uses the server `.env`.
5. **Keep ngrok running** (`ngrok http 5680`) until n8n has a stable public URL.

## Test it

- Run a scan in the app (a demo scan works). The webhook fires on completion.
- In n8n, check the workflow **Executions** - you should see one run, the secret
  verified, and A1 (or B1) sent.
- To test without real email, temporarily point the SMTP node at a catch-all
  inbox (e.g. mailtrap) or read the console (the app logs `[marketing-webhook]`
  if it errors).

## Known limitations / next enhancements

- **No mid-sequence "stop on upgrade."** v1 gates on plan *at scan time*. If a
  user upgrades mid-sequence they may still get a later email. To fix: add an
  HTTP Request node before each send that checks current plan via a small
  app endpoint, and route paid users to the "Skip" branch. Low priority - the
  sequence is short and converters usually disengage.
- **No cross-scan dedupe.** If a free user scans repeatedly, each completed scan
  starts a fresh sequence. Options: only fire on first scan (filter `source` /
  add a "first scan" flag app-side), or dedupe in n8n by email + a 14-day window
  (e.g. a Postgres/Redis/Data-store check at the top of the flow).
- **Sequence C (dormant) and behavioral one-offs** from
  `../lifecycle/post-scan-emails.md` are separate workflows - build them next per
  `n8n-playbook.md` (Workflow 1 covers A & B; C is a daily Cron + DB query).
