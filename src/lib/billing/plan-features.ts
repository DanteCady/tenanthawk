/** Customer-facing feature lists — Pro and Enterprise are separate tiers, not bundles. */

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
  "Everything in Pro for every client tenant",
  "Multi-tenant portfolio roll-up dashboard",
  "Clients console — switch, rescan, and open any tenant",
  "Per-client scorecards for QBRs and client updates",
  "Unlimited client tenants (volume pricing)",
  "Priority support",
] as const;

export const ENTERPRISE_CONSOLE_FEATURES = [
  "Multi-tenant portfolio roll-up",
  "Clients list with switch & rescan",
  "Per-client scorecards for QBRs",
  "Volume pricing for MSPs & consultants",
] as const;
