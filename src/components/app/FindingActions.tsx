"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { FindingTrackingStatus } from "@/db/types";

export function FindingActions({
  checkId,
  entityRef,
  tracking,
  onUpdated,
}: {
  checkId: string;
  entityRef: string | null;
  tracking: FindingTrackingStatus | "open";
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function update(action: "resolve" | "snooze" | "reopen", snoozeDays?: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/findings/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId, entityRef, action, snoozeDays }),
      });
      if (res.ok) onUpdated();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  }

  if (tracking === "resolved" || tracking === "snoozed") {
    return (
      <button
        type="button"
        onClick={() => update("reopen")}
        className="text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        Reopen
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => update("resolve")}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-green-300 hover:text-green-700"
      >
        Mark resolved
      </button>
      <button
        type="button"
        onClick={() => update("snooze", 7)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-amber-300 hover:text-amber-800"
      >
        Snooze 7d
      </button>
    </div>
  );
}
