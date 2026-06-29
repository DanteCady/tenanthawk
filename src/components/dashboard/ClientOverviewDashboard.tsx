import Link from "next/link";
import { AlertTriangle, ListChecks, PiggyBank, ArrowRight, Route } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { getPreviousScan, getFindings } from "@/lib/queries";
import { diffScans } from "@/lib/scan/drift";
import { buildCompliancePosture } from "@/lib/compliance/posture";
import { buildRoadmapStops } from "@/lib/remediation/roadmap";
import { ScoreRing } from "@/components/app/ScoreRing";
import { Sparkline } from "@/components/app/Sparkline";
import { RescanButton } from "@/components/app/RescanButton";
import { ExportMenu } from "@/components/app/ExportMenu";
import { DriftSummary } from "@/components/app/DriftSummary";
import { MonitoringStatus } from "@/components/app/MonitoringStatus";
import { CATEGORY_META } from "@/components/app/categories";
import { CategoryInfoButton } from "@/components/app/CategoryInfoButton";
import { GradeBadge } from "@/components/app/GradeBadge";
import { CompliancePosture } from "@/components/app/CompliancePosture";
import { InlineStatHint } from "@/components/app/InlineStatHint";
import { timeAgo } from "@/lib/time";
import { formatUsd } from "@/lib/format";
import { hasCustomLicensePricing, parseLicensePricing } from "@/lib/licenses/pricing-overrides";

const CATEGORY_STYLE: Record<string, { icon: string; chip: string }> = {
  security: { icon: "text-red-600", chip: "bg-red-50" },
  cost: { icon: "text-green-600", chip: "bg-green-50" },
  reliability: { icon: "text-blue-600", chip: "bg-blue-50" },
  hygiene: { icon: "text-yellow-600", chip: "bg-yellow-50" },
};

export async function ClientOverviewDashboard() {
  const {
    conn,
    scan,
    findings,
    activeFindings,
    summary,
    trend,
    isPro,
    tenantLabel,
  } = await getDashboardSnapshot();

  let drift = null;
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
  }

  const compliancePosture = isPro
    ? buildCompliancePosture(
        activeFindings.map((f) => ({
          id: f.id,
          check_id: f.check_id,
          title: f.title,
          severity: f.severity,
        })),
      )
    : null;

  const customLicensePricing = hasCustomLicensePricing(
    parseLicensePricing(conn.license_pricing),
  );

  const firstRoadmapStop = isPro
    ? buildRoadmapStops(
        activeFindings.map((f) => ({
          id: f.id,
          checkId: f.check_id,
          category: f.category,
          severity: f.severity,
          title: f.title,
          description: f.description,
          remediation: f.remediation,
          entityRef: f.entity_ref,
          impact: f.impact,
          tracking: "open" as const,
        })),
      ).find((s) => s.tracking === "open")
    : null;

  const recoverableHint = customLicensePricing
    ? "Monthly savings from unused or misassigned licenses, using your contracted rates from Settings. Rescan after changing rates."
    : isPro
      ? "Monthly savings from unused or misassigned licenses, estimated from Microsoft list pricing. Set your contract rates in Settings → License pricing."
      : "Monthly savings from unused or misassigned licenses, estimated from Microsoft list pricing. Pro users can set contracted rates in Settings.";

  const stats = [
    { icon: ListChecks, label: "Open issues", value: summary.total.toString() },
    { icon: AlertTriangle, label: "High severity", value: summary.high.toString() },
    {
      icon: PiggyBank,
      label: "Recoverable / mo",
      value: `$${formatUsd(summary.usd)}`,
      hint: recoverableHint,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Workspace overview
          </h1>
          <p className="text-sm text-slate-600">
            {tenantLabel}
            {" · "}
            <span className="text-slate-500">last scan {timeAgo(scan.started_at)}</span>
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
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-600">
                {s.label}
                {"hint" in s && s.hint ? <InlineStatHint text={s.hint} /> : null}
              </p>
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
              className="surface-card flex items-center justify-between gap-4 p-4"
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
                    {c.count} issues{c.high > 0 ? ` · ${c.high} high` : ""} · {c.score}{" "}
                    pts
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <CategoryInfoButton category={c.category} />
                <GradeBadge letter={c.grade} size="md" />
              </div>
            </div>
          );
        })}
      </div>

      {isPro && compliancePosture && (
        <CompliancePosture posture={compliancePosture} compact />
      )}

      {isPro && summary.total > 0 && firstRoadmapStop && (
        <div className="surface-card flex flex-wrap items-center justify-between gap-4 border border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)] p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--th-surface)] text-[var(--th-brand-text)]">
              <Route className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--th-text)]">Start here</p>
              <p className="mt-0.5 truncate text-xs text-[var(--th-text-muted)]">
                {firstRoadmapStop.title}
              </p>
              <p className="mt-1 text-xs text-[var(--th-brand-text)]">
                {firstRoadmapStop.priorityReason}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/roadmap"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--th-brand)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Open roadmap
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {summary.total} open finding{summary.total === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Review, remediate, and track progress on the findings page.
          </p>
        </div>
        <Link
          href="/dashboard/findings"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
        >
          View findings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
