import type { RemediationAction, RemediationPlan } from "../types";

export type ExportFormat = "local-ps7" | "local-ps51" | "azure-runbook";

export interface ExportOptions {
  actionIds?: string[];
}

export interface ExportResult {
  filename: string;
  content: string;
  mimeType: string;
}

export function filterActions(
  plan: RemediationPlan,
  actionIds?: string[],
): { actions: RemediationAction[]; includedCount: number; totalCount: number } {
  const totalCount = plan.actions.length;
  if (!actionIds || actionIds.length === 0) {
    return { actions: plan.actions, includedCount: totalCount, totalCount };
  }
  const idSet = new Set(actionIds);
  const actions = plan.actions.filter((a) => idSet.has(a.id));
  return { actions, includedCount: actions.length, totalCount };
}

export function buildMetadataHeader(
  plan: RemediationPlan,
  includedCount: number,
  totalCount: number,
): string {
  return [
    "# Tenant Hawk remediation export",
    `# findingId:    ${plan.findingId}`,
    `# checkId:      ${plan.checkId}`,
    `# tenantId:     ${plan.tenantId}`,
    `# tenant:       ${plan.tenantLabel}`,
    `# generatedAt:  ${plan.generatedAt}`,
    `# planVersion:  ${plan.planVersion}`,
    `# actions:      ${includedCount} of ${totalCount} from preview`,
    "# NOTE: Re-run Preview in Tenant Hawk if tenant state changed since generatedAt.",
    "",
  ].join("\n");
}

function psQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function psStringArray(values: string[]): string {
  if (values.length === 0) return "@()";
  return `@(${values.map((v) => psQuote(v)).join(", ")})`;
}

export function emitActionBody(action: RemediationAction, checkId: string, previewOnly: boolean): string {
  const lines: string[] = [];
  const target = psQuote(action.target);

  if (checkId === "cost.disabled-user-licenses") {
    const before = action.before as {
      userPrincipalName?: string;
      skuIds?: string[];
    };
    const upn = before.userPrincipalName ?? action.target;
    const skuIds = before.skuIds ?? [];
    lines.push(`  # ${action.verb}: ${action.target}${action.detail ? ` (${action.detail})` : ""}`);
    if (previewOnly) {
      lines.push(`  Write-Verbose "What if: Remove licenses from ${upn}"`);
    } else {
      lines.push(`  $user = Get-MgUser -UserId ${psQuote(upn)} -Property Id`);
      lines.push(
        `  Set-MgUserLicense -UserId $user.Id -AddLicenses @() -RemoveLicenses ${psStringArray(skuIds)}`,
      );
    }
    return lines.join("\n");
  }

  if (checkId === "hygiene.empty-groups") {
    const before = action.before as { groupId?: string };
    const groupId = before.groupId ?? action.target;
    lines.push(`  # ${action.verb}: ${action.target}`);
    if (previewOnly) {
      lines.push(`  Write-Verbose "What if: Delete group ${action.target}"`);
    } else {
      lines.push(`  Remove-MgGroup -GroupId ${psQuote(groupId)}`);
    }
    return lines.join("\n");
  }

  if (checkId === "cost.unused-licenses") {
    const before = action.before as {
      skuPartNumber?: string;
      unused?: number;
      enabled?: number;
    };
    lines.push(`  # ${action.verb}: ${action.target}`);
    lines.push(
      `  Write-Output "Review ${before.unused ?? "?"} unused of ${before.enabled ?? "?"} prepaid seats for SKU ${before.skuPartNumber ?? action.target}"`,
    );
    lines.push(
      `  Write-Output "  → Reduce prepaid seats in M365 Admin or review assignments before changing billing."`,
    );
    return lines.join("\n");
  }

  lines.push(`  # ${action.verb}: ${target}`);
  lines.push(`  Write-Verbose "What if: ${action.verb} on ${action.target}"`);
  return lines.join("\n");
}

export function emitActionLoop(
  plan: RemediationPlan,
  actions: RemediationAction[],
  previewOnly: boolean,
): string {
  if (actions.length === 0) {
    return "Write-Warning 'No actions included in this export.'";
  }

  const blocks = actions.map((action) => {
    const body = emitActionBody(action, plan.checkId, previewOnly);
    if (plan.checkId === "cost.unused-licenses") {
      return body;
    }
    return [
      `if ($PSCmdlet.ShouldProcess(${psQuote(action.target)}, ${psQuote(action.verb)})) {`,
      body,
      "}",
    ].join("\n");
  });

  return blocks.join("\n\n");
}

export function scriptFilename(plan: RemediationPlan, format: ExportFormat): string {
  const shortId = plan.findingId.slice(0, 8);
  const suffix = format === "azure-runbook" ? "runbook" : "preview";
  return `tenanthawk-${plan.checkId}-${shortId}-${suffix}.ps1`;
}
