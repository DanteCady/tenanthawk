import type { RemediationPlan } from "../types";
import {
  buildMetadataHeader,
  emitActionLoop,
  filterActions,
  scriptFilename,
  type ExportOptions,
  type ExportResult,
} from "./types";

export function emitLocalPs7(plan: RemediationPlan, options?: ExportOptions): ExportResult {
  const { actions, includedCount, totalCount } = filterActions(plan, options?.actionIds);
  const header = buildMetadataHeader(plan, includedCount, totalCount);

  const content = [
    header,
    "#requires -Version 7.0",
    "# Tenant Hawk — see metadata block above. Default: preview only.",
    "# Prerequisites: Install-Module Microsoft.Graph.Users, Microsoft.Graph.Groups",
    "# Write scopes required if you remove -WhatIf: User.ReadWrite.All, Group.ReadWrite.All",
    "",
    "[CmdletBinding(SupportsShouldProcess)]",
    "param(",
    "  [switch]$WhatIf = $true   # default preview",
    ")",
    "",
    "Connect-MgGraph -Scopes 'User.ReadWrite.All','Group.ReadWrite.All' -NoWelcome",
    "",
    "# Embedded action list from preview — not live re-discovery",
    "$PreviewMode = $WhatIf.IsPresent",
    "if ($PreviewMode) {",
    "  Write-Host 'Preview mode (WhatIf). Pass -WhatIf:$false to apply after change approval.' -ForegroundColor Cyan",
    "}",
    "",
    emitActionLoop(plan, actions, true).replace(
      /Write-Verbose "What if:/g,
      'Write-Host "What if:',
    ),
    "",
    "Write-Host \"Done. $($includedCount) action(s) processed in preview mode.\" -ForegroundColor Green",
  ].join("\n");

  return {
    filename: scriptFilename(plan, "local-ps7"),
    content,
    mimeType: "text/plain",
  };
}
