import type { InstantAlertMode } from "@/db/types";
import type { ScanDrift } from "@/lib/scan/drift";
import {
  isExpiryCheckId,
  isUrgentExpiryFinding,
  type ExpiryFindingLike,
} from "@/lib/scan/expiry";

export function shouldSendInstantAlert(
  mode: InstantAlertMode,
  drift: ScanDrift,
  scoreDelta: number | null,
): boolean {
  if (mode === "off") return false;

  const scoreDropped = scoreDelta != null && scoreDelta <= -5;

  if (mode === "high") {
    return drift.newHighCount > 0 || scoreDropped;
  }

  return (
    drift.newCount > 0 ||
    drift.resolvedCount > 0 ||
    drift.changedCount > 0 ||
    (scoreDelta != null && scoreDelta !== 0)
  );
}

export function shouldSendExpiryAlert(
  enabled: boolean,
  previous: ExpiryFindingLike[],
  current: ExpiryFindingLike[],
  keyFn: (f: ExpiryFindingLike & { entity_ref?: string | null }) => string,
): boolean {
  if (!enabled) return false;

  const prevKeys = new Set(
    previous.filter((f) => isExpiryCheckId(f.check_id)).map(keyFn),
  );

  return current.some((f) => {
    if (!isExpiryCheckId(f.check_id)) return false;
    if (prevKeys.has(keyFn(f as ExpiryFindingLike & { entity_ref?: string | null }))) {
      return false;
    }
    return isUrgentExpiryFinding(f);
  });
}
