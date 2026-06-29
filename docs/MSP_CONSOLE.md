# MSP Multi-Tenant Console

Tenant Hawk scopes scan data by **`connection`** (one Microsoft 365 tenant per row). The MSP console adds an **active client context** so operators with many connections can switch tenants without re-onboarding.

## Two layers (don't confuse them)

| Layer | Model | Switching |
|-------|--------|-----------|
| **MSP organization** | Better Auth organization (Phase 6) | Org switcher — staff, billing |
| **Client tenant** | `connection` row | Clients page + active connection cookie |

Phases 1–3 implement **client tenant switching** only. In the UI we say **client**, not workspace.

## Active connection resolution

Order (see `getActiveConnection` in `src/lib/queries.ts`):

1. Explicit `preferredId` (API body or validated server-side)
2. HttpOnly cookie `th_active_connection`
3. Fallback: most recently scanned connection, then newest created

Deep links: append `?connection=<uuid>` on any `/dashboard/*` route. The Next.js `proxy` handler mirrors the param into the cookie before render.

Switch API: `POST /api/connection/switch` with `{ "connectionId": "..." }` — sets cookie and returns `{ ok: true }`.

## Per-tenant disconnect

`POST /api/connection/disconnect` accepts `{ "connectionId": "..." }`. Deletes one connection and cascades scans/findings. Clears the active cookie when disconnecting the active client; otherwise leaves selection unchanged.

## Routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | MSP roll-up overview — avg score, totals, clients needing attention |
| `/dashboard/clients` | Client list — switch, open, rescan, scorecards |
| `/dashboard/workspaces` | Legacy redirect → `/dashboard/clients` |
| `/dashboard/client?connection=` | Single-client health overview |
| `/dashboard/client/scorecard?connection=` | Per-client scorecard — top findings, grades, share link |
| `/onboarding?mode=add-client` | Connect another tenant without solo onboarding flow |

## Plans (who buys what)

| Buyer | Plan | Billing |
|-------|------|---------|
| Internal IT admin | Free or **Pro** | Per tenant |
| MSP / consultant | **Enterprise only** | Volume pricing — never Pro |

Enterprise is a **standalone** plan for MSPs. It is not “Pro plus multi-tenant.” Pro users who need a client portfolio should move to Enterprise.

## UI guards

- **Tenant switcher** — removed; use **Clients** page to switch
- **Clients nav + context bar** — Enterprise (`msp` plan) with 2+ connections
- **Portfolio roll-up** on `/dashboard` — same gate as clients nav
- **Scorecards** — Enterprise only
- **Add client** (`/onboarding?mode=add-client`) — Enterprise only
- Pro remains for single internal-tenant IT teams only

Solo users with one connection see no MSP chrome.

## Enterprise entitlement (Phase 4)

Access to the multi-tenant console requires **`msp` plan** (shown as **Enterprise** in the UI) or an email on **`MSP_ENTITLEMENT_ALLOWLIST`** (comma-separated env var for design partners).

| Check | Location |
|-------|----------|
| `hasMspConsoleEntitlement()` | `src/lib/entitlements/msp-console.ts` |
| `getMspConsoleAccess()` | Combines entitlement + connection count → `showConsole` |

Dev plan cycling (no Stripe): Billing → Dev tools toggles Free → Pro (IT) → Enterprise (MSP).

Until Stripe is configured, grant Enterprise via `pnpm seed:msp`, `/api/dev/plan { "plan": "msp" }`, or the allowlist.

### Stripe Enterprise (Phase 7a)

| Env | Purpose |
|-----|---------|
| `STRIPE_PRICE_ENTERPRISE` | Enterprise Starter monthly ($299/mo) |
| `STRIPE_PRICE_ENTERPRISE_ANNUAL` | Enterprise Starter annual ($2990/yr) |
| `ENTERPRISE_CLIENT_CAP` | Included client tenants (default **10**) |

Self-serve checkout and Stripe customer portal work like Pro. Better Auth plan name is **`msp`**; UI shows **Enterprise**.

## Local MSP test user

With the dev server running:

```bash
pnpm seed:msp
```

| | |
|---|---|
| **Email** | `msp@tenanthawk.app` |
| **Password** | `TenantHawk!MSP1` |
| **Plan** | Enterprise (`msp` dev subscription) |
| **Clients** | Contoso Holdings, Fabrikam Legal, Northwind Traders (demo) |
| **Portfolio** | `/dashboard/clients` |

Override with `SEED_MSP_EMAIL` / `SEED_MSP_PASSWORD`. Idempotent — safe to re-run.

## Better Auth (Phase 6+)

Adopt the **organization** plugin for staff invites and roles. Keep M365 **clients** as `connection` rows — do not use org Teams for customer tenants.
