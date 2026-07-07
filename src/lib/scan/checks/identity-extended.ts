import type { Severity } from "@/db/types";
import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

const DAY = 86_400_000;
const GUEST_INACTIVE_DAYS = 90;
const GUEST_INVITE_WINDOW_DAYS = 30;
const GUEST_INVITE_SPIKE_THRESHOLD = 15;

const PRIVILEGED_ROLE_NAMES = new Set([
  "Global Administrator",
  "Privileged Role Administrator",
  "User Administrator",
  "Security Administrator",
]);

const PIM_SENSITIVE_ROLE_NAMES = new Set([
  "Global Administrator",
  "User Administrator",
]);

interface GraphUser {
  id?: string;
  displayName?: string;
  userPrincipalName?: string;
  userType?: string;
  accountEnabled?: boolean;
  createdDateTime?: string;
  manager?: { id?: string } | null;
  signInActivity?: { lastSignInDateTime?: string };
}

interface MfaRegistrationRow {
  userPrincipalName?: string;
  userDisplayName?: string;
  isMfaRegistered?: boolean;
}

interface DirectoryRole {
  id?: string;
  displayName?: string;
  roleTemplateId?: string;
}

interface DirectoryRoleMember {
  id?: string;
  displayName?: string;
  userPrincipalName?: string;
  "@odata.type"?: string;
}

interface UnifiedRoleAssignment {
  id?: string;
  principalId?: string;
  roleDefinitionId?: string;
  assignmentType?: string;
}

interface RoleEligibilitySchedule {
  principalId?: string;
  roleDefinitionId?: string;
}

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

function aggregateFinding(
  checkId: string,
  category: FindingDraft["category"],
  count: number,
  entities: string[],
  opts: {
    noun: string;
    description: string;
    remediation: string;
    severity: Severity;
  },
): FindingDraft[] {
  if (count === 0) return [];

  return [
    {
      category,
      checkId,
      severity: opts.severity,
      title: `${count} ${opts.noun}`,
      description: opts.description,
      impact: { count, entities: entities.slice(0, 15) },
      remediation: opts.remediation,
    },
  ];
}

function userLabel(user: GraphUser): string {
  return user.displayName ?? user.userPrincipalName ?? "Unknown user";
}

function daysSince(date: string | undefined | null): number | null {
  if (!date) return null;
  return Math.round((Date.now() - new Date(date).getTime()) / DAY);
}

async function fetchGuestUsers(token: string): Promise<GraphUser[]> {
  return graphGet<GraphUser>(
    token,
    "/users?$filter=userType eq 'Guest'&$select=id,displayName,userPrincipalName,createdDateTime,signInActivity&$top=999",
  );
}

async function fetchPrivilegedUserIds(token: string): Promise<Map<string, string>> {
  const roles = await graphGet<DirectoryRole>(token, "/directoryRoles");
  const users = new Map<string, string>();

  for (const role of roles) {
    if (!role.id || !role.displayName || !PRIVILEGED_ROLE_NAMES.has(role.displayName)) {
      continue;
    }
    const members = await graphGet<DirectoryRoleMember>(
      token,
      `/directoryRoles/${role.id}/members?$select=id,displayName,userPrincipalName`,
    );
    for (const member of members) {
      if (!member.id) continue;
      if (member["@odata.type"] && !member["@odata.type"].includes("user")) continue;
      users.set(member.id, member.displayName ?? member.userPrincipalName ?? role.displayName);
    }
  }

  return users;
}

export const staleGuestsCheck: Check = {
  id: "security.stale-guests",
  category: "security",
  async run({ token }) {
    const guests = await fetchGuestUsers(token);
    const stale = guests.filter((guest) => {
      const days = daysSince(guest.signInActivity?.lastSignInDateTime);
      return days === null || days >= GUEST_INACTIVE_DAYS;
    });

    return aggregateFinding(
      staleGuestsCheck.id,
      "security",
      stale.length,
      stale.map(userLabel),
      {
        noun: stale.length === 1 ? "stale guest account" : "stale guest accounts",
        description: `${stale.length} guest account${stale.length === 1 ? "" : "s"} had no sign-in activity in ${GUEST_INACTIVE_DAYS}+ days (or never signed in).`,
        remediation:
          "Review stale guests in Entra → External Identities and remove access that is no longer required.",
        severity: severityFromCount(stale.length, { medium: 10, high: 25 }),
      },
    );
  },
};

export const guestInviteSprawlCheck: Check = {
  id: "security.guest-invite-sprawl",
  category: "security",
  async run({ token }) {
    const guests = await fetchGuestUsers(token);
    const recent = guests.filter((guest) => {
      const days = daysSince(guest.createdDateTime);
      return days != null && days <= GUEST_INVITE_WINDOW_DAYS;
    });

    if (recent.length < GUEST_INVITE_SPIKE_THRESHOLD) return [];

    return [
      {
        category: "security",
        checkId: guestInviteSprawlCheck.id,
        severity: "low",
        title: `${recent.length} guest invitations in ${GUEST_INVITE_WINDOW_DAYS} days`,
        description: `${recent.length} guest accounts were created in the last ${GUEST_INVITE_WINDOW_DAYS} days. A sudden spike may indicate invite sprawl or an external sharing cleanup opportunity.`,
        impact: {
          count: recent.length,
          entities: recent.slice(0, 15).map(userLabel),
        },
        remediation:
          "Review recent guest invitations in Entra → External Identities and confirm each sponsor and business owner.",
      },
    ];
  },
};

export const usersNoManagerCheck: Check = {
  id: "hygiene.users-no-manager",
  category: "hygiene",
  async run({ token }) {
    const users = await graphGet<GraphUser>(
      token,
      "/users?$filter=accountEnabled eq true and userType eq 'Member'&$select=id,displayName,userPrincipalName,manager&$expand=manager($select=id)&$top=999",
    );

    const withoutManager = users.filter((user) => !user.manager?.id);

    return aggregateFinding(
      usersNoManagerCheck.id,
      "hygiene",
      withoutManager.length,
      withoutManager.map(userLabel),
      {
        noun: withoutManager.length === 1 ? "user without a manager" : "users without a manager",
        description: `${withoutManager.length} enabled member account${withoutManager.length === 1 ? "" : "s"} do not have a manager assigned in Entra ID.`,
        remediation:
          "Assign managers in Entra → Users so access reviews, lifecycle workflows, and org reporting stay accurate.",
        severity: severityFromCount(withoutManager.length, { medium: 15, high: 40 }),
      },
    );
  },
};

export const privilegedUserNoMfaCheck: Check = {
  id: "security.privileged-user-no-mfa",
  category: "security",
  async run({ token }) {
    const [privilegedUsers, mfaRows] = await Promise.all([
      fetchPrivilegedUserIds(token),
      graphGet<MfaRegistrationRow>(
        token,
        "/reports/authenticationMethods/userRegistrationDetails",
      ),
    ]);

    if (privilegedUsers.size === 0) return [];

    const mfaByUpn = new Map(
      mfaRows
        .filter((row) => row.userPrincipalName)
        .map((row) => [row.userPrincipalName!.toLowerCase(), row.isMfaRegistered === true]),
    );

    const privilegedMembers = await graphGet<GraphUser>(
      token,
      "/users?$filter=accountEnabled eq true&$select=displayName,userPrincipalName,id&$top=999",
    );

    const unprotected: string[] = [];
    for (const user of privilegedMembers) {
      if (!user.id || !privilegedUsers.has(user.id)) continue;
      const upn = user.userPrincipalName?.toLowerCase();
      const registered = upn ? mfaByUpn.get(upn) : false;
      if (!registered) unprotected.push(userLabel(user));
    }

    return aggregateFinding(
      privilegedUserNoMfaCheck.id,
      "security",
      unprotected.length,
      unprotected,
      {
        noun:
          unprotected.length === 1
            ? "privileged user without MFA"
            : "privileged users without MFA",
        description: `${unprotected.length} user${unprotected.length === 1 ? "" : "s"} with privileged directory roles do not have MFA registered.`,
        remediation:
          "Require MFA for privileged roles via Conditional Access and complete MFA registration for admin accounts.",
        severity: unprotected.length > 0 ? "high" : "low",
      },
    );
  },
};

export const pimStandingAccessCheck: Check = {
  id: "security.pim-standing-access",
  category: "security",
  async run({ token }) {
    try {
      const [roles, assignments, eligibilityResult] = await Promise.all([
        graphGet<{ id?: string; displayName?: string }>(
          token,
          "/roleManagement/directory/roleDefinitions?$select=id,displayName&$top=999",
        ),
        graphGet<UnifiedRoleAssignment>(
          token,
          "/roleManagement/directory/roleAssignments?$select=principalId,roleDefinitionId,assignmentType&$top=999",
        ),
        graphGet<RoleEligibilitySchedule>(
          token,
          "/roleManagement/directory/roleEligibilitySchedules?$select=principalId,roleDefinitionId&$top=999",
        )
          .then((rows) => ({ rows, readable: true as const }))
          .catch(() => ({ rows: [] as RoleEligibilitySchedule[], readable: false as const })),
      ]);

      if (!eligibilityResult.readable) return [];

      const eligibility = eligibilityResult.rows;

      const sensitiveRoleIds = new Set(
        roles
          .filter((role) => role.displayName && PIM_SENSITIVE_ROLE_NAMES.has(role.displayName))
          .map((role) => role.id)
          .filter((id): id is string => Boolean(id)),
      );

      if (sensitiveRoleIds.size === 0) return [];

      const eligibleKeys = new Set(
        eligibility.map((entry) => `${entry.principalId}|${entry.roleDefinitionId}`),
      );

      const standingPrincipalIds = new Set<string>();
      for (const assignment of assignments) {
        if (!assignment.principalId || !assignment.roleDefinitionId) continue;
        if (!sensitiveRoleIds.has(assignment.roleDefinitionId)) continue;
        const key = `${assignment.principalId}|${assignment.roleDefinitionId}`;
        if (!eligibleKeys.has(key)) {
          standingPrincipalIds.add(assignment.principalId);
        }
      }

      if (standingPrincipalIds.size === 0) return [];

      const users = await graphGet<GraphUser>(
        token,
        "/users?$select=id,displayName,userPrincipalName&$top=999",
      );
      const labels = users
        .filter((user) => user.id && standingPrincipalIds.has(user.id))
        .map(userLabel);

      return aggregateFinding(
        pimStandingAccessCheck.id,
        "security",
        labels.length,
        labels,
        {
          noun:
            labels.length === 1
              ? "standing privileged role assignment"
              : "standing privileged role assignments",
          description: `${labels.length} account${labels.length === 1 ? "" : "s"} have active Global Administrator or User Administrator assignments without a matching PIM eligibility schedule.`,
          remediation:
            "Move privileged access to Entra Privileged Identity Management with just-in-time activation and remove permanent role assignments where possible.",
          severity: labels.length >= 3 ? "high" : "medium",
        },
      );
    } catch (err) {
      const msg = String(err);
      if (msg.includes("403") || msg.includes("Access is denied")) {
        return [];
      }
      throw err;
    }
  },
};
