"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient(), stripeClient({ subscription: true })],
});

export const { signIn, signUp, signOut, useSession } = authClient;

const VERIFY_CALLBACK = "/check-email";

export { VERIFY_CALLBACK };
