/** Checks and helpers for license / certificate / secret expiry findings. */

export const EXPIRY_CHECK_IDS = new Set([
  "reliability.expiring-secrets",
  "reliability.service-principal-secrets",
  "cost.license-expiry",
]);

export function isExpiryCheckId(checkId: string): boolean {
  return EXPIRY_CHECK_IDS.has(checkId);
}

export interface ExpiryFindingLike {
  check_id: string;
  severity: string;
  title: string;
  impact?: { daysUntil?: number; expiresAt?: string } | null;
}

export function isUrgentExpiryFinding(f: ExpiryFindingLike): boolean {
  if (!isExpiryCheckId(f.check_id)) return false;
  const days = f.impact?.daysUntil;
  if (days != null) return days <= 30;
  return f.severity === "high";
}

export function countNewExpiryFindings(
  findings: ExpiryFindingLike[],
  previousKeys: Set<string>,
  keyFn: (f: ExpiryFindingLike & { entity_ref?: string | null }) => string,
): ExpiryFindingLike[] {
  return findings.filter((f) => {
    if (!isExpiryCheckId(f.check_id)) return false;
    const key = keyFn(f as ExpiryFindingLike & { entity_ref?: string | null });
    return !previousKeys.has(key) && isUrgentExpiryFinding(f);
  });
}
