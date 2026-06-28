import Link from "next/link";
import { ArrowRight, Lock, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ScoreRing } from "@/components/app/ScoreRing";
import { UpgradeButton } from "@/components/app/UpgradeButton";
import { GradeBadge } from "@/components/app/GradeBadge";
import { CATEGORY_META } from "@/components/app/categories";
import { CategoryInfoButton } from "@/components/app/CategoryInfoButton";
import type { ScanSummary } from "@/lib/summary";

const CATEGORY_CHIP: Record<string, string> = {
  security: "bg-red-50 text-red-600",
  cost: "bg-green-50 text-green-600",
  reliability: "bg-blue-50 text-blue-600",
  hygiene: "bg-yellow-50 text-yellow-700",
};

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
    <main className="app-shell relative flex min-h-screen flex-col items-center px-6 py-12 sm:py-16">
      <div className="light-aura pointer-events-none absolute inset-0 -z-10" />
      <div className="mb-6 sm:mb-8">
        <Logo tone="light" />
      </div>

      <div className="w-full max-w-2xl">
        <div className="surface-card overflow-hidden">
          <div className="p-6 sm:p-8">
            <p className="text-center text-sm text-slate-500 sm:text-left">
              Scan complete for{" "}
              <span className="font-medium text-slate-700">{tenant}</span>
            </p>

            <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
              <ScoreRing score={score} size={140} />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Your tenant health score
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:max-w-sm">
                  We found{" "}
                  <span className="font-semibold text-slate-900">
                    {summary.total} issues
                  </span>
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

            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {summary.categories.map((c) => {
                const meta = CATEGORY_META[c.category];
                const Icon = meta.icon;
                const chip = CATEGORY_CHIP[c.category] ?? "bg-slate-50 text-slate-600";
                return (
                  <div
                    key={c.category}
                    className="relative rounded-xl border border-slate-200/80 bg-slate-50/80 p-3"
                  >
                    <CategoryInfoButton
                      category={c.category}
                      className="absolute right-2 top-1"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${chip}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <GradeBadge letter={c.grade} size="md" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {meta.label}
                    </p>
                    <p className="text-xs text-slate-500">{c.count} issues</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 px-6 py-5 sm:px-8">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Lock className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Full report locked
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Upgrade to Pro for every finding, remediation steps, and daily
                  monitoring — or continue free with your score and grades.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:p-5">
            <Link
              href="/dashboard"
              className="group btn-primary order-1 flex-1 justify-center shadow-none hover:shadow-md sm:order-2"
            >
              Continue to dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <UpgradeButton className="order-2 inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-800 sm:order-1">
              <TrendingUp className="h-4 w-4" />
              Unlock full report
            </UpgradeButton>
          </div>
        </div>
      </div>
    </main>
  );
}
