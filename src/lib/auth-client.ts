"use client";

import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  emailOTPClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { ssoClient } from "@better-auth/sso/client";
import { stripeClient } from "@better-auth/stripe/client";

function resolveClientBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveClientBaseUrl(),
  plugins: [
    emailOTPClient(),
    twoFactorClient({
      twoFactorPage: "/two-factor",
    }),
    adminClient(),
    organizationClient(),
    ssoClient(),
    stripeClient({ subscription: true }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

const VERIFY_CALLBACK = "/check-email";

export { VERIFY_CALLBACK };
