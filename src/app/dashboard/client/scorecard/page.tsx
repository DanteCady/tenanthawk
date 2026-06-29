import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getDashboardSnapshot } from "@/lib/dashboard/context";
import { ScoreRing } from "@/components/app/ScoreRing";
import { GradeBadge } from "@/components/app/GradeBadge";
import { SeverityBadge } from "@/components/app/SeverityBadge";
import { CATEGORY_META } from "@/components/app/categories";
import { ShareReportPanel } from "@/components/app/ShareReportPanel";
import { ExportMenu } from "@/components/app/ExportMenu";
import { RescanButton } from "@/components/app/RescanButton";
import { timeAgo } from "@/lib/time";
import { formatUsd } from "@/lib/format";

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

export default async function ClientScorecardPage() {
  const { conn, scan, activeFindings, summary, isPro, tenantLabel } =
    await getDashboardSnapshot();

  const topFindings = [...activeFindings]
    .sort(
      (a, b) =>
        SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
        (b.impact?.usd ?? 0) - (a.impact?.usd ?? 0),
    )
    .slice(0, 5);

  const connectionQuery = `connection=${conn.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/dashboard/client?${connectionQuery}`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Client overview
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Client scorecard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {tenantLabel} · last scan {timeAgo(scan.started_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu isPro={isPro} />
          <RescanButton />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-highlight flex flex-col items-center gap-4 p-6 lg:col-span-1">
          <ScoreRing score={scan.score ?? 0} size={140} />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-900">Tenant health</p>
            <p className="mt-1 text-xs text-slate-500">
              {summary.high} high · ${formatUsd(summary.usd)}/mo recoverable
            </p>
          </div>
        </div>

        <div className="surface-card grid gap-3 p-5 sm:grid-cols-2 lg:col-span-2">
          {summary.categories.map((c) => {
            const meta = CATEGORY_META[c.category];
            const Icon = meta.icon;
            return (
              <div
                key={c.category}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate text-sm font-medium text-slate-900">
                    {meta.label}
                  </span>
                </div>
                <GradeBadge letter={c.grade} size="sm" />
              </div>
            );
          })}
        </div>
      </div>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Top findings</h2>
          <Link
            href="/dashboard/findings"
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            View all
          </Link>
        </div>
        {topFindings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No open findings — great posture.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {topFindings.map((f) => (
              <li key={f.id} className="flex flex-wrap items-start gap-3 py-3 first:pt-0">
                <SeverityBadge severity={f.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{f.title}</p>
                  {f.impact?.usd ? (
                    <p className="mt-0.5 text-xs text-green-700">
                      ${formatUsd(f.impact.usd)}/mo impact
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isPro ? (
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Share scorecard</h2>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Create a read-only link for QBRs and client updates. Links are scoped to this
            client.
          </p>
          <ShareReportPanel />
        </section>
      ) : (
        <div className="surface-card border border-dashed border-slate-200 px-5 py-4 text-sm text-slate-600">
          Upgrade to Pro to share scorecard links with clients.
          <Link href="/dashboard/billing" className="ml-1 font-medium text-blue-700">
            View plans
          </Link>
        </div>
      )}
    </div>
  );
}
