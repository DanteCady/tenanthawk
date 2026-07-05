"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { CATEGORY_ORDER, CATEGORY_META } from "@/components/app/categories";
import type { Category } from "@/db/types";
import {
  CATEGORY_COLORS,
  type CategoryTrendPoint,
} from "@/lib/charts/category-trend";
import { grade } from "@/lib/scan/score";
import { CategoryRadarChart } from "./CategoryRadarChart";
import { GradeBadge } from "./GradeBadge";
import { Sparkline } from "./Sparkline";

export { buildCategoryTrend } from "@/lib/charts/category-trend";
export type { CategoryTrendPoint } from "@/lib/charts/category-trend";

const CATEGORY_CHIP: Record<Category, string> = {
  security: "bg-red-50",
  cost: "bg-green-50",
  reliability: "bg-blue-50",
  hygiene: "bg-yellow-50",
};

function overallFromPoint(p: CategoryTrendPoint): number {
  return Math.round(
    CATEGORY_ORDER.reduce((sum, c) => sum + p.scores[c], 0) / CATEGORY_ORDER.length,
  );
}

function Delta({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Minus className="h-3 w-3" aria-hidden />
        No change
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        up ? "text-emerald-600" : "text-red-600"
      }`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" aria-hidden />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden />
      )}
      {up ? "+" : ""}
      {delta} vs prior scan
    </span>
  );
}

export function CategoryTrendChart({ points }: { points: CategoryTrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">
        Complete a scan to see category scores.
      </div>
    );
  }

  const latest = points[points.length - 1];
  const prev = points.length >= 2 ? points[points.length - 2] : null;
  const overallSeries = points.map(overallFromPoint);
  const overallLatest = overallSeries[overallSeries.length - 1];
  const overallDelta = prev != null ? overallLatest - overallFromPoint(prev) : null;

  return (
    <div className="space-y-4">
      <div className="surface-highlight grid gap-4 p-4 sm:grid-cols-[minmax(0,8rem)_1fr_minmax(0,6rem)] sm:items-end">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
            Overall
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-3xl font-semibold tabular-nums text-slate-900">
              {overallLatest}
            </p>
            <GradeBadge letter={grade(overallLatest)} size="sm" />
          </div>
          {overallDelta != null && (
            <div className="mt-1">
              <Delta delta={overallDelta} />
            </div>
          )}
        </div>
        <div className="min-w-0 pb-1">
          <Sparkline
            points={overallSeries}
            width="100%"
            height={52}
            color="#2563eb"
            domainMin={0}
            domainMax={100}
          />
        </div>
        <div className="text-right text-xs text-slate-500 sm:pb-1">
          <p className="font-medium text-slate-700">
            {points.length} scan{points.length === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 truncate">{latest.label}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORY_ORDER.map((cat) => {
          const series = points.map((p) => p.scores[cat]);
          const score = latest.scores[cat];
          const delta = prev != null ? score - prev.scores[cat] : null;
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;

          return (
            <div key={cat} className="surface-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${CATEGORY_CHIP[cat]}`}
                  >
                    <Icon className="h-4 w-4" style={{ color: CATEGORY_COLORS[cat] }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {meta.label}
                    </p>
                    <p className="text-2xl font-semibold tabular-nums leading-none text-slate-900">
                      {score}
                    </p>
                  </div>
                </div>
                <GradeBadge letter={grade(score)} size="sm" />
              </div>
              {delta != null && (
                <div className="mt-2">
                  <Delta delta={delta} />
                </div>
              )}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Sparkline
                  points={series}
                  width="100%"
                  height={36}
                  color={CATEGORY_COLORS[cat]}
                  domainMin={0}
                  domainMax={100}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="surface-card flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-slate-900">Latest snapshot</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Category balance on {latest.label}. Sparklines above show how each score
            changed across your last {points.length} scan{points.length === 1 ? "" : "s"}.
          </p>
        </div>
        <CategoryRadarChart scores={latest.scores} size={200} />
      </div>
    </div>
  );
}
