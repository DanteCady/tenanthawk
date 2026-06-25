"use client";

import { useState } from "react";
import { Loader2, Plus, Send, Trash2 } from "lucide-react";
import type { WebhookPlatform } from "@/db/types";
import {
  detectWebhookPlatform,
  platformBadgeClass,
  platformLabel,
  resolveWebhookPlatform,
  WEBHOOK_PLATFORM_OPTIONS,
  type WebhookPlatformOverride,
} from "@/lib/webhooks/platform";

export interface WebhookRow {
  id: string;
  label: string;
  url: string;
  platform: WebhookPlatform;
}

export function WebhookList({ isPro }: { isPro: boolean }) {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [platformOverride, setPlatformOverride] =
    useState<WebhookPlatformOverride>("auto");
  const [adding, setAdding] = useState(false);
  const [testingId, setTestingId] = useState<string | "draft" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const detected = url.trim() ? detectWebhookPlatform(url) : null;
  const effectiveDraft =
    url.trim() ? resolveWebhookPlatform(url, platformOverride) : null;

  async function load() {
    const res = await fetch("/api/settings/webhooks");
    if (!res.ok) return;
    const data = await res.json();
    setWebhooks(data.webhooks ?? []);
    setLoaded(true);
  }

  if (isPro && !loaded) {
    void load();
  }

  async function addWebhook() {
    setAdding(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, url, platformOverride }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to add webhook");
        return;
      }
      setWebhooks((prev) => [...prev, data.webhook]);
      setLabel("");
      setUrl("");
      setPlatformOverride("auto");
      setMessage("Webhook added.");
    } finally {
      setAdding(false);
    }
  }

  async function removeWebhook(id: string) {
    setError(null);
    const res = await fetch(`/api/settings/webhooks?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setError("Failed to remove webhook");
      return;
    }
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  async function testWebhook(opts: { id?: string; draft?: boolean }) {
    setTestingId(opts.draft ? "draft" : (opts.id ?? null));
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          opts.draft
            ? { webhookUrl: url, webhookPlatformOverride: platformOverride }
            : { testWebhookId: opts.id },
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Test failed");
        return;
      }
      setMessage("Test message sent.");
    } finally {
      setTestingId(null);
    }
  }

  if (!isPro) return null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Chat webhooks</p>
        <p className="mt-1 text-xs text-slate-500">
          Add Slack, Teams, or Discord incoming webhooks. Alerts are formatted
          per platform.
        </p>
      </div>

      {webhooks.length > 0 && (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {webhooks.map((w) => (
            <li
              key={w.id}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{w.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${platformBadgeClass(w.platform)}`}
                  >
                    {platformLabel(w.platform)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{w.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => testWebhook({ id: w.id })}
                  disabled={testingId === w.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
                >
                  {testingId === w.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Test
                </button>
                <button
                  type="button"
                  onClick={() => removeWebhook(w.id)}
                  className="inline-flex items-center rounded-lg border border-slate-300 p-1.5 text-slate-500 hover:border-red-200 hover:text-red-600"
                  aria-label={`Remove ${w.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-900">Add webhook</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. #security-alerts)"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
          <select
            value={platformOverride}
            onChange={(e) =>
              setPlatformOverride(e.target.value as WebhookPlatformOverride)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {WEBHOOK_PLATFORM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.slack.com/…"
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
        {effectiveDraft && (
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${platformBadgeClass(effectiveDraft)}`}
          >
            {platformOverride === "auto" && detected
              ? `Detected: ${platformLabel(detected)}`
              : `Format: ${platformLabel(effectiveDraft)}`}
          </span>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addWebhook}
            disabled={adding || !url.trim()}
            className="btn-primary inline-flex items-center gap-2 text-sm shadow-none disabled:opacity-60"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add webhook
          </button>
          {url.trim() && (
            <button
              type="button"
              onClick={() => testWebhook({ draft: true })}
              disabled={testingId === "draft"}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
            >
              {testingId === "draft" && <Loader2 className="h-4 w-4 animate-spin" />}
              Test URL
            </button>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
