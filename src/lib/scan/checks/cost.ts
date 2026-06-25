import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

interface SubscribedSku {
  skuPartNumber?: string;
  capabilityStatus?: string;
  appliesTo?: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: { enabled?: number };
}

/** Surfaces prepaid license seats that are assigned but unused. */
export const unusedLicenses: Check = {
  id: "cost.unused-licenses",
  category: "cost",
  async run({ token }) {
    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const findings: FindingDraft[] = [];

    for (const sku of skus) {
      if (sku.capabilityStatus && sku.capabilityStatus !== "Enabled") continue;

      const enabled = sku.prepaidUnits?.enabled ?? 0;
      const consumed = sku.consumedUnits?.enabled ?? 0;
      const unused = enabled - consumed;
      if (unused < 3) continue;

      const name = sku.skuPartNumber ?? "Unknown SKU";
      findings.push({
        category: "cost",
        checkId: unusedLicenses.id,
        severity: unused >= 10 ? "high" : "medium",
        title: `${unused} unused ${name} license${unused === 1 ? "" : "s"}`,
        description: `${enabled} ${name} seats are prepaid but only ${consumed} are assigned — ${unused} appear unused.`,
        remediation:
          "Review license assignments in M365 Admin → Users → Active users, or reduce prepaid seats in Billing.",
        entityRef: name,
        impact: { count: unused },
      });
    }

    return findings;
  },
};

/** Flags subscription SKUs in warning/suspended state (renewal / billing risk). */
export const licenseExpiry: Check = {
  id: "cost.license-expiry",
  category: "cost",
  async run({ token }) {
    const skus = await graphGet<SubscribedSku>(token, "/subscribedSkus");
    const findings: FindingDraft[] = [];

    for (const sku of skus) {
      const status = sku.capabilityStatus ?? "Enabled";
      if (status === "Enabled") continue;

      const name = sku.skuPartNumber ?? "Unknown SKU";
      findings.push({
        category: "cost",
        checkId: licenseExpiry.id,
        severity: status === "Suspended" ? "high" : "medium",
        title: `License SKU ${name} is ${status.toLowerCase()}`,
        description: `Subscribed SKU ${name} reports capability status "${status}" — renewal or billing action may be required.`,
        remediation:
          "Review subscription status in M365 Admin → Billing → Your products, or Microsoft 365 admin center → Billing.",
        entityRef: name,
        impact: { count: 1, daysUntil: 0 },
      });
    }

    return findings;
  },
};
