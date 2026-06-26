import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { pool } from "../db";
import {
  cancelStripeSubscription,
  deleteUserData,
} from "./account/deleteUserData";

// Placeholder keys keep schema generation + demo mode working before real
// Stripe keys are added. Real checkout/webhook activate once env is set.
const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);

export const PRO_PLAN = "pro";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    // Local/dev: no email provider wired yet, so don't block sign-in.
    requireEmailVerification: false,
    autoSignIn: true,
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await cancelStripeSubscription(user.id);
        await deleteUserData(user.id);
      },
    },
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder",
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: PRO_PLAN,
            priceId: process.env.STRIPE_PRICE_PRO || "",
          },
        ],
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
