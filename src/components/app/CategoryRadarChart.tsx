import { CATEGORY_ORDER } from "@/components/app/categories";
import type { CategoryScores } from "@/db/types";
import {
  normalizeCategoryScores,
  radarAxisEnd,
  radarCategoryLabels,
  radarDataPolygon,
  radarLabelPosition,
  RADAR_GRID_LEVELS,
  radarVertex,
} from "@/lib/export/category-radar";

export function CategoryRadarChart({
  scores,
  size = 240,
}: {
  scores: CategoryScores | null | undefined;
  size?: number;
}) {
  const data = normalizeCategoryScores(scores);
  const cx = size / 2;
  const cy = size / 2 + 2;
  const maxR = size / 2 - 42;
  const labels = radarCategoryLabels();

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      aria-label="Category score radar chart"
      role="img"
    >
      {RADAR_GRID_LEVELS.map((level) => {
        const ringR = (level / 100) * maxR;
        const ringPoints = CATEGORY_ORDER.map((_, i) => {
          const { x, y } = radarAxisEnd(i, cx, cy, ringR);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={ringPoints}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={level === 100 ? 1.25 : 0.75}
          />
        );
      })}

      {CATEGORY_ORDER.map((_, i) => {
        const { x, y } = radarAxisEnd(i, cx, cy, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth={0.75}
          />
        );
      })}

      <polygon
        points={radarDataPolygon(data, cx, cy, maxR)}
        fill="rgb(37 99 235 / 0.18)"
        stroke="#2563eb"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {CATEGORY_ORDER.map((cat, i) => {
        const { x, y } = radarVertex(i, data[cat], cx, cy, maxR);
        return <circle key={cat} cx={x} cy={y} r={3.5} fill="#2563eb" />;
      })}

      {labels.map(({ category, label }, i) => {
        const { x, y, anchor } = radarLabelPosition(i, cx, cy, maxR, 14);
        return (
          <text
            key={category}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-slate-600 text-[10px] font-semibold"
          >
            {label}
          </text>
        );
      })}

      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-400 text-[9px] font-medium"
      >
        Score
      </text>
    </svg>
  );
}
