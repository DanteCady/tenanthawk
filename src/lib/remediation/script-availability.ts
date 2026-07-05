import { SUPPORTED_PREVIEW_CHECKS } from "./plan/registry";
import { getPowerShellForCheck } from "./portal-links";

export type ScriptIndicatorKind = "export" | "snippet";

/** Whether this check has a preview + export remediation script. */
export function hasRemediationExport(checkId: string): boolean {
  return SUPPORTED_PREVIEW_CHECKS.has(checkId);
}

/** Whether this check has a read-only quick-action PowerShell snippet. */
export function hasPowerShellSnippet(checkId: string): boolean {
  return getPowerShellForCheck(checkId) != null;
}

export function getScriptIndicatorKind(checkId: string): ScriptIndicatorKind | null {
  if (hasRemediationExport(checkId)) return "export";
  if (hasPowerShellSnippet(checkId)) return "snippet";
  return null;
}

export function scriptIndicatorTooltip(
  kind: ScriptIndicatorKind,
  isPro: boolean,
): string {
  if (kind === "export") {
    return isPro
      ? "Remediation script — preview and export"
      : "Pro: remediation script export";
  }
  return "Sample PowerShell snippet";
}
