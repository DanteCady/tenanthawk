"use client";

import { useState } from "react";
import { CATEGORY_ORDER, CATEGORY_META } from "@/components/app/categories";
import type { Category } from "@/db/types";
import {
  CATEGORY_COLORS,
  type CategoryTrendPoint,
} from "@/lib/charts/category-trend";

export { buildCategoryTrend } from "@/lib/charts/category-trend";
export type { CategoryTrendPoint } from "@/lib/charts/category-trend";

type ChartType = "line" | "bar" | "pie";

const CHART_TYPES: { id: ChartType; label: string }[] = [
  { id: "line", label: "Line" },
  { id: "bar", label: "Bar" },
  { id: "pie", label: "Pie" },
];

function ChartLegend() {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {CATEGORY_ORDER.map((cat) => (
        <li key={cat} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[cat] }}
          />
          {CATEGORY_META[cat].label}
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ height, message }: { height: number; message: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-500"
      style={{ height }}
    >
      {message}
    </div>
  );
}

function LineTrendChart({
  points,
  width,
  height,
}: {
  points: CategoryTrendPoint[];
  width: number | string;
  height: number;
}) {
  const numericWidth = typeof width === "number" ? width : 400;
  const pad = { top: 12, right: 12, bottom: 28, left: 36 };
  const chartW = numericWidth - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const stepX = chartW / (points.length - 1);

  function yFor(score: number) {
    return pad.top + chartH - (score / 100) * chartH;
  }

  const gridLevels = [0, 25, 50, 75, 100];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      className="overflow-visible"
      aria-label="Category score line chart"
      role="img"
    >
      {gridLevels.map((level) => {
        const y = yFor(level);
        return (
          <g key={level}>
            <line
              x1={pad.left}
              y1={y}
              x2={pad.left + chartW}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={level === 0 ? 1 : 0.75}
              strokeDasharray={level === 0 ? undefined : "4 4"}
            />
            <text
              x={pad.left - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-400 text-[9px]"
            >
              {level}
            </text>
          </g>
        );
      })}

      {CATEGORY_ORDER.map((cat) => {
        const coords = points.map((p, i) => ({
          x: pad.left + i * stepX,
          y: yFor(p.scores[cat]),
        }));
        const path = coords
          .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
          .join(" ");
        const last = coords[coords.length - 1];
        return (
          <g key={cat}>
            <path
              d={path}
              fill="none"
              stroke={CATEGORY_COLORS[cat]}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={last.x} cy={last.y} r={3} fill={CATEGORY_COLORS[cat]} />
          </g>
        );
      })}

      {points.map((p, i) => (
        <text
          key={p.key}
          x={pad.left + i * stepX}
          y={height - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[9px]"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function BarTrendChart({
  points,
  width,
  height,
}: {
  points: CategoryTrendPoint[];
  width: number | string;
  height: number;
}) {
  const numericWidth = typeof width === "number" ? width : 400;
  const pad = { top: 12, right: 12, bottom: 28, left: 36 };
  const chartW = numericWidth - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const groupW = chartW / points.length;
  const barGap = 2;
  const barW = Math.max(4, (groupW - barGap * (CATEGORY_ORDER.length + 1)) / CATEGORY_ORDER.length);
  const gridLevels = [0, 25, 50, 75, 100];

  function yFor(score: number) {
    return pad.top + chartH - (score / 100) * chartH;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      className="overflow-visible"
      aria-label="Category score bar chart"
      role="img"
    >
      {gridLevels.map((level) => {
        const y = yFor(level);
        return (
          <g key={level}>
            <line
              x1={pad.left}
              y1={y}
              x2={pad.left + chartW}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={level === 0 ? 1 : 0.75}
              strokeDasharray={level === 0 ? undefined : "4 4"}
            />
            <text
              x={pad.left - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-400 text-[9px]"
            >
              {level}
            </text>
          </g>
        );
      })}

      {points.map((point, gi) => {
        const groupX = pad.left + gi * groupW;
        return (
          <g key={point.key}>
            {CATEGORY_ORDER.map((cat, ci) => {
              const score = point.scores[cat];
              const x = groupX + barGap + ci * (barW + barGap);
              const yTop = yFor(score);
              const barH = pad.top + chartH - yTop;
              return (
                <rect
                  key={cat}
                  x={x}
                  y={yTop}
                  width={barW}
                  height={Math.max(barH, score > 0 ? 2 : 0)}
                  rx={2}
                  fill={CATEGORY_COLORS[cat]}
                  opacity={0.9}
                >
                  <title>
                    {CATEGORY_META[cat].label}: {score} ({point.label})
                  </title>
                </rect>
              );
            })}
            <text
              x={groupX + groupW / 2}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-500 text-[9px]"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
}

function PieTrendChart({
  points,
  width,
  height,
}: {
  points: CategoryTrendPoint[];
  width: number | string;
  height: number;
}) {
  const latest = points[points.length - 1];
  const numericWidth = typeof width === "number" ? width : 400;
  const cx = numericWidth / 2;
  const cy = height / 2 - 4;
  const r = Math.min(numericWidth, height) / 2 - 36;

  const scores = CATEGORY_ORDER.map((cat) => ({
    cat,
    value: latest.scores[cat],
  }));
  const total = scores.reduce((s, x) => s + x.value, 0);
  const weights =
    total > 0
      ? scores.map((s) => s.value)
      : scores.map(() => 25);

  const weightSum = weights.reduce((a, b) => a + b, 0);
  const slices = scores.reduce<
    Array<{ cat: (typeof scores)[number]["cat"]; value: number; start: number; end: number }>
  >((acc, s, i) => {
    const sweep = (weights[i] / weightSum) * 360;
    const start = acc.length ? acc[acc.length - 1].end : 0;
    return [...acc, { ...s, start, end: start + sweep }];
  }, []);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${numericWidth} ${height}`}
      aria-label="Category score pie chart for latest scan"
      role="img"
    >
      {slices.map((slice) => (
        <path
          key={slice.cat}
          d={describeArc(cx, cy, r, slice.start, slice.end)}
          fill={CATEGORY_COLORS[slice.cat]}
          stroke="#fff"
          strokeWidth={1.5}
        >
          <title>
            {CATEGORY_META[slice.cat].label}: {slice.value} ({latest.label})
          </title>
        </path>
      ))}
      <circle cx={cx} cy={cy} r={r * 0.45} fill="white" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        className="fill-slate-900 text-sm font-semibold"
      >
        Latest
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        className="fill-slate-500 text-[10px]"
      >
        {latest.label}
      </text>
      {CATEGORY_ORDER.map((cat, i) => {
        const mid = (slices[i].start + slices[i].end) / 2;
        const labelR = r * 0.72;
        const { x, y } = polarToCartesian(cx, cy, labelR, mid);
        return (
          <text
            key={cat}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-[9px] font-semibold"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.35)" }}
          >
            {latest.scores[cat]}
          </text>
        );
      })}
    </svg>
  );
}

export function CategoryTrendChart({
  points,
  width = "100%",
  height = 220,
}: {
  points: CategoryTrendPoint[];
  width?: number | string;
  height?: number;
}) {
  const [chartType, setChartType] = useState<ChartType>("line");

  if (points.length === 0) {
    return (
      <EmptyState height={height} message="Complete a scan to see category scores." />
    );
  }

  const lineNeedsMore = chartType === "line" && points.length < 2;

  return (
    <div className="w-full">
      <div className="mb-3 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 w-fit">
        {CHART_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setChartType(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              chartType === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {lineNeedsMore ? (
        <EmptyState
          height={height}
          message="Run at least two scans for the line chart. Try bar or pie."
        />
      ) : chartType === "line" ? (
        <LineTrendChart points={points} width={width} height={height} />
      ) : chartType === "bar" ? (
        <BarTrendChart points={points} width={width} height={height} />
      ) : (
        <PieTrendChart points={points} width={width} height={height} />
      )}

      <ChartLegend />
      {chartType === "pie" && points.length > 1 && (
        <p className="mt-2 text-xs text-slate-500">
          Pie shows the latest scan ({points[points.length - 1].label}). Slice size is
          proportional to each category score.
        </p>
      )}
    </div>
  );
}
