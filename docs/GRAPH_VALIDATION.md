# Graph API validation log

Spike results for Microsoft Graph endpoints used by Tenant Hawk scan checks.
Run spikes against a live tenant before promoting checks from `backlog` → `v1`.

## How to record a spike

1. Note tenant type (E3/E5, Copilot licensed or not, Intune enrolled, etc.).
2. Call the endpoint with the app-only token used in production scans.
3. Record HTTP status, sample row count, and any permission gaps.
4. Link the check ID and set `graphValidationRef` in `src/lib/scan/checks/registry.ts`.

## Spikes

| Ref | Endpoint / pattern | Check(s) | Status | Notes |
|-----|-------------------|----------|--------|-------|
| CP2 | `GET /subscribedSkus` (Copilot SKU parts) | `cost.unused-copilot-licenses` | **Pass (SKU)** | Prepaid vs consumed seat math works without usage reports. |
| CP1 | `GET /reports/getMicrosoft365CopilotUsageUserDetail(period='D30')` | Copilot usage v2 | Pending | Requires `Reports.Read.All`; 302 CSV or JSON `$format`. |
| T1 | `GET /groups?$expand=owners` + separate `members` pass | `hygiene.ownerless-groups`, `hygiene.ownerless-teams`, `hygiene.empty-teams` | **Pass** | Graph 400 if owners+members expanded together; merged by group id. |
| TM1 | `GET /reports/getTeamsTeamActivityDetail(period='D90')` | `hygiene.stale-teams`, `hygiene.teams-no-active-channels`, `hygiene.teams-guest-heavy` | **Pass (CSV)** | 302 CSV parse; Active Channels + Guests columns. |
| SP1 | `GET /reports/getSharePointSiteUsageDetail(period='D30')` | SharePoint v1 checks | **Pass (CSV, obfuscated)** | App-only report hides Site URL; pseudonymous site key is in `Owner Display Name`; use `Root Web Template` for labels. `Sites.Read.All` unlocks real URLs on some tenants. |
| EX1 | `GET /reports/getMailboxUsageDetail(period='D30')` | Exchange v2 checks | Pending | |

## Permissions reference

See [SETUP.md](../SETUP.md) for the full app registration permission set.
New sectors may require additional **Application** permissions — update SETUP.md when promoting checks.
