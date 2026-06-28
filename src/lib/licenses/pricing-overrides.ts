export interface LicensePricingOverrides {
  /** Fallback USD/mo per seat when SKU is not in the table or overrides. */
  defaultUsd?: number;
  /** skuPartNumber → USD/mo per seat */
  skus?: Record<string, number>;
}

export const COMMON_LICENSE_PRICING_FIELDS = [
  { code: "SPE_E3", label: "Microsoft 365 E3" },
  { code: "SPE_E5", label: "Microsoft 365 E5" },
  { code: "ENTERPRISEPACK", label: "Office 365 E3" },
  { code: "ENTERPRISEPREMIUM", label: "Office 365 E5" },
  { code: "O365_BUSINESS_PREMIUM", label: "Microsoft 365 Business Standard" },
  { code: "SPB", label: "Microsoft 365 Business Premium" },
] as const;

const MAX_RATE = 1000;

function normalizeRate(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0 || value > MAX_RATE) return null;
  return Math.round(value * 100) / 100;
}

export function parseLicensePricing(raw: unknown): LicensePricingOverrides | null {
  if (raw == null) return null;

  let data: unknown = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (typeof data !== "object" || data === null) return null;
  const o = data as Record<string, unknown>;
  const result: LicensePricingOverrides = {};

  const defaultUsd = normalizeRate(o.defaultUsd);
  if (defaultUsd != null) result.defaultUsd = defaultUsd;

  if (o.skus && typeof o.skus === "object" && o.skus !== null) {
    const skus: Record<string, number> = {};
    for (const [key, value] of Object.entries(o.skus as Record<string, unknown>)) {
      const code = key.trim().toUpperCase();
      if (!/^[A-Z0-9_]{2,64}$/.test(code)) continue;
      const rate = normalizeRate(value);
      if (rate != null) skus[code] = rate;
    }
    if (Object.keys(skus).length > 0) result.skus = skus;
  }

  if (result.defaultUsd == null && !result.skus) return null;
  return result;
}

export function hasCustomLicensePricing(
  overrides: LicensePricingOverrides | null | undefined,
): boolean {
  return (
    overrides != null &&
    (overrides.defaultUsd != null || Object.keys(overrides.skus ?? {}).length > 0)
  );
}

export function sanitizeLicensePricingInput(
  input: LicensePricingOverrides,
): LicensePricingOverrides | null {
  return parseLicensePricing(input);
}
