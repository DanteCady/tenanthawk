# Tenant Hawk — Cursor Handoff

A complete context dump for picking this project up in Cursor (or any editor /
AI assistant). Read this first, then `SETUP.md` for environment specifics.

---

## 1. What this is

**Tenant Hawk** is a micro-SaaS: a "CleanMyMac for Microsoft 365 / Azure." A
company connects their tenant (read-only), we scan it, and surface **one health
score** plus a prioritized fix-it list across four categories — **Security,
Cost, Reliability, Hygiene**.

**Product flow:** land → sign up → connect tenant (admin consent, read-only) →
scan → paywall → dashboard. Time-to-value target: **under 5 minutes.**

**Business model:** Free (score + grades + counts) → **Pro $49/tenant/mo**
(full findings, $ impact, remediation, monitoring) → MSP (custom, multi-tenant).
The paywall sits right after the first scan.

---

## 2. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | route handlers run Node runtime |
| Language | TypeScript | strict |
| Styling | **Tailwind CSS v4** | tokens in `src/app/globals.css` via `@theme inline` |
| Animation | framer-motion | |
| Icons | lucide-react | |
| Auth | **Better Auth** (email/password) | `@better-auth/stripe` plugin |
| DB | **Postgres via Kysely** (`pg` Pool) | local Docker now → Supabase later |
| Billing | **Stripe** (through Better Auth plugin) | checkout + portal + webhook |
| Graph | Microsoft Graph REST | app-only client credentials |
| Package mgr | **pnpm** | |

> Better Auth uses Kysely under the hood, so it shares the **same `pg` Pool** as
> our app queries (`src/db/index.ts`). One connection pool for everything.

---

## 3. Run it locally (demo mode — no Azure/Stripe needed)

```bash
cp .env.example .env          # set BETTER_AUTH_SECRET: openssl rand -base64 32
docker compose up -d          # local Postgres on :5432
pnpm install
npx @better-auth/cli migrate -y                                   # auth + subscription tables
docker compose exec -T db psql -U postgres -d tenanthawk < src/db/schema.sql   # app tables
pnpm dev                      # http://localhost:3000
pnpm seed                     # (server must be running) full-access demo user
```

See `docs/DEMO_USER.md` for the seeded login.

---

## 4. Directory map

```
src/
  app/
    page.tsx                  Marketing landing (LIGHT theme)
    layout.tsx                Root; body is bg-white (light)
    globals.css               Theme tokens + light/dark helper classes
    icon.svg                  Favicon (hawk on tile)
    login/ signup/            Better Auth email/password pages (DARK)
    onboarding/page.tsx       Connect → scan → results+paywall (DARK)
    dashboard/
      layout.tsx              App shell, top bar (DARK)
      page.tsx                Single-pane dashboard
      billing/page.tsx        Plan + upgrade/manage (+ dev plan toggle)
    api/
      auth/[...all]/          Better Auth handler (incl. Stripe webhook)
      connect/demo            POST → create demo connection + scan
      connect/start          GET → Microsoft admin-consent redirect
      connect/callback       GET → handle consent, upsert connection, first scan
      scan                   POST → re-scan primary connection
      cron/scan              GET → re-scan active live connections (Vercel cron)
      dev/plan               POST → DEV-ONLY simulate Pro/Free (no Stripe)
      waitlist               Legacy landing waitlist (still present)
  components/
    Logo.tsx                  HawkMark + wordmark (tone="light"|"dark")
    Navbar/Hero/ScoreCard/Stats/ProblemSection/
      Categories/HowItWorks/Pricing/WaitlistSection/Footer   Marketing (LIGHT)
    Reveal.tsx                Scroll-reveal wrapper
    auth/                     AuthShell, AuthForm
    onboarding/               ConnectStep, ResultsStep
    app/                      Dashboard UI: ScoreRing, Sparkline, FindingsTable,
                              SeverityBadge, PlanBadge, RescanButton,
                              UpgradeButton, ManageBillingButton, DevPlanToggle,
                              categories.ts
  lib/
    auth.ts                   Better Auth server instance (+ Stripe plugin)
    auth-client.ts            Better Auth React client
    session.ts                getSession / requireSession (server)
    entitlements.ts           getPlan / isPro (reads subscription table)
    queries.ts                getPrimaryConnection / getLatestScan / getFindings / getScanTrend
    summary.ts                summarize(findings, categoryScores) → ScanSummary
    time.ts                   timeAgo()
    scan/
      graph.ts                getAppToken (client-credentials), graphGet (paging), isLiveConfigured
      score.ts                scoreFindings(), grade()
      runScan.ts              orchestrator: live checks OR demo; persists scan+findings
      demo.ts                 deterministic demo findings (no Azure)
      types.ts                Check, FindingDraft, ScanContext
      checks/                 reliability, cost, security, hygiene + index
  db/
    index.ts                  shared pg Pool + Kysely instance
    types.ts                  Kysely Database interface
    schema.sql                app tables (connection, scan, finding)
  proxy.ts                    Next 16 route protection (was middleware.ts)
scripts/seed.mjs              Seed full-access demo user via HTTP
docker-compose.yml            Postgres 17
vercel.json                   Daily cron → /api/cron/scan
SETUP.md                      Env + go-live checklist
```

---

## 5. Theme model (important)

- **Marketing site is LIGHT, the app is DARK.** Body is `bg-white text-slate-900`.
  Each app shell explicitly sets `bg-slate-950 text-mist`
  (`dashboard/layout.tsx`, `auth/AuthShell.tsx`, onboarding `ConnectStep`/`ResultsStep`).
- `globals.css` overrides Tailwind `slate-700..950` with custom dark-navy values
  (used by the app). `slate-50..600` are stock Tailwind (used by the landing).
  Custom brand scale is `hawk-*` (amber). Stock `blue/green/yellow/red` are used
  for the colorful landing + per-category colors.
- Category colors: **Security = red, Cost = green, Reliability = blue,
  Hygiene = yellow** (see `components/app/categories.ts` for icon/label meta;
  colors are applied per-component on the landing).
- Helper classes: `.light-aura`, `.light-grid`, `.text-rainbow` (light);
  `.hawk-aura`, `.hawk-grid`, `.text-gradient` (dark).
- `Logo` needs `tone="light"` on light backgrounds (Navbar, Footer).

---

## 6. Data model

Better Auth tables (`user`, `session`, `account`, `verification`) + Stripe
plugin `subscription` are created by `@better-auth/cli migrate`. App tables in
`src/db/schema.sql`:

- **connection**: `user_id`, `provider`, `tenant_id`, `tenant_domain`,
  `display_name`, `mode` (`live`|`demo`), `status`, `created_at`.
- **scan**: `connection_id`, `status`, `score`, `category_scores` (jsonb),
  timestamps, `error`.
- **finding**: `scan_id`, `category`, `check_id`, `severity`, `title`,
  `description`, `impact` (jsonb `{usd?,count?}`), `remediation`, `entity_ref`.

Kysely note: nullable / DB-defaulted columns are modeled with `ColumnType` so
inserts can omit them. jsonb columns are written with `JSON.stringify(...)` and
read back as parsed objects.

---

## 7. How the scan engine works

`runScan(connectionId)` (`lib/scan/runScan.ts`):
1. Loads the connection.
2. If `mode === "demo"` **or** `MS_CLIENT_ID` is unset → `getDemoFindings()`.
3. Else mints an app-only token (`getAppToken(tenantId)`) and runs each check in
   `checks/` (each wrapped in try/catch so one failure doesn't kill the scan).
4. `scoreFindings()` → overall + per-category scores.
5. Persists the `scan` row + `finding` rows.

Adding a check = drop a `Check` into `lib/scan/checks/<category>.ts` and register
it in `checks/index.ts`. That's the whole extensibility story (the "many modules,
one engine" design).

---

## 8. Auth & entitlements

- Sign-up/in via Better Auth email/password (`emailAndPassword`, `autoSignIn`,
  no email verification in dev).
- `proxy.ts` does an optimistic cookie check to guard `/dashboard` + `/onboarding`;
  **real authz** is `requireSession()` / `getSession()` in server code.
- **Plan gating:** `getPlan(userId)` reads the `subscription` table; active/trialing
  `pro` ⇒ unlocked. The dashboard sends **no finding data** to free users (the
  `FindingsTable` renders a locked placeholder) — gating is enforced server-side,
  not just visually.

---

## 9. Stripe

- Configured in `lib/auth.ts` via the Better Auth `stripe()` plugin. Uses
  **placeholder keys** when env is unset so schema/migrate and demo mode work.
- Checkout: `authClient.subscription.upgrade({ plan: "pro", successUrl, cancelUrl })`
  (`UpgradeButton`). Portal/cancel: `authClient.subscription.cancel(...)`
  (`ManageBillingButton`). Webhook is mounted under the auth handler
  (`/api/auth/stripe/webhook`).
- **Dev without Stripe:** `/api/dev/plan` + the Billing page `DevPlanToggle`
  simulate Pro/Free by writing the subscription row directly. Auto-disabled once
  `STRIPE_SECRET_KEY` is set or in production.

---

## 10. Current state

✅ Done & verified end-to-end (demo mode):
- Marketing landing (light, colorful, emotional hook) + waitlist API.
- Auth (email/password), route protection.
- Connect (admin-consent flow built; demo path live), scan engine + 5 real
  checks + demo generator, scoring.
- Onboarding (connect → scan → results + paywall).
- Stripe plugin wiring, entitlement gating both ways.
- Single-pane dashboard (score ring, trend sparkline, KPIs, category grades,
  findings table with lock overlay, re-scan) + billing page.
- `pnpm seed` full-access demo user.
- Clean `pnpm lint` + `pnpm build`.

---

## 11. Next steps / TODO

- **Go live** (env only, no code changes): swap `DATABASE_URL` to Supabase
  pooler; register the multi-tenant read-only Entra app and set `MS_*`; set
  Stripe test keys + Pro price + webhook. See `SETUP.md`.
- Real Graph checks need testing against a live tenant (only demo path is
  exercised so far). Verify Graph permission scopes & paging on real data.
- Email provider (Resend) for verification / alert emails.
- Better Auth **organization plugin** for teams + the MSP multi-tenant console.
- Connection management UI (multiple tenants, disconnect, re-consent).
- Report export (PDF/CSV) for Pro.
- Harden the connect `state` (currently a cookie compare) and add rate limiting.
- Tests (none yet).

---

## 12. Gotchas

- **Origin header:** Better Auth rejects state-changing POSTs without an
  `Origin` header (CSRF). Scripts/tools hitting the API must send it
  (see `scripts/seed.mjs`).
- **pnpm build approval:** native deps (`sharp`, `unrs-resolver`) are allowed in
  `pnpm-workspace.yaml` (`allowBuilds` + `onlyBuiltDependencies`). Don't remove.
- **Next 16:** `middleware` is now `proxy` (`src/proxy.ts`); the old name is
  deprecated.
- **Demo vs live:** app is in demo mode whenever `MS_CLIENT_ID` is absent —
  great for local dev, but means "live" code paths in `checks/` are untested.
- **Route handlers** that touch the DB set `export const runtime = "nodejs"`
  (pg needs Node, not Edge).
- **Two query layers, one DB:** Better Auth owns its tables; we read `subscription`
  read-only via Kysely. Don't write Better Auth tables directly.
- `.env` is gitignored; `.env.example` is kept (`!.env.example` in `.gitignore`).
- Not a git repo yet — `git init` when ready.
