import type { Category, Severity, CategoryScores } from "@/db/types";
import type { FindingDraft } from "./types";

const PENALTY: Record<Severity, number> = { high: 18, medium: 7, low: 3 };
const CATEGORIES: Category[] = ["security", "cost", "reliability", "hygiene"];

export function scoreFindings(findings: FindingDraft[]): {
  overall: number;
  categoryScores: CategoryScores;
} {
  const categoryScores: CategoryScores = {
    security: 100,
    cost: 100,
    reliability: 100,
    hygiene: 100,
  };

  for (const f of findings) {
    categoryScores[f.category] = Math.max(
      0,
      categoryScores[f.category] - PENALTY[f.severity],
    );
  }

  const overall = Math.round(
    CATEGORIES.reduce((sum, c) => sum + categoryScores[c], 0) / CATEGORIES.length,
  );

  return { overall, categoryScores };
}

export function grade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const GRADE_STYLES: Record<string, string> = {
  A: "bg-green-100 text-green-700 ring-green-200",
  B: "bg-blue-100 text-blue-700 ring-blue-200",
  C: "bg-amber-100 text-amber-800 ring-amber-200",
  D: "bg-orange-100 text-orange-700 ring-orange-200",
  F: "bg-red-100 text-red-700 ring-red-200",
};

export function gradeStyles(letter: string): string {
  return GRADE_STYLES[letter] ?? GRADE_STYLES.F;
}
