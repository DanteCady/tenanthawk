"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  ssoDomainVerificationDnsHost,
  ssoDomainVerificationTxtValue,
} from "@/lib/enterprise/sso-domain";

export function SsoDomainVerification({
  providerId,
  domain,
  initialToken,
  domainVerified: initialVerified = false,
  onVerified,
}: {
  providerId: string;
  domain: string;
  initialToken?: string | null;
  domainVerified?: boolean;
  onVerified?: () => void;
}) {
  const [token, setToken] = useState(initialToken ?? "");
  const [loadingToken, setLoadingToken] = useState(!initialToken && !initialVerified);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(initialVerified);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"host" | "value" | null>(null);

  const loadToken = useCallback(async () => {
    if (verified) return;
    setError(null);
    setLoadingToken(true);
    const result = await authClient.$fetch<{ domainVerificationToken: string }>(
      "/sso/request-domain-verification",
      { method: "POST", body: { providerId } },
    );
    setLoadingToken(false);
    if (result.error) {
      const code = (result.error as { code?: string }).code;
      if (code === "DOMAIN_VERIFIED") {
        setVerified(true);
        onVerified?.();
        return;
      }
      setError(result.error.message ?? "Could not load verification token.");
      return;
    }
    setToken(result.data?.domainVerificationToken ?? "");
  }, [onVerified, providerId, verified]);

  useEffect(() => {
    if (initialVerified) return;
    if (initialToken) {
      setToken(initialToken);
      setLoadingToken(false);
      return;
    }
    void loadToken();
  }, [initialToken, initialVerified, loadToken]);

  async function verify() {
    setError(null);
    setVerifying(true);
    const result = await authClient.$fetch("/sso/verify-domain", {
      method: "POST",
      body: { providerId },
    });
    setVerifying(false);
    if (result.error) {
      setError(
        result.error.message ??
          "DNS record not found yet. Propagation can take a few minutes - try again shortly.",
      );
      return;
    }
    setVerified(true);
    onVerified?.();
  }

  async function copy(text: string, kind: "host" | "value") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  if (verified) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-900">Domain verified</p>
          <p className="mt-0.5 text-sm text-green-800">
            <span className="font-mono">{domain}</span> is confirmed. SSO sign-in is enabled for
            this workspace.
          </p>
        </div>
      </div>
    );
  }

  const dnsHost = ssoDomainVerificationDnsHost(domain, providerId);
  const txtValue = token ? ssoDomainVerificationTxtValue(providerId, token) : "";

  return (
    <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <p className="text-sm font-semibold text-amber-950">Verify domain ownership</p>
          <p className="mt-1 text-sm text-amber-900/90">
            Add a DNS TXT record to prove you control{" "}
            <span className="font-mono font-medium">{domain}</span>. SSO stays disabled until
            verification succeeds.
          </p>
        </div>
      </div>

      {loadingToken ? (
        <p className="flex items-center gap-2 text-sm text-amber-900">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing verification record…
        </p>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="rounded-lg border border-amber-200/80 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Type</p>
            <p className="mt-1 font-mono text-slate-900">TXT</p>
          </div>

          <div className="rounded-lg border border-amber-200/80 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Host / name
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-900 sm:text-sm">
                  {dnsHost}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(dnsHost, "host")}
                className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                {copied === "host" ? "Copied" : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200/80 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Value</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-900 sm:text-sm">
                  {txtValue || "-"}
                </p>
              </div>
              {txtValue && (
                <button
                  type="button"
                  onClick={() => copy(txtValue, "value")}
                  className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                >
                  {copied === "value" ? "Copied" : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-amber-900/80">
            Some DNS hosts want only the subdomain label (
            <span className="font-mono">{dnsHost.split(".")[0]}</span>) in the host field. TXT
            changes may take up to 48 hours to propagate.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={verify}
          disabled={verifying || loadingToken || !token}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
          Check DNS &amp; verify
        </button>
        <button
          type="button"
          onClick={() => void loadToken()}
          disabled={loadingToken || verifying}
          className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100/50 disabled:opacity-60"
        >
          Refresh token
        </button>
      </div>
    </div>
  );
}
