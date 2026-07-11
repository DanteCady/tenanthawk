import {
  CHECK_DEFINITIONS,
  offeredCheckDefinitions,
} from "@/lib/scan/checks/registry";

export type GraphPermissionRow = {
  permission: string;
  /** What Microsoft grants with this scope, in plain terms. */
  grants: string;
  /** What Tenant Hawk actually does with it — kept specific and honest. */
  usedFor: string;
  /** Marketing labels of offered checks that require this permission. */
  checkLabels: string[];
};

/**
 * Plain-language descriptions for every Graph application permission the
 * Tenant Hawk multi-tenant app requests via admin consent. The permission set
 * itself is derived from the check registry so this table cannot drift from
 * what the scan engine uses — adding a check with a new scope fails the
 * registry test below until it is documented here.
 */
const PERMISSION_DESCRIPTIONS: Record<string, { grants: string; usedFor: string }> = {
  "Application.Read.All": {
    grants: "App registrations and enterprise apps (service principals), including credential metadata.",
    usedFor:
      "Finding client secrets and certificates about to expire, ownerless or unused apps, and enterprise apps holding more permissions than they use. We read credential expiry dates — never the secret values themselves, which Microsoft does not expose.",
  },
  "AuditLog.Read.All": {
    grants: "Entra sign-in and audit log entries.",
    usedFor:
      "Sign-in activity for enterprise apps, so unused apps are flagged from real usage rather than guesswork.",
  },
  "Channel.ReadBasic.All": {
    grants: "Teams channel names and metadata.",
    usedFor: "Detecting private channels whose owners have all left or been disabled.",
  },
  "ChannelMessage.Read.All": {
    grants: "Messages in Teams channels.",
    usedFor:
      "Channel activity only: during a deep scan we request the single most recent message per channel and keep its timestamp to detect inactive and never-used channels. Message content is not stored and does not appear in any finding.",
  },
  "Device.Read.All": {
    grants: "Entra device records.",
    usedFor:
      "Comparing Entra device records against Intune enrollment to catch drift, and flagging devices with stale sign-ins.",
  },
  "DeviceManagementManagedDevices.Read.All": {
    grants: "Intune managed device inventory.",
    usedFor:
      "Stale device sync, compliance state, personally owned enrollments, and the Entra-vs-Intune reconciliation above.",
  },
  "Directory.Read.All": {
    grants: "Directory objects: groups, role assignments, organizational relationships.",
    usedFor:
      "Privileged role assignments, empty and ownerless groups, and Teams whose owners are gone.",
  },
  "Mail.ReadBasic.All": {
    grants: "Mailbox metadata — not message bodies or attachments.",
    usedFor:
      "Mailbox settings only: external forwarding addresses and stale automatic replies. We never read, store, or index email content.",
  },
  "Organization.Read.All": {
    grants: "Tenant subscription and SKU information.",
    usedFor:
      "License seat counts against assignments — the source for dollar figures on unused, disabled-user, and expiring licenses.",
  },
  "Policy.Read.All": {
    grants: "Conditional Access and authentication policies.",
    usedFor:
      "Conditional Access coverage gaps (including policies stuck in report-only) and legacy authentication exposure.",
  },
  "Reports.Read.All": {
    grants: "Microsoft 365 usage reports (aggregated activity per user, site, mailbox, and team).",
    usedFor:
      "The activity backbone for most hygiene checks: MFA registration, inactive users, stale SharePoint sites, mailbox and Teams activity. These are the same reports in your admin center — pre-aggregated by Microsoft, no message or file content.",
  },
  "RoleManagement.Read.All": {
    grants: "Role management and PIM configuration.",
    usedFor: "Detecting standing (always-on) privileged access that should be eligible-only.",
  },
  "SharePointTenantSettings.Read.All": {
    grants: "Tenant-level SharePoint settings.",
    usedFor: "The org-wide external sharing posture check.",
  },
  "Team.ReadBasic.All": {
    grants: "Team names and basic metadata.",
    usedFor: "Team-level checks: disabled owners, outdated or unverified Teams apps.",
  },
  "User.Read.All": {
    grants: "User profiles, account status, license assignments, and sign-in activity timestamps.",
    usedFor:
      "The core of licensing and lifecycle checks: disabled accounts still holding licenses, inactive users (interactive and non-interactive sign-ins both considered), and guest sprawl.",
  },
};

/** Every permission required by at least one offered check, with usage docs. */
export function graphPermissionRows(): GraphPermissionRow[] {
  const byPermission = new Map<string, string[]>();
  for (const check of offeredCheckDefinitions()) {
    for (const permission of check.permissions) {
      const labels = byPermission.get(permission) ?? [];
      if (!labels.includes(check.marketingLabel)) labels.push(check.marketingLabel);
      byPermission.set(permission, labels);
    }
  }

  return [...byPermission.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([permission, checkLabels]) => {
      const description = PERMISSION_DESCRIPTIONS[permission];
      return {
        permission,
        grants: description?.grants ?? "",
        usedFor: description?.usedFor ?? "",
        checkLabels,
      };
    });
}

/** Permissions referenced by any registered check but missing docs above. */
export function undocumentedPermissions(): string[] {
  const documented = new Set(Object.keys(PERMISSION_DESCRIPTIONS));
  const missing = new Set<string>();
  for (const check of CHECK_DEFINITIONS) {
    if (!check.offered) continue;
    for (const permission of check.permissions) {
      if (!documented.has(permission)) missing.add(permission);
    }
  }
  return [...missing].sort();
}
