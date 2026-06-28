"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/store/toast";

export function RescanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function rescan() {
    setLoading(true);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      if (!res.ok) {
        toast.error("Scan failed. Check your tenant connection and try again.");
        return;
      }
      toast.success("Scan complete. Dashboard updated.");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
