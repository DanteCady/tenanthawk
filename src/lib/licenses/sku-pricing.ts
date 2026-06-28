import { shouldSkipUnusedSeatFinding } from "@/lib/licenses/sku-display";
import type { LicensePricingOverrides } from "@/lib/licenses/pricing-overrides";
import { hasCustomLicensePricing } from "@/lib/licenses/pricing-overrides";

/** Shown on findings with dollar estimates (Microsoft list prices). */
export const LICENSE_PRICING_NOTE =
  "Estimated using Microsoft list pricing (annual commitment, USD/mo per seat). Your contract may differ.";

export function licensePricingNote(
  overrides?: LicensePricingOverrides | null,
): string {
  if (hasCustomLicensePricing(overrides)) {
    return "Estimated using your contracted rates from Settings. Run a rescan to refresh dollar amounts.";
  }
  return LICENSE_PRICING_NOTE;
}

/**
 * Microsoft list prices — USD per user / month (annual commitment).
 * Sources: Microsoft price list / NCE tiers (2025–2026). Rounded for display.
 */
const SKU_MONTHLY_USD: Record<string, number> = {
  // Office 365 / Microsoft 365 enterprise
  STANDARDPACK: 10,
  ENTERPRISEPACK: 26,
  ENTERPRISEPREMIUM: 38,
  SPE_E3: 39,
  SPE_E5: 60,
  SPE_E1: 10,
  M365EDU_A3: 30,
  M365EDU_A5: 45,

  // Business (≤300 users)
  O365_BUSINESS_ESSENTIALS: 7,
  O365_BUSINESS: 8.25,
  O365_BUSINESS_PREMIUM: 14,
  SPB: 22,
  SMB_BUSINESS: 14,
  SMB_BUSINESS_PREMIUM: 22,

  // Frontline / deskless
  M365_F1: 3,
  SPE_F1: 10,
  DESKLESSPACK: 10,
  OFFICEBASIC: 7,

  // Apps only
  OFFICESUBSCRIPTION: 12,
  OFFICESUBSCRIPTION_STUDENT: 12,

  // Exchange / Outlook
  EXCHANGESTANDARD: 4,
  EXCHANGEENTERPRISE: 8,
  EXCHANGEDESKLESS: 4,

  // Common add-ons (still reclaimable from disabled users)
  AAD_PREMIUM: 6,
  AAD_PREMIUM_P2: 9,
  RIGHTSMANAGEMENT: 2,
  POWER_BI_PRO: 10,
  POWER_BI_STANDARD: 10,
  PROJECTPROFESSIONAL: 30,
  PROJECTPREMIUM: 55,
  VISIOCLIENT: 15,
  MCOMEETADV: 4,
  MCOEV: 8,
  MCOPSTN1: 12,
  MCOPSTN2: 24,
  MCOPSTN_5: 12,
  MCOPSTN5_US: 12,
  MCOPSTN_6: 12,
  MCOPSTN5: 12,
  MCOTEAMS_ESSENTIALS: 15,
  TEAMS_EXPLORATORY: 0,
  ATP_ENTERPRISE: 5,
  THREAT_INTELLIGENCE: 15,
};

/** Fallback when SKU is a user seat but not in the price table. */
const DEFAULT_USER_SEAT_USD = 20;

const ZERO_VALUE_SKUS = new Set([
  "AAD_BASIC",
  "SMB_APPS",
  "FLOW_FREE",
  "TEAMS_FREE",
  "WINDOWS_STORE",
]);

const CAPACITY_SKU_PATTERN =
  /CAPACITY|_GB$|STORAGE|MAU_|ADDON_STORE|COMMUNICATIONS|MCOPSTNC/i;

export function isBillableUserSeat(
  skuPartNumber: string,
  appliesTo?: string,
): boolean {
  const code = skuPartNumber.trim().toUpperCase();
  if (!code || code === "UNKNOWN") return false;
  if (shouldSkipUnusedSeatFinding(code)) return false;
  if (ZERO_VALUE_SKUS.has(code)) return false;
  if (CAPACITY_SKU_PATTERN.test(code)) return false;
  if (appliesTo && appliesTo !== "User") return false;
  return true;
}

export function microsoftListPriceForSku(skuPartNumber: string): number | null {
  const code = skuPartNumber.trim().toUpperCase();
  const listed = SKU_MONTHLY_USD[code];
  return listed ?? null;
}

export function monthlyUsdPerSeat(
  skuPartNumber: string,
  appliesTo?: string,
  overrides?: LicensePricingOverrides | null,
): number | null {
  const code = skuPartNumber.trim().toUpperCase();
  if (!isBillableUserSeat(code, appliesTo)) return null;

  const overrideRate = overrides?.skus?.[code];
  if (overrideRate != null) return overrideRate;

  const listed = SKU_MONTHLY_USD[code];
  if (listed != null) return listed;

  if (overrides?.defaultUsd != null) return overrides.defaultUsd;

  return DEFAULT_USER_SEAT_USD;
}

export function estimateRecoverableUsd(
  skuPartNumber: string,
  seatCount: number,
  appliesTo?: string,
  overrides?: LicensePricingOverrides | null,
): number {
  if (seatCount <= 0) return 0;
  const perSeat = monthlyUsdPerSeat(skuPartNumber, appliesTo, overrides);
  if (perSeat == null || perSeat <= 0) return 0;
  return Math.round(perSeat * seatCount);
}

export function sumAssignedLicenseUsd(
  assigned: Array<{ skuId: string }>,
  skuById: Map<string, { skuPartNumber?: string; appliesTo?: string }>,
  overrides?: LicensePricingOverrides | null,
): { licenseCount: number; usd: number } {
  let licenseCount = 0;
  let usd = 0;

  for (const lic of assigned) {
    const sub = skuById.get(lic.skuId);
    const code = sub?.skuPartNumber ?? "UNKNOWN";
    const perSeat = monthlyUsdPerSeat(code, sub?.appliesTo, overrides);
    if (perSeat == null || perSeat <= 0) continue;
    licenseCount += 1;
    usd += perSeat;
  }

  return { licenseCount, usd: Math.round(usd) };
}
