"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn, signUp, signOut, VERIFY_CALLBACK } from "@/lib/auth-client";
import type { AccountType } from "@/lib/onboarding/account-type";
import { persistAccountIntent } from "@/lib/onboarding/account-type";
import { authInputClass } from "@/components/auth/auth-styles";

const inputClass = authInputClass;

export function AuthForm({
  mode,
  redirectTo,
  defaultRedirect,
  accountType = "individual",
}: {
  mode: "login" | "signup";
  /** Post-login path from `?redirect=` (pass from the server page for SSR-safe hydration). */
  redirectTo?: string | null;
  /** Used when the URL has no `redirect` query param (e.g. platform admin login). */
  defaultRedirect?: string;
  accountType?: AccountType;
}) {
  const router = useRouter();
  const redirect = redirectTo ?? defaultRedirect;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup) {
      await signOut();
    }

    const result = isSignup
      ? await signUp.email({
          name: name || email.split("@")[0],
          email,
          password,
          callbackURL: VERIFY_CALLBACK,
          accountType,
        } as Parameters<typeof signUp.email>[0])
      : await signIn.email({
          email,
          password,
          callbackURL: redirect ?? VERIFY_CALLBACK,
        });

    setLoading(false);

    if (result.error) {
      const message = result.error.message ?? "Something went wrong. Please try again.";
      if (message.toLowerCase().includes("email") && message.toLowerCase().includes("verif")) {
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(message);
      return;
    }

    if (
      !isSignup &&
      result.data &&
      "twoFactorRedirect" in result.data &&
      result.data.twoFactorRedirect
    ) {
      const next = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
      router.push(`/two-factor${next}`);
      return;
    }

    if (isSignup) {
      persistAccountIntent(accountType);
      const intent = encodeURIComponent(accountType);
      router.push(`/check-email?email=${encodeURIComponent(email)}&intent=${intent}`);
      return;
    }

    router.push(redirect ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {isSignup && (
        <div>
          <label className="mb-1.5 block text-sm text-slate-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Lee"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm text-slate-600">Work email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm text-slate-600">Password</label>
          {!isSignup && (
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignup ? "At least 8 characters" : "••••••••"}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="group btn-primary w-full shadow-none hover:shadow-md disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Please wait…
          </>
        ) : (
          <>
            {isSignup ? "Create account" : "Sign in"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>

      <p className="pt-2 text-center text-sm text-slate-600">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Tenant Hawk?{" "}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </>
        )}
      </p>

      {isSignup && (
        <p className="text-center text-xs text-slate-500">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-slate-600 underline hover:text-slate-800">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-slate-600 underline hover:text-slate-800">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </form>
  );
}
