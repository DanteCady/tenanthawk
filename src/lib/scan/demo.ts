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
        "23 licensed users have never signed in - likely provisioned and forgotten.",
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
        "7 users hold the Global Administrator role - more than the recommended 2–4 break-glass + named admins.",
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
      checkId: "hygiene.ownerless-groups",
      severity: "medium",
      title: "12 ownerless groups",
      description:
        "12 groups have no assigned owners. Ownerless groups are hard to govern and often accumulate stale data.",
      impact: {
        count: 12,
        entities: ["Finance-Approvers", "Contractor-Access-2022", "Old-Sales-Region-West"],
      },
      remediation: "Assign at least two owners per group in Entra → Groups, or delete unused groups.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.ownerless-teams",
      severity: "high",
      title: "8 ownerless Microsoft Teams",
      description:
        "8 Microsoft Teams have no assigned owners. Ownerless Teams are hard to govern and often accumulate stale data.",
      impact: {
        count: 8,
        entities: ["Project Phoenix", "Marketing Archive", "IT Sandbox"],
      },
      remediation:
        "Assign owners in Teams admin or Entra group owners; archive or delete unused Teams.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.empty-teams",
      severity: "medium",
      title: "6 empty Microsoft Teams",
      description:
        "6 Microsoft Teams have zero members. Empty Teams clutter the tenant and may indicate abandoned projects.",
      impact: { count: 6, entities: ["Pilot Rollout", "Q1 Planning"] },
      remediation: "Archive or delete unused Teams in Teams admin, or add members if the Team is still needed.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.stale-teams",
      severity: "high",
      title: "14 stale Microsoft Teams",
      description:
        "14 Microsoft Teams had no activity in 90+ days (some 180+ days). Stale Teams add noise to search and Copilot grounding.",
      impact: { count: 14, entities: ["Legacy Support", "2023 All Hands", "Vendor Coordination"] },
      remediation:
        "Review inactive Teams in Teams admin and archive or delete those no longer needed.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.teams-no-active-channels",
      severity: "medium",
      title: "9 Teams with no active channels",
      description:
        "9 Microsoft Teams report zero active channels in the last 90 days. Channels may be unused or abandoned.",
      impact: { count: 9, entities: ["Field Ops", "Training Cohort B"] },
      remediation: "Review channel usage in Teams admin and remove or archive unused channels.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.teams-guest-heavy",
      severity: "low",
      title: "2 guest-heavy Teams",
      description:
        "2 Microsoft Teams had 10+ guest users active in the last 90 days. Heavy guest presence increases data-exposure risk.",
      impact: { count: 2, entities: ["Client Delivery", "Partner Workspace"] },
      remediation:
        "Review guest access in Teams admin and Entra → External Identities; remove stale guests.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.groups-naming-chaos",
      severity: "low",
      title: "27 groups with risky naming",
      description:
        "27 groups use Test/Temp/Old/Archive-style names. This is informational — rename or document groups to improve directory hygiene.",
      impact: { count: 27, entities: ["Test-SSO", "Temp-Onboarding-2023", "Old-Sales-Archive"] },
      remediation:
        "Rename or delete ambiguous groups in Entra → Groups so admins can trust directory search.",
    },
    {
      category: "cost",
      checkId: "cost.unused-copilot-licenses",
      severity: "high",
      title: "~$450/mo in unused Copilot seats",
      description:
        "15 Microsoft 365 Copilot seats are prepaid but only 0 are assigned — 15 appear unused. Copilot is typically ~$30/user/mo.",
      impact: { count: 15, usd: 450 },
      remediation:
        "Assign Copilot to intended users in M365 Admin → Users, or reduce prepaid Copilot seats in Billing before renewal.",
      entityRef: "Microsoft_365_Copilot",
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
    {
      category: "hygiene",
      checkId: "hygiene.sharepoint-external-sites",
      severity: "medium",
      title: "7 sites with external sharing",
      description: "7 SharePoint sites allow external sharing beyond org-only access.",
      impact: { count: 7, entities: ["Client Portal", "Vendor Docs", "Partner Workspace"] },
      remediation:
        "Review site sharing settings in SharePoint admin and restrict external access on sensitive sites.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.sharepoint-stale-sites",
      severity: "medium",
      title: "18 stale SharePoint sites",
      description: "18 SharePoint sites had no activity in 180+ days.",
      impact: { count: 18, entities: ["Legacy-Intranet", "Project-2019", "Archive-HR"] },
      remediation:
        "Archive or delete unused SharePoint sites in SharePoint admin, or confirm owners still need them.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.sharepoint-high-storage",
      severity: "high",
      title: "4 high-storage SharePoint sites",
      description: "4 SharePoint sites use more than 50 GB of storage (some over 100 GB).",
      impact: { count: 4, entities: ["Records-Center", "Media-Library", "Engineering-Share"] },
      remediation:
        "Review large sites in SharePoint admin, archive old content, and apply retention policies.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.sharepoint-empty-sites",
      severity: "low",
      title: "11 empty SharePoint sites",
      description: "11 SharePoint sites have zero files and zero page views in the last 30 days.",
      impact: { count: 11, entities: ["Pilot-Site", "Test-Team-Site"] },
      remediation: "Delete or archive unused site collections in SharePoint admin.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.sharepoint-ownerless-sites",
      severity: "medium",
      title: "5 ownerless SharePoint sites",
      description: "5 SharePoint sites have no owner listed in the usage report.",
      impact: { count: 5, entities: ["Old-Project-Site", "Contractor-Uploads"] },
      remediation:
        "Assign site owners in SharePoint admin or via the site's Site permissions panel.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.sharepoint-inactive-files",
      severity: "medium",
      title: "9 sites with inactive files",
      description:
        "9 SharePoint sites contain files but report zero active files in the last 30 days.",
      impact: { count: 9, entities: ["Policies", "Shared-Documents-Archive"] },
      remediation:
        "Review stale document libraries and apply retention or archival policies.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.entra-unmanaged-devices",
      severity: "medium",
      title: "14 Entra devices not in Intune",
      description:
        "14 Entra-registered devices are not enrolled in Intune and may lack compliance policies.",
      impact: {
        count: 14,
        entities: ["LAPTOP-ACME-042 (jordan@contoso.com)", "DESKTOP-FIN-09 (finance@contoso.com)"],
      },
      remediation:
        "Enroll corporate devices in Intune or retire stale Entra device records in Entra → Devices.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.personal-device-enrolled",
      severity: "low",
      title: "22 personally owned enrolled devices",
      description:
        "22 Intune-enrolled devices are marked as personally owned (BYOD). Confirm this matches your access policy.",
      impact: { count: 22, entities: ["iPhone 15 (alex@contoso.com)", "Pixel 8 (sam@contoso.com)"] },
      remediation:
        "Review BYOD enrollment in Intune > Devices and tighten app protection or block personal enrollment if not allowed.",
    },
    {
      category: "reliability",
      checkId: "reliability.entra-stale-devices",
      severity: "medium",
      title: "31 stale Entra devices",
      description: "31 Entra devices had no sign-in activity in 30+ days.",
      impact: { count: 31, entities: ["OLD-LAPTOP-2019", "KIOSK-RECEPTION"] },
      remediation:
        "Review stale devices in Entra → Devices and disable or delete records for lost or decommissioned hardware.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.inactive-mailboxes",
      severity: "medium",
      title: "19 inactive mailboxes",
      description: "19 mailboxes had no activity in 90+ days (some 180+ days).",
      impact: { count: 19, entities: ["Inactive mailbox · 1.2 GB · last active 2023-04-10", "Inactive mailbox · 0 GB · no activity on record"] },
      remediation:
        "Review inactive mailboxes in Exchange admin, convert to shared, or remove licenses from unused accounts.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.mailbox-high-storage",
      severity: "high",
      title: "3 high-storage mailboxes",
      description: "3 mailboxes use more than 50 GB of storage (some over 100 GB).",
      impact: { count: 3, entities: ["exec-archive@contoso.com", "legal-hold@contoso.com"] },
      remediation:
        "Review large mailboxes in Exchange admin, enable archiving, or apply retention policies.",
    },
    {
      category: "security",
      checkId: "security.over-permissioned-apps",
      severity: "high",
      title: "4 over-permissioned enterprise apps",
      description:
        "4 enterprise apps grant admin-consented Graph permissions that include high-risk scopes such as Mail.ReadWrite.All.",
      impact: { count: 4, entities: ["Legacy CRM Sync", "Finance Automation", "HR Data Export"] },
      remediation:
        "Review admin-consented permissions in Entra → Enterprise applications and remove unnecessary Graph scopes.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.unused-enterprise-apps",
      severity: "medium",
      title: "6 unused enterprise apps",
      description:
        "6 credentialed enterprise apps had no sign-in activity in the last 90 days.",
      impact: { count: 6, entities: ["Old SSO Bridge", "Retired Reporting API"] },
      remediation:
        "Disable or remove unused enterprise applications and rotate stale credentials.",
    },
    {
      category: "hygiene",
      checkId: "hygiene.app-without-owners",
      severity: "medium",
      title: "8 ownerless app registrations",
      description: "8 app registrations have no assigned owners.",
      impact: { count: 8, entities: ["Contoso Portal", "Inventory Sync"] },
      remediation: "Assign at least two owners to each app registration in Entra → App registrations.",
    },
  ];
}
