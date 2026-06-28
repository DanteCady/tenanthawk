import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

interface CaPolicy {
  displayName?: string;
  state?: string;
  conditions?: {
    clientAppTypes?: string[];
  };
  grantControls?: {
    builtInControls?: string[];
  };
}
interface GraphUser {
  displayName?: string;
  userType?: string;
}
interface DirectoryRole {
  id?: string;
  displayName?: string;
}

export const conditionalAccess: Check = {
  id: "security.conditional-access",
  category: "security",
  async run({ token }) {
    const findings: FindingDraft[] = [];
    const policies = await graphGet<CaPolicy>(
      token,
      "/identity/conditionalAccess/policies",
    );

    const enabled = policies.filter((p) => p.state === "enabled");
    if (policies.length === 0) {
      findings.push({
        category: "security",
        checkId: conditionalAccess.id,
        severity: "high",
        title: "No Conditional Access policies found",
        description:
          "This tenant has no Conditional Access policies enforcing MFA or device controls.",
        remediation:
          "Create baseline CA policies (require MFA for admins and all users) in Entra → Protection → Conditional Access.",
      });
    } else {
      const reportOnly = policies.filter(
        (p) => p.state === "enabledForReportingButNotEnforced",
      );
      if (enabled.length === 0 && reportOnly.length > 0) {
        findings.push({
          category: "security",
          checkId: conditionalAccess.id,
          severity: "high",
          title: "All Conditional Access policies are report-only",
          description: `${reportOnly.length} CA policies exist but none are enforced.`,
          remediation: "Move validated report-only policies to On in Entra → Conditional Access.",
        });
      }
    }
    return findings;
  },
};

export const adminRoles: Check = {
  id: "security.admin-roles",
  category: "security",
  async run({ token }) {
    const roles = await graphGet<DirectoryRole>(token, "/directoryRoles");
    const globalAdmin = roles.find((r) => r.displayName === "Global Administrator");
    if (!globalAdmin?.id) return [];

    const members = await graphGet<{ displayName?: string }>(
      token,
      `/directoryRoles/${globalAdmin.id}/members?$select=displayName`,
    );
    if (members.length <= 4) return [];

    const names = members
      .slice(0, 12)
      .map((m) => m.displayName ?? "Unknown");

    return [
      {
        category: "security",
        checkId: adminRoles.id,
        severity: members.length >= 7 ? "high" : "medium",
        title: `${members.length} accounts with Global Administrator`,
        description: `${members.length} users hold Global Administrator — more than the recommended 2–4 break-glass plus named admins.`,
        impact: { count: members.length, entities: names },
        remediation:
          "Reduce standing Global Admins and use Entra Privileged Identity Management for just-in-time elevation.",
      },
    ];
  },
};

export const legacyAuthentication: Check = {
  id: "security.legacy-auth",
  category: "security",
  async run({ token }) {
    const defaults = await graphGet<{ isEnabled?: boolean }>(
      token,
      "/policies/identitySecurityDefaultsEnforcementPolicy",
    );
    if (defaults[0]?.isEnabled === true) return [];

    const policies = await graphGet<CaPolicy>(
      token,
      "/identity/conditionalAccess/policies",
    );

    const blocksLegacy = policies.some((p) => {
      if (p.state !== "enabled") return false;
      const types = p.conditions?.clientAppTypes ?? [];
      const targetsLegacy =
        types.includes("exchangeActiveSync") || types.includes("other");
      const blocks = p.grantControls?.builtInControls?.includes("block");
      return targetsLegacy && blocks;
    });

    if (blocksLegacy) return [];

    return [
      {
        category: "security",
        checkId: legacyAuthentication.id,
        severity: "high",
        title: "Legacy authentication not blocked",
        description:
          "Security defaults are off and no Conditional Access policy blocks legacy authentication protocols (IMAP, POP, SMTP, older clients).",
        remediation:
          "Block legacy authentication with a Conditional Access policy or enable Entra security defaults.",
      },
    ];
  },
};

export const guestSprawl: Check = {
  id: "security.guest-accounts",
  category: "security",
  async run({ token }) {
    const guests = await graphGet<GraphUser>(
      token,
      "/users?$filter=userType eq 'Guest'&$select=displayName&$count=true&$top=999",
    );
    if (guests.length < 25) return [];
    return [
      {
        category: "security",
        checkId: guestSprawl.id,
        severity: guests.length >= 100 ? "medium" : "low",
        title: `${guests.length} guest accounts in the directory`,
        description: `${guests.length} external guest accounts exist. Stale guests expand your attack surface.`,
        impact: { count: guests.length },
        remediation:
          "Run an access review for guests and remove ones with no recent activity in Entra → Identity Governance.",
      },
    ];
  },
};
