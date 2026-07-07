"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/store/toast";

export function RescanButton({ isPro = false }: { isPro?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deepScan, setDeepScan] = useState(false);

  async function rescan() {
    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanMode: deepScan ? "deep" : "standard" }),
      });
      if (res.status === 429) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Too many scans. Try again later.");
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Scan failed. Check your tenant connection and try again.");
        return;
      }
      toast.success(
        deepScan ? "Deep scan complete. Dashboard updated." : "Scan complete. Dashboard updated.",
      );
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPro && (
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
          <input
            type="checkbox"
            checked={deepScan}
            onChange={(event) => setDeepScan(event.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Deep scan
        </label>
      )}
      <button
        onClick={rescan}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Re-scan
      </button>
    </div>
  );
}
