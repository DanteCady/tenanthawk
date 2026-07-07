import type { Category, Severity, CategoryScores } from "@/db/types";
import type { FindingDraft } from "./types";
import { CHECK_DEFINITION_BY_ID } from "./checks/registry";

import { SCORE_PENALTIES } from "./catalog";

const PENALTY: Record<Severity, number> = SCORE_PENALTIES;
const CATEGORIES: Category[] = ["security", "cost", "reliability", "hygiene"];
const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3 };

function isScoredFinding(f: FindingDraft): boolean {
  const def = CHECK_DEFINITION_BY_ID.get(f.checkId);
  if (!def) return true;
  return def.scoreImpact === "full";
}

/** One penalty per exclusivity group (highest severity wins). */
function dedupeExclusivityGroups(findings: FindingDraft[]): FindingDraft[] {
  const byGroup = new Map<string, FindingDraft>();
  const ungrouped: FindingDraft[] = [];

  for (const f of findings) {
    const group = CHECK_DEFINITION_BY_ID.get(f.checkId)?.exclusivityGroup;
    if (!group) {
      ungrouped.push(f);
      continue;
    }
    const existing = byGroup.get(group);
    if (!existing) {
      byGroup.set(group, f);
      continue;
    }

    const fOrder = CHECK_DEFINITION_BY_ID.get(f.checkId)?.exclusivityOrder ?? 0;
    const existingOrder =
      CHECK_DEFINITION_BY_ID.get(existing.checkId)?.exclusivityOrder ?? 0;
    const fRank = SEVERITY_RANK[f.severity];
    const existingRank = SEVERITY_RANK[existing.severity];

    if (fRank > existingRank || (fRank === existingRank && fOrder < existingOrder)) {
      byGroup.set(group, f);
    }
  }

  return [...ungrouped, ...byGroup.values()];
}

export function scoreFindings(findings: FindingDraft[]): {
  overall: number;
  categoryScores: CategoryScores;
} {
  const scored = dedupeExclusivityGroups(findings.filter(isScoredFinding));
  const categoryScores: CategoryScores = {
    security: 100,
    cost: 100,
    reliability: 100,
    hygiene: 100,
  };

  for (const f of scored) {
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
