import { graphGet } from "@/lib/scan/graph";
import { resolveLicenseSku, shouldSkipUnusedSeatFinding } from "@/lib/licenses/sku-display";
import { estimateRecoverableUsd } from "@/lib/licenses/sku-pricing";
import type { PlanHandler, PlanHandlerContext, PlanHandlerResult } from "../types";

interface SubscribedSku {
  skuId?: string;
  skuPartNumber?: string;
  capabilityStatus?: string;
  appliesTo?: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: { enabled?: number };
}

export const unusedLicensesHandler: PlanHandler = {
  checkId: "cost.unused-licenses",
  async planActions(ctx: PlanHandlerContext): Promise<PlanHandlerResult> {
    const skus = await graphGet<SubscribedSku>(ctx.token, "/subscribedSkus");
    let estimatedUsdSaved = 0;
    const actions = [];

    for (const sku of skus) {
      if (sku.capabilityStatus && sku.capabilityStatus !== "Enabled") continue;

      const code = sku.skuPartNumber ?? "Unknown SKU";
      if (shouldSkipUnusedSeatFinding(code)) continue;

      if (ctx.finding.entity_ref && ctx.finding.entity_ref !== code) continue;

      const enabled = sku.prepaidUnits?.enabled ?? 0;
      const consumed = sku.consumedUnits?.enabled ?? 0;
      const unused = enabled - consumed;
      if (unused < 3) continue;

      const info = resolveLicenseSku(code);
      const usd = estimateRecoverableUsd(
        code,
        unused,
        sku.appliesTo,
        ctx.licensePricing,
      );
      estimatedUsdSaved += usd;

      actions.push({
        id: `sku-${code}`,
        target: info.label,
        verb: "Review unused prepaid seats",
        detail: `${unused} unused of ${enabled} prepaid (${consumed} assigned)`,
        before: {
          skuPartNumber: code,
          skuId: sku.skuId,
          enabled,
          consumed,
          unused,
        },
        after: {
          recommendation: "Reduce prepaid seats or review license assignments",
        },
        risk: "low" as const,
        reversible: true,
      });
    }

    return { actions, estimatedUsdSaved: estimatedUsdSaved || undefined };
  },
};
