/** Founding promo - Stripe Promotion Code `EARLYBIRD26`. */
export const FOUNDING_PROMO_CODE = "EARLYBIRD26";

/** Must match `max_redemptions` on the Stripe promotion code. */
export const FOUNDING_PROMO_MAX_CUSTOMERS = 20;

/** Must match Stripe Coupon `percent_off`. */
export const FOUNDING_PROMO_PERCENT_OFF = 25;

export const FOUNDING_PROMO_HEADLINE = "Early bird founding pricing";

export function foundingPromoMonthlyUsd(listPrice = 49): number {
  return Math.round(listPrice * (1 - FOUNDING_PROMO_PERCENT_OFF / 100) * 100) / 100;
}

export function foundingPromoAnnualUsd(listPrice = 490): number {
  return Math.round(listPrice * (1 - FOUNDING_PROMO_PERCENT_OFF / 100) * 100) / 100;
}

export function foundingPromoSummary(): string {
  const monthly = foundingPromoMonthlyUsd();
  const annual = foundingPromoAnnualUsd();
  return `${FOUNDING_PROMO_PERCENT_OFF}% off Pro for life (~$${monthly}/mo or $${annual}/yr) - first ${FOUNDING_PROMO_MAX_CUSTOMERS} customers only.`;
}
