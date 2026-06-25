import { redirect } from "next/navigation";
import { AlertTriangle, ListChecks, PiggyBank } from "lucide-react";
import { getSession } from "@/lib/session";
import {
  getPrimaryConnection,
  getLatestScan,
  getFindings,
  getScanTrend,
  getScanHistory,
  getPreviousScan,
} from "@/lib/queries";
import { getPlan } from "@/lib/entitlements";
import { summarize } from "@/lib/summary";
import { diffScans } from "@/lib/scan/drift";
import { getFindingStatuses, isFindingHidden } from "@/lib/findings/status";
import { findingStatusKey } from "@/lib/findings/key";
import { ScoreRing } from "@/components/app/ScoreRing";
import { Sparkline } from "@/components/app/Sparkline";
import { RescanButton } from "@/components/app/RescanButton";
import { ExportMenu } from "@/components/app/ExportMenu";
import { DriftSummary } from "@/components/app/DriftSummary";
import { ScanHistory } from "@/components/app/ScanHistory";
import { MonitoringStatus } from "@/components/app/MonitoringStatus";
import { FindingsTable, type FindingDTO } from "@/components/app/FindingsTable";
import { CATEGORY_META } from "@/components/app/categories";
import { GradeBadge } from "@/components/app/GradeBadge";
import { timeAgo } from "@/lib/time";

const CATEGORY_STYLE: Record<
  string,
  { icon: string; chip: string }
> = {
  security: { icon: "text-red-600", chip: "bg-red-50" },
  cost: { icon: "text-green-600", chip: "bg-green-50" },
  reliability: { icon: "text-blue-600", chip: "bg-blue-50" },
  hygiene: { icon: "text-yellow-600", chip: "bg-yellow-50" },
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) redirect("/onboarding");
  const scan = await getLatestScan(conn.id);
  if (!scan) redirect("/onboarding");

  const findings = await getFindings(scan.id);
  const plan = await getPlan(session.user.id);
  const isPro = plan === "pro";
  const statuses = isPro ? await getFindingStatuses(conn.id) : new Map();

  const activeFindings = findings.filter((f) => {
    const tracking = statuses.get(findingStatusKey(f.check_id, f.entity_ref));
    return !isFindingHidden(tracking);
  });

  const summary = summarize(activeFindings, scan.category_scores);
  const trend = await getScanTrend(conn.id);

  const dtos: FindingDTO[] = findings.map((f) => {
    const tracking = statuses.get(findingStatusKey(f.check_id, f.entity_ref));
    return {
      id: f.id,
      checkId: f.check_id,
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description,
      impact: f.impact,
      remediation: f.remediation,
      entityRef: f.entity_ref,
      tracking: tracking?.status ?? "open",
      snoozedUntil: tracking?.snoozedUntil?.toISOString() ?? null,
    };
  });

  let drift = null;
  let history: Array<{ id: string; score: number | null; started_at: Date | string }> =
    [];

  if (isPro) {
    const prevScan = await getPreviousScan(conn.id, scan.id);
    if (prevScan) {
      const prevFindings = await getFindings(prevScan.id);
      drift = diffScans(
        prevFindings.map((f) => ({
          check_id: f.check_id,
          entity_ref: f.entity_ref,
          title: f.title,
          severity: f.severity,
        })),
        findings.map((f) => ({
          check_id: f.check_id,
          entity_ref: f.entity_ref,
          title: f.title,
          severity: f.severity,
        })),
      );
    }
    history = await getScanHistory(conn.id);
  }

  const stats = [
    { icon: ListChecks, label: "Open issues", value: summary.total.toString() },
    { icon: AlertTriangle, label: "High severity", value: summary.high.toString() },
    {
      icon: PiggyBank,
      label: "Recoverable / mo",
      value: `$${summary.usd.toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Tenant health
          </h1>
          <p className="text-sm text-slate-600">
            {conn.mode === "demo"
              ? "Contoso (demo tenant)"
              : conn.tenant_domain ?? "Microsoft 365"}
            {" · "}
            <span className="text-slate-500">
              last scan {timeAgo(scan.started_at)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu isPro={isPro} />
          <RescanButton />
        </div>
      </div>

      {isPro && <MonitoringStatus connectionId={conn.id} />}

      {isPro && drift && <DriftSummary drift={drift} />}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-highlight flex flex-col gap-3 p-4 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center gap-3">
            <ScoreRing score={scan.score ?? 0} size={96} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">Health score</p>
              <p className="text-xs text-slate-500">Overall tenant grade</p>
            </div>
          </div>
          <div className="border-t border-blue-200/50 pt-3">
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">
              Last 12 scans
            </p>
            <Sparkline
              points={trend.map((t) => t.score ?? 0)}
              width="100%"
              height={32}
              className="w-full"
            />
          </div>
        </div>

        {stats.map((s) => (
          <div key={s.label} className="surface-card flex items-center gap-3.5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <s.icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-none text-slate-900">
                {s.value}
              </p>
              <p className="mt-1 truncate text-xs text-slate-600">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.categories.map((c) => {
          const meta = CATEGORY_META[c.category];
          const Icon = meta.icon;
          const style = CATEGORY_STYLE[c.category];
          return (
            <div
              key={c.category}
              className="surface-card flex items-center justify-between gap-3 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.chip}`}
                >
                  <Icon className={`h-4 w-4 ${style.icon}`} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {meta.label}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {c.count} issues{c.high > 0 ? ` · ${c.high} high` : ""} ·{" "}
                    {c.score} pts
                  </p>
                </div>
              </div>
              <GradeBadge letter={c.grade} size="md" />
            </div>
          );
        })}
      </div>

      {isPro && history.length > 0 && (
        <ScanHistory scans={history} />
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Findings</h2>
        {isPro ? (
          <FindingsTable findings={dtos} />
        ) : (
          <FindingsTable lockedCount={summary.total} />
        )}
      </div>
    </div>
  );
}
