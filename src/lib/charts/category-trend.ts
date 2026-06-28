import type { Category, CategoryScores } from "@/db/types";

export const CATEGORY_COLORS: Record<Category, string> = {
  security: "#dc2626",
  cost: "#16a34a",
  reliability: "#2563eb",
  hygiene: "#ca8a04",
};

export interface CategoryTrendPoint {
  /** Stable React key (scan id). */
  key: string;
  label: string;
  scores: CategoryScores;
}

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

function dayKeyUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTrendLabel(d: Date, includeTime: boolean): string {
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  if (!includeTime) return date;

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${date}, ${time}`;
}

export function buildCategoryTrend(
  scans: Array<{
    id: string;
    started_at: Date | string;
    category_scores: CategoryScores | null;
  }>,
): CategoryTrendPoint[] {
  const dated = scans
    .filter((s) => s.category_scores != null)
    .map((s) => ({ ...s, date: toDate(s.started_at) }));

  const scansPerDay = new Map<string, number>();
  for (const s of dated) {
    const day = dayKeyUtc(s.date);
    scansPerDay.set(day, (scansPerDay.get(day) ?? 0) + 1);
  }

  return dated.map((s) => {
    const includeTime = (scansPerDay.get(dayKeyUtc(s.date)) ?? 0) > 1;
    return {
      key: s.id,
      label: formatTrendLabel(s.date, includeTime),
      scores: s.category_scores as CategoryScores,
    };
  });
}
