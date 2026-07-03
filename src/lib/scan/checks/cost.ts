import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";
import {
  resolveLicenseSku,
  shouldSkipUnusedSeatFinding,
} from "@/lib/licenses/sku-display";
import {
  estimateRecoverableUsd,
  licensePricingNote,
  sumAssignedLicenseUsd,
} from "@/lib/licenses/sku-pricing";

interface SubscribedSku {
  skuId?: string;
  skuPartNumber?: string;
  capabilityStatus?: string;
  appliesTo?: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: { enabled?: number };
}

interface AssignedLicense {
  skuId: string;
}

interface LicensedUser {
  displayName?: string;
  userPrincipalName?: string;
  assignedLicenses?: AssignedLicense[];
}

function formatUsdInTitle(usd: number): string {
  return usd.toLocaleString("en-US");
}

/** Disabled or blocked sign-in accounts still consuming license seats. */
export const disabledUserLicenses: Check = {
  id: "cost.disabled-user-licenses",
  category: "cost",
  async run({ token, licensePricing }) {
    const [users, skus] = await Promise.all([
      graphGet<LicensedUser>(
        token,
        "/users?$filter=accountEnabled eq false&$select=displayName,userPrincipalName,assignedLicenses&$top=999",
      ),
      graphGet<SubscribedSku>(token, "/subscribedSkus"),
    ]);

    const skuById = new Map(
      skus
        .filter((s) => s.skuId)
        .map((s) => [s.skuId as string, s]),
    );

    const withLicenses = users.filter((u) => (u.assignedLicenses?.length ?? 0) > 0);
    if (withLicenses.length === 0) return [];

    const names = withLicenses
      .slice(0, 20)
      .map((u) => u.displayName ?? u.userPrincipalName ?? "Unknown");

    let totalUsd = 0;
    let reclaimableLicenses = 0;
    for (const user of withLicenses) {
      const { licenseCount, usd } = sumAssignedLicenseUsd(
        user.assignedLicenses ?? [],
        skuById,
        licensePricing,
      );
      reclaimableLicenses += licenseCount;
      totalUsd += usd;
    }

    const savingsLine =
      totalUsd > 0
        ? ` Estimated recoverable spend: ~$${formatUsdInTitle(totalUsd)}/mo. ${licensePricingNote(licensePricing)}`
        : "";

    return [
      {
        category: "cost",
        checkId: disabledUserLicenses.id,
        severity: withLicenses.length >= 5 ? "high" : "medium",
        title:
          totalUsd > 0
            ? `~$${formatUsdInTitle(totalUsd)}/mo in licenses on disabled accounts`
            : `${withLicenses.length} disabled account${withLicenses.length === 1 ? "" : "s"} still have licenses`,
        description: `${withLicenses.length} disabled (blocked sign-in) accounts still have ${reclaimableLicenses || "Microsoft 365"} license assignment${reclaimableLicenses === 1 ? "" : "s"}.${savingsLine}`,
        impact: {
          count: withLicenses.length,
          entities: names,
          ...(totalUsd > 0 ? { usd: totalUsd } : {}),
        },
        remediation:
          "Remove licenses from disabled accounts in M365 Admin > Users > Active users, or automate offboarding.",
      },
    ];
  },
};

/** Surfaces prepaid license seats that are assigned but unused. */
export const unusedLicenses: Check = {
  id: "cost.unused-licenses",
  category: "cost",
  async run({ token, licensePricing }) {
    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const findings: FindingDraft[] = [];

    for (const sku of skus) {
      if (sku.capabilityStatus && sku.capabilityStatus !== "Enabled") continue;

      const code = sku.skuPartNumber ?? "Unknown SKU";
      if (shouldSkipUnusedSeatFinding(code)) continue;

      const enabled = sku.prepaidUnits?.enabled ?? 0;
      const consumed = sku.consumedUnits?.enabled ?? 0;
      const unused = enabled - consumed;
      if (unused < 3) continue;

      const info = resolveLicenseSku(code);
      const usd = estimateRecoverableUsd(code, unused, sku.appliesTo, licensePricing);
      const savingsLine =
        usd > 0
          ? ` Estimated recoverable spend: ~$${formatUsdInTitle(usd)}/mo. ${licensePricingNote(licensePricing)}`
          : "";

      findings.push({
        category: "cost",
        checkId: unusedLicenses.id,
        severity: unused >= 10 ? "high" : "medium",
        title:
          usd > 0
            ? `~$${formatUsdInTitle(usd)}/mo in unused ${info.label} seats`
            : `${unused} unused ${info.label} seat${unused === 1 ? "" : "s"}`,
        description: `${enabled} ${info.label} seats are prepaid but only ${consumed} are assigned - ${unused} appear unused.${info.hint ? ` ${info.hint}` : ""}${savingsLine} (SKU: ${info.code})`,
        remediation:
          "Review license assignments in M365 Admin → Users → Active users, or reduce prepaid seats in Billing.",
        entityRef: code,
        impact: {
          count: unused,
          ...(usd > 0 ? { usd } : {}),
        },
      });
    }

    return findings;
  },
};

/** Flags subscription SKUs in warning/suspended state (renewal / billing risk). */
export const licenseExpiry: Check = {
  id: "cost.license-expiry",
  category: "cost",
  async run({ token, licensePricing }) {
    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const findings: FindingDraft[] = [];

    for (const sku of skus) {
      const status = sku.capabilityStatus ?? "Enabled";
      if (status === "Enabled") continue;

      const code = sku.skuPartNumber ?? "Unknown SKU";
      const info = resolveLicenseSku(code);

      findings.push({
        category: "cost",
        checkId: licenseExpiry.id,
        severity: status === "Suspended" ? "high" : "medium",
        title: `${info.label} is ${status.toLowerCase()}`,
        description: `${info.label} reports capability status "${status}" - renewal or billing action may be required.${info.hint ? ` ${info.hint}` : ""} (SKU: ${info.code})`,
        remediation:
          "Review subscription status in M365 Admin → Billing → Your products, or Microsoft 365 admin center → Billing.",
        entityRef: code,
        impact: { count: 1, daysUntil: 0 },
      });
    }

    return findings;
  },
};
