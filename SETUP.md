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
   `Device.Read.All`, `SharePointTenantSettings.Read.All`, `Mail.ReadBasic.All`.
   Optional for PIM standing-access checks: `RoleManagement.Read.Directory`.
   For readable SharePoint site names in
   findings (not pseudonymous hashes), also add `Sites.Read.All` and re-consent.
   For readable Microsoft Teams names in activity findings, add
   `Team.ReadBasic.All` and re-consent.
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
### Stripe (billing)
1. Create a recurring **monthly** Price for Pro ($49/mo); put its id in `STRIPE_PRICE_PRO`.
2. Create a recurring **yearly** Price on the same product ($490/yr — 2 months free vs monthly); put its id in `STRIPE_PRICE_PRO_ANNUAL`.
3. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Add a webhook to `${APP_URL}/api/auth/stripe/webhook`; put the signing secret
   in `STRIPE_WEBHOOK_SECRET`.
5. Checkout shows **Monthly** vs **Annual** on the billing page; Better Auth passes
   `annual: true` when the user picks yearly.
6. **Early bird promo (`EARLYBIRD26`):** 25% off Pro forever, first 20 customers.
   Stripe needs **both** a **Coupon** (the discount rules) and a **Promotion code**
   (the customer-facing code at checkout). If you only created a coupon in the
   dashboard, add a promotion code with code `EARLYBIRD26` linked to that coupon,
   or run:
   ```bash
   node --env-file=.env scripts/stripe-create-founding-promo.mjs
   ```
   (Uses `STRIPE_SECRET_KEY` from `.env` — run separately in test and live.)
   Users enter the code on the billing page before checkout; it applies to monthly
   and annual Pro.

7. **Enterprise (MSP) billing:** Create a separate Stripe Product for Enterprise.
   - Monthly Price **$299/mo** → `STRIPE_PRICE_ENTERPRISE`
   - Yearly Price **$2990/yr** (2 months free vs monthly) → `STRIPE_PRICE_ENTERPRISE_ANNUAL`
   - Checkout: Billing page → Enterprise → `authClient.subscription.upgrade({ plan: "msp" })`
   - Webhook writes `subscription.plan = "msp"` (shown as **Enterprise** in the UI)
   - Starter includes **10 client tenants** (`ENTERPRISE_CLIENT_CAP`, default 10)
   - Manage/cancel via the same Stripe customer portal as Pro

### Scheduled monitoring
`vercel.json` documents the intended schedule: `/api/cron/scan` daily at 07:00 UTC,
`/api/cron/digest` weekly. On non-Vercel hosts, add a crontab entry and call
`./scripts/trigger-cron.sh scan` or `digest` with `CRON_SECRET` set.

Set `CRON_SECRET` so cron routes require `Authorization: Bearer <secret>`.

### Deploy (Lightsail + GitHub Actions)

**One-time server setup** (SSH as ubuntu, then sudo):

```bash
sudo bash scripts/server/bootstrap-lightsail.sh
nano /var/www/tenanthawk/.env   # production secrets — not in git
```

**GitHub → Settings → Environments → `production`** — add secrets:

| Secret | Purpose |
|--------|---------|
| `LIGHTSAIL_HOST` | Static IP (e.g. `98.83.207.89`) |
| `LIGHTSAIL_USER` | `ubuntu` |
| `LIGHTSAIL_SSH_KEY` | Private key (Lightsail default key PEM) |
| All vars from `.env.example` | Used at build time; runtime also reads `/var/www/tenanthawk/.env` on the host |

**Pipelines:**

- **CI** (`.github/workflows/ci.yml`) — lint, typecheck, build on PRs and `main`
- **Deploy** (`.github/workflows/deploy.yml`) — build standalone bundle, rsync to `/var/www/tenanthawk/app`, PM2 restart on push to `main`

Download the Lightsail SSH key under **Account → SSH keys** and paste the full PEM into `LIGHTSAIL_SSH_KEY`.

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
