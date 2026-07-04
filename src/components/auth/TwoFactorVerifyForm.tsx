"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { authInputClass } from "@/components/auth/auth-styles";

type Mode = "totp" | "backup";

export function TwoFactorVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setError("");
    setLoading(true);

    const result =
      mode === "backup"
        ? await authClient.twoFactor.verifyBackupCode({
            code: code.trim(),
            trustDevice,
          })
        : await authClient.twoFactor.verifyTotp({
            code: code.trim(),
            trustDevice,
          });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Invalid code. Try again.");
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Enter the 6-digit code from your authenticator app, or use a backup code.
        </p>
      </div>

      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("totp");
            setCode("");
            setError("");
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === "totp"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Authenticator
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("backup");
            setCode("");
            setError("");
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === "backup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Backup code
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="two-factor-code" className="mb-1.5 block text-sm text-slate-600">
            {mode === "totp" ? "Authentication code" : "Backup code"}
          </label>
          <input
            id="two-factor-code"
            type="text"
            inputMode={mode === "totp" ? "numeric" : "text"}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) =>
              setCode(
                mode === "totp"
                  ? e.target.value.replace(/\D/g, "").slice(0, 6)
                  : e.target.value,
              )
            }
            placeholder={mode === "totp" ? "000000" : "xxxx-xxxx-xxxx"}
            className={authInputClass}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="mt-0.5 rounded border-slate-300"
          />
          Trust this device for 30 days
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-primary w-full disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Continue"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
