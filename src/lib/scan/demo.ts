import type { FindingDraft } from "./types";

/** Deterministic, realistic findings so the full product works without Azure. */
export function getDemoFindings(): FindingDraft[] {
  return [
    // Reliability
    {
      category: "reliability",
      checkId: "reliability.expiring-secrets",
      severity: "high",
      title: "3 app secrets expire in 14 days",
      description:
        "Client secrets for 'Backup Connector', 'HR Sync', and 'Reporting API' expire within 14 days. Integrations using them will break at expiry.",
      impact: { count: 3, daysUntil: 14, expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString() },
      remediation:
        "Rotate the secrets in Entra → App registrations → Certificates & secrets before they expire.",
      entityRef: "Backup Connector, HR Sync, Reporting API",
    },
    {
      category: "reliability",
      checkId: "reliability.expiring-secrets",
      severity: "medium",
      title: "SSO signing certificate expires in 26 days",
      description:
        "The SAML signing certificate for 'Salesforce' expires in 26 days.",
      impact: { count: 1, daysUntil: 26, expiresAt: new Date(Date.now() + 26 * 86_400_000).toISOString() },
      remediation: "Renew the signing certificate in the enterprise app's SSO settings.",
      entityRef: "Salesforce",
    },
    {
      category: "cost",
      checkId: "cost.license-expiry",
      severity: "high",
      title: "E5 subscription renewal in 18 days",
      description:
        "Your Microsoft 365 E5 subscription renewal date is in 18 days. Confirm payment method and seat count before auto-renewal.",
      impact: {
        count: 1,
        daysUntil: 18,
        expiresAt: new Date(Date.now() + 18 * 86_400_000).toISOString(),
      },
      remediation:
        "Review renewal terms and seat count in M365 Admin → Billing → Your products before the renewal date.",
      entityRef: "ENTERPRISEPREMIUM", // displays as Office 365 E5
    },
    {
      category: "cost",
      checkId: "cost.unused-licenses",
      severity: "high",
      title: "$1,840/mo in unused M365 licenses",
      description:
        "12 disabled users still hold E3/E5 licenses and 8 E5 licenses show no Teams or Power Platform usage in 90 days.",
      impact: { usd: 1840, count: 20 },
      remediation:
        "Remove licenses from disabled accounts and downgrade unused E5s to E3 in M365 Admin → Users.",
    },
    {
      category: "cost",
      checkId: "cost.unused-licenses",
      severity: "medium",
      title: "23 never-signed-in licensed accounts",
      description:
        "23 licensed users have never signed in — likely provisioned and forgotten.",
      impact: { usd: 540, count: 23 },
      remediation: "Reclaim licenses from accounts with no sign-in activity.",
    },
    // Security
    {
      category: "security",
      checkId: "security.conditional-access",
      severity: "high",
      title: "Conditional Access policy changed 2 days ago",
      description:
        "An MFA exclusion was added to the 'Require MFA for all users' policy 2 days ago, weakening enforcement.",
      remediation:
        "Review the change in Entra → Conditional Access and remove unintended exclusions.",
      entityRef: "Require MFA for all users",
    },
    {
      category: "security",
      checkId: "security.legacy-auth",
      severity: "high",
      title: "Legacy authentication still allowed",
      description:
        "Basic/legacy auth protocols are not blocked, leaving accounts open to password spray.",
      remediation: "Block legacy authentication via a Conditional Access policy.",
    },
    {
      category: "security",
      checkId: "security.guest-accounts",
      severity: "medium",
      title: "61 guest accounts, 18 inactive 90+ days",
      description:
        "61 external guests exist; 18 have had no activity in over 90 days.",
      impact: { count: 18 },
      remediation: "Run a guest access review and remove stale guests.",
    },
    {
      category: "security",
      checkId: "security.admin-roles",
      severity: "medium",
      title: "7 accounts with Global Administrator",
      description:
        "7 users hold the Global Administrator role — more than the recommended 2–4 break-glass + named admins.",
      impact: { count: 7 },
      remediation:
        "Reduce standing Global Admins and use PIM for just-in-time elevation.",
    },
    // Hygiene
    {
      category: "hygiene",
      checkId: "hygiene.empty-groups",
      severity: "low",
      title: "34 empty groups",
      description: "34 groups have no members and appear unused.",
      impact: {
        count: 34,
        entities: [
          "Legacy-Project-Alpha",
          "Temp-Onboarding-2023",
          "SharePoint-Archive-RO",
        ],
      },
      remediation: "Review and delete unused groups in Entra → Groups.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.inactive-users",
      severity: "low",
      title: "19 inactive enabled users (90+ days)",
      description:
        "19 enabled accounts have not signed in for over 90 days.",
      impact: { count: 19 },
      remediation: "Disable or offboard inactive accounts after confirming with their managers.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.sharing",
      severity: "medium",
      title: "Anonymous file sharing enabled org-wide",
      description:
        "SharePoint/OneDrive allow 'Anyone' links by default, increasing data-leak risk.",
      remediation:
        "Set sharing to 'Only people in your organization' or limit anonymous links in SharePoint admin.",
    },
  ];
}
