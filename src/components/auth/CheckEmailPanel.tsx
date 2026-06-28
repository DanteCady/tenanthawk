"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.35em] text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function CheckEmailPanel({
  email,
  errorCode,
}: {
  email?: string;
  errorCode?: string;
}) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");

  async function resend() {
    if (!email) return;
    setError("");
    setResent(false);
    setResending(true);

    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message ?? "Could not resend the code. Try again.");
      return;
    }

    setResent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || otp.length < 6) return;

    setError("");
    setVerifying(true);

    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email,
      otp: otp.trim(),
    });

    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code. Try again or request a new one.");
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  const linkError =
    errorCode === "TOKEN_EXPIRED" || errorCode === "INVALID_TOKEN"
      ? "That verification link expired. Enter the code from your latest email instead."
      : errorCode === "USER_NOT_FOUND"
        ? "We couldn't find an account for that link. Try signing up again."
        : undefined;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Mail className="h-6 w-6" />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-600">
            We sent a 6-digit code to{" "}
            {email ? (
              <span className="font-medium text-slate-900">{email}</span>
            ) : (
              "your email"
            )}
            . Enter it below to continue onboarding.
          </p>
          <p className="text-xs text-slate-500">
            Check spam if you don&apos;t see it within a few minutes.
          </p>
        </div>
      </div>

      <form onSubmit={verify} className="space-y-3">
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
            className={inputClass}
          />
        </div>

        {(linkError || error) && (
          <p className="text-center text-sm text-red-600">{linkError ?? error}</p>
        )}

        {resent && (
          <p className="text-center text-sm text-green-700">New code sent.</p>
        )}

        <button
          type="submit"
          disabled={verifying || otp.length < 6}
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

      {email && (
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="btn-secondary w-full disabled:cursor-not-allowed"
        >
          {resending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            "Resend code"
          )}
        </button>
      )}

      <p className="text-center text-sm text-slate-600">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
