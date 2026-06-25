"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import type { InstantAlertMode } from "@/db/types";
import { WebhookList } from "@/components/app/WebhookList";

export function AlertPreferencesForm({
  isPro,
  userEmail,
  initialInstantAlerts,
  initialWeeklyDigest,
  initialExpiryAlerts,
}: {
  isPro: boolean;
  userEmail: string;
  initialInstantAlerts: InstantAlertMode;
  initialWeeklyDigest: boolean;
  initialExpiryAlerts: boolean;
}) {
  const [instantAlerts, setInstantAlerts] =
    useState<InstantAlertMode>(initialInstantAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(initialWeeklyDigest);
  const [expiryAlerts, setExpiryAlerts] = useState(initialExpiryAlerts);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    setTestMessage(null);
    try {
      const res = await fetch("/api/settings/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instantAlerts, weeklyDigest, expiryAlerts }),
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

  async function sendTestAlert() {
    setTesting(true);
    setError(null);
    setTestMessage(null);
    try {
      const res = await fetch("/api/settings/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Test failed");
        return;
      }
      const parts: string[] = [];
      if (data.email) parts.push(userEmail);
      if (data.webhook) {
        parts.push(
          data.webhooksSent > 1
            ? `${data.webhooksSent} webhooks`
            : "your webhook(s)",
        );
      }
      setTestMessage(
        parts.length > 0 ? `Test sent to ${parts.join(" and ")}.` : "Test sent.",
      );
    } finally {
      setTesting(false);
    }
  }

  if (!isPro) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm text-slate-600">
          Automated scans, email alerts, and chat webhooks are included with Pro.
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
    <div className="space-y-6">
      <div>
        <label
          htmlFor="instant-alerts"
          className="block text-sm font-medium text-slate-900"
        >
          Instant drift alerts
        </label>
        <p className="mt-1 text-xs text-slate-500">
          After each daily automated scan when findings change meaningfully.
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
          checked={expiryAlerts}
          onChange={(e) => {
            setExpiryAlerts(e.target.checked);
            setSaved(false);
          }}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <span>
          <span className="block text-sm font-medium text-slate-900">
            Expiry alerts
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Notify when new license, certificate, or secret expirations are
            detected (within 30 days).
          </span>
        </span>
      </label>

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
            Weekly digest
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Monday email + webhook summary with score and week-over-week drift.
          </span>
        </span>
      </label>

      <WebhookList isPro={isPro} />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-sm font-medium text-slate-900">Test alerts</p>
        <p className="mt-1 text-xs text-slate-500">
          Sends a sample to <span className="font-medium text-slate-700">{userEmail}</span>{" "}
          and all saved webhooks.
        </p>
        <button
          type="button"
          onClick={sendTestAlert}
          disabled={testing}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send test alert
        </button>
      </div>

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
        {testMessage && (
          <span className="text-sm text-green-600">{testMessage}</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
