"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye, Loader2, Lock } from "lucide-react";
import type { RemediationPlan } from "@/lib/remediation/plan/types";
import {
  SUPPORTED_PREVIEW_CHECKS,
  downloadExport,
  exportRemediationScript,
  type ExportFormat,
} from "@/lib/remediation/plan/export";
import { RemediationInteractiveView } from "./RemediationInteractiveView";

const EXPORT_OPTIONS: { format: ExportFormat; label: string }[] = [
  { format: "local-ps7", label: "Local script (PowerShell 7)" },
  { format: "local-ps51", label: "Local script (Windows PowerShell 5.1)" },
  { format: "azure-runbook", label: "Azure Automation runbook" },
];

const UI_ACTION_CAP = 50;

function formatGeneratedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function RemediationPlanPanel({
  findingId,
  checkId,
  isPro,
  connectionMode,
}: {
  findingId: string;
  checkId: string;
  isPro: boolean;
  connectionMode: "live" | "demo";
}) {
  const supported = SUPPORTED_PREVIEW_CHECKS.has(checkId);
  const [plan, setPlan] = useState<RemediationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [exportOpen, setExportOpen] = useState(false);

  const isDemo = connectionMode === "demo";

  const syncIncluded = useCallback((nextPlan: RemediationPlan) => {
    const map: Record<string, boolean> = {};
    for (const action of nextPlan.actions) {
      map[action.id] = true;
    }
    setIncluded(map);
  }, []);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/findings/${findingId}/remediation/preview`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        plan?: RemediationPlan;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setPlan(null);
        setError(data.message ?? data.error ?? "Could not load preview.");
        return;
      }
      if (data.plan) {
        setPlan(data.plan);
        syncIncluded(data.plan);
      }
    } catch {
      setError("Could not reach the server.");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, [findingId, syncIncluded]);

  const visibleActions = useMemo(() => {
    if (!plan) return [];
    return plan.actions.slice(0, UI_ACTION_CAP);
  }, [plan]);

  const hiddenActionCount = plan
    ? Math.max(0, (plan.summary.totalActionCount ?? plan.actions.length) - UI_ACTION_CAP)
    : 0;

  const selectedIds = useMemo(
    () => visibleActions.filter((a) => included[a.id] !== false).map((a) => a.id),
    [visibleActions, included],
  );

  const includedCount = selectedIds.length;
  const totalVisible = visibleActions.length;

  function toggleIncluded(actionId: string, value: boolean) {
    setIncluded((prev) => ({ ...prev, [actionId]: value }));
  }

  function handleExport(format: ExportFormat) {
    if (!plan || includedCount === 0) return;
    const result = exportRemediationScript(plan, format, { actionIds: selectedIds });
    downloadExport(result);
    setExportOpen(false);
  }

  if (!supported) return null;

  if (!isPro) {
    return (
      <div className="remediation-plan">
        <div className="remediation-plan-header">
          <Eye className="h-4 w-4 text-[var(--th-brand-text)]" />
          <span className="text-sm font-medium text-[var(--th-text)]">
            Remediation preview
          </span>
        </div>
        <Link
          href="/dashboard/billing"
          className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--th-brand-text)] hover:underline"
        >
          <Lock className="h-3.5 w-3.5" />
          Upgrade to Pro for live preview and script export
        </Link>
      </div>
    );
  }

  return (
    <div className="remediation-plan">
      <div className="remediation-plan-header">
        <Eye className="h-4 w-4 text-[var(--th-brand-text)]" />
        <span className="text-sm font-medium text-[var(--th-text)]">
          Remediation preview
        </span>
      </div>

      <p className="remediation-plan-disclaimer">
        Preview uses live Graph reads. Exported scripts require separate write
        permissions in your environment.
      </p>

      {isDemo ? (
        <p className="text-sm text-amber-600">
          Connect a live tenant to preview remediation.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchPreview()}
              disabled={loading}
              className="remediation-plan-btn-primary"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {plan ? "Refresh preview" : "Preview fix"}
            </button>

            {plan && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setExportOpen((v) => !v)}
                  disabled={includedCount === 0}
                  className="remediation-plan-btn-secondary"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                {exportOpen && (
                  <div className="remediation-plan-export-menu">
                    {EXPORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.format}
                        type="button"
                        onClick={() => handleExport(opt.format)}
                        className="remediation-plan-export-item"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="mt-2 text-sm text-amber-600">{error}</p>}

          {plan && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--th-text-faint)]">
                <span>Preview as of {formatGeneratedAt(plan.generatedAt)}</span>
                {plan.summary.estimatedUsdSaved != null && plan.summary.estimatedUsdSaved > 0 && (
                  <span>
                    Est. ~${plan.summary.estimatedUsdSaved.toLocaleString("en-US")}/mo recoverable
                  </span>
                )}
              </div>

              {includedCount === 0 && (
                <p className="text-sm text-amber-600">
                  Include at least one action to export.
                </p>
              )}

              {includedCount > 0 && (
                <p className="text-xs text-[var(--th-text-faint)]">
                  Export will include {includedCount} of {totalVisible} action
                  {totalVisible === 1 ? "" : "s"}. Exports use the preview above — no second
                  Graph read.
                </p>
              )}

              {plan.summary.truncated && (
                <p className="text-xs text-amber-600">
                  Showing first {UI_ACTION_CAP} of {plan.summary.totalActionCount} actions.
                  Export includes all actions in the preview response
                  {hiddenActionCount > 0 ? ` (up to ${plan.actions.length})` : ""}.
                </p>
              )}

              <RemediationInteractiveView
                plan={plan}
                actions={visibleActions}
                included={included}
                onToggleIncluded={toggleIncluded}
              />

              <p className="text-xs text-[var(--th-text-faint)]">
                Preview mode is on by default in exported scripts. Run apply only after
                change approval.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
