"use client";

import Link from "next/link";
import { useState } from "react";
import { UpgradeButton } from "@/components/app/UpgradeButton";
import {
  PRO_ANNUAL_SAVINGS_PERCENT,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import {
  FOUNDING_PROMO_CODE,
  foundingPromoAnnualUsd,
  foundingPromoMonthlyUsd,
} from "@/lib/billing/founding";
import { formatUsd } from "@/lib/format";

type Interval = "monthly" | "annual";

export function OnboardingUpgradePanel({
  annualAvailable = true,
}: {
  annualAvailable?: boolean;
}) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const annual = interval === "annual";
  const foundingMonthly = foundingPromoMonthlyUsd(PRO_MONTHLY_USD);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Unlock the full report</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
            Every finding, remediation steps, and daily monitoring on Pro.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-900">
          {FOUNDING_PROMO_CODE} · 25% off
        </span>
      </div>

      {annualAvailable && (
        <div
          className="mt-4 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
          role="group"
          aria-label="Billing interval"
        >
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
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
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              interval === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Annual
            <span className="ml-1 hidden text-[0.65rem] text-green-700 sm:inline">
              −{PRO_ANNUAL_SAVINGS_PERCENT}%
            </span>
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        {annual ? (
          <>
            From ${formatUsd(foundingPromoAnnualUsd(PRO_ANNUAL_USD))}/yr with{" "}
            <span className="font-mono text-slate-700">{FOUNDING_PROMO_CODE}</span>
          </>
        ) : (
          <>
            From ${formatUsd(foundingMonthly)}/mo with{" "}
            <span className="font-mono text-slate-700">{FOUNDING_PROMO_CODE}</span>
          </>
        )}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <UpgradeButton
          annual={annual}
          promotionCode={FOUNDING_PROMO_CODE}
          className="inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100 sm:flex-1"
        >
          {annual ? "Upgrade to Pro (annual)" : "Upgrade to Pro"}
        </UpgradeButton>
        <Link
          href="/dashboard/billing"
          className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:w-auto sm:shrink-0"
        >
          Compare plans
        </Link>
      </div>
    </div>
  );
}
