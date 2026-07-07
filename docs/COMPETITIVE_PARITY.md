# Competitive parity — Tenant Hawk vs Inspect 365

Positioning reference for marketing and product. Tenant Hawk leads with **dollar impact**, **client-ready QBR exports**, and **broad M365 workload coverage** — not a continuous ops console.

| Inspect 365 claim | Tenant Hawk check(s) | Tier | Differentiator |
|---|---|---|---|
| Continuous hygiene | Scheduled scans + journal + accept/flag workflow | v1 + M10 | QBR report + reclaimable spend front and center |
| Cross-system device view | `hygiene.entra-unmanaged-devices` + owner on entity | v1 | Defender deep posture in backlog |
| Stale Teams | `hygiene.stale-teams` | v1 | Sector filter + export sections |
| Inactive channels | `hygiene.inactive-channels` | v2 deep | Capped channel sampling |
| SharePoint sprawl | SharePoint sector (v1 + v2) | v1/v2 | Usage-report-first, obfuscation-aware labels |
| High-impact people | Prioritized fix list (severity + USD) | v1 | Not full org-chart analytics |
| Decision memory | Accept / flag / resolve / snooze | M10 | Regress detection on accepted findings |
| License waste | Cost sector + crossovers | v1 | Primary wedge |
| Copilot license ROI | `cost.unused-copilot-licenses`, `cost.copilot-licensed-inactive` | v1 | Dollar-ranked Copilot findings |
| Copilot readiness | `copilot.readiness-blockers` composite | v1 | No undocumented admin APIs |
| Copilot adoption | Usage report + low adoption + Chat-only patterns | v1 | QBR sector grades |
| Mailbox / Exchange hygiene | Exchange sector v1 + v2 | v1/v2 | Report concealment UX |
| Enterprise apps | Apps sector (8 checks) | v1 | Grouped credential expiry UX |

## Explicit gaps (backlog)

- Microsoft Defender for Endpoint sector
- Power Platform (Flows, environments)
- Purview / Copilot DLP label coverage
- Azure ARM resources (VMs, storage, networking)
- Copilot agent catalog governance (v2 — `CopilotPackages.Read.All`)

## Messaging

> Tenant Hawk scans the **Microsoft 365 tenant** (Entra org + workloads). **Not included:** Azure subscription resources, ARM, VMs, networking.
