/** Marketing + UI constants for the scan engine. Keep in sync with checks/registry.ts offered count. */

import { scoredCheckCount } from "./checks/registry";

export const SCAN_CHECK_COUNT = scoredCheckCount();

export const SCORE_SCALE = 100;

export const SCORE_PENALTIES = {
  high: 18,
  medium: 7,
  low: 3,
} as const;

export function scoreMethodologyLine(): string {
  return `${SCAN_CHECK_COUNT} automated checks, severity-weighted, scored out of ${SCORE_SCALE}`;
}

export function scoreMethodologyDetail(): string {
  return `Each category starts at ${SCORE_SCALE}. Each finding lowers the category score: high costs ${SCORE_PENALTIES.high} points, medium ${SCORE_PENALTIES.medium}, low ${SCORE_PENALTIES.low}. Your overall score is the average across security, cost, reliability, and hygiene.`;
}
