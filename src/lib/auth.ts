import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { pool } from "../db";
import {
  cancelStripeSubscription,
  deleteUserData,
} from "./account/deleteUserData";
import { sendEmail } from "./email/send";
import { verificationOtpEmail } from "./email/templates";

// Placeholder keys keep schema generation + demo mode working before real
// Stripe keys are added. Real checkout/webhook activate once env is set.
const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);

export const PRO_PLAN = "pro";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: pool,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
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
    emailOTP({
      overrideDefaultEmailVerification: true,
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification") return;
        const mail = verificationOtpEmail({ otp });
        const ok = await sendEmail({ to: email, ...mail });
        if (!ok) {
          console.error("[auth] Failed to send verification OTP to", email);
        }
      },
    }),
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
