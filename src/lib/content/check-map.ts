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
  "hygiene.sharing": {
    slug: "m365-tenant-hygiene",
    label: "External sharing settings",
  },
  "hygiene.intune-noncompliant": {
    slug: "m365-tenant-hygiene",
    label: "Intune compliance gaps",
  },
  "reliability.expiring-secrets": {
    slug: "m365-expiring-secrets-and-domains",
    label: "Expiring app secrets and certs",
  },
  "reliability.intune-stale-sync": {
    slug: "m365-tenant-hygiene",
    label: "Stale Intune device sync",
  },
};

export function getGuideLinkForCheck(checkId: string): CheckGuideLink | null {
  return CHECK_GUIDE_MAP[checkId] ?? null;
}
