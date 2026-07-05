import type { RemediationPlan } from "../types";
import {
  buildMetadataHeader,
  emitActionBody,
  filterActions,
  scriptFilename,
  type ExportOptions,
  type ExportResult,
} from "./types";

function emitRunbookActionLoop(plan: RemediationPlan, actions: ReturnType<typeof filterActions>["actions"]): string {
  if (actions.length === 0) {
    return "Write-Warning 'No actions included in this export.'";
  }

  return actions
    .map((action) => {
      if (plan.checkId === "cost.unused-licenses") {
        return emitActionBody(action, plan.checkId, true);
      }
      const previewLines = [
        `Write-Output "What if: ${action.verb} on ${action.target}"`,
      ];
      const applyLines = emitActionBody(action, plan.checkId, false)
        .split("\n")
        .filter((l) => !l.includes("Write-Verbose") && !l.includes("Write-Host"))
        .join("\n");

      return [
        "if ($PreviewOnly) {",
        ...previewLines.map((l) => `  ${l}`),
        "} else {",
        applyLines,
        "}",
      ].join("\n");
    })
    .join("\n\n");
}

export function emitAzureRunbook(plan: RemediationPlan, options?: ExportOptions): ExportResult {
  const { actions, includedCount, totalCount } = filterActions(plan, options?.actionIds);
  const header = buildMetadataHeader(plan, includedCount, totalCount);

  const content = [
    header,
    "# Azure Automation runbook — Tenant Hawk remediation export",
    "# Prerequisites:",
    "#   - Automation account with managed identity enabled",
    "#   - Graph API permissions granted to MI: User.ReadWrite.All, Group.ReadWrite.All",
    "#   - Microsoft.Graph modules imported in Automation account",
    "",
    "param(",
    "  [bool]$PreviewOnly = $true,",
    `  [string]$TenantId = '${plan.tenantId}'`,
    ")",
    "",
    "Connect-MgGraph -Identity -NoWelcome",
    "",
    "# Embedded action list from preview — not live re-discovery",
    emitRunbookActionLoop(plan, actions),
    "",
    `Write-Output "Done. ${includedCount} action(s) processed."`,
  ].join("\n");

  return {
    filename: scriptFilename(plan, "azure-runbook"),
    content,
    mimeType: "text/plain",
  };
}
