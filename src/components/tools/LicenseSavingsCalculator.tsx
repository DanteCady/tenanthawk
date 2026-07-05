"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  E5_LICENSE_MONTHLY_USD_LIST,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";

const LICENSE_PRESETS = [
  { label: "Microsoft 365 Business Basic", monthly: 6 },
  { label: "Microsoft 365 Business Premium", monthly: 22 },
  { label: "Microsoft 365 E3", monthly: 36 },
  { label: "Microsoft 365 E5", monthly: E5_LICENSE_MONTHLY_USD_LIST },
] as const;

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function LicenseSavingsCalculator() {
  const [users, setUsers] = useState(250);
  const [wastePercent, setWastePercent] = useState(12);
  const [licenseMonthly, setLicenseMonthly] = useState(E5_LICENSE_MONTHLY_USD_LIST);

  const { monthlyWaste, annualWaste, proAnnualCost } = useMemo(() => {
    const wastedSeats = users * (wastePercent / 100);
    const monthly = wastedSeats * licenseMonthly;
    return {
      monthlyWaste: monthly,
      annualWaste: monthly * 12,
      proAnnualCost: PRO_MONTHLY_USD * 12,
    };
  }, [users, wastePercent, licenseMonthly]);

  const roiMultiple =
    proAnnualCost > 0 ? Math.round((annualWaste / proAnnualCost) * 10) / 10 : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-8">
        <div>
          <label htmlFor="calc-users" className="text-sm font-medium text-slate-900">
            Licensed users in tenant
          </label>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{users}</p>
          <input
            id="calc-users"
            type="range"
            min={25}
            max={5000}
            step={25}
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
            className="mt-3 w-full accent-blue-600"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>25</span>
            <span>5,000</span>
          </div>
        </div>

        <div>
          <label htmlFor="calc-waste" className="text-sm font-medium text-slate-900">
            Estimated license waste (%)
          </label>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{wastePercent}%</p>
          <input
            id="calc-waste"
            type="range"
            min={3}
            max={30}
            step={1}
            value={wastePercent}
            onChange={(e) => setWastePercent(Number(e.target.value))}
            className="mt-3 w-full accent-blue-600"
          />
          <p className="mt-2 text-xs text-slate-500">
            Industry range is often 5–15% from inactive, never-signed-in, and oversized SKUs.
          </p>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-900">Average license cost</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {LICENSE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setLicenseMonthly(preset.monthly)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  licenseMonthly === preset.monthly
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                ${preset.monthly}/mo · {preset.label.replace("Microsoft 365 ", "")}
              </button>
            ))}
          </div>
          <label htmlFor="calc-license" className="mt-4 block text-xs text-slate-500">
            Custom $/seat/month: ${licenseMonthly}
          </label>
          <input
            id="calc-license"
            type="range"
            min={6}
            max={60}
            step={1}
            value={licenseMonthly}
            onChange={(e) => setLicenseMonthly(Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white px-6 py-6 text-center">
        <p className="text-sm font-medium text-amber-900">Estimated recoverable spend</p>
        <p className="mt-2 text-4xl font-bold tabular-nums text-slate-900">
          ${formatUsd(monthlyWaste)}
          <span className="text-lg font-semibold text-slate-500">/mo</span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          ${formatUsd(annualWaste)}/year at {wastePercent}% waste across {users} users
        </p>
        {roiMultiple >= 1 && (
          <p className="mt-3 text-sm font-medium text-green-800">
            ~{roiMultiple}× Tenant Hawk Pro annual cost if you reclaim this waste
          </p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Estimates use list pricing and your slider inputs. A free Tenant Hawk scan surfaces
        actual unused seats, never-signed-in users, and disabled accounts with dollar impact
        from your tenant.
      </p>

      <Link
        href="/signup"
        className="group btn-primary mt-6 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 sm:w-auto"
      >
        Run a free scan for your real number
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
