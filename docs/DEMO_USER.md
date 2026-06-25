# Demo User

A pre-seeded, **full-access (Pro)** account for demos and testing. It comes with
a connected demo tenant and a completed scan, so the dashboard is fully
populated — including the unlocked findings list.

## Credentials

| | |
|---|---|
| **URL** | http://localhost:3000/login |
| **Email** | `demo@tenanthawk.app` |
| **Password** | `TenantHawk!Demo1` |
| **Plan** | Pro (full access) |
| **Tenant** | Contoso (demo) — seeded sample findings |

> These are local/development credentials. Do **not** reuse this password for any
> real or production account.

## What the demo user can see

- A populated **dashboard** (`/dashboard`): health score ~72, trend sparkline,
  KPI tiles, the four category grade cards, and the **full findings table** with
  severity, dollar impact, and step-by-step remediation (no paywall, because the
  account is Pro).
- The **billing page** (`/dashboard/billing`) showing the Pro plan. In local dev
  (no Stripe configured) a "Dev tools" box lets you toggle Pro/Free to test the
  paywall both ways.

## How to (re)create it

The dev server must be running, then:

```bash
pnpm dev          # in one terminal
pnpm seed         # in another
```

`scripts/seed.mjs` is **idempotent**: it signs the user up (or signs in if they
already exist), connects a demo tenant + runs a scan, and grants Pro. It prints
the credentials at the end.

### Customize

Override via env vars:

```bash
SEED_EMAIL=you@example.com SEED_PASSWORD='Sup3r!Secret' APP_URL=http://localhost:3000 pnpm seed
```

## How "full access" is granted

The seed calls `POST /api/dev/plan { "plan": "pro" }`, which writes an active
`pro` row into the Better Auth `subscription` table. Entitlement checks
(`lib/entitlements.ts → getPlan/isPro`) read that table, so the app treats the
user as Pro everywhere.

> `/api/dev/plan` is **dev-only** — it returns 404 in production or once
> `STRIPE_SECRET_KEY` is set. With real Stripe configured, upgrade through the
> Billing page (Stripe Checkout) instead.

## Reset / remove

```bash
# downgrade to Free (keeps the account + scan)
curl -X POST http://localhost:3000/api/dev/plan \
  -H "Content-Type: application/json" -H "Origin: http://localhost:3000" \
  -d '{"plan":"free"}' -b <session-cookie>

# or wipe everything and start clean
docker compose down -v && docker compose up -d
npx @better-auth/cli migrate -y
docker compose exec -T db psql -U postgres -d tenanthawk < src/db/schema.sql
```

## Notes

- API POSTs to Better Auth require an `Origin` header (CSRF protection) — the
  seed script sends it; keep that in mind if you script logins yourself.
- The demo tenant uses deterministic sample findings from `src/lib/scan/demo.ts`,
  so the score and issues are stable across re-scans.
