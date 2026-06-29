"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/store/toast";

export function ClientRescanButton({
  connectionId,
  compact = false,
}: {
  connectionId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function rescan() {
    setLoading(true);
    try {
      const switched = await fetch("/api/connection/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (!switched.ok) {
        toast.error("Could not select client for scan.");
        return;
      }

      const res = await fetch("/api/scan", { method: "POST" });
      if (res.status === 429) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Too many scans. Try again later.");
        return;
      }
      if (!res.ok) {
        toast.error("Scan failed. Check the tenant connection and try again.");
        return;
      }
      toast.success("Scan complete.");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={rescan}
      disabled={loading}
      className={
        compact
          ? "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
          : "inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {compact ? "Scan" : "Re-scan"}
    </button>
  );
}
