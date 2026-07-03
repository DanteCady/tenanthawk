"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  COMMON_LICENSE_PRICING_FIELDS,
  type LicensePricingOverrides,
} from "@/lib/licenses/pricing-overrides";

function toInputValue(value: number | undefined): string {
  return value != null ? String(value) : "";
}

export function LicensePricingForm({
  isPro,
  initialOverrides,
  listPrices,
}: {
  isPro: boolean;
  initialOverrides: LicensePricingOverrides | null;
  listPrices: Record<string, number | null>;
}) {
  const [defaultUsd, setDefaultUsd] = useState(
    toInputValue(initialOverrides?.defaultUsd),
  );
  const [skuValues, setSkuValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {};
    for (const { code } of COMMON_LICENSE_PRICING_FIELDS) {
      values[code] = toInputValue(initialOverrides?.skus?.[code]);
    }
    return values;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const skus: Record<string, string | number> = {};
      for (const [code, value] of Object.entries(skuValues)) {
        if (value.trim()) skus[code] = value.trim();
      }

      const res = await fetch("/api/settings/license-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultUsd: defaultUsd.trim() || null,
          skus,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (!isPro) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm text-slate-600">
          Set your contracted per-seat rates so recoverable spend matches what you actually
          pay Microsoft. Included with Pro.
        </p>
        <Link
          href="/dashboard/billing"
          className="mt-3 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Upgrade to Pro →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Override Microsoft list prices with your EA or CSP rates. Used when estimating
        recoverable license spend on scans. Run a rescan after saving to refresh findings.
      </p>

      <div>
        <label htmlFor="default-license-rate" className="block text-sm font-medium text-slate-900">
          Default rate for unknown SKUs
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Applied when we detect a reclaimable seat but don&apos;t have a specific price.
          Leave blank to use the $20/mo list estimate.
        </p>
        <div className="relative mt-2 max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            $
          </span>
          <input
            id="default-license-rate"
            type="number"
            min={0}
            max={1000}
            step={0.01}
            value={defaultUsd}
            onChange={(e) => {
              setDefaultUsd(e.target.value);
              setSaved(false);
            }}
            placeholder="20"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-12 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            /mo
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-900">Common license rates</p>
        <p className="mt-1 text-xs text-slate-500">
          Placeholders show Microsoft list pricing. Enter your contracted rate to override.
        </p>
        <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {COMMON_LICENSE_PRICING_FIELDS.map(({ code, label }) => {
            const list = listPrices[code];
            return (
              <li
                key={code}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{code}</p>
                </div>
                <div className="relative w-28 shrink-0">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    step={0.01}
                    value={skuValues[code] ?? ""}
                    onChange={(e) => {
                      setSkuValues((prev) => ({ ...prev, [code]: e.target.value }));
                      setSaved(false);
                    }}
                    placeholder={list != null ? String(list) : "-"}
                    aria-label={`${label} monthly rate`}
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    /mo
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="text-sm text-green-700">
          Saved. Run a rescan to update recoverable amounts on your dashboard.
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm shadow-none hover:shadow-md disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save rates
      </button>
    </div>
  );
}
