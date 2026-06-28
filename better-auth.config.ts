/**
 * Minimal Better Auth config for CLI migrations only.
 * Run: npx @better-auth/cli migrate -y --config better-auth.config.ts
 */
import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { pool } from "./src/db";

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
      subscription: {
        enabled: true,
        plans: [
          {
            name: "pro",
            priceId: process.env.STRIPE_PRICE_PRO || "",
            annualDiscountPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || undefined,
          },
        ],
      },
    }),
  ],
});
