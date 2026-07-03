/** Customer-facing feature lists - Pro and Enterprise are separate tiers, not bundles. */

export const PRO_PLAN_FEATURES = [
  "Full findings with severity & dollar impact",
  "AI-guided remediation with Microsoft doc links",
  "Category score trends & compliance mapping (CIS / NIST)",
  "Shareable read-only report links for leadership",
  "Daily scans + drift & expiry alerts",
  "Slack / Teams / Discord webhook alerts",
  "Export reports",
  "All four scan categories",
] as const;

export const ENTERPRISE_PLAN_FEATURES = [
  "Full platform on every client tenant",
  "Multi-tenant portfolio roll-up dashboard",
  "Clients console - switch, rescan, and open any tenant",
  "Per-client scorecards for client updates and exec summaries",
  "Up to 10 client tenants on Starter (volume tiers available)",
  "Priority support",
] as const;

export const ENTERPRISE_CONSOLE_FEATURES = [
  "Multi-tenant portfolio roll-up",
  "Clients list with switch & rescan",
  "Shareable per-client scorecards",
  "Volume pricing for MSPs & consultants",
] as const;
