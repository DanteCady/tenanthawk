import { CATEGORY_META, CATEGORY_ORDER } from "@/components/app/categories";
import type { Category, CategoryScores } from "@/db/types";

const AXES = CATEGORY_ORDER.length;

export function normalizeCategoryScores(
  scores: CategoryScores | null | undefined,
): CategoryScores {
  return (
    scores ?? {
      security: 100,
      cost: 100,
      reliability: 100,
      hygiene: 100,
    }
  );
}

export function radarAngle(index: number): number {
  return -Math.PI / 2 + ((2 * Math.PI) / AXES) * index;
}

export function radarVertex(
  index: number,
  score: number,
  cx: number,
  cy: number,
  maxRadius: number,
): { x: number; y: number } {
  const angle = radarAngle(index);
  const radius = (Math.max(0, Math.min(100, score)) / 100) * maxRadius;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function radarAxisEnd(
  index: number,
  cx: number,
  cy: number,
  maxRadius: number,
): { x: number; y: number; angle: number } {
  const angle = radarAngle(index);
  return {
    x: cx + maxRadius * Math.cos(angle),
    y: cy + maxRadius * Math.sin(angle),
    angle,
  };
}

export function radarDataPolygon(
  scores: CategoryScores,
  cx: number,
  cy: number,
  maxRadius: number,
): string {
  return CATEGORY_ORDER.map((cat, i) => {
    const { x, y } = radarVertex(i, scores[cat], cx, cy, maxRadius);
    return `${x},${y}`;
  }).join(" ");
}

export function radarLabelPosition(
  index: number,
  cx: number,
  cy: number,
  maxRadius: number,
  padding: number,
): { x: number; y: number; anchor: "start" | "middle" | "end" } {
  const { x, y, angle } = radarAxisEnd(index, cx, cy, maxRadius + padding);
  const cos = Math.cos(angle);
  let anchor: "start" | "middle" | "end" = "middle";
  if (cos > 0.35) anchor = "start";
  else if (cos < -0.35) anchor = "end";
  return { x, y, anchor };
}

export function radarCategoryLabels(): Array<{ category: Category; label: string }> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_META[category].label,
  }));
}

export const RADAR_GRID_LEVELS = [25, 50, 75, 100] as const;
