"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, Send } from "lucide-react";
import type { InstantAlertMode, WebhookPlatform } from "@/db/types";
import {
  detectWebhookPlatform,
  platformBadgeClass,
  platformLabel,
  resolveWebhookPlatform,
  WEBHOOK_PLATFORM_OPTIONS,
  type WebhookPlatformOverride,
} from "@/lib/webhooks/platform";

function testResultMessage(
  email: boolean,
  webhook: boolean | null,
  userEmail: string,
  platform: WebhookPlatform | null,
): string {
  const webhookTarget = platform ? platformLabel(platform) : "your webhook";

  if (email && webhook) {
    return `Test sent to ${userEmail} and ${webhookTarget}.`;
  }
  if (email) {
    return `Test sent to ${userEmail}.`;
  }
  if (webhook) {
    return `Test sent to ${webhookTarget}.`;
  }
  return "Test sent.";
}

function initialPlatformOverride(
  webhookUrl: string | null,
  storedPlatform: WebhookPlatform | null,
): WebhookPlatformOverride {
  if (!webhookUrl?.trim() || !storedPlatform) return "auto";
  const detected = detectWebhookPlatform(webhookUrl);
  if (!detected || detected === storedPlatform) return "auto";
  return storedPlatform;
}

export function AlertPreferencesForm({
  isPro,
  userEmail,
  initialInstantAlerts,
  initialWeeklyDigest,
  initialWebhookUrl,
  initialWebhookPlatform,
}: {
  isPro: boolean;
  userEmail: string;
  initialInstantAlerts: InstantAlertMode;
  initialWeeklyDigest: boolean;
  initialWebhookUrl: string | null;
  initialWebhookPlatform: WebhookPlatform | null;
}) {
  const [instantAlerts, setInstantAlerts] =
    useState<InstantAlertMode>(initialInstantAlerts);
  const [weeklyDigest, setWeeklyDigest] = useState(initialWeeklyDigest);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? "");
  const [platformOverride, setPlatformOverride] = useState<WebhookPlatformOverride>(
    () => initialPlatformOverride(initialWebhookUrl, initialWebhookPlatform),
  );
  const [advancedOpen, setAdvancedOpen] = useState(
    () => initialPlatformOverride(initialWebhookUrl, initialWebhookPlatform) !== "auto",
  );
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectedPlatform = useMemo(
    () => (webhookUrl.trim() ? detectWebhookPlatform(webhookUrl) : null),
    [webhookUrl],
  );

  const effectivePlatform = useMemo(() => {
    if (!webhookUrl.trim()) return null;
    return resolveWebhookPlatform(webhookUrl, platformOverride);
  }, [webhookUrl, platformOverride]);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    setTestMessage(null);
    try {
      const res = await fetch("/api/settings/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instantAlerts,
          weeklyDigest,
          webhookUrl,
          webhookPlatformOverride: platformOverride,
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

  async function sendTestAlert() {
    setTesting(true);
    setError(null);
    setTestMessage(null);
    try {
      const res = await fetch("/api/settings/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl, webhookPlatformOverride: platformOverride }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Test failed");
        if (data.email || data.webhook) {
          setTestMessage(
            testResultMessage(
              Boolean(data.email),
              data.webhook ?? null,
              userEmail,
              data.webhookPlatform ?? effectivePlatform,
            ),
          );
        }
        return;
      }
      setTestMessage(
        testResultMessage(
          Boolean(data.email),
          data.webhook ?? null,
          userEmail,
          data.webhookPlatform ?? effectivePlatform,
        ),
      );
    } finally {
      setTesting(false);
    }
  }

  if (!isPro) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm text-slate-600">
          Automated scans, email alerts, and Slack, Teams, or Discord webhooks
          are included with Pro.
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
          sent to email and your chat webhook (if configured).
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
          Chat webhook
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Optional Slack, Microsoft Teams, or Discord incoming webhook. We format
          alerts for the detected platform.
        </p>
        <input
          id="webhook-url"
          type="url"
          value={webhookUrl}
          onChange={(e) => {
            setWebhookUrl(e.target.value);
            setPlatformOverride("auto");
            setSaved(false);
            setTestMessage(null);
          }}
          placeholder="https://hooks.slack.com/… · webhook.office.com/… · discord.com/api/webhooks/…"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        {webhookUrl.trim() && effectivePlatform && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${platformBadgeClass(effectivePlatform)}`}
            >
              {platformOverride === "auto" && detectedPlatform
                ? `Detected: ${platformLabel(detectedPlatform)}`
                : `Format: ${platformLabel(effectivePlatform)}`}
            </span>
            {platformOverride !== "auto" && detectedPlatform && (
              <span className="text-xs text-slate-500">
                URL looks like {platformLabel(detectedPlatform)}
              </span>
            )}
            {!detectedPlatform && platformOverride === "auto" && (
              <span className="text-xs text-amber-700">
                Could not auto-detect — choose a format below or use Generic.
              </span>
            )}
          </div>
        )}

        <details
          className="mt-3 rounded-lg border border-slate-200 bg-slate-50"
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
            />
            Advanced: platform format
          </summary>
          <div className="border-t border-slate-200 px-3 pb-3 pt-2">
            <p className="text-xs text-slate-500">
              Override auto-detection if alerts don&apos;t render correctly (e.g.
              Power Automate or a custom relay).
            </p>
            <select
              id="webhook-platform"
              value={platformOverride}
              onChange={(e) => {
                setPlatformOverride(e.target.value as WebhookPlatformOverride);
                setSaved(false);
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {WEBHOOK_PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </details>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-sm font-medium text-slate-900">Test alerts</p>
        <p className="mt-1 text-xs text-slate-500">
          Sends a sample alert to{" "}
          <span className="font-medium text-slate-700">{userEmail}</span>
          {webhookUrl.trim()
            ? ` and ${effectivePlatform ? platformLabel(effectivePlatform) : "your webhook"}`
            : ""}
          . No need to save first.
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
