import type { RemediationPlan } from "../types";
import { emitAzureRunbook } from "./emit-azure-runbook";
import { emitLocalPs51 } from "./emit-local-ps51";
import { emitLocalPs7 } from "./emit-local-ps7";
import type { ExportFormat, ExportOptions, ExportResult } from "./types";

export type { ExportFormat, ExportOptions, ExportResult } from "./types";
export { SUPPORTED_PREVIEW_CHECKS } from "../registry";

/** Generate a remediation script client-side from a cached preview plan. */
export function exportRemediationScript(
  plan: RemediationPlan,
  format: ExportFormat,
  options?: ExportOptions,
): ExportResult {
  switch (format) {
    case "local-ps7":
      return emitLocalPs7(plan, options);
    case "local-ps51":
      return emitLocalPs51(plan, options);
    case "azure-runbook":
      return emitAzureRunbook(plan, options);
  }
}

/** Trigger a browser download for an export result. */
export function downloadExport(result: ExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = result.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
