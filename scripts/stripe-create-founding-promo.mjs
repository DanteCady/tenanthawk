/**
 * Create EARLYBIRD26 in Stripe (25% off Pro forever, max 20 redemptions).
 *
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-create-founding-promo.mjs
 */
import Stripe from "stripe";

const FOUNDING_PROMO_CODE = "EARLYBIRD26";
const FOUNDING_PROMO_MAX_CUSTOMERS = 20;
const FOUNDING_PROMO_PERCENT_OFF = 25;

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key || key.includes("placeholder")) {
  console.error("Set STRIPE_SECRET_KEY to a real Stripe secret key.");
  process.exit(1);
}

const stripe = new Stripe(key);

const existing = await stripe.promotionCodes.list({
  code: FOUNDING_PROMO_CODE,
  limit: 1,
});

if (existing.data[0]) {
  const promo = existing.data[0];
  console.log(`Promotion code already exists: ${FOUNDING_PROMO_CODE}`);
  console.log(`  id: ${promo.id}`);
  console.log(`  active: ${promo.active}`);
  console.log(`  times_redeemed: ${promo.times_redeemed ?? 0} / ${promo.max_redemptions ?? "∞"}`);
  process.exit(0);
}

const coupons = await stripe.coupons.list({ limit: 100 });
const coupon =
  coupons.data.find((c) => c.name === FOUNDING_PROMO_CODE && c.valid) ??
  coupons.data.find((c) => c.percent_off === FOUNDING_PROMO_PERCENT_OFF && c.duration === "forever" && c.valid);

let couponId = coupon?.id;
if (!couponId) {
  const created = await stripe.coupons.create({
    percent_off: FOUNDING_PROMO_PERCENT_OFF,
    duration: "forever",
    name: "Tenant Hawk early bird founding pricing",
    metadata: {
      promo: FOUNDING_PROMO_CODE,
      max_customers: String(FOUNDING_PROMO_MAX_CUSTOMERS),
    },
  });
  couponId = created.id;
  console.log(`Created coupon: ${couponId}`);
}

const promotionCode = await stripe.promotionCodes.create({
  promotion: { type: "coupon", coupon: couponId },
  code: FOUNDING_PROMO_CODE,
  max_redemptions: FOUNDING_PROMO_MAX_CUSTOMERS,
  metadata: {
    campaign: "founding_2026",
  },
});

console.log("Created founding promo:");
console.log(`  code: ${promotionCode.code}`);
console.log(`  coupon: ${couponId} (${FOUNDING_PROMO_PERCENT_OFF}% off forever)`);
console.log(`  promotion_code id: ${promotionCode.id}`);
console.log(`  max_redemptions: ${FOUNDING_PROMO_MAX_CUSTOMERS}`);
