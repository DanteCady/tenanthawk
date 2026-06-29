# Post-Scan Lifecycle — Setup

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

## Setup (one time)

1. **Import the workflow.** In n8n: *Workflows → Import from File →*
   `n8n-postscan-lifecycle.json`.
2. **Set up SMTP credentials.** Create an SMTP credential (ideally a `marketing.`
   subdomain / separate stream from the app's `alerts@` sender to protect
   deliverability). Open each red "A#/B#" email node and select it — they all
   reference one credential named **"Tenant Hawk Marketing SMTP"**.
   - Update `fromEmail` on the nodes if you don't use `hello@tenanthawk.io`.
3. **Set the shared secret.** Open the **Verify secret** node and replace
   `REPLACE_WITH_SHARED_SECRET` with a strong random value (`openssl rand -hex 24`).
4. **Activate** the workflow (toggle top-right). Copy the **Production** webhook
   URL from the Webhook node.
5. **Point the app at it.** In the app environment (Vercel):
   ```
   MARKETING_WEBHOOK_URL=https://<your-n8n>/webhook/tenanthawk-scan-completed
   MARKETING_WEBHOOK_SECRET=<the same secret from step 3>
   ```
   Redeploy. Until these are set, `fireMarketingWebhook` is a silent no-op, so
   nothing changes in production prematurely.

## Test it

- Run a scan in the app (a demo scan works). The webhook fires on completion.
- In n8n, check the workflow **Executions** — you should see one run, the secret
  verified, and A1 (or B1) sent.
- To test without real email, temporarily point the SMTP node at a catch-all
  inbox (e.g. mailtrap) or read the console (the app logs `[marketing-webhook]`
  if it errors).

## Known limitations / next enhancements

- **No mid-sequence "stop on upgrade."** v1 gates on plan *at scan time*. If a
  user upgrades mid-sequence they may still get a later email. To fix: add an
  HTTP Request node before each send that checks current plan via a small
  app endpoint, and route paid users to the "Skip" branch. Low priority — the
  sequence is short and converters usually disengage.
- **No cross-scan dedupe.** If a free user scans repeatedly, each completed scan
  starts a fresh sequence. Options: only fire on first scan (filter `source` /
  add a "first scan" flag app-side), or dedupe in n8n by email + a 14-day window
  (e.g. a Postgres/Redis/Data-store check at the top of the flow).
- **Sequence C (dormant) and behavioral one-offs** from
  `../lifecycle/post-scan-emails.md` are separate workflows — build them next per
  `n8n-playbook.md` (Workflow 1 covers A & B; C is a daily Cron + DB query).
