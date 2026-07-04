"use client";

import { useState } from "react";
import { Loader2, Shield, ShieldOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { authClient } from "@/lib/auth-client";
import { authInputClass } from "@/components/auth/auth-styles";

function parseTotpSecret(totpUri: string): string | null {
  try {
    return new URL(totpUri).searchParams.get("secret");
  } catch {
    return null;
  }
}

export function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [step, setStep] = useState<"idle" | "setup" | "backup">("idle");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setError("");
    setLoading(true);

    const { data, error: enableError } = await authClient.twoFactor.enable({
      password,
      issuer: "Tenant Hawk",
    });

    setLoading(false);

    if (enableError) {
      setError(enableError.message ?? "Could not start 2FA setup.");
      return;
    }

    setTotpUri(data.totpURI);
    setBackupCodes(data.backupCodes);
    setStep("setup");
    setVerifyCode("");
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    if (verifyCode.length < 6) return;

    setError("");
    setLoading(true);

    const { error: verifyError } = await authClient.twoFactor.verifyTotp({
      code: verifyCode.trim(),
      trustDevice: true,
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message ?? "Invalid code. Check your authenticator app.");
      return;
    }

    setIsEnabled(true);
    setStep("backup");
    setPassword("");
    setVerifyCode("");
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setError("");
    setLoading(true);

    const { error: disableError } = await authClient.twoFactor.disable({ password });

    setLoading(false);

    if (disableError) {
      setError(disableError.message ?? "Could not disable 2FA.");
      return;
    }

    setIsEnabled(false);
    setStep("idle");
    setPassword("");
    setTotpUri("");
    setBackupCodes([]);
  }

  function finishSetup() {
    setStep("idle");
    setTotpUri("");
    setBackupCodes([]);
  }

  const secret = totpUri ? parseTotpSecret(totpUri) : null;

  if (step === "setup") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Scan the QR code with Google Authenticator, 1Password, Microsoft Authenticator, or
          another TOTP app.
        </p>

        {totpUri && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <QRCodeSVG
              value={totpUri}
              size={200}
              level="M"
              marginSize={2}
              aria-label="Two-factor authentication QR code"
            />
            <p className="text-xs text-slate-500">Scan to add Tenant Hawk</p>
          </div>
        )}

        {secret && (
          <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-slate-700">
              Can&apos;t scan? Enter setup key manually
            </summary>
            <p className="mt-3 break-all font-mono text-sm text-slate-900">{secret}</p>
          </details>
        )}

        <form onSubmit={confirmEnable} className="space-y-3">
          <div>
            <label htmlFor="two-factor-verify" className="mb-1.5 block text-sm text-slate-600">
              Code from authenticator
            </label>
            <input
              id="two-factor-verify"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={verifyCode}
              onChange={(e) =>
                setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className={authInputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || verifyCode.length < 6}
            className="btn-primary w-full disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </>
            ) : (
              "Enable two-factor authentication"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (step === "backup") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Save these backup codes somewhere secure. Each code works once if you lose your
          authenticator.
        </p>
        <ul className="grid gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-4 font-mono text-sm text-slate-900 sm:grid-cols-2">
          {backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>
        <button type="button" onClick={finishSetup} className="btn-primary w-full">
          I saved my backup codes
        </button>
      </div>
    );
  }

  if (isEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-700">
          <Shield className="h-4 w-4" />
          Two-factor authentication is enabled
        </div>

        <form onSubmit={disable} className="space-y-3">
          <div>
            <label htmlFor="disable-2fa-password" className="mb-1.5 block text-sm text-slate-600">
              Confirm with your password to disable
            </label>
            <input
              id="disable-2fa-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Disabling…
              </>
            ) : (
              <>
                <ShieldOff className="h-4 w-4" />
                Disable 2FA
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Require a code from your authenticator app when signing in on a new device.
      </p>

      <form onSubmit={startEnable} className="space-y-3">
        <div>
          <label htmlFor="enable-2fa-password" className="mb-1.5 block text-sm text-slate-600">
            Confirm with your password
          </label>
          <input
            id="enable-2fa-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="btn-primary w-full disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Starting…
            </>
          ) : (
            "Set up authenticator app"
          )}
        </button>
      </form>
    </div>
  );
}
