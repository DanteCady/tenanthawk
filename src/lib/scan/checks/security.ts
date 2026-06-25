import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

interface CaPolicy {
  displayName?: string;
  state?: string; // enabled | disabled | enabledForReportingButNotEnforced
}
interface GraphUser {
  displayName?: string;
  userType?: string;
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
