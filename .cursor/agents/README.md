# Tenant Hawk — Cursor Agents

Specialized subagents for the M365/Azure tenant health micro-SaaS. Single Next.js app at repo root.

**Start here:** `docs/CURSOR_HANDOFF.md` → `SETUP.md` for env and go-live.

## Orchestration

| Phase | Agents |
|-------|--------|
| Ideation | `feature-strategist-agent`, `marketing-ui-agent` |
| Implementation | Domain agents (`scan-engine-agent`, `microsoft-graph-agent`, etc.) |
| UX polish | `ui-ux-agent`, `marketing-ui-agent`, `dashboard-app-agent` |
| Documentation | `documentation-agent` (after features, before PR) |
| Quality gate | `security-reviewer`, `verifier`, `judge` |
| Ship / go-live | `infrastructure-agent` |
| Tests | `test-agent` |

## Typical flow

```
feature-strategist → domain agent → documentation-agent → verifier → judge
```

## Context & approval system

Every agent file includes **Context & focus**, **Approval gates**, and **Handoffs**.

| Section | Purpose |
|---------|---------|
| **Context & focus** | Primary scope, owned paths, out-of-scope table with delegate agent |
| **Approval gates** | When to stop and ask the user vs proceed within the stated task |
| **Handoffs** | Which agent runs next in the orchestration flow |

### Universal approval rules (all implementing agents)

Ask the user before:

- Expanding beyond the stated task or the agent's primary scope
- Schema changes, bulk data deletion, or breaking API/contract changes
- Commits, pushes, or PRs (unless explicitly requested)
- Production side effects (real Stripe charges, live Graph against customer tenants, deploys)
- Writing to Better Auth tables directly (use Better Auth APIs / CLI)

Readonly agents (`judge`, `verifier`, `security-reviewer`) never edit files — they report and delegate fixes.

## Conventions

- **Stack:** Next.js 16 (App Router), TypeScript strict, Tailwind v4, Better Auth + Stripe plugin, Kysely + Postgres (`pg` Pool), Microsoft Graph (app-only)
- **Theme:** Marketing = LIGHT (`bg-white`); app (auth, onboarding, dashboard) = DARK (`bg-slate-950`)
- **Auth:** `requireSession()` / `getSession()` in server code; `src/proxy.ts` is optimistic cookie guard only
- **Entitlements:** `getPlan()` / `isPro()` read `subscription` table; server must gate finding data, not just UI
- **DB:** Better Auth tables via `npx @better-auth/cli migrate`; app tables in `src/db/schema.sql`
- **Scan engine:** one orchestrator (`runScan.ts`), many `Check` modules in `lib/scan/checks/`
- **Route handlers touching DB:** `export const runtime = "nodejs"`
- **Demo mode:** when `MS_CLIENT_ID` is unset, scans use `demo.ts` — live check code is untested until go-live
- **Package mgr:** pnpm

## Readonly agents

`judge`, `verifier`, `security-reviewer` — analyze only; no file edits.

## Agent index

| Agent | Readonly | Primary scope |
|-------|----------|---------------|
| judge | ✓ | Final quality gate |
| verifier | ✓ | lint, build, conventions |
| security-reviewer | ✓ | Auth, connect flow, API security |
| feature-strategist-agent | | Roadmap, feature briefs |
| scan-engine-agent | | Scan orchestrator, checks, scoring |
| microsoft-graph-agent | | Graph API, connect/consent, live checks |
| better-auth-agent | | Better Auth, Stripe plugin, sessions |
| onboarding-billing-agent | | Onboarding funnel, paywall, billing |
| dashboard-app-agent | | Dashboard data, findings, entitlements UX |
| ui-ux-agent | | Layout, a11y, states, design consistency |
| marketing-ui-agent | | Landing copy + light-theme marketing |
| api-routes-agent | | Route handlers, proxy, cron |
| db-agent | | Kysely, schema.sql, migrations |
| infrastructure-agent | | Docker, Vercel cron, Supabase, go-live |
| documentation-agent | | docs/ + targeted comments |
| test-agent | | Vitest/Playwright test setup & cases |
