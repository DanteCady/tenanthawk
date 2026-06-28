"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  PRO_ANNUAL_MONTHLY_EQUIV,
  PRO_ANNUAL_SAVINGS_PERCENT,
  PRO_ANNUAL_SAVINGS_USD,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { FOUNDING_PROMO_CODE } from "@/lib/billing/founding";
import { normalizePromoCode } from "@/lib/billing/promo-code";
import { formatUsd } from "@/lib/format";
import { FoundingPromoCallout } from "@/components/app/FoundingPromoCallout";

type Interval = "monthly" | "annual";

export function UpgradeButton({
  children,
  className = "",
  annual = false,
  promotionCode,
}: {
  children: React.ReactNode;
  className?: string;
  /** When true, checkout uses the annual Stripe price. */
  annual?: boolean;
  promotionCode?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upgrade() {
    setLoading(true);
    setError("");
    const code = normalizePromoCode(promotionCode);
    const { error: upgradeError } = await authClient.subscription.upgrade({
      plan: "pro",
      annual,
      successUrl: `${window.location.origin}/dashboard?upgraded=1`,
      cancelUrl: window.location.href,
      ...(code ? { metadata: { promotionCode: code } } : {}),
    });
    if (upgradeError) {
      setError(upgradeError.message ?? "Billing isn't configured yet.");
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

export function ProUpgradeOptions({
  annualAvailable = true,
  compact = false,
  buttonClassName = "btn-primary w-full shadow-none hover:shadow-md",
  showFoundingPromo = true,
}: {
  annualAvailable?: boolean;
  compact?: boolean;
  buttonClassName?: string;
  showFoundingPromo?: boolean;
}) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const [promotionCode, setPromotionCode] = useState(FOUNDING_PROMO_CODE);
  const annual = interval === "annual";

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {showFoundingPromo && <FoundingPromoCallout compact={compact} />}
      {annualAvailable && (
        <div
          className={`flex rounded-xl border border-slate-200 bg-slate-50 p-1 ${
            compact ? "" : ""
          }`}
          role="group"
          aria-label="Billing interval"
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
              Save {PRO_ANNUAL_SAVINGS_PERCENT}%
            </span>
          </button>
        </div>
      )}

      <div className={compact ? "" : "rounded-xl border border-slate-200 bg-white px-4 py-3"}>
        {annual ? (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900">
                ${formatUsd(PRO_ANNUAL_USD)}
              </span>
              <span className="text-slate-600">/ tenant / year</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              ${PRO_ANNUAL_MONTHLY_EQUIV}/mo equivalent · save $
              {formatUsd(PRO_ANNUAL_SAVINGS_USD)} vs monthly
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold text-slate-900">
                ${PRO_MONTHLY_USD}
              </span>
              <span className="text-slate-600">/ tenant / month</span>
            </div>
            {annualAvailable && (
              <p className="mt-1 text-sm text-slate-500">
                Or ${formatUsd(PRO_ANNUAL_USD)}/year with annual billing.
              </p>
            )}
          </>
        )}
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Promotion code</span>
        <input
          type="text"
          value={promotionCode}
          onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
          autoComplete="off"
          spellCheck={false}
          placeholder={FOUNDING_PROMO_CODE}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </label>

      <UpgradeButton
        annual={annual}
        promotionCode={promotionCode}
        className={buttonClassName}
      >
        {annual ? "Upgrade (annual)" : "Upgrade (monthly)"}
      </UpgradeButton>
    </div>
  );
}
