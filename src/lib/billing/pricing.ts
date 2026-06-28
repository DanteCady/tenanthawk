/** Display pricing for Pro (must match Stripe Price amounts). */
export const PRO_MONTHLY_USD = 49;

/** Billed yearly — 2 months free vs paying monthly ($49 × 12 = $588). */
export const PRO_ANNUAL_USD = 490;

export const PRO_ANNUAL_MONTHLY_EQUIV = Math.round((PRO_ANNUAL_USD / 12) * 100) / 100;

export const PRO_ANNUAL_SAVINGS_USD = PRO_MONTHLY_USD * 12 - PRO_ANNUAL_USD;

export const PRO_ANNUAL_SAVINGS_PERCENT = Math.round(
  (PRO_ANNUAL_SAVINGS_USD / (PRO_MONTHLY_USD * 12)) * 100,
);

export function isAnnualBillingConfigured(): boolean {
  return Boolean(process.env.STRIPE_PRICE_PRO_ANNUAL?.trim());
}
