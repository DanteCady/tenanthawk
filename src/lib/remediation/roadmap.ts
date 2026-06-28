import type { Category, Severity } from "@/db/types";
import type { RemediationEnriched } from "@/lib/remediation/types";
import {
  getCheckRemediationMeta,
  type RemediationEffort,
} from "@/lib/remediation/meta";

export type RoadmapPhase = "first" | "month" | "backlog";
export type RoadmapTracking = "open" | "resolved" | "snoozed";

export interface RoadmapFindingInput {
  id: string;
  checkId: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  remediation: string;
  entityRef: string | null;
  impact: {
    usd?: number;
    count?: number;
    daysUntil?: number;
  } | null;
  remediationEnriched?: RemediationEnriched | null;
  tracking: RoadmapTracking;
}

export interface RoadmapStop extends RoadmapFindingInput {
  priorityScore: number;
  priorityReason: string;
  phase: RoadmapPhase;
  effort: RemediationEffort;
  adminSurface: string;
  effortLabel: string;
  order: number;
}

export interface RoadmapStats {
  total: number;
  open: number;
  resolved: number;
  snoozed: number;
  remainingQuick: number;
}

const SEV_WEIGHT: Record<Severity, number> = { high: 300, medium: 200, low: 100 };
const EFFORT_BOOST: Record<RemediationEffort, number> = {
  quick: 40,
  moderate: 15,
  project: 0,
};

const PHASE_LABELS: Record<RoadmapPhase, string> = {
  first: "Do first",
  month: "This month",
  backlog: "Backlog",
};

export function phaseLabel(phase: RoadmapPhase): string {
  return PHASE_LABELS[phase];
}

function urgencyBoost(daysUntil: number | undefined): number {
  if (daysUntil == null) return 0;
  if (daysUntil <= 0) return 200;
  if (daysUntil <= 7) return 150;
  if (daysUntil <= 14) return 100;
  if (daysUntil <= 30) return 50;
  return 0;
}

function buildPriorityReason(input: {
  severity: Severity;
  daysUntil?: number;
  effort: RemediationEffort;
  usd?: number;
}): string {
  const parts: string[] = [];
  if (input.daysUntil != null && input.daysUntil <= 14) {
    parts.push(
      input.daysUntil <= 0
        ? "Expired or overdue"
        : `Expires in ${input.daysUntil} day${input.daysUntil === 1 ? "" : "s"}`,
    );
  } else if (input.severity === "high") {
    parts.push("High severity");
  }
  if (input.effort === "quick") parts.push("Quick fix");
  if (input.usd != null && input.usd >= 50) {
    parts.push(`~$${input.usd.toLocaleString("en-US")}/mo recoverable`);
  }
  if (parts.length === 0) {
    if (input.severity === "medium") return "Medium priority";
    return "Lower priority hygiene";
  }
  return parts.join(" · ");
}

function assignPhase(
  score: number,
  severity: Severity,
  effort: RemediationEffort,
  daysUntil: number | undefined,
): RoadmapPhase {
  if (
    (daysUntil != null && daysUntil <= 14) ||
    (severity === "high" && effort === "quick") ||
    score >= 400
  ) {
    return "first";
  }
  if (severity === "high" || severity === "medium" || score >= 250) {
    return "month";
  }
  return "backlog";
}

function scoreFinding(f: RoadmapFindingInput, effort: RemediationEffort): number {
  const daysUntil = f.impact?.daysUntil;
  let score = SEV_WEIGHT[f.severity];
  score += urgencyBoost(daysUntil);
  score += EFFORT_BOOST[effort];
  if (f.impact?.usd != null && f.impact.usd >= 100) score += 25;
  else if (f.impact?.usd != null && f.impact.usd > 0) score += 10;
  return score;
}

export function buildRoadmapStops(findings: RoadmapFindingInput[]): RoadmapStop[] {
  const stops: RoadmapStop[] = findings.map((f) => {
    const meta = getCheckRemediationMeta(f.checkId);
    const priorityScore = scoreFinding(f, meta.effort);
    const priorityReason = buildPriorityReason({
      severity: f.severity,
      daysUntil: f.impact?.daysUntil,
      effort: meta.effort,
      usd: f.impact?.usd,
    });
    return {
      ...f,
      priorityScore,
      priorityReason,
      phase: assignPhase(priorityScore, f.severity, meta.effort, f.impact?.daysUntil),
      effort: meta.effort,
      adminSurface: meta.adminSurface,
      effortLabel: meta.effortLabel,
      order: 0,
    };
  });

  stops.sort((a, b) => {
    const statusOrder = (t: RoadmapTracking) =>
      t === "open" ? 0 : t === "snoozed" ? 1 : 2;
    const sd = statusOrder(a.tracking) - statusOrder(b.tracking);
    if (sd !== 0) return sd;
    return b.priorityScore - a.priorityScore;
  });

  return stops.map((s, i) => ({ ...s, order: i + 1 }));
}

export function buildRoadmapStats(stops: RoadmapStop[]): RoadmapStats {
  const open = stops.filter((s) => s.tracking === "open");
  return {
    total: stops.length,
    open: open.length,
    resolved: stops.filter((s) => s.tracking === "resolved").length,
    snoozed: stops.filter((s) => s.tracking === "snoozed").length,
    remainingQuick: open.filter((s) => s.effort === "quick").length,
  };
}

export function groupStopsByPhase(
  stops: RoadmapStop[],
): Record<RoadmapPhase, RoadmapStop[]> {
  const groups: Record<RoadmapPhase, RoadmapStop[]> = {
    first: [],
    month: [],
    backlog: [],
  };
  for (const stop of stops) {
    if (stop.tracking !== "open") continue;
    groups[stop.phase].push(stop);
  }
  return groups;
}
