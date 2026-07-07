"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { FindingTrackingStatus } from "@/db/types";
import { toast } from "@/store/toast";

type Action = "resolve" | "snooze" | "reopen" | "accept" | "flag";

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

  async function update(action: Action, snoozeDays?: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/findings/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId, entityRef, action, snoozeDays }),
      });
      if (res.ok) {
        if (action === "resolve") toast.success("Finding marked resolved.");
        else if (action === "accept") toast.success("Finding accepted as by design.");
        else if (action === "flag") toast.success("Finding flagged for review.");
        else if (action === "snooze") toast.success("Finding snoozed for 7 days.");
        else toast.info("Finding reopened.");
        onUpdated();
      } else {
        toast.error("Could not update finding status.");
      }
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
  }

  if (tracking === "resolved" || tracking === "snoozed" || tracking === "accepted") {
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
        Resolve
      </button>
      <button
        type="button"
        onClick={() => update("accept")}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900"
      >
        Accept
      </button>
      <button
        type="button"
        onClick={() => update("flag")}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-amber-300 hover:text-amber-800"
      >
        Flag
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
