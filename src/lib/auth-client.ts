"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
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
    adminClient(),
    organizationClient(),
    ssoClient(),
    stripeClient({ subscription: true }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

const VERIFY_CALLBACK = "/check-email";

export { VERIFY_CALLBACK };
