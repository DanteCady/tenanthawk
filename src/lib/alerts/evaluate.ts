import type { InstantAlertMode } from "@/db/types";
import type { ScanDrift } from "@/lib/scan/drift";

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
