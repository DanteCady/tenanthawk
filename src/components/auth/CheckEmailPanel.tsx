"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { AccountType } from "@/lib/onboarding/account-type";
import {
  clearAccountIntent,
  isAccountType,
  readAccountIntent,
} from "@/lib/onboarding/account-type";

import { authInputClass, authOtpClass, RESEND_COOLDOWN_SEC } from "@/components/auth/auth-styles";

const inputClass = authInputClass;
const otpClass = authOtpClass;

export function CheckEmailPanel({
  email: initialEmail,
  errorCode,
  intent,
}: {
  email?: string;
  errorCode?: string;
  intent?: AccountType;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    const target = initialEmail?.trim().toLowerCase();
    if (!target) return;

    void (async () => {
      const { data } = await authClient.getSession();
      const current = data?.user?.email?.trim().toLowerCase();
      if (current && current !== target) {
        await authClient.signOut();
      }
    })();
  }, [initialEmail]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  async function resend() {
    const target = email.trim();
    if (!target || cooldown > 0) return;

    setError("");
    setResent(false);
    setResending(true);

    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
      email: target,
      type: "email-verification",
    });

    setResending(false);

    if (resendError) {
      const msg = resendError.message ?? "Could not resend the code. Try again.";
      if (msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("too many")) {
        setCooldown(RESEND_COOLDOWN_SEC);
      }
      setError(msg);
      return;
    }

    setResent(true);
    setCooldown(RESEND_COOLDOWN_SEC);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const target = email.trim();
    if (!target || otp.length < 6) return;

    setError("");
    setVerifying(true);

    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email: target,
      otp: otp.trim(),
    });

    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code. Try again or request a new one.");
      setVerifying(false);
      return;
    }

    const accountType =
      (intent && isAccountType(intent) ? intent : null) ??
      readAccountIntent() ??
      "individual";
    clearAccountIntent();
    const path = accountType === "msp" ? "/onboarding/workspace" : "/onboarding";
    window.location.assign(path);
  }

  const linkError =
    errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN"
      ? "That verification link expired. Enter the code from your latest email instead."
      : errorCode === "USER_NOT_FOUND"
        ? "We couldn't find an account for that link. Try signing up again."
        : undefined;

  const canResend = email.trim().length > 0 && cooldown === 0 && !resending;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Mail className="h-6 w-6" />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-600">
            We sent a 6-digit code to your email. Enter it below to continue onboarding.
          </p>
          <p className="text-xs text-slate-500">
            Check spam if you don&apos;t see it within a few minutes.
          </p>
        </div>
      </div>

      <form onSubmit={verify} className="space-y-3">
        <div>
          <label htmlFor="verify-email" className="mb-1.5 block text-sm text-slate-600">
            Email
          </label>
          <input
            id="verify-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="otp" className="mb-1.5 block text-sm text-slate-600">
            Verification code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className={otpClass}
          />
        </div>

        {(linkError || error) && (
          <p className="text-center text-sm text-red-600">{linkError ?? error}</p>
        )}

        {resent && (
          <p className="text-center text-sm text-green-700">New code sent - check your inbox.</p>
        )}

        <button
          type="submit"
          disabled={verifying || otp.length < 6 || !email.trim()}
          className="btn-primary w-full disabled:cursor-not-allowed"
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Verify and continue"
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={resend}
        disabled={!canResend}
        className="btn-secondary w-full disabled:cursor-not-allowed"
      >
        {resending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : cooldown > 0 ? (
          `Resend code in ${cooldown}s`
        ) : (
          "Resend code"
        )}
      </button>

      <p className="text-center text-sm text-slate-600">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
