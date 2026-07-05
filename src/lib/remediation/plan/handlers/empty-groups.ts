import { graphGet } from "@/lib/scan/graph";
import type { PlanHandler, PlanHandlerContext, PlanHandlerResult } from "../types";

interface Group {
  id?: string;
  displayName?: string;
  "members@odata.count"?: number;
}

export const emptyGroupsHandler: PlanHandler = {
  checkId: "hygiene.empty-groups",
  async planActions(ctx: PlanHandlerContext): Promise<PlanHandlerResult> {
    const groups = await graphGet<Group>(
      ctx.token,
      "/groups?$select=id,displayName&$expand=members($select=id)&$top=999",
    );

    const empty = groups.filter((g) => (g["members@odata.count"] ?? 0) === 0);

    const actions = empty.map((group) => {
      const name = group.displayName?.trim() || group.id || "Unnamed group";
      const groupId = group.id ?? name;

      return {
        id: `group-${groupId}`,
        target: name,
        verb: "Delete group",
        detail: "No members",
        before: {
          groupId: group.id,
          displayName: group.displayName,
          memberCount: 0,
        },
        after: { deleted: true },
        risk: "medium" as const,
        reversible: false,
      };
    });

    return { actions };
  },
};
