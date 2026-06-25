"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { InstantAlertMode } from "@/db/types";

export function AlertPreferencesForm({
  isPro,
  initialInstantAlerts,
  initialWeeklyDigest,
  initialWebhookUrl,
}: {
  isPro: boolean;
  initialInstantAlerts: InstantAlertMode;
  initialWeeklyDigest: boolean;
  initialWebhookUrl: string | null;
}) {
  const [instantAlerts, setInstantAlerts] =
    useState<InstantAlertMode>(initialInstantAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(initialWeeklyDigest);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testOk, setTestOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    setTestOk(false);
    try {
      const res = await fetch("/api/settings/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instantAlerts, weeklyDigest, webhookUrl }),
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

  async function testWebhook() {
    setTesting(true);
    setError(null);
    setTestOk(false);
    try {
      const res = await fetch("/api/settings/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Test failed");
        return;
      }
      setTestOk(true);
    } finally {
      setTesting(false);
    }
  }

  if (!isPro) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm text-slate-600">
          Automated scans, email alerts, and Slack/Teams webhooks are included
          with Pro.
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
          Instant alerts
        </label>
        <p className="mt-1 text-xs text-slate-500">
          After each daily automated scan when something meaningful changes —
          sent to email and your webhook (if configured).
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
            Weekly digest
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Monday summary with score, open issues, and week-over-week drift.
          </span>
        </span>
      </label>

      <div>
        <label
          htmlFor="webhook-url"
          className="block text-sm font-medium text-slate-900"
        >
          Slack or Teams webhook
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Optional incoming webhook URL. Alerts use the same rules as email
          above.
        </p>
        <input
          id="webhook-url"
          type="url"
          value={webhookUrl}
          onChange={(e) => {
            setWebhookUrl(e.target.value);
            setSaved(false);
            setTestOk(false);
          }}
          placeholder="https://hooks.slack.com/services/… or https://….webhook.office.com/…"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {webhookUrl.trim() && (
          <button
            type="button"
            onClick={testWebhook}
            disabled={testing}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
          >
            {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Send test message
          </button>
        )}
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
        {testOk && (
          <span className="text-sm text-green-600">Test message sent.</span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  );
}
