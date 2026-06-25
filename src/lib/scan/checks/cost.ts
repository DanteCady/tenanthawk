import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

interface SubscribedSku {
  skuId: string;
  skuPartNumber: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: number;
}
interface AssignedLicense {
  skuId: string;
}
interface GraphUser {
  displayName?: string;
  accountEnabled?: boolean;
  assignedLicenses?: AssignedLicense[];
  signInActivity?: { lastSignInDateTime?: string };
}

// Approx monthly list price (USD) by SKU part number — used to estimate waste.
const SKU_PRICE: Record<string, number> = {
  ENTERPRISEPREMIUM: 57, // E5
  SPE_E5: 57,
  ENTERPRISEPACK: 36, // E3
  SPE_E3: 36,
  O365_BUSINESS_PREMIUM: 22,
  SPB: 22,
  EXCHANGESTANDARD: 4,
  FLOW_FREE: 0,
};

function price(part: string): number {
  return SKU_PRICE[part] ?? 20;
}

export const unusedLicenses: Check = {
  id: "cost.unused-licenses",
  category: "cost",
  async run({ token }) {
    const findings: FindingDraft[] = [];

    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const skuById = new Map(skus.map((s) => [s.skuId, s]));

    const users = await graphGet<GraphUser>(
      token,
      "/users?$select=displayName,accountEnabled,assignedLicenses,signInActivity&$top=999",
    );

    let disabledWaste = 0;
    let disabledCount = 0;
    for (const u of users) {
      const licenses = u.assignedLicenses ?? [];
      if (u.accountEnabled === false && licenses.length > 0) {
        disabledCount++;
        for (const l of licenses) {
          const sku = skuById.get(l.skuId);
          if (sku) disabledWaste += price(sku.skuPartNumber);
        }
      }
    }

    if (disabledCount > 0) {
      findings.push({
        category: "cost",
        checkId: unusedLicenses.id,
        severity: disabledWaste >= 200 ? "high" : "medium",
        title: `${disabledCount} disabled users still hold licenses`,
        description: `${disabledCount} disabled accounts are still assigned paid licenses — roughly $${disabledWaste}/mo wasted.`,
        impact: { usd: disabledWaste, count: disabledCount },
        remediation:
          "Remove licenses from disabled accounts (or convert mailboxes to shared) in M365 Admin → Users.",
      });
    }

    return findings;
  },
};
