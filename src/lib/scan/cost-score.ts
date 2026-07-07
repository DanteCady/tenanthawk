import type { Severity } from "@/db/types";
import type { FindingDraft } from "./types";
import { SCORE_PENALTIES } from "./catalog";

const PENALTY: Record<Severity, number> = SCORE_PENALTIES;

/** Map estimated recoverable spend to a 0–100 cost health score (higher = less waste). */
export function costScoreFromRecoverableUsd(monthlyUsd: number): number {
  if (monthlyUsd <= 0) return 100;
  if (monthlyUsd < 100) return 95;
  if (monthlyUsd < 300) return 88;
  if (monthlyUsd < 750) return 80;
  if (monthlyUsd < 1500) return 72;
  if (monthlyUsd < 3000) return 64;
  if (monthlyUsd < 6000) return 56;
  if (monthlyUsd < 12000) return 48;
  const extra = Math.floor((monthlyUsd - 12000) / 5000);
  return Math.max(20, 40 - extra * 4);
}

/** Cost category: blend finding penalties with recoverable spend so low waste earns a better grade. */
export function scoreCostFromFindings(findings: FindingDraft[]): number {
  if (findings.length === 0) return 100;

  let penaltyScore = 100;
  let totalUsd = 0;
  for (const f of findings) {
    penaltyScore = Math.max(0, penaltyScore - PENALTY[f.severity]);
    totalUsd += f.impact?.usd ?? 0;
  }

  if (totalUsd <= 0) return penaltyScore;

  const dollarScore = costScoreFromRecoverableUsd(totalUsd);
  return Math.round(penaltyScore * 0.35 + dollarScore * 0.65);
}
