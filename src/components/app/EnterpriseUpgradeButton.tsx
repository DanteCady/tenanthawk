"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  ENTERPRISE_ANNUAL_MONTHLY_EQUIV,
  ENTERPRISE_ANNUAL_SAVINGS_PERCENT,
  ENTERPRISE_ANNUAL_SAVINGS_USD,
  ENTERPRISE_ANNUAL_USD,
  ENTERPRISE_CLIENT_CAP_DEFAULT,
  ENTERPRISE_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { formatUsd } from "@/lib/format";

type Interval = "monthly" | "annual";

export function EnterpriseUpgradeButton({
  children,
  className = "",
  annual = false,
}: {
  children: React.ReactNode;
  className?: string;
  annual?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setLoading(true);
    setError("");
    const { error: upgradeError } = await authClient.subscription.upgrade({
      plan: "msp",
      annual,
      successUrl: `${window.location.origin}/dashboard/clients?upgraded=enterprise`,
      cancelUrl: window.location.href,
    });
    if (upgradeError) {
      setError(upgradeError.message ?? "Enterprise billing isn't configured yet.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={upgrade} disabled={loading} className={className}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecting…
          </span>
        ) : (
          children
        )}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function EnterpriseUpgradeOptions({
  annualAvailable = true,
  clientCap = ENTERPRISE_CLIENT_CAP_DEFAULT,
  buttonClassName = "inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-800 disabled:opacity-60",
}: {
  annualAvailable?: boolean;
  clientCap?: number;
  buttonClassName?: string;
}) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const annual = interval === "annual";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Enterprise Starter</p>
        <p className="mt-1 text-slate-600">
          Includes up to {clientCap} client tenants, multi-tenant console, and scorecards.
        </p>
      </div>

      {annualAvailable && (
        <div
          className="flex rounded-xl border border-slate-200 bg-slate-50 p-1"
          role="group"
          aria-label="Enterprise billing interval"
        >
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              interval === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setInterval("annual")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              interval === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual
            <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[0.65rem] font-semibold text-green-800">
              Save {ENTERPRISE_ANNUAL_SAVINGS_PERCENT}%
            </span>
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
        {annual ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900">
                ${formatUsd(ENTERPRISE_ANNUAL_USD)}
              </span>
              <span className="text-slate-600">/ year</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              ${ENTERPRISE_ANNUAL_MONTHLY_EQUIV}/mo equivalent · save $
              {formatUsd(ENTERPRISE_ANNUAL_SAVINGS_USD)} vs monthly
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900">
                ${ENTERPRISE_MONTHLY_USD}
              </span>
              <span className="text-slate-600">/ month</span>
            </div>
            {annualAvailable && (
              <p className="mt-1 text-sm text-slate-500">
                Or ${formatUsd(ENTERPRISE_ANNUAL_USD)}/year with annual billing.
              </p>
            )}
          </>
        )}
      </div>

      <EnterpriseUpgradeButton annual={annual} className={buttonClassName}>
        {annual ? "Subscribe (annual)" : "Subscribe (monthly)"}
      </EnterpriseUpgradeButton>

      <p className="text-center text-xs text-slate-500">
        Need more than {clientCap || ENTERPRISE_CLIENT_CAP_DEFAULT} clients?{" "}
        <a
          href="mailto:support@tenanthawk.io?subject=Enterprise%20volume%20pricing"
          className="font-medium text-violet-700 hover:text-violet-800"
        >
          Contact us
        </a>{" "}
        for volume pricing.
      </p>
    </div>
  );
}
