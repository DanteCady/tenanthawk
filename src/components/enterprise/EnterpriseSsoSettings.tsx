"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { buildEnterpriseSubdomainUrl } from "@/lib/enterprise/config";
import { SsoDomainVerification } from "@/components/enterprise/SsoDomainVerification";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25";

type SsoMode = "oidc" | "saml";

export type ExistingSsoProvider = {
  providerId: string;
  domain: string;
  domainVerified: boolean;
};

type RegisterResponse = {
  providerId: string;
  domain: string;
  domainVerified?: boolean;
  domainVerificationToken?: string;
};

export function EnterpriseSsoSettings({
  organizationId,
  organizationSlug,
  existingProvider,
}: {
  organizationId: string;
  organizationSlug: string;
  existingProvider?: ExistingSsoProvider | null;
}) {
  const [mode, setMode] = useState<SsoMode>("oidc");
  const [providerId, setProviderId] = useState(
    existingProvider?.providerId ?? `${organizationSlug}-sso`,
  );
  const [issuer, setIssuer] = useState("");
  const [domain, setDomain] = useState(existingProvider?.domain ?? "");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [entryPoint, setEntryPoint] = useState("");
  const [cert, setCert] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedProvider, setSavedProvider] = useState<ExistingSsoProvider | null>(
    existingProvider ?? null,
  );
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const activeProvider = savedProvider;
  const showVerification =
    activeProvider && !activeProvider.domainVerified && activeProvider.domain;

  const callbackBase = buildEnterpriseSubdomainUrl(organizationSlug, "");

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPendingToken(null);
    setSaving(true);

    const body =
      mode === "oidc"
        ? {
            providerId,
            issuer,
            domain,
            organizationId,
            oidcConfig: {
              clientId,
              clientSecret,
              scopes: ["openid", "email", "profile"],
            },
          }
        : {
            providerId,
            issuer,
            domain,
            organizationId,
            samlConfig: {
              entryPoint,
              cert,
              callbackUrl: `${callbackBase}/dashboard`,
            },
          };

    const endpoint = existingProvider ? "/sso/update-provider" : "/sso/register";
    const result = await authClient.$fetch<RegisterResponse>(endpoint, {
      method: "POST",
      body: existingProvider ? { ...body, providerId: existingProvider.providerId } : body,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error.message ?? "Could not register SSO provider.");
      return;
    }

    const data = result.data;
    if (!data) {
      setError("Unexpected response from server.");
      return;
    }

    const normalizedDomain = domain.trim().toLowerCase();
    const domainChanged =
      existingProvider &&
      normalizedDomain !== existingProvider.domain.trim().toLowerCase();

    setSavedProvider({
      providerId: existingProvider?.providerId ?? data.providerId,
      domain: normalizedDomain,
      domainVerified: domainChanged ? false : Boolean(existingProvider?.domainVerified),
    });
    setPendingToken(data.domainVerificationToken ?? null);
    setMessage(
      data.domainVerified
        ? "SSO provider saved."
        : "SSO provider saved. Verify your email domain below to enable sign-in.",
    );
  }

  const metadataUrl = `${callbackBase}/api/auth/sso/saml2/sp/metadata?providerId=${encodeURIComponent(providerId)}`;

  return (
    <div className="space-y-5">
      {activeProvider?.domainVerified && (
        <SsoDomainVerification
          providerId={activeProvider.providerId}
          domain={activeProvider.domain}
          domainVerified
        />
      )}

      <div className="flex gap-2">
        {(["oidc", "saml"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === value
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {value === "oidc" ? "OIDC" : "SAML 2.0"}
          </button>
        ))}
      </div>

      <form onSubmit={register} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Provider ID
            </label>
            <input
              type="text"
              required
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className={inputClass}
              disabled={Boolean(existingProvider)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email domain
            </label>
            <input
              type="text"
              required
              placeholder="acmecorp.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Users with this email domain can use SSO after DNS verification.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Issuer URL</label>
          <input
            type="url"
            required
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="https://login.microsoftonline.com/..."
            className={inputClass}
          />
        </div>

        {mode === "oidc" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Client ID</label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Client secret
              </label>
              <input
                type="password"
                required
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                IdP SSO URL (entry point)
              </label>
              <input
                type="url"
                required
                value={entryPoint}
                onChange={(e) => setEntryPoint(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                IdP signing certificate (PEM)
              </label>
              <textarea
                required
                rows={5}
                value={cert}
                onChange={(e) => setCert(e.target.value)}
                className={inputClass}
                placeholder="-----BEGIN CERTIFICATE-----"
              />
            </div>
            <p className="text-xs text-slate-500">
              SP metadata:{" "}
              <a
                href={metadataUrl}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                download XML
              </a>
            </p>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {existingProvider ? "Update SSO configuration" : "Save SSO configuration"}
        </button>
      </form>

      {showVerification && activeProvider && (
        <SsoDomainVerification
          providerId={activeProvider.providerId}
          domain={activeProvider.domain}
          initialToken={pendingToken}
          onVerified={() => {
            setSavedProvider({ ...activeProvider, domainVerified: true });
            setMessage("Domain verified - SSO sign-in is now enabled.");
            setPendingToken(null);
          }}
        />
      )}
    </div>
  );
}
