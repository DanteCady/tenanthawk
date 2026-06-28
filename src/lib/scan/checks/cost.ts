import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

interface SubscribedSku {
  skuPartNumber?: string;
  capabilityStatus?: string;
  appliesTo?: string;
  prepaidUnits?: { enabled?: number };
  consumedUnits?: { enabled?: number };
}

interface LicensedUser {
  displayName?: string;
  userPrincipalName?: string;
  assignedLicenses?: unknown[];
}

/** Free/viral SKUs with huge prepaid counts add noise without actionable waste. */
const NOISE_UNUSED_SKUS = new Set([
  "FLOW_FREE",
  "CCIBOTS_PRIVPREV_VIRAL",
  "POWERAPPS_VIRAL",
  "TEAMS_ESSENTIALS_AAD",
  "WINDOWS_STORE",
]);

/** Disabled or blocked sign-in accounts still consuming license seats. */
export const disabledUserLicenses: Check = {
  id: "cost.disabled-user-licenses",
  category: "cost",
  async run({ token }) {
    const users = await graphGet<LicensedUser>(
      token,
      "/users?$filter=accountEnabled eq false&$select=displayName,userPrincipalName,assignedLicenses&$top=999",
    );

    const withLicenses = users.filter((u) => (u.assignedLicenses?.length ?? 0) > 0);
    if (withLicenses.length === 0) return [];

    const names = withLicenses
      .slice(0, 20)
      .map((u) => u.displayName ?? u.userPrincipalName ?? "Unknown");

    return [
      {
        category: "cost",
        checkId: disabledUserLicenses.id,
        severity: withLicenses.length >= 5 ? "high" : "medium",
        title: `${withLicenses.length} disabled account${withLicenses.length === 1 ? "" : "s"} still have licenses`,
        description: `${withLicenses.length} disabled (blocked sign-in) accounts still have Microsoft 365 licenses assigned.`,
        impact: { count: withLicenses.length, entities: names },
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
      if (NOISE_UNUSED_SKUS.has(name)) continue;
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
