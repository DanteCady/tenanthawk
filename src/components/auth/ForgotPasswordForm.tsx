"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { authInputClass, RESEND_COOLDOWN_SEC } from "@/components/auth/auth-styles";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;

    setError("");
    setLoading(true);

    const { error: resetError } = await authClient.emailOtp.requestPasswordReset({
      email: target,
    });

    setLoading(false);

    if (resetError) {
      const msg = resetError.message ?? "Could not send reset code. Try again.";
      setError(msg);
      return;
    }

    setSent(true);
    router.push(`/reset-password?email=${encodeURIComponent(target)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-sm text-slate-600">
        Enter your account email and we&apos;ll send a 6-digit code to reset your password.
      </p>

      <div>
        <label htmlFor="forgot-email" className="mb-1.5 block text-sm text-slate-600">
          Work email
        </label>
        <input
          id="forgot-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className={authInputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {sent && (
        <p className="text-sm text-green-700">
          If an account exists for that email, a reset code is on its way.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="group btn-primary w-full shadow-none hover:shadow-md disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send reset code
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="pt-2 text-center text-sm text-slate-600">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-slate-500">
        Codes expire in {RESEND_COOLDOWN_SEC / 60} minutes. Check spam if you don&apos;t see the email.
      </p>
    </form>
  );
}
