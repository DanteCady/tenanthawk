import type { Category, CategoryScores, Severity } from "@/db/types";
import { CATEGORY_ORDER } from "@/components/app/categories";
import { grade } from "@/lib/scan/score";

export interface FindingRow {
  category: Category;
  severity: Severity;
  impact: { usd?: number; count?: number } | null;
}

export interface CategorySummary {
  category: Category;
  score: number;
  grade: string;
  count: number;
  high: number;
}

export interface ScanSummary {
  total: number;
  high: number;
  usd: number;
  categories: CategorySummary[];
}

export function summarize(
  findings: FindingRow[],
  categoryScores: CategoryScores | null,
): ScanSummary {
  const scores = categoryScores ?? {
    security: 100,
    cost: 100,
    reliability: 100,
    hygiene: 100,
  };

  const categories: CategorySummary[] = CATEGORY_ORDER.map((category) => {
    const inCat = findings.filter((f) => f.category === category);
    return {
      category,
      score: scores[category],
      grade: grade(scores[category]),
      count: inCat.length,
      high: inCat.filter((f) => f.severity === "high").length,
    };
  });

  return {
    total: findings.length,
    high: findings.filter((f) => f.severity === "high").length,
    usd: findings.reduce((sum, f) => sum + (f.impact?.usd ?? 0), 0),
    categories,
  };
}
