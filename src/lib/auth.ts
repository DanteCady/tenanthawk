import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins/email-otp";
import { twoFactor } from "better-auth/plugins/two-factor";
import { admin } from "better-auth/plugins/admin";
import { organization } from "better-auth/plugins/organization";
import { stripe } from "@better-auth/stripe";
import { sso } from "@better-auth/sso";
import Stripe from "stripe";
import { pool } from "../db";
import {
  cancelStripeSubscription,
  deleteUserData,
} from "./account/deleteUserData";
import { sendEmail } from "./email/send";
import { passwordResetOtpEmail, verificationOtpEmail } from "./email/templates";
import {
  promotionCodeFromUpgradeMetadata,
  resolveCheckoutDiscountParams,
} from "./billing/stripe-checkout";
import {
  getAuthAllowedHosts,
  getEnterpriseCookieDomain,
  getSsoDomainVerificationOptions,
  getTenantHawkAdminUserIds,
  isEnterpriseSsoEnabled,
} from "./enterprise/config";
import { getPlan, isEnterprisePlan } from "./entitlements";
import { captureServerEvent, identifyServerUser } from "./analytics/server";
import { fireSignupWebhook } from "./marketing/webhook";

const stripeClient = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);

export const PRO_PLAN = "pro";
export const ENTERPRISE_PLAN = "msp";

const authFallbackUrl =
  process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";

const cookieDomain = getEnterpriseCookieDomain();

export const auth = betterAuth({
  appName: "Tenant Hawk",
  baseURL: {
    allowedHosts: getAuthAllowedHosts(),
    fallback: authFallbackUrl,
    protocol: "auto",
  },
  trustedOrigins: [
    authFallbackUrl,
    "http://localhost:3000",
    "http://*.localhost:3000",
    "https://tenanthawk.io",
    "https://*.tenanthawk.io",
    "http://tenanthawk.io",
    "http://*.tenanthawk.io",
  ],
  advanced: cookieDomain
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: cookieDomain,
        },
      }
    : undefined,
  database: pool,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const accountType =
            (user as { accountType?: string | null }).accountType ?? "individual";
          identifyServerUser(user.id, { email: user.email, name: user.name ?? null });
          captureServerEvent(user.id, "signup_completed", { account_type: accountType });
          await fireSignupWebhook({
            email: user.email,
            name: user.name,
            accountType,
          });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: false,
        defaultValue: "individual",
        input: true,
      },
    },
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        await cancelStripeSubscription(user.id);
        await deleteUserData(user.id);
      },
    },
  },
  plugins: [
    admin({
      adminUserIds: getTenantHawkAdminUserIds(),
    }),
    organization({
      allowUserToCreateOrganization: async (user) => {
        const plan = await getPlan(user.id);
        if (isEnterprisePlan(plan)) return true;
        const accountType = (user as { accountType?: string | null }).accountType;
        return accountType === "msp";
      },
      organizationLimit: 1,
      creatorRole: "owner",
    }),
    ...(isEnterpriseSsoEnabled()
      ? [
          sso({
            organizationProvisioning: {
              defaultRole: "member",
            },
            domainVerification: getSsoDomainVerificationOptions(),
          }),
        ]
      : []),
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 600,
      resendStrategy: "reuse",
      rateLimit: { window: 60, max: 5 },
      async sendVerificationOTP({ email, otp, type }) {
        const mail =
          type === "forget-password"
            ? passwordResetOtpEmail({ otp })
            : type === "email-verification"
              ? verificationOtpEmail({ otp })
              : null;
        if (!mail) return;
        const ok = await sendEmail({ to: email, ...mail });
        if (!ok) {
          console.error(`[auth] Failed to send ${type} OTP to`, email);
        }
      },
    }),
    twoFactor({
      issuer: "Tenant Hawk",
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
            annualDiscountPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || undefined,
          },
          {
            name: ENTERPRISE_PLAN,
            priceId: process.env.STRIPE_PRICE_ENTERPRISE || "",
            annualDiscountPriceId: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || undefined,
          },
        ],
        async getCheckoutSessionParams(_data, _request, ctx) {
          const metadata = ctx.body?.metadata as Record<string, unknown> | undefined;
          const discountParams = await resolveCheckoutDiscountParams(
            stripeClient,
            promotionCodeFromUpgradeMetadata(metadata),
          );
          return { params: discountParams };
        },
        async onSubscriptionComplete({ subscription, plan }) {
          captureServerEvent(subscription.referenceId, "plan_upgraded", {
            plan: plan.name,
          });
          identifyServerUser(subscription.referenceId, { plan: plan.name });
        },
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
