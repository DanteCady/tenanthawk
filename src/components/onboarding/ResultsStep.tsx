import Link from "next/link";
import { Lock, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ScoreRing } from "@/components/app/ScoreRing";
import { UpgradeButton } from "@/components/app/UpgradeButton";
import { GradeBadge } from "@/components/app/GradeBadge";
import { CATEGORY_META } from "@/components/app/categories";
import type { ScanSummary } from "@/lib/summary";

export function ResultsStep({
  summary,
  score,
  tenant,
}: {
  summary: ScanSummary;
  score: number;
  tenant: string;
}) {
  return (
    <main className="app-shell relative flex min-h-screen flex-col items-center px-6 py-16">
      <div className="light-aura pointer-events-none absolute inset-0 -z-10" />
      <div className="mb-8">
        <Logo tone="light" />
      </div>

      <div className="w-full max-w-3xl">
        <div className="surface-card p-8">
          <p className="text-sm text-slate-600">Scan complete for {tenant}</p>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={score} />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Your tenant health score
              </h1>
              <p className="mt-2 max-w-md text-slate-600">
                We found{" "}
                <span className="font-semibold text-slate-900">{summary.total} issues</span>
                {summary.high > 0 && (
                  <>
                    {" "}
                    including{" "}
                    <span className="font-semibold text-bad">
                      {summary.high} high-severity
                    </span>
                  </>
                )}
                {summary.usd > 0 && (
                  <>
                    , with{" "}
                    <span className="font-semibold text-blue-700">
                      ~${summary.usd.toLocaleString()}/mo
                    </span>{" "}
                    in recoverable spend
                  </>
                )}
                .
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summary.categories.map((c) => {
              const meta = CATEGORY_META[c.category];
              const Icon = meta.icon;
              return (
                <div
                  key={c.category}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <GradeBadge letter={c.grade} size="lg" />
                  </div>
                  <p className="mt-2 text-sm text-slate-900">{meta.label}</p>
                  <p className="text-xs text-slate-500">{c.count} issues</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mt-5 overflow-hidden surface-card p-8">
          <div className="pointer-events-none select-none space-y-3 blur-sm" aria-hidden>
            {[80, 64, 72, 56].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-bad" />
                <div className="h-3 rounded bg-slate-200" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 px-6 text-center backdrop-blur-[2px]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Unlock the full report
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              See every finding with severity, dollar impact, and step-by-step
              remediation — plus daily monitoring and drift alerts.
            </p>
            <div className="mt-5">
              <UpgradeButton className="btn-primary shadow-none hover:shadow-md">
                <TrendingUp className="h-4 w-4" />
                Unlock full report — Pro
              </UpgradeButton>
            </div>
            <Link
              href="/dashboard"
              className="mt-4 text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              Continue to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
