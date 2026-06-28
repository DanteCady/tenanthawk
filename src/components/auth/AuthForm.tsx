"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn, signUp, VERIFY_CALLBACK } from "@/lib/auth-client";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect");

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

    const result = isSignup
      ? await signUp.email({
          name: name || email.split("@")[0],
          email,
          password,
          callbackURL: VERIFY_CALLBACK,
        })
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

    if (isSignup) {
      router.push(`/check-email?email=${encodeURIComponent(email)}`);
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
        <label className="mb-1.5 block text-sm text-slate-600">Password</label>
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
    </form>
  );
}
