/** Approx. Microsoft 365 E5 list price per user/month (ROI marketing copy). */
export const E5_LICENSE_MONTHLY_USD_LIST = 57;

/** Display pricing for Pro (must match Stripe Price amounts). */
export const PRO_MONTHLY_USD = 49;

/** Billed yearly — 2 months free vs paying monthly ($49 × 12 = $588). */
export const PRO_ANNUAL_USD = 490;

export const PRO_ANNUAL_MONTHLY_EQUIV = Math.round((PRO_ANNUAL_USD / 12) * 100) / 100;

export const PRO_ANNUAL_SAVINGS_USD = PRO_MONTHLY_USD * 12 - PRO_ANNUAL_USD;

export const PRO_ANNUAL_SAVINGS_PERCENT = Math.round(
  (PRO_ANNUAL_SAVINGS_USD / (PRO_MONTHLY_USD * 12)) * 100,
);

/** Enterprise Starter — flat platform fee (must match Stripe Price amounts). */
export const ENTERPRISE_MONTHLY_USD = 299;

/** Billed yearly — 2 months free vs paying monthly ($299 × 12 = $3588). */
export const ENTERPRISE_ANNUAL_USD = 2990;

export const ENTERPRISE_ANNUAL_MONTHLY_EQUIV =
  Math.round((ENTERPRISE_ANNUAL_USD / 12) * 100) / 100;

export const ENTERPRISE_ANNUAL_SAVINGS_USD =
  ENTERPRISE_MONTHLY_USD * 12 - ENTERPRISE_ANNUAL_USD;

export const ENTERPRISE_ANNUAL_SAVINGS_PERCENT = Math.round(
  (ENTERPRISE_ANNUAL_SAVINGS_USD / (ENTERPRISE_MONTHLY_USD * 12)) * 100,
);

/** Included client tenants on Enterprise Starter (override with ENTERPRISE_CLIENT_CAP). */
export const ENTERPRISE_CLIENT_CAP_DEFAULT = 10;

export function getEnterpriseClientCap(): number {
  const raw = process.env.ENTERPRISE_CLIENT_CAP?.trim();
  if (!raw) return ENTERPRISE_CLIENT_CAP_DEFAULT;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : ENTERPRISE_CLIENT_CAP_DEFAULT;
}

export function isAnnualBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_PRICE_PRO_ANNUAL?.trim());
}

export function isEnterpriseBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_PRICE_ENTERPRISE?.trim());
}

export function isEnterpriseAnnualBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL?.trim());
}

export function isStripeBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
