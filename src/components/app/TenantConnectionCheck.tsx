"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { ConnectionHealth } from "@/lib/connect/health";
import { ConnectionStatusBlip } from "@/components/app/ConnectionStatusBlip";
import { formatCheckedAt } from "@/lib/time";
import { toast } from "@/store/toast";

export function TenantConnectionCheck({
  initial,
  tenantLabel,
}: {
  initial: ConnectionHealth;
  tenantLabel: string;
}) {
  const [health, setHealth] = useState(initial);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/connection/health?refresh=1");
      if (res.ok) {
        const next = await res.json();
        setHealth(next);
        if (next.status === "connected") {
          toast.success("Connection looks good.");
        } else if (next.status === "demo") {
          toast.info("Demo tenant — no live connection check needed.");
        } else {
          toast.error("Connection issue detected. See details below.");
        }
      } else if (res.status === 429) {
        const data = (await res.json()) as { error?: string };
        toast.error(data.error ?? "Too many checks. Try again later.");
      } else {
        toast.error("Could not run connection check.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Connection check</h3>
          <p className="mt-1 text-xs text-slate-600">
            Verifies Tenant Hawk can still authenticate to your Microsoft 365 tenant
            (e.g. if the enterprise app was deleted or consent was revoked).
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Check now
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ConnectionStatusBlip health={health} tenantLabel={tenantLabel} />
        <span className="text-xs text-slate-500">
          Last checked {formatCheckedAt(health.checkedAt)}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-600">{health.detail}</p>
    </div>
  );
}
