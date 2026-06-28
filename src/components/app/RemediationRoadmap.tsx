"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Clock,
  Flag,
  MapPin,
  PauseCircle,
} from "lucide-react";
import type { RoadmapStats, RoadmapStop } from "@/lib/remediation/roadmap";
import { groupStopsByPhase, phaseLabel } from "@/lib/remediation/roadmap";
import { effortBadgeLabel } from "@/lib/remediation/meta";
import { SeverityBadge } from "@/components/app/SeverityBadge";
import { CategoryIconChip } from "@/components/app/CategoryIconChip";
import { FindingActions } from "@/components/app/FindingActions";
import { RemediationPanel } from "@/components/app/RemediationPanel";
import { formatUsd } from "@/lib/format";

function EffortBadge({ effort }: { effort: RoadmapStop["effort"] }) {
  const cls =
    effort === "quick"
      ? "roadmap-effort-quick"
      : effort === "moderate"
        ? "roadmap-effort-moderate"
        : "roadmap-effort-project";
  return (
    <span className={`roadmap-effort-badge ${cls}`}>{effortBadgeLabel(effort)}</span>
  );
}

function RoadmapTracker({ stats }: { stats: RoadmapStats }) {
  const pct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <div className="roadmap-tracker surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--th-text)]">Journey progress</p>
          <p className="mt-0.5 text-xs text-[var(--th-text-muted)]">
            {stats.resolved} of {stats.total} destination{stats.total === 1 ? "" : "s"}{" "}
            completed
            {stats.snoozed > 0 ? ` · ${stats.snoozed} paused` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tabular-nums text-[var(--th-text)]">
            {pct}%
          </p>
          <p className="text-xs text-[var(--th-text-muted)]">
            {stats.open} remaining
            {stats.remainingQuick > 0
              ? ` · ${stats.remainingQuick} quick fix${stats.remainingQuick === 1 ? "" : "es"}`
              : ""}
          </p>
        </div>
      </div>
      <div className="roadmap-progress-track mt-4" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="roadmap-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StopNode({
  stop,
  expanded,
  onToggle,
  onUpdated,
}: {
  stop: RoadmapStop;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: () => void;
}) {
  const done = stop.tracking === "resolved";
  const paused = stop.tracking === "snoozed";

  return (
    <li className={`roadmap-stop ${done ? "roadmap-stop-done" : ""} ${paused ? "roadmap-stop-paused" : ""}`}>
      <div className="roadmap-stop-rail" aria-hidden>
        <span className={`roadmap-stop-dot ${done ? "roadmap-stop-dot-done" : paused ? "roadmap-stop-dot-paused" : ""}`}>
          {done ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : paused ? (
            <PauseCircle className="h-3.5 w-3.5" />
          ) : (
            <span className="text-[0.65rem] font-bold tabular-nums">{stop.order}</span>
          )}
        </span>
      </div>

      <div className="roadmap-stop-card min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-2">
          <CategoryIconChip category={stop.category} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={stop.severity} />
              <EffortBadge effort={stop.effort} />
              <span className="text-[0.65rem] font-medium uppercase tracking-wide text-[var(--th-text-muted)]">
                {stop.adminSurface}
              </span>
              <span className="inline-flex items-center gap-1 text-[0.65rem] text-[var(--th-text-muted)]">
                <Clock className="h-3 w-3" />
                {stop.effortLabel}
              </span>
            </div>
            <h3 className={`mt-1.5 text-sm font-semibold leading-snug ${done ? "text-[var(--th-text-muted)] line-through" : "text-[var(--th-text)]"}`}>
              {stop.title}
            </h3>
            {!done && (
              <p className="mt-1 text-xs text-[var(--th-brand-text)]">{stop.priorityReason}</p>
            )}
            {stop.impact?.usd != null && stop.impact.usd > 0 && !done && (
              <p className="mt-1 text-xs text-[var(--th-text-muted)]">
                ~${formatUsd(stop.impact.usd)}/mo recoverable
              </p>
            )}
          </div>
        </div>

        {!done && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--th-border)] pt-3">
            <FindingActions
              checkId={stop.checkId}
              entityRef={stop.entityRef}
              tracking={stop.tracking}
              onUpdated={onUpdated}
            />
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--th-brand-text)] hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? "Hide steps" : "How to fix"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}

        {!done && expanded && (
          <div className="mt-3">
            <RemediationPanel
              findingId={stop.id}
              templateRemediation={stop.remediation}
              initialEnriched={stop.remediationEnriched}
            />
          </div>
        )}

        {done && (
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Completed</p>
        )}
        {paused && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">Paused · snoozed</p>
        )}
      </div>
    </li>
  );
}

function PhaseSection({
  phase,
  stops,
  expandedId,
  onToggle,
  onUpdated,
}: {
  phase: keyof ReturnType<typeof groupStopsByPhase>;
  stops: RoadmapStop[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  onUpdated: () => void;
}) {
  if (stops.length === 0) return null;

  return (
    <div className="roadmap-phase">
      <div className="roadmap-phase-label">
        <Flag className="h-3.5 w-3.5" />
        {phaseLabel(phase)}
        <span className="text-[var(--th-text-muted)]">({stops.length})</span>
      </div>
      <ol className="roadmap-stops">
        {stops.map((stop) => (
          <StopNode
            key={stop.id}
            stop={stop}
            expanded={expandedId === stop.id}
            onToggle={() => onToggle(stop.id)}
            onUpdated={onUpdated}
          />
        ))}
      </ol>
    </div>
  );
}

export function RemediationRoadmap({
  stops,
  stats,
}: {
  stops: RoadmapStop[];
  stats: RoadmapStats;
}) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const firstOpen = stops.find((s) => s.tracking === "open");
    return firstOpen?.id ?? null;
  });
  const [showCompleted, setShowCompleted] = useState(true);

  const openByPhase = useMemo(() => groupStopsByPhase(stops), [stops]);
  const completed = useMemo(
    () => stops.filter((s) => s.tracking === "resolved" || s.tracking === "snoozed"),
    [stops],
  );

  function refresh() {
    router.refresh();
  }

  function toggleExpand(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  if (stops.length === 0) {
    return (
      <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <p className="mt-4 font-semibold text-[var(--th-text)]">Nothing on the map</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--th-text-muted)]">
          Your latest scan has no open findings. Run another scan after changes to keep the
          roadmap current.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <RoadmapTracker stats={stats} />

      <div className="roadmap-journey surface-card overflow-hidden">
        <div className="roadmap-journey-header">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--th-brand-text)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--th-text)]">Remediation route</p>
            <p className="text-xs text-[var(--th-text-muted)]">
              Ordered by urgency, effort, and impact. Work top to bottom.
            </p>
          </div>
        </div>

        <div className="roadmap-journey-body px-4 pb-6 pt-2 sm:px-6">
          <div className="roadmap-terminal roadmap-terminal-start">
            <span className="roadmap-terminal-dot" />
            <span className="text-xs font-medium text-[var(--th-text-muted)]">Start · Your tenant today</span>
          </div>

          <PhaseSection
            phase="first"
            stops={openByPhase.first}
            expandedId={expandedId}
            onToggle={toggleExpand}
            onUpdated={refresh}
          />
          <PhaseSection
            phase="month"
            stops={openByPhase.month}
            expandedId={expandedId}
            onToggle={toggleExpand}
            onUpdated={refresh}
          />
          <PhaseSection
            phase="backlog"
            stops={openByPhase.backlog}
            expandedId={expandedId}
            onToggle={toggleExpand}
            onUpdated={refresh}
          />

          {completed.length > 0 && (
            <div className="roadmap-phase">
              <button
                type="button"
                onClick={() => setShowCompleted((v) => !v)}
                className="roadmap-phase-label roadmap-phase-toggle"
              >
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Completed & paused
                <span className="text-[var(--th-text-muted)]">({completed.length})</span>
                <ChevronDown className={`ml-auto h-3.5 w-3.5 transition-transform ${showCompleted ? "rotate-180" : ""}`} />
              </button>
              {showCompleted && (
                <ol className="roadmap-stops">
                  {completed.map((stop) => (
                    <StopNode
                      key={stop.id}
                      stop={stop}
                      expanded={false}
                      onToggle={() => {}}
                      onUpdated={refresh}
                    />
                  ))}
                </ol>
              )}
            </div>
          )}

          <div className="roadmap-terminal roadmap-terminal-end">
            <span className="roadmap-terminal-dot roadmap-terminal-dot-end" />
            <span className="text-xs font-medium text-[var(--th-text-muted)]">
              Destination · Healthier tenant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
