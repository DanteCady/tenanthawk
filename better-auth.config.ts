/**
 * Minimal Better Auth config for CLI migrations only.
 * Run: npx @better-auth/cli migrate -y --config better-auth.config.ts
 */
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { stripe } from "@better-auth/stripe";
import { sso } from "@better-auth/sso";
import Stripe from "stripe";
import { pool } from "./src/db";
import { getAuthAllowedHosts } from "./src/lib/enterprise/config";

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);

const authFallbackUrl =
  process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: getAuthAllowedHosts(),
    fallback: authFallbackUrl,
    protocol: "auto",
  },
  database: pool,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: false,
        defaultValue: "individual",
        input: true,
      },
    },
  },
  plugins: [
    admin(),
    organization(),
    sso(),
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
          {
            name: "msp",
            priceId: process.env.STRIPE_PRICE_ENTERPRISE || "",
            annualDiscountPriceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || undefined,
          },
        ],
      },
    }),
  ],
});
