/**
 * Maps scanner check IDs to the most specific public guide for that finding.
 * Used in the dashboard ("Learn more") and for internal linking from product → content.
 */
export interface CheckGuideLink {
  slug: string;
  label: string;
}

export const CHECK_GUIDE_MAP: Record<string, CheckGuideLink> = {
  "security.conditional-access": {
    slug: "how-to-find-inactive-conditional-access-policies",
    label: "Report only Conditional Access policies",
  },
  "security.legacy-auth": {
    slug: "block-legacy-authentication-microsoft-365",
    label: "Block legacy authentication",
  },
  "security.admin-roles": {
    slug: "m365-security-misconfigurations",
    label: "Global Administrator hygiene",
  },
  "security.mfa-registration": {
    slug: "m365-security-misconfigurations",
    label: "MFA coverage gaps",
  },
  "security.guest-accounts": {
    slug: "m365-security-misconfigurations",
    label: "Guest account risks",
  },
  "cost.unused-licenses": {
    slug: "find-wasted-m365-licenses",
    label: "Unused license seats",
  },
  "cost.disabled-user-licenses": {
    slug: "find-wasted-m365-licenses",
    label: "Licenses on disabled accounts",
  },
  "cost.license-expiry": {
    slug: "m365-expiring-secrets-and-domains",
    label: "Expiring subscriptions",
  },
  "hygiene.inactive-users": {
    slug: "m365-tenant-hygiene",
    label: "Inactive user accounts",
  },
  "hygiene.disabled-outside-group": {
    slug: "m365-tenant-hygiene",
    label: "Disabled account lifecycle",
  },
  "hygiene.empty-groups": {
    slug: "m365-tenant-cleanup",
    label: "Empty and stale groups",
  },
  "hygiene.ownerless-groups": {
    slug: "m365-tenant-cleanup",
    label: "Ownerless groups",
  },
  "hygiene.ownerless-teams": {
    slug: "m365-tenant-cleanup",
    label: "Ownerless Microsoft Teams",
  },
  "hygiene.empty-teams": {
    slug: "m365-tenant-cleanup",
    label: "Empty Microsoft Teams",
  },
  "hygiene.stale-teams": {
    slug: "m365-tenant-cleanup",
    label: "Stale Microsoft Teams",
  },
  "hygiene.teams-no-active-channels": {
    slug: "m365-tenant-cleanup",
    label: "Teams with no active channels",
  },
  "hygiene.teams-guest-heavy": {
    slug: "m365-tenant-hygiene",
    label: "Guest-heavy Teams",
  },
  "hygiene.groups-naming-chaos": {
    slug: "m365-tenant-cleanup",
    label: "Risky group naming patterns",
  },
  "cost.unused-copilot-licenses": {
    slug: "find-wasted-m365-licenses",
    label: "Unused Copilot license seats",
  },
  "hygiene.sharing": {
    slug: "m365-tenant-hygiene",
    label: "External sharing settings",
  },
  "hygiene.sharepoint-external-sites": {
    slug: "m365-tenant-hygiene",
    label: "Sites with external sharing",
  },
  "hygiene.sharepoint-stale-sites": {
    slug: "m365-tenant-cleanup",
    label: "Stale SharePoint sites",
  },
  "hygiene.sharepoint-high-storage": {
    slug: "m365-tenant-hygiene",
    label: "High-storage SharePoint sites",
  },
  "hygiene.sharepoint-empty-sites": {
    slug: "m365-tenant-cleanup",
    label: "Empty SharePoint sites",
  },
  "hygiene.sharepoint-ownerless-sites": {
    slug: "m365-tenant-hygiene",
    label: "Ownerless SharePoint sites",
  },
  "hygiene.sharepoint-inactive-files": {
    slug: "m365-tenant-cleanup",
    label: "Sites with inactive files",
  },
  "hygiene.intune-noncompliant": {
    slug: "m365-tenant-hygiene",
    label: "Intune compliance gaps",
  },
  "hygiene.entra-unmanaged-devices": {
    slug: "m365-tenant-hygiene",
    label: "Entra devices not in Intune",
  },
  "hygiene.intune-ghost-enrollment": {
    slug: "m365-tenant-hygiene",
    label: "Orphaned Intune enrollments",
  },
  "hygiene.personal-device-enrolled": {
    slug: "m365-tenant-hygiene",
    label: "Personally owned Intune devices",
  },
  "reliability.entra-stale-devices": {
    slug: "m365-tenant-hygiene",
    label: "Stale Entra device sign-ins",
  },
  "hygiene.inactive-mailboxes": {
    slug: "m365-tenant-hygiene",
    label: "Inactive mailboxes",
  },
  "hygiene.mailbox-high-storage": {
    slug: "m365-tenant-hygiene",
    label: "High-storage mailboxes",
  },
  "hygiene.mailbox-forwarding-external": {
    slug: "m365-security-misconfigurations",
    label: "External mailbox forwarding",
  },
  "hygiene.mailbox-forwarding-enabled": {
    slug: "m365-security-misconfigurations",
    label: "Mailbox forwarding enabled",
  },
  "cost.inactive-mailbox-licenses": {
    slug: "find-wasted-m365-licenses",
    label: "Licensed inactive mailboxes",
  },
  "reliability.expiring-secrets": {
    slug: "m365-expiring-secrets-and-domains",
    label: "Expiring app secrets and certs",
  },
  "reliability.service-principal-secrets": {
    slug: "m365-expiring-secrets-and-domains",
    label: "Expiring enterprise app secrets",
  },
  "security.over-permissioned-apps": {
    slug: "m365-security-misconfigurations",
    label: "Over-permissioned enterprise apps",
  },
  "hygiene.unused-enterprise-apps": {
    slug: "m365-tenant-hygiene",
    label: "Unused enterprise apps",
  },
  "hygiene.app-without-owners": {
    slug: "m365-tenant-hygiene",
    label: "Ownerless app registrations",
  },
  "hygiene.enterprise-app-no-owners": {
    slug: "m365-tenant-hygiene",
    label: "Ownerless enterprise apps",
  },
  "security.app-global-admin-role": {
    slug: "m365-security-misconfigurations",
    label: "Apps with Global Administrator role",
  },
  "hygiene.multi-tenant-apps": {
    slug: "m365-security-misconfigurations",
    label: "Multi-tenant apps with credentials",
  },
  "reliability.intune-stale-sync": {
    slug: "m365-tenant-hygiene",
    label: "Stale Intune device sync",
  },
};

export function getGuideLinkForCheck(checkId: string): CheckGuideLink | null {
  return CHECK_GUIDE_MAP[checkId] ?? null;
}
