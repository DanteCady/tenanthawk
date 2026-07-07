import type { Severity } from "@/db/types";
import type { FindingDraft } from "./types";

const READINESS_BLOCKERS: Array<{
  label: string;
  checkIds: string[];
}> = [
  { label: "External SharePoint sharing", checkIds: ["hygiene.sharing"] },
  {
    label: "Externally shared SharePoint sites",
    checkIds: ["hygiene.sharepoint-external-sites"],
  },
  {
    label: "Conditional Access gaps",
    checkIds: ["security.conditional-access"],
  },
  { label: "Legacy authentication allowed", checkIds: ["security.legacy-auth"] },
  { label: "Stale Microsoft Teams", checkIds: ["hygiene.stale-teams"] },
  { label: "Ownerless Microsoft Teams", checkIds: ["hygiene.ownerless-teams"] },
  {
    label: "Guest account risk",
    checkIds: ["security.guest-accounts", "security.stale-guests"],
  },
  {
    label: "Over-permissioned enterprise apps",
    checkIds: ["security.over-permissioned-apps"],
  },
];

export function buildCopilotReadinessFindings(
  findings: FindingDraft[],
): FindingDraft[] {
  const openCheckIds = new Set(findings.map((finding) => finding.checkId));
  const blockers = READINESS_BLOCKERS.filter((blocker) =>
    blocker.checkIds.some((checkId) => openCheckIds.has(checkId)),
  );

  if (blockers.length === 0) return [];

  const entities = blockers.map((blocker) => blocker.label);

  return [
    {
      category: "hygiene",
      checkId: "copilot.readiness-blockers",
      severity: blockers.length >= 4 ? "high" : blockers.length >= 2 ? "medium" : "low",
      title: `${blockers.length} Copilot readiness blocker${blockers.length === 1 ? "" : "s"} detected`,
      description: `${blockers.length} tenant hygiene issue${blockers.length === 1 ? "" : "s"} may reduce Microsoft 365 Copilot quality or grounding: ${entities.join(", ")}.`,
      impact: { count: blockers.length, entities },
      remediation:
        "Resolve the listed hygiene findings in Tenant Hawk, then review Microsoft Copilot adoption guidance for data governance and access controls.",
    },
  ];
}
