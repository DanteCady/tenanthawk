# MSP Multi-Tenant Console

Tenant Hawk scopes scan data by **`connection`** (one Microsoft 365 tenant per row). The MSP console adds an **active client context** so operators with many connections can switch tenants without re-onboarding.

## Two layers (don't confuse them)

| Layer | Model | Switching |
|-------|--------|-----------|
| **MSP organization** | Better Auth `organization` plugin | Staff invites, SSO, branded subdomain |
| **Client tenant** | `connection` row | Clients page + active connection cookie |

Phases 1–5 implement **client tenant switching**. Phase 6 adds **Enterprise workspace** (subdomain + SSO + invites). In the UI we say **client**, not workspace, for M365 tenants.

## Enterprise workspace (Phase 6)

Each Enterprise MSP gets one Better Auth **organization** with:

| Feature | Route / URL |
|---------|-------------|
| Branded subdomain | `https://{slug}.tenanthawk.io` |
| SSO login | `{slug}.tenanthawk.io/login` |
| Workspace settings | `/dashboard/settings/enterprise` |
| Team invites | Same settings page |

**Platform admin** (Tenant Hawk owner) uses a **separate subdomain** — not an MSP org:

| Feature | URL |
|---------|-----|
| Console | `https://admin.tenanthawk.io` |
| Login | `admin.tenanthawk.io/login` |
| Env | `PLATFORM_ADMIN_SUBDOMAIN=admin` (default), `TENANT_HAWK_ADMIN_USER_ID` |

The Better Auth **`admin`** plugin powers user list and impersonation. Visiting `/admin` on the apex domain redirects to the admin subdomain.

Invited org members inherit the owner's client portfolio (`resolveWorkspaceDataUserId` in `src/lib/enterprise/workspace.ts`).

### SSO (self-serve)

MSPs configure SAML 2.0 or OIDC in **Settings → Enterprise workspace**. Better Auth `@better-auth/sso` plugin stores providers linked to `organizationId`.

**Email domain verification** is required before SSO sign-in works. After saving a provider, add a DNS **TXT** record:

| Field | Value |
|-------|--------|
| Host | `_tenanthawk-token-{providerId}.{your-domain}` |
| Value | `_tenanthawk-token-{providerId}={token}` |

The settings UI shows the exact host/value and a **Check DNS & verify** button. SSO sign-in stays blocked until verification succeeds.

### Production DNS / TLS

#### 1. Wildcard DNS (at your domain registrar / DNS host)

Point **apex**, **www**, and **all subdomains** at your Lightsail static IP (e.g. from GitHub secret `LIGHTSAIL_HOST`):

| Type | Name / Host | Value |
|------|-------------|--------|
| `A` | `@` (or `tenanthawk.io`) | `<LIGHTSAIL_STATIC_IP>` |
| `A` | `www` | `<LIGHTSAIL_STATIC_IP>` |
| `A` | `*` | `<LIGHTSAIL_STATIC_IP>` |

The `*` record is what makes `demo.tenanthawk.io`, `admin.tenanthawk.io`, etc. work without per-MSP DNS.

Verify (may take a few minutes to propagate):

```bash
dig +short tenanthawk.io
dig +short admin.tenanthawk.io
dig +short demo.tenanthawk.io
```

All should return your static IP.

**Cloudflare tip:** use “DNS only” (grey cloud) for these records while debugging TLS; orange-cloud proxy can complicate cert issuance unless you use Cloudflare origin certs.

#### 2. Nginx

`scripts/server/bootstrap-lightsail.sh` already sets `server_name tenanthawk.io www.tenanthawk.io *.tenanthawk.io` and proxies to port 3000.

#### 3. Wildcard TLS (Let's Encrypt DNS-01)

HTTP validation **cannot** issue `*.tenanthawk.io`. Use **DNS-01** with certbot and your DNS provider plugin, e.g. Cloudflare:

```bash
sudo apt install certbot python3-certbot-dns-cloudflare
# credentials file: dns_cloudflare_api_token = <token with Zone:DNS:Edit>
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/cloudflare.ini \
  -d tenanthawk.io -d '*.tenanthawk.io'
```

Then enable HTTPS in nginx (add `listen 443 ssl`, cert paths under `/etc/letsencrypt/live/tenanthawk.io/`, and redirect 80 → 443).

Renewal cron is installed by the bootstrap script.

#### 4. Production env

On the server (`/var/www/tenanthawk/.env`):

```env
ENTERPRISE_ROOT_DOMAIN=tenanthawk.io
ENTERPRISE_COOKIE_DOMAIN=.tenanthawk.io
BETTER_AUTH_URL=https://tenanthawk.io
NEXT_PUBLIC_APP_URL=https://tenanthawk.io
```

`ENTERPRISE_COOKIE_DOMAIN` lets sessions work across `tenanthawk.io`, `admin.tenanthawk.io`, and `{msp-slug}.tenanthawk.io`.

#### Reserved workspace slugs

MSPs cannot claim infrastructure subdomains. Built-in reserved slugs include `admin`, `app`, `api`, `support`, `platform`, `portal`, `console`, `login`, `dashboard`, and others — see `DEFAULT_RESERVED` in `src/lib/enterprise/config.ts`. Add more via `ENTERPRISE_RESERVED_SLUGS=foo,bar` in env.

### Env vars

| Env | Purpose |
|-----|---------|
| `ENTERPRISE_ROOT_DOMAIN` | Root domain (default `tenanthawk.io`) |
| `ENTERPRISE_COOKIE_DOMAIN` | Session cookie domain (e.g. `.tenanthawk.io`) |
| `ENTERPRISE_SSO_ENABLED` | Enable SSO plugin (default true) |
| `TENANT_HAWK_ADMIN_USER_ID` | Platform owner for admin plugin |
| `PLATFORM_ADMIN_SUBDOMAIN` | Operator console subdomain (default `admin`) |

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
| **Workspace** | `demo.tenanthawk.io` (slug `demo`; override with `SEED_MSP_ORG_SLUG`) |
| **Clients** | Contoso Holdings, Fabrikam Legal, Northwind Traders (demo) |
| **Portfolio** | `/dashboard/clients` |
| **Enterprise settings** | `/dashboard/settings/enterprise` |

Override with `SEED_MSP_EMAIL` / `SEED_MSP_PASSWORD` / `SEED_MSP_ORG_SLUG`. Idempotent — safe to re-run.

Local subdomain testing: set `ENTERPRISE_ROOT_DOMAIN=localhost`, then use `http://demo.localhost:3000/login` (MSP) or `http://admin.localhost:3000/login` (platform owner).

## M365 clients vs MSP org

Keep M365 **clients** as `connection` rows — do not map customer tenants to Better Auth organization teams.
