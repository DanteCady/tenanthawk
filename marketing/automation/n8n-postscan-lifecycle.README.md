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

## Status: already created in n8n

The workflow is live in n8n (built via the n8n MCP, not imported):
- **Workflow ID:** `HMWPVqlwGXUmqFaE`
- **URL:** http://localhost:5678/workflow/HMWPVqlwGXUmqFaE
- **Webhook path:** `tenanthawk-scan-completed`

`n8n-postscan-lifecycle.json` is kept as a portable backup/reference only - the
source of truth is now the workflow in n8n. Edit there, or ask Claude to update
it via the MCP.

## Finish setup (the workflow exists but is inactive)

1. **Create the SMTP credential.** In n8n: *Credentials → New → SMTP*. Name it
   exactly **"Tenant Hawk Marketing SMTP"** (use a `marketing.` subdomain /
   separate stream from the app's `alerts@` sender to protect deliverability).
   The 8 email nodes already reference this credential by name - open one and
   confirm it's attached (the MCP created it as a placeholder).
   - Update `fromEmail` on the nodes if you don't use `hello@tenanthawk.io`.
2. **Set the shared secret.** Open the **Verify secret** node and replace
   `REPLACE_WITH_SHARED_SECRET` with a strong random value (`openssl rand -hex 24`).
3. **Activate** the workflow (toggle top-right). Copy the **Production** webhook
   URL from the Webhook node.
4. **Point the app at it.** In the app environment (Vercel):
   ```
   MARKETING_WEBHOOK_URL=https://<your-n8n>/webhook/tenanthawk-scan-completed
   MARKETING_WEBHOOK_SECRET=<the same secret from step 2>
   ```
   Redeploy. Until these are set, `fireMarketingWebhook` is a silent no-op, so
   nothing changes in production prematurely.

> **Reachability caveat:** your n8n is currently on `localhost:5678`. The
> deployed app (Vercel) cannot POST to `localhost`. Either (a) expose n8n with a
> tunnel like `ngrok http 5678` / a public host, and use that URL in
> `MARKETING_WEBHOOK_URL`, or (b) test end-to-end by running the app locally
> (`pnpm dev`) so it can reach local n8n. For production you'll need n8n on a
> publicly reachable URL.

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
