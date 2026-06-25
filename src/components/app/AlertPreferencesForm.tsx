"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { InstantAlertMode } from "@/db/types";

export function AlertPreferencesForm({
  isPro,
  initialInstantAlerts,
  initialWeeklyDigest,
}: {
  isPro: boolean;
  initialInstantAlerts: InstantAlertMode;
  initialWeeklyDigest: boolean;
}) {
  const [instantAlerts, setInstantAlerts] =
    useState<InstantAlertMode>(initialInstantAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(initialWeeklyDigest);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instantAlerts, weeklyDigest }),
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
          Automated scans and email alerts are included with Pro.
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
      <div>
        <label
          htmlFor="instant-alerts"
          className="block text-sm font-medium text-slate-900"
        >
          Instant email alerts
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Sent after each daily automated scan when something meaningful changes.
        </p>
        <select
          id="instant-alerts"
          value={instantAlerts}
          onChange={(e) => {
            setInstantAlerts(e.target.value as InstantAlertMode);
            setSaved(false);
          }}
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="high">High severity & score drops only</option>
          <option value="any">Any drift (new, resolved, or severity change)</option>
          <option value="off">Off</option>
        </select>
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={weeklyDigest}
          onChange={(e) => {
            setWeeklyDigest(e.target.checked);
            setSaved(false);
          }}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          <span className="block text-sm font-medium text-slate-900">
            Weekly digest email
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Monday summary with score, open issues, and week-over-week drift.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2 text-sm shadow-none disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save preferences
        </button>
        {saved && (
          <span className="text-sm text-green-600">Preferences saved.</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
