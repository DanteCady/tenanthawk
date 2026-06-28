# Tenant Hawk — Setup

The hawk-eye view of your Microsoft 365 & Azure tenant. Sign up → connect a
tenant (read-only) → scan → unlock the full report.

## Stack
Next.js 16 · TypeScript · Tailwind 4 · Better Auth · Kysely + Postgres · Stripe
(Better Auth plugin) · Microsoft Graph (app-only, read-only).

## Run locally (demo mode — no Azure/Stripe needed)

```bash
cp .env.example .env            # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
docker compose up -d            # local Postgres
pnpm install
npx @better-auth/cli migrate -y # auth + subscription tables
docker compose exec -T db psql -U postgres -d tenanthawk < src/db/schema.sql   # app tables
pnpm dev                        # http://localhost:3000
```

Sign up → **Run a demo scan** → see the score + paywall. On the **Billing**
page, the dev tools box lets you simulate Pro/Free to test the unlock UX
(available only when no Stripe key is set).

## Going live

### Database (Supabase)
Swap `DATABASE_URL` to the Supabase **pooler** connection string. Re-run the two
migration commands above. No code changes.

### Microsoft Graph (real connect)
1. Register a **multi-tenant** Entra app. Add **application** Graph permissions
   (read-only): `Directory.Read.All`, `User.Read.All`, `Application.Read.All`,
   `Policy.Read.All`, `Reports.Read.All`, `AuditLog.Read.All`,
   `Organization.Read.All`, `DeviceManagementManagedDevices.Read.All`,
   `SharePointTenantSettings.Read.All`.
2. Add a client secret. Set redirect URI to `${APP_URL}/api/connect/callback`.
3. Set `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_REDIRECT_URI`. The app switches
   out of demo mode automatically. Customers connect via **Connect Microsoft
   365** (admin consent). We store only the tenant ID — tokens are minted on
   demand and never persisted.

### Email (Purelymail SMTP)
1. Create a mailbox (e.g. `alerts@yourdomain.com`) in Purelymail.
2. Set `SMTP_HOST=smtp.purelymail.com`, port `465` (SSL) or `587` (STARTTLS with `SMTP_SECURE=false`).
3. Set `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` to match that mailbox.
4. Branded templates live in `src/lib/email/templates.ts` (instant alerts, weekly digest, test).
1. Create a recurring **Price** for Pro; put its id in `STRIPE_PRICE_PRO`.
2. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Add a webhook to `${APP_URL}/api/auth/stripe/webhook`; put the signing secret
   in `STRIPE_WEBHOOK_SECRET`.
4. The "Unlock full report" / "Upgrade" buttons now run real Checkout, and the
   customer portal opens from **Billing → Manage billing**.

### Scheduled monitoring
`vercel.json` documents the intended schedule: `/api/cron/scan` daily at 07:00 UTC,
`/api/cron/digest` weekly. On non-Vercel hosts, add a crontab entry and call
`./scripts/trigger-cron.sh scan` or `digest` with `CRON_SECRET` set.

Set `CRON_SECRET` so cron routes require `Authorization: Bearer <secret>`.

### AI remediation (OpenAI)
Pro users can expand a finding for **AI-guided fix steps** with links to Microsoft
docs. Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default `gpt-4o-mini`).
Without a key, findings still show the scan engine’s template remediation steps.

## Notable paths
- `src/lib/auth.ts` — Better Auth + Stripe plugin (shared pg pool)
- `src/lib/scan/` — scan engine: `graph.ts`, `checks/`, `score.ts`, `runScan.ts`, `demo.ts`
- `src/app/onboarding/` — connect → scan → results + paywall
- `src/app/dashboard/` — single-pane dashboard + billing
- `src/db/` — Kysely types, pool, `schema.sql`
