"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/store/toast";

interface ShareRow {
  id: string;
  label: string | null;
  url: string;
  expiresAt: string | null;
  createdAt: string;
}

export function ShareReportPanel() {
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report/share");
      if (!res.ok) return;
      const data = (await res.json()) as { shares?: ShareRow[] };
      setShares(data.shares ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createShare() {
    setCreating(true);
    try {
      const res = await fetch("/api/report/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || "Executive report" }),
      });
      const data = (await res.json()) as { error?: string; share?: ShareRow };
      if (!res.ok) {
        toast.error(data.error ?? "Could not create share link.");
        return;
      }
      setLabel("");
      toast.success("Share link created.");
      await load();
      if (data.share?.url) {
        await navigator.clipboard.writeText(data.share.url);
        toast.info("Link copied to clipboard.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/report/share?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Could not revoke link.");
      return;
    }
    toast.success("Share link revoked.");
    await load();
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard.");
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Link2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Shareable report</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Send leadership a read-only link. Always shows your latest scan. Revoke anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Q2 board review)"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
          />
          <button
            type="button"
            onClick={createShare}
            disabled={creating}
            className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 text-sm shadow-none hover:shadow-md disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Create link
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading links…</p>
        ) : shares.length === 0 ? (
          <p className="text-sm text-slate-500">No active share links yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {shares.map((s) => (
              <li key={s.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {s.label ?? "Shared report"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{s.url}</p>
                  {s.expiresAt && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Expires{" "}
                      {new Date(s.expiresAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => copy(s.url)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => revoke(s.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
