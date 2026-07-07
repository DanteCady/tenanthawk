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
| CP1 | `GET /reports/getMicrosoft365CopilotUsageUserDetail(period='D30')` | `cost.copilot-licensed-inactive`, `hygiene.copilot-low-adoption`, `hygiene.copilot-app-skew`, `hygiene.copilot-chat-only-usage` | **Pass (report)** | Requires `Reports.Read.All`; 302 CSV. Skips user-level checks when report names are concealed. |
| T1 | `GET /groups?$expand=owners` + separate `members` pass | `hygiene.ownerless-groups`, `hygiene.ownerless-teams`, `hygiene.empty-teams` | **Pass** | Graph 400 if owners+members expanded together; merged by group id. |
| TM1 | `GET /reports/getTeamsTeamActivityDetail(period='D90')` | `hygiene.stale-teams`, `hygiene.teams-no-active-channels`, `hygiene.teams-guest-heavy` | **Pass (CSV, obfuscated)** | App-only report hides Team Id; pseudonymous key is in `Team Name`; use `Team Type` for labels. `Team.ReadBasic.All` may unlock real names on some tenants. |
| SP1 | `GET /reports/getSharePointSiteUsageDetail(period='D30')` | SharePoint v1 checks | **Pass (CSV, obfuscated)** | App-only report hides Site URL; pseudonymous site key is in `Owner Display Name`; use `Root Web Template` for labels. `Sites.Read.All` unlocks real URLs on some tenants. |
| EX1 | `GET /users/{id}/mailboxSettings` (`forwardingSmtpAddress`) | Forwarding checks | **Needs Mail.ReadBasic.All** | App-only returns 403 without permission; checks degrade gracefully. |
| EX2 | `GET /reports/getMailboxUsageDetail(period='D30')` | Inactive / storage checks | **Pass (CSV, obfuscated)** | Pseudonymous mailbox keys in report; activity + storage columns usable. |
| RS1 | `GET /admin/reportSettings` (`displayConcealedNames`) | Report concealment banner (optional) | Optional | Authoritative when `ReportSettings.Read.All` is granted; otherwise inferred from obfuscated usage report rows during scan. |
| AP1 | `GET /applications`, `GET /servicePrincipals` (+ owners expand) | Apps v1 ownership / multi-tenant | Pending | |
| AP2 | `GET /oauth2PermissionGrants` | `security.over-permissioned-apps` | Pending | Match risky scopes in `risky-permissions.ts`. |
| AP3 | `GET /auditLogs/signIns` + credentialed `servicePrincipals` | `hygiene.unused-enterprise-apps` | Pending | 90d sign-in lookback; capped paging. |
| AP4 | `GET /directoryRoles` (Global Admin) `/members` | `security.app-global-admin-role` | Pending | Filter service principal members. |
| ID1 | `GET /roleManagement/directory/roleAssignments` + `roleEligibilitySchedules` | `security.pim-standing-access` | **Needs RoleManagement.Read.All** | Detects permanent GA/User Admin assignments without a PIM eligibility schedule. Re-consent after adding permission. |
| ID2 | `GET /users` (guests, managers) | Identity extended checks | Pending | Guest inactivity and manager assignment. |
| ID3 | Privileged role members × MFA registration report | `security.privileged-user-no-mfa` | Pending | Cross-reference directory roles with authentication methods report. |
| DV1 | `GET /devices` + match to Intune via `azureADDeviceId` | Device sector checks | **Pass** | Entra/Intune cross-match works with `Device.Read.All` + managed devices permission. |

## Permissions reference

See [SETUP.md](../SETUP.md) for the full app registration permission set.
New sectors may require additional **Application** permissions — update SETUP.md when promoting checks.
