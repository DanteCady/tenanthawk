import { graphGet } from "../graph";
import type { Check } from "../types";

const DAY = 86_400_000;
const INACTIVE_DAYS = 90;

const DISABLED_GROUP_PATTERN =
  /disabled|offboard|off-board|terminated|leaver|inactive|deprovision|archive/i;

interface GraphUser {
  id?: string;
  displayName?: string;
  userPrincipalName?: string;
  userType?: string;
  accountEnabled?: boolean;
  assignedLicenses?: unknown[];
  signInActivity?: { lastSignInDateTime?: string };
}

interface GraphGroup {
  id?: string;
  displayName?: string;
}

interface MfaRegistrationRow {
  userPrincipalName?: string;
  userDisplayName?: string;
  isMfaRegistered?: boolean;
  isMfaCapable?: boolean;
}

/** Enabled users without MFA registered (Entra authentication methods report). */
export const mfaRegistration: Check = {
  id: "security.mfa-registration",
  category: "security",
  async run({ token }) {
    const rows = await graphGet<MfaRegistrationRow>(
      token,
      "/reports/authenticationMethods/userRegistrationDetails",
    );

    const withoutMfa = rows.filter((r) => r.isMfaRegistered === false);
    if (withoutMfa.length === 0) return [];

    return [
      {
        category: "security",
        checkId: mfaRegistration.id,
        severity: withoutMfa.length >= 10 ? "high" : "medium",
        title: `${withoutMfa.length} user${withoutMfa.length === 1 ? "" : "s"} without MFA registered`,
        description: `${withoutMfa.length} accounts in this tenant do not have MFA registered. Password-only accounts are easier to compromise.`,
        impact: { count: withoutMfa.length, entities: withoutMfa.slice(0, 20).map(
          (r) => r.userDisplayName ?? r.userPrincipalName ?? "Unknown",
        ) },
        remediation:
          "Require MFA via Conditional Access and run an MFA registration campaign in Entra > Protection > Authentication methods.",
      },
    ];
  },
};

/** Enabled member accounts with no sign-in in 90+ days. */
export const inactiveUsers: Check = {
  id: "hygiene.inactive-users",
  category: "hygiene",
  async run({ token }) {
    const users = await graphGet<GraphUser>(
      token,
      "/users?$filter=accountEnabled eq true&$select=displayName,userType,signInActivity&$top=999",
    );

    const now = Date.now();
    const inactive = users.filter((u) => {
      if (u.userType === "Guest") return false;
      const last = u.signInActivity?.lastSignInDateTime;
      if (!last) return true;
      return now - new Date(last).getTime() >= INACTIVE_DAYS * DAY;
    });

    if (inactive.length === 0) return [];

    const names = inactive
      .slice(0, 20)
      .map((u) => u.displayName ?? u.userPrincipalName ?? "Unknown");

    return [
      {
        category: "hygiene",
        checkId: inactiveUsers.id,
        severity: inactive.length >= 25 ? "medium" : "low",
        title: `${inactive.length} inactive enabled user${inactive.length === 1 ? "" : "s"} (${INACTIVE_DAYS}+ days)`,
        description: `${inactive.length} enabled accounts have not signed in for ${INACTIVE_DAYS}+ days (or never signed in).`,
        impact: { count: inactive.length, entities: names },
        remediation:
          "Disable or offboard inactive accounts after confirming with their managers, and remove unused licenses.",
      },
    ];
  },
};

/** Disabled accounts not placed in a Disabled/Offboarded security group. */
export const disabledOutsideGroup: Check = {
  id: "hygiene.disabled-outside-group",
  category: "hygiene",
  async run({ token }) {
    const [groups, disabledUsers] = await Promise.all([
      graphGet<GraphGroup>(token, "/groups?$select=id,displayName&$top=999"),
      graphGet<GraphUser>(
        token,
        "/users?$filter=accountEnabled eq false&$select=id,displayName,userPrincipalName&$top=999",
      ),
    ]);

    if (disabledUsers.length === 0) return [];

    const disabledGroups = groups.filter((g) =>
      DISABLED_GROUP_PATTERN.test(g.displayName ?? ""),
    );

    if (disabledGroups.length === 0) {
      return [
        {
          category: "hygiene",
          checkId: disabledOutsideGroup.id,
          severity: "low",
          title: `${disabledUsers.length} disabled account${disabledUsers.length === 1 ? "" : "s"} — no Disabled group found`,
          description:
            `${disabledUsers.length} accounts are disabled but this tenant has no group whose name matches Disabled/Offboard/Terminated. Consider a standard Disabled Users group for lifecycle management.`,
          impact: { count: disabledUsers.length },
          remediation:
            "Create a Disabled Users security group and move disabled accounts into it for consistent access reviews and automation.",
        },
      ];
    }

    const inDisabledGroup = new Set<string>();
    for (const group of disabledGroups.slice(0, 15)) {
      if (!group.id) continue;
      const members = await graphGet<{ id?: string }>(
        token,
        `/groups/${group.id}/members?$select=id&$top=999`,
      );
      for (const m of members) {
        if (m.id) inDisabledGroup.add(m.id);
      }
    }

    const outside = disabledUsers.filter((u) => u.id && !inDisabledGroup.has(u.id));
    if (outside.length === 0) return [];

    const names = outside
      .slice(0, 20)
      .map((u) => u.displayName ?? u.userPrincipalName ?? "Unknown");

    return [
      {
        category: "hygiene",
        checkId: disabledOutsideGroup.id,
        severity: outside.length >= 10 ? "medium" : "low",
        title: `${outside.length} disabled account${outside.length === 1 ? "" : "s"} not in a Disabled group`,
        description: `${outside.length} disabled accounts are not members of a Disabled/Offboard/Terminated group (${disabledGroups.length} matching group${disabledGroups.length === 1 ? "" : "s"} found).`,
        impact: { count: outside.length, entities: names },
        remediation:
          "Move disabled accounts into your standard Disabled Users group so access and licenses stay auditable.",
      },
    ];
  },
};
