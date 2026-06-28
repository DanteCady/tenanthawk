import type Stripe from "stripe";
import { normalizePromoCode } from "@/lib/billing/promo-code";

export async function resolveCheckoutDiscountParams(
  stripe: Stripe,
  rawCode: unknown,
): Promise<
  Pick<Stripe.Checkout.SessionCreateParams, "allow_promotion_codes" | "discounts">
> {
  const promotionCode = normalizePromoCode(rawCode);
  if (!promotionCode) {
    return { allow_promotion_codes: true };
  }

  const promos = await stripe.promotionCodes.list({
    code: promotionCode,
    active: true,
    limit: 1,
  });

  const promo = promos.data[0];
  if (!promo) {
    throw new Error(
      `Promotion code "${promotionCode}" isn't valid, has expired, or has reached its limit.`,
    );
  }

  return {
    discounts: [{ promotion_code: promo.id }],
  };
}

export function promotionCodeFromUpgradeMetadata(
  metadata: Record<string, unknown> | undefined,
): string | undefined {
  return normalizePromoCode(metadata?.promotionCode);
}
