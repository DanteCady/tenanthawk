import type { ScanMode } from "./types";
import { CHECK_DEFINITION_BY_ID } from "./checks/registry";

export function checkTier(checkId: string): string | undefined {
  return CHECK_DEFINITION_BY_ID.get(checkId)?.tier;
}

export function shouldRunCheck(checkId: string, scanMode: ScanMode = "standard"): boolean {
  const tier = checkTier(checkId);
  if (tier === "v2" && scanMode !== "deep") return false;
  return true;
}

export function skipReasonForCheck(checkId: string, scanMode: ScanMode = "standard"): string | null {
  if (shouldRunCheck(checkId, scanMode)) return null;
  return "Requires deep scan";
}
