"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  authInputClass,
  authOtpClass,
  RESEND_COOLDOWN_SEC,
} from "@/components/auth/auth-styles";

export function ResetPasswordForm({ initialEmail }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
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
    setResending(true);

    const { error: resetError } = await authClient.emailOtp.requestPasswordReset({
      email: target,
    });

    setResending(false);

    if (resetError) {
      setError(resetError.message ?? "Could not resend code.");
      return;
    }

    setCooldown(RESEND_COOLDOWN_SEC);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = email.trim();
    if (!target || otp.length < 6 || password.length < 8) return;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    const { error: resetError } = await authClient.emailOtp.resetPassword({
      email: target,
      otp: otp.trim(),
      password,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? "Invalid or expired code. Request a new one.");
      return;
    }

    router.push("/login?reset=1");
    router.refresh();
  }

  const canResend = email.trim().length > 0 && cooldown === 0 && !resending;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="reset-email" className="mb-1.5 block text-sm text-slate-600">
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
        />
      </div>

      <div>
        <label htmlFor="reset-otp" className="mb-1.5 block text-sm text-slate-600">
          Reset code
        </label>
        <input
          id="reset-otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className={authOtpClass}
        />
      </div>

      <div>
        <label htmlFor="reset-password" className="mb-1.5 block text-sm text-slate-600">
          New password
        </label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={authInputClass}
        />
      </div>

      <div>
        <label htmlFor="reset-confirm" className="mb-1.5 block text-sm text-slate-600">
          Confirm password
        </label>
        <input
          id="reset-confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          className={authInputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || otp.length < 6 || password.length < 8}
        className="btn-primary w-full disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Updating…
          </>
        ) : (
          "Set new password"
        )}
      </button>

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
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
