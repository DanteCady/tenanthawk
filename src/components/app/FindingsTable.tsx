"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock } from "lucide-react";
import type { Category, FindingTrackingStatus, Severity } from "@/db/types";
import { SeverityBadge } from "./SeverityBadge";
import { CategoryIconChip } from "./CategoryIconChip";
import { OnboardingUpgradePanel } from "@/components/onboarding/OnboardingUpgradePanel";
import { FindingActions } from "./FindingActions";
import { FindingGuideLink } from "./FindingGuideLink";
import { RemediationPanel } from "./RemediationPanel";
import { FindingScriptIndicator } from "./FindingScriptIndicator";
import { isExpiryCheckId } from "@/lib/scan/expiry";
import { formatUsd } from "@/lib/format";
import {
  formatLicenseEntityRefDetailed,
  isLicenseSkuCode,
} from "@/lib/licenses/sku-display";
import type { RemediationEnriched } from "@/lib/remediation/types";

export interface FindingDTO {
  id: string;
  checkId: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  impact: { usd?: number; count?: number; daysUntil?: number; entities?: string[] } | null;
  remediation: string;
  entityRef: string | null;
  remediationEnriched?: RemediationEnriched | null;
  tracking: FindingTrackingStatus | "open";
  snoozedUntil?: string | null;
}

const FILTERS: Array<{ key: "all" | Severity; label: string }> = [
  { key: "all", label: "All" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

const SEV_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export interface FindingPreview {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
}

export interface LockedFindingsPreview {
  total: number;
  high: number;
  usd: number;
  items: FindingPreview[];
}

const PREVIEW_LIMIT = 8;

function LockedFindingsView({
  preview,
  annualAvailable,
}: {
  preview: LockedFindingsPreview;
  annualAvailable: boolean;
}) {
  const shown = preview.items.slice(0, PREVIEW_LIMIT);
  const hiddenCount = Math.max(0, preview.total - shown.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <span className="filter-chip filter-chip-active pointer-events-none">
          All ({preview.total})
        </span>
        {preview.high > 0 && (
          <span className="filter-chip pointer-events-none">
            High ({preview.high})
          </span>
        )}
      </div>

      <div className="overflow-hidden surface-card">
        <div className="divide-y divide-slate-100">
          {shown.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-5 py-4"
              aria-hidden={false}
            >
              <SeverityBadge severity={f.severity} />
              <CategoryIconChip category={f.category} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-900">
                {f.title}
              </span>
              <Lock className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
            </div>
          ))}
          {shown.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              No findings on the latest scan.
            </p>
          )}
        </div>

        {hiddenCount > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-3 text-center text-sm text-slate-600">
            + {hiddenCount} more {hiddenCount === 1 ? "finding" : "findings"} on Pro
          </div>
        )}

        <div className="border-t border-slate-100 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Lock className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {preview.total} {preview.total === 1 ? "finding" : "findings"} with full
                remediation
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Upgrade to Pro for dollar impact, AI-guided fixes, compliance mapping,
                shareable reports, and daily monitoring.
                {preview.usd > 0 && (
                  <>
                    {" "}
                    About{" "}
                    <span className="font-semibold text-blue-700">
                      ${formatUsd(preview.usd)}/mo
                    </span>{" "}
                    looks recoverable on this scan.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <OnboardingUpgradePanel annualAvailable={annualAvailable} />
    </div>
  );
}

function LicenseEntityLine({ entityRef }: { entityRef: string }) {
  const { primary, secondary } = formatLicenseEntityRefDetailed(entityRef);
  return (
    <p className="text-xs text-slate-500">
      License: <span className="font-medium text-slate-700">{primary}</span>
      {secondary && secondary !== primary && (
        <span className="text-slate-400"> · {secondary}</span>
      )}
    </p>
  );
}

function affectedItemsLabel(checkId: string): string {
  if (checkId.startsWith("cost.")) return "Affected accounts";
  return "Affected groups";
}

function trackingLabel(f: FindingDTO): string | null {
  if (f.tracking === "resolved") return "Resolved";
  if (f.tracking === "snoozed") return "Snoozed";
  return null;
}

export function FindingsTable({
  findings,
  lockedPreview,
  annualAvailable = false,
  isPro = true,
  connectionMode = "live",
}: {
  findings?: FindingDTO[];
  /** Free tier: summary + title previews without remediation details. */
  lockedPreview?: LockedFindingsPreview;
  annualAvailable?: boolean;
  isPro?: boolean;
  connectionMode?: "live" | "demo";
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [showHandled, setShowHandled] = useState(false);
  const [enrichedCache, setEnrichedCache] = useState<
    Record<string, RemediationEnriched>
  >({});

  if (!findings) {
    if (!lockedPreview) return null;
    return (
      <LockedFindingsView preview={lockedPreview} annualAvailable={annualAvailable} />
    );
  }

  const visible = findings.filter((f) => {
    if (showHandled) return true;
    return f.tracking === "open";
  });

  const rows = visible
    .filter((f) => filter === "all" || f.severity === filter)
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);

  const handledCount = findings.filter((f) => f.tracking !== "open").length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === f.key ? "filter-chip-active" : "filter-chip"
            }`}
          >
            {f.label}
          </button>
        ))}
        {handledCount > 0 && (
          <button
            type="button"
            onClick={() => setShowHandled((v) => !v)}
            className={`ml-auto rounded-lg px-3 py-1.5 text-sm transition-colors ${
              showHandled ? "filter-chip-secondary-active" : "filter-chip"
            }`}
          >
            {showHandled ? "Hide" : "Show"} resolved & snoozed ({handledCount})
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden surface-card">
        {rows.map((f) => {
          const isOpen = open === f.id;
          const badge = trackingLabel(f);
          return (
            <div key={f.id} className={f.tracking !== "open" ? "opacity-75" : ""}>
              <button
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="finding-row-trigger flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <SeverityBadge severity={f.severity} />
                <CategoryIconChip category={f.category} size="sm" />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm text-slate-900">{f.title}</span>
                  <FindingScriptIndicator checkId={f.checkId} isPro={isPro} />
                  {isExpiryCheckId(f.checkId) && f.impact?.daysUntil != null && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-medium text-amber-800">
                      {f.impact.daysUntil <= 0 ? "Expired" : `${f.impact.daysUntil}d`}
                    </span>
                  )}
                  {badge && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600">
                      {badge}
                    </span>
                  )}
                </span>
                {f.impact?.usd ? (
                  <span className="hidden text-sm font-medium text-blue-700 sm:inline">
                    ${formatUsd(f.impact.usd)}/mo
                  </span>
                ) : null}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="finding-row-detail space-y-3 px-5 pb-5 pt-1">
                  <p className="text-sm text-slate-600">{f.description}</p>
                  <FindingGuideLink checkId={f.checkId} />
                  {f.impact?.entities && f.impact.entities.length > 0 ? (
                    <div className="text-xs text-slate-500">
                      <p className="mb-1 font-medium text-slate-600">
                        {affectedItemsLabel(f.checkId)}
                      </p>
                      <ul className="list-inside list-disc space-y-0.5">
                        {f.impact.entities.map((name, i) => (
                          <li key={`${i}-${name}`}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : f.entityRef && isLicenseSkuCode(f.entityRef) ? (
                    <LicenseEntityLine entityRef={f.entityRef} />
                  ) : f.entityRef ? (
                    <p className="text-xs text-slate-500">Affected: {f.entityRef}</p>
                  ) : null}
                  <RemediationPanel
                    findingId={f.id}
                    checkId={f.checkId}
                    templateRemediation={f.remediation}
                    initialEnriched={
                      f.remediationEnriched ?? enrichedCache[f.id] ?? null
                    }
                    onEnriched={(data) =>
                      setEnrichedCache((prev) => ({ ...prev, [f.id]: data }))
                    }
                    isPro={isPro}
                    connectionMode={connectionMode}
                  />
                  <FindingActions
                    checkId={f.checkId}
                    entityRef={f.entityRef}
                    tracking={f.tracking}
                    onUpdated={() => router.refresh()}
                  />
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No active {filter !== "all" ? filter : ""} findings. 🎉
          </p>
        )}
      </div>
    </div>
  );
}
