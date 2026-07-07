"use client";

import { useMemo, useState } from "react";
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
import {
  checkSector,
  SECTOR_LABELS,
  type ScanSector,
} from "@/lib/scan/checks/registry";
import { formatSharePointEntityLabel } from "@/lib/scan/sharepoint-site-label";
import { formatTeamsEntityLabel } from "@/lib/scan/teams-activity-label";
import { formatMailboxEntityLabel } from "@/lib/scan/exchange-mailbox-label";
import { ReportConcealmentBanner } from "@/components/app/ReportConcealmentBanner";
import type { ReportConcealmentStatus } from "@/lib/scan/report-settings.shared";
import { groupFindingsForDisplay } from "@/lib/findings/group-display";

export interface FindingDTO {
  id: string;
  checkId: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  impact: {
    usd?: number;
    count?: number;
    daysUntil?: number;
    expiresAt?: string;
    entities?: string[];
  } | null;
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

function formatEntityLabel(checkId: string, entity: string): string {
  if (checkId.startsWith("hygiene.sharepoint-")) {
    return formatSharePointEntityLabel(entity);
  }
  if (
    checkId === "hygiene.stale-teams" ||
    checkId.startsWith("hygiene.teams-")
  ) {
    return formatTeamsEntityLabel(entity);
  }
  if (
    checkId.startsWith("hygiene.mailbox-") ||
    checkId === "hygiene.inactive-mailboxes" ||
    checkId === "cost.inactive-mailbox-licenses"
  ) {
    return formatMailboxEntityLabel(entity);
  }
  return entity;
}

function affectedItemsLabel(checkId: string): string {
  if (checkId.startsWith("cost.")) return "Affected accounts";
  const sector = checkSector(checkId);
  if (sector === "sharepoint") return "Affected sites";
  if (sector === "teams") {
    if (checkId.includes("group")) return "Affected groups";
    return "Affected Teams";
  }
  if (sector === "devices") return "Affected devices";
  if (sector === "exchange") return "Affected mailboxes";
  if (sector === "apps") return "Affected apps";
  return "Affected items";
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
  reportConcealment,
}: {
  findings?: FindingDTO[];
  /** Free tier: summary + title previews without remediation details. */
  lockedPreview?: LockedFindingsPreview;
  annualAvailable?: boolean;
  isPro?: boolean;
  connectionMode?: "live" | "demo";
  reportConcealment?: ReportConcealmentStatus;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [sectorFilter, setSectorFilter] = useState<"all" | ScanSector>("all");
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

  const sectorCounts = useMemo(() => {
    const counts = new Map<ScanSector, number>();
    for (const f of visible) {
      const sector = checkSector(f.checkId);
      if (!sector) continue;
      counts.set(sector, (counts.get(sector) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [visible]);

  const rows = useMemo(() => {
    const filtered = visible
      .filter((f) => filter === "all" || f.severity === filter)
      .filter((f) => sectorFilter === "all" || checkSector(f.checkId) === sectorFilter);
    return groupFindingsForDisplay(filtered);
  }, [visible, filter, sectorFilter]);

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
        {sectorCounts.length > 1 && (
          <>
            <span className="hidden h-4 w-px bg-slate-200 sm:inline" aria-hidden />
            {sectorCounts.map(([sector, count]) => (
              <button
                key={sector}
                type="button"
                onClick={() =>
                  setSectorFilter((current) => (current === sector ? "all" : sector))
                }
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  sectorFilter === sector ? "filter-chip-active" : "filter-chip"
                }`}
              >
                {SECTOR_LABELS[sector]} ({count})
              </button>
            ))}
          </>
        )}
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

      {sectorFilter === "exchange" &&
      connectionMode === "live" &&
      reportConcealment ? (
        <ReportConcealmentBanner status={reportConcealment} compact />
      ) : null}

      <div className="divide-y divide-slate-100 overflow-hidden surface-card">
        {rows.map((group) => {
          const isOpen = open === group.key;
          const badge = trackingLabel(group.items[0]);
          const primary = group.items[0];
          return (
            <div
              key={group.key}
              className={group.tracking !== "open" ? "opacity-75" : ""}
            >
              <button
                onClick={() => setOpen(isOpen ? null : group.key)}
                className="finding-row-trigger flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <SeverityBadge severity={group.severity} />
                <CategoryIconChip category={group.category} size="sm" />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm text-slate-900">{group.title}</span>
                  <FindingScriptIndicator checkId={group.checkId} isPro={isPro} />
                  {isExpiryCheckId(group.checkId) && group.impact?.daysUntil != null && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-medium text-amber-800">
                      {group.impact.daysUntil <= 0
                        ? "Expired"
                        : `${group.impact.daysUntil}d`}
                    </span>
                  )}
                  {group.items.length > 1 ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600">
                      {group.items.length} items
                    </span>
                  ) : null}
                  {badge && (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-medium text-slate-600">
                      {badge}
                    </span>
                  )}
                </span>
                {group.impact?.usd ? (
                  <span className="hidden text-sm font-medium text-blue-700 sm:inline">
                    ${formatUsd(group.impact.usd)}/mo
                  </span>
                ) : null}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="finding-row-detail space-y-3 px-5 pb-5 pt-1">
                  <p className="text-sm text-slate-600">{group.description}</p>
                  <FindingGuideLink checkId={group.checkId} />
                  {group.impact?.entities && group.impact.entities.length > 0 ? (
                    <div className="text-xs text-slate-500">
                      <p className="mb-1 font-medium text-slate-600">
                        {affectedItemsLabel(group.checkId)}
                      </p>
                      <ul className="list-inside list-disc space-y-0.5">
                        {group.impact.entities.map((name, i) => (
                          <li key={`${i}-${name}`}>
                            {formatEntityLabel(group.checkId, name)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : group.items.length > 1 ? (
                    <div className="text-xs text-slate-500">
                      <p className="mb-1 font-medium text-slate-600">Included findings</p>
                      <ul className="list-inside list-disc space-y-0.5">
                        {group.items.map((item) => (
                          <li key={item.id}>{item.title}</li>
                        ))}
                      </ul>
                    </div>
                  ) : primary.entityRef && isLicenseSkuCode(primary.entityRef) ? (
                    <LicenseEntityLine entityRef={primary.entityRef} />
                  ) : primary.entityRef ? (
                    <p className="text-xs text-slate-500">Affected: {primary.entityRef}</p>
                  ) : null}
                  <RemediationPanel
                    findingId={primary.id}
                    checkId={group.checkId}
                    templateRemediation={group.remediation}
                    initialEnriched={
                      primary.remediationEnriched ?? enrichedCache[primary.id] ?? null
                    }
                    onEnriched={(data) =>
                      setEnrichedCache((prev) => ({ ...prev, [primary.id]: data }))
                    }
                    isPro={isPro}
                    connectionMode={connectionMode}
                  />
                  {group.items.length === 1 ? (
                    <FindingActions
                      checkId={group.checkId}
                      entityRef={primary.entityRef}
                      tracking={primary.tracking}
                      onUpdated={() => router.refresh()}
                    />
                  ) : (
                    <div className="space-y-3 border-t border-slate-100 pt-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                          <p className="text-sm font-medium text-slate-800">{item.title}</p>
                          <FindingActions
                            checkId={item.checkId}
                            entityRef={item.entityRef}
                            tracking={item.tracking}
                            onUpdated={() => router.refresh()}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No active
            {filter !== "all" ? ` ${filter}` : ""}
            {sectorFilter !== "all" ? ` ${SECTOR_LABELS[sectorFilter]}` : ""} findings. 🎉
          </p>
        )}
      </div>
    </div>
  );
}
