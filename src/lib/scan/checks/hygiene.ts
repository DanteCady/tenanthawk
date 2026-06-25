import { graphGet } from "../graph";
import type { Check } from "../types";

interface Group {
  displayName?: string;
  "members@odata.count"?: number;
}

export const emptyGroups: Check = {
  id: "hygiene.empty-groups",
  category: "hygiene",
  async run({ token }) {
    const groups = await graphGet<Group>(
      token,
      "/groups?$select=displayName&$expand=members($select=id)&$top=999",
    );
    const empty = groups.filter((g) => (g["members@odata.count"] ?? 0) === 0);
    if (empty.length === 0) return [];
    return [
      {
        category: "hygiene",
        checkId: emptyGroups.id,
        severity: empty.length >= 25 ? "medium" : "low",
        title: `${empty.length} empty groups`,
        description: `${empty.length} groups have no members. Empty groups clutter the directory and can mask misconfiguration.`,
        impact: { count: empty.length },
        remediation:
          "Review and delete unused groups in Entra → Groups, or document why they exist.",
      },
    ];
  },
};
