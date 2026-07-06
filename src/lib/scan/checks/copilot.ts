import { graphGet } from "../graph";
import {
  DEFAULT_COPILOT_SEAT_USD,
  isCopilotSkuPartNumber,
} from "../constants/copilot-skus";
import type { Check, FindingDraft } from "../types";

interface SubscribedSku {
  skuPartNumber?: string;
  capabilityStatus?: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: { enabled?: number };
}

function formatUsd(usd: number): string {
  return usd.toLocaleString("en-US");
}

/** Prepaid Microsoft 365 Copilot seats not assigned to any user. */
export const unusedCopilotLicenses: Check = {
  id: "cost.unused-copilot-licenses",
  category: "cost",
  async run({ token }) {
    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const findings: FindingDraft[] = [];

    for (const sku of skus) {
      if (sku.capabilityStatus && sku.capabilityStatus !== "Enabled") continue;

      const code = sku.skuPartNumber ?? "";
      if (!isCopilotSkuPartNumber(code)) continue;

      const enabled = sku.prepaidUnits?.enabled ?? 0;
      const consumed = sku.consumedUnits?.enabled ?? 0;
      const unused = enabled - consumed;
      if (unused < 1) continue;

      const usd = unused * DEFAULT_COPILOT_SEAT_USD;

      findings.push({
        category: "cost",
        checkId: unusedCopilotLicenses.id,
        severity: unused >= 5 ? "high" : unused >= 2 ? "medium" : "low",
        title: `~$${formatUsd(usd)}/mo in unused Copilot seats`,
        description: `${enabled} Microsoft 365 Copilot seats are prepaid but only ${consumed} are assigned — ${unused} appear unused. Copilot is typically ~$${DEFAULT_COPILOT_SEAT_USD}/user/mo.`,
        remediation:
          "Assign Copilot to intended users in M365 Admin → Users, or reduce prepaid Copilot seats in Billing before renewal.",
        entityRef: code,
        impact: { count: unused, usd },
      });
    }

    return findings;
  },
};
