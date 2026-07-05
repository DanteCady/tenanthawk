import { graphGet } from "@/lib/scan/graph";
import { sumAssignedLicenseUsd } from "@/lib/licenses/sku-pricing";
import type { PlanHandler, PlanHandlerContext, PlanHandlerResult } from "../types";

interface SubscribedSku {
  skuId?: string;
  skuPartNumber?: string;
}

interface AssignedLicense {
  skuId: string;
}

interface LicensedUser {
  id?: string;
  displayName?: string;
  userPrincipalName?: string;
  assignedLicenses?: AssignedLicense[];
}

export const disabledUserLicensesHandler: PlanHandler = {
  checkId: "cost.disabled-user-licenses",
  async planActions(ctx: PlanHandlerContext): Promise<PlanHandlerResult> {
    const [users, skus] = await Promise.all([
      graphGet<LicensedUser>(
        ctx.token,
        "/users?$filter=accountEnabled eq false&$select=id,displayName,userPrincipalName,assignedLicenses&$top=999",
      ),
      graphGet<SubscribedSku>(ctx.token, "/subscribedSkus"),
    ]);

    const skuById = new Map(
      skus.filter((s) => s.skuId).map((s) => [s.skuId as string, s]),
    );

    const withLicenses = users.filter((u) => (u.assignedLicenses?.length ?? 0) > 0);
    let estimatedUsdSaved = 0;
    const actions = withLicenses.map((user) => {
      const upn = user.userPrincipalName ?? user.id ?? "unknown";
      const assigned = user.assignedLicenses ?? [];
      const skuIds = assigned.map((l) => l.skuId);
      const skuPartNumbers = skuIds.map(
        (id) => skuById.get(id)?.skuPartNumber ?? id,
      );
      const { usd } = sumAssignedLicenseUsd(assigned, skuById, ctx.licensePricing);
      estimatedUsdSaved += usd;

      return {
        id: `disabled-user-${upn}`,
        target: upn,
        verb: "Remove assigned licenses",
        detail:
          skuPartNumbers.length > 0
            ? skuPartNumbers.join(", ")
            : `${assigned.length} license(s)`,
        before: {
          userId: user.id,
          userPrincipalName: upn,
          displayName: user.displayName,
          skuIds,
          skuPartNumbers,
        },
        after: { assignedLicenses: [] },
        risk: "low" as const,
        reversible: true,
      };
    });

    return { actions, estimatedUsdSaved: estimatedUsdSaved || undefined };
  },
};
