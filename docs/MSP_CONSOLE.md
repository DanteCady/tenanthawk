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

## UI guards

- **Tenant switcher** — removed; use **Clients** page to switch
- **Clients nav** — shown when `connections.length > 1`
- **Context bar** — on findings/roadmap/reports: “Client: {name} · Switch client”

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
| **Plan** | Enterprise (`msp` dev subscription) |
| **Clients** | Contoso Holdings, Fabrikam Legal, Northwind Traders (demo) |
| **Portfolio** | `/dashboard/clients` |

Override with `SEED_MSP_EMAIL` / `SEED_MSP_PASSWORD`. Idempotent — safe to re-run.

## Enterprise entitlement (Phase 4)

`Plan = "free" | "pro" | "msp"` — `msp` is the Enterprise / MSP tier (multi-tenant console). Early design partners via dev subscription or env allowlist until Stripe org billing (Phase 7).

## Better Auth (Phase 6+)

Adopt the **organization** plugin for staff invites and roles. Keep M365 **clients** as `connection` rows — do not use org Teams for customer tenants.
