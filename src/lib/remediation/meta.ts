/** Per-check remediation metadata (static - maintained alongside scan checks). */

export type RemediationEffort = "quick" | "moderate" | "project";

export interface CheckRemediationMeta {
  effort: RemediationEffort;
  /** Where admins typically fix this */
  adminSurface: "Entra" | "M365 Admin" | "Intune" | "SharePoint" | "Mixed";
  effortLabel: string;
}

const DEFAULT_META: CheckRemediationMeta = {
  effort: "moderate",
  adminSurface: "M365 Admin",
  effortLabel: "~1 hour",
};

export const CHECK_REMEDIATION_META: Record<string, CheckRemediationMeta> = {
  "security.conditional-access": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "security.legacy-auth": {
    effort: "project",
    adminSurface: "Entra",
    effortLabel: "Half day+",
  },
  "security.mfa-registration": {
    effort: "project",
    adminSurface: "Entra",
    effortLabel: "Half day+",
  },
  "security.admin-roles": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "security.guest-accounts": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "cost.disabled-user-licenses": {
    effort: "quick",
    adminSurface: "M365 Admin",
    effortLabel: "~15 min",
  },
  "cost.unused-licenses": {
    effort: "moderate",
    adminSurface: "M365 Admin",
    effortLabel: "~1 hour",
  },
  "cost.license-expiry": {
    effort: "quick",
    adminSurface: "M365 Admin",
    effortLabel: "~15 min",
  },
  "reliability.expiring-secrets": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "reliability.intune-stale-sync": {
    effort: "moderate",
    adminSurface: "Intune",
    effortLabel: "~1 hour",
  },
  "hygiene.inactive-users": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.disabled-outside-group": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.empty-groups": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "hygiene.ownerless-groups": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "hygiene.ownerless-teams": {
    effort: "quick",
    adminSurface: "Mixed",
    effortLabel: "~15 min",
  },
  "hygiene.empty-teams": {
    effort: "quick",
    adminSurface: "Mixed",
    effortLabel: "~15 min",
  },
  "hygiene.stale-teams": {
    effort: "moderate",
    adminSurface: "Mixed",
    effortLabel: "~1 hour",
  },
  "hygiene.teams-no-active-channels": {
    effort: "moderate",
    adminSurface: "Mixed",
    effortLabel: "~1 hour",
  },
  "hygiene.teams-guest-heavy": {
    effort: "moderate",
    adminSurface: "Mixed",
    effortLabel: "~1 hour",
  },
  "hygiene.groups-naming-chaos": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "cost.unused-copilot-licenses": {
    effort: "quick",
    adminSurface: "M365 Admin",
    effortLabel: "~15 min",
  },
  "hygiene.intune-noncompliant": {
    effort: "project",
    adminSurface: "Intune",
    effortLabel: "Half day+",
  },
  "hygiene.entra-unmanaged-devices": {
    effort: "moderate",
    adminSurface: "Mixed",
    effortLabel: "~1 hour",
  },
  "hygiene.intune-ghost-enrollment": {
    effort: "moderate",
    adminSurface: "Intune",
    effortLabel: "~1 hour",
  },
  "hygiene.personal-device-enrolled": {
    effort: "moderate",
    adminSurface: "Intune",
    effortLabel: "~1 hour",
  },
  "reliability.entra-stale-devices": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.inactive-mailboxes": {
    effort: "moderate",
    adminSurface: "Mixed",
    effortLabel: "~1 hour",
  },
  "hygiene.mailbox-high-storage": {
    effort: "moderate",
    adminSurface: "Mixed",
    effortLabel: "~1 hour",
  },
  "hygiene.mailbox-forwarding-external": {
    effort: "quick",
    adminSurface: "Mixed",
    effortLabel: "~15 min",
  },
  "hygiene.mailbox-forwarding-enabled": {
    effort: "quick",
    adminSurface: "Mixed",
    effortLabel: "~15 min",
  },
  "cost.inactive-mailbox-licenses": {
    effort: "moderate",
    adminSurface: "M365 Admin",
    effortLabel: "~1 hour",
  },
  "reliability.service-principal-secrets": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "security.over-permissioned-apps": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.unused-enterprise-apps": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.app-without-owners": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "hygiene.enterprise-app-no-owners": {
    effort: "quick",
    adminSurface: "Entra",
    effortLabel: "~15 min",
  },
  "security.app-global-admin-role": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.multi-tenant-apps": {
    effort: "moderate",
    adminSurface: "Entra",
    effortLabel: "~1 hour",
  },
  "hygiene.sharing": {
    effort: "moderate",
    adminSurface: "SharePoint",
    effortLabel: "~1 hour",
  },
  "hygiene.sharepoint-external-sites": {
    effort: "moderate",
    adminSurface: "SharePoint",
    effortLabel: "~1 hour",
  },
  "hygiene.sharepoint-stale-sites": {
    effort: "moderate",
    adminSurface: "SharePoint",
    effortLabel: "~1 hour",
  },
  "hygiene.sharepoint-high-storage": {
    effort: "moderate",
    adminSurface: "SharePoint",
    effortLabel: "~1 hour",
  },
  "hygiene.sharepoint-empty-sites": {
    effort: "quick",
    adminSurface: "SharePoint",
    effortLabel: "~15 min",
  },
  "hygiene.sharepoint-ownerless-sites": {
    effort: "quick",
    adminSurface: "SharePoint",
    effortLabel: "~15 min",
  },
  "hygiene.sharepoint-inactive-files": {
    effort: "moderate",
    adminSurface: "SharePoint",
    effortLabel: "~1 hour",
  },
};

export function getCheckRemediationMeta(checkId: string): CheckRemediationMeta {
  return CHECK_REMEDIATION_META[checkId] ?? DEFAULT_META;
}

export function effortBadgeLabel(effort: RemediationEffort): string {
  switch (effort) {
    case "quick":
      return "Quick fix";
    case "moderate":
      return "Moderate";
    case "project":
      return "Project";
  }
}
