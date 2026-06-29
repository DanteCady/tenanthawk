# MSP Multi-Tenant Console

Tenant Hawk scopes scan data by **`connection`** (one Microsoft 365 tenant per row). The MSP console adds an **active client context** so operators with many connections can switch tenants without re-onboarding.

## Two workspace layers

| Layer | Model | Switching |
|-------|--------|-----------|
| **MSP workspace** | Better Auth organization (Phase 6) | Org switcher — staff, billing |
| **Client tenant** | `connection` row | Active connection cookie + header switcher |

Phases 1–3 implement **client tenant switching** only.

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
| `/dashboard/workspaces` | Workspace picker — switch and open client tenants |
| `/dashboard/client/scorecard?connection=` | Per-client scorecard — top findings, grades, share link |
| `/onboarding?mode=add-client` | Connect another tenant without solo onboarding flow |
| `/dashboard?connection=<id>` | Deep link to a client overview |

## UI guards

- **Tenant switcher** — removed; use **Workspaces** page to switch
- **Workspaces nav** — shown when `connections.length > 1`

Solo users with one connection see no MSP chrome.

## Local MSP test user

With the dev server running:

```bash
pnpm seed:msp
```

| | |
|---|---|
| **Email** | `msp@tenanthawk.app` |
| **Password** | `TenantHawk!MSP1` |
| **Plan** | Pro (dev subscription) |
| **Clients** | Contoso Holdings, Fabrikam Legal, Northwind Traders (demo) |
| **Portfolio** | `/dashboard/workspaces` |

Override with `SEED_MSP_EMAIL` / `SEED_MSP_PASSWORD`. Idempotent — safe to re-run.

## Manual MSP entitlement (Phase 4+)

`Plan = "free" | "pro" | "msp"` — early design partners via dev plan API or env allowlist until Stripe org billing (Phase 7).

## Better Auth (Phase 6+)

Adopt the **organization** plugin for staff invites and roles. Keep M365 **clients** as `connection` rows — do not use org Teams for customer tenants.
