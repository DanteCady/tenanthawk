import type { RemediationAction, RemediationPlan } from "./types";

export type WhatIfLineKind = "prompt" | "comment" | "whatif" | "detail" | "summary" | "blank";

export interface WhatIfTerminalLine {
  actionId?: string;
  kind: WhatIfLineKind;
  text: string;
}

/** PowerShell ShouldProcess-style WhatIf message for one action. */
export function formatWhatIfMessage(action: RemediationAction): string {
  return `What if: Performing the operation "${action.verb}" on target "${action.target}".`;
}

function formatActionDetail(
  plan: RemediationPlan,
  action: RemediationAction,
): string | null {
  if (action.detail) return `# ${action.detail}`;

  if (plan.checkId === "cost.unused-licenses") {
    const before = action.before as {
      unused?: number;
      enabled?: number;
      consumed?: number;
    };
    if (before.unused != null && before.enabled != null) {
      return `# ${before.unused} unused of ${before.enabled} prepaid (${before.consumed ?? "?"} assigned)`;
    }
  }

  return null;
}

/** Build terraform-plan-style terminal lines from a cached remediation plan. */
export function buildWhatIfTerminalLines(
  plan: RemediationPlan,
  actions: RemediationAction[],
  included: Record<string, boolean>,
): WhatIfTerminalLine[] {
  const lines: WhatIfTerminalLine[] = [];
  const scriptName = `tenanthawk-${plan.checkId}-preview.ps1`;
  const includedActions = actions.filter((a) => included[a.id] !== false);
  const skippedCount = actions.length - includedActions.length;

  lines.push({
    kind: "prompt",
    text: `PS> .\\${scriptName} -WhatIf`,
  });
  lines.push({
    kind: "comment",
    text: `# Tenant Hawk plan ${plan.planVersion} · ${plan.tenantLabel}`,
  });
  lines.push({
    kind: "comment",
    text: `# generatedAt: ${plan.generatedAt}`,
  });
  lines.push({ kind: "blank", text: "" });

  if (actions.length === 0) {
    lines.push({
      kind: "summary",
      text: "Plan: No changes. Nothing to remediate for this finding.",
    });
    return lines;
  }

  for (const action of actions) {
    const isIncluded = included[action.id] !== false;
    lines.push({
      actionId: action.id,
      kind: "whatif",
      text: isIncluded
        ? formatWhatIfMessage(action)
        : `# [skip] ${formatWhatIfMessage(action)}`,
    });
    const detail = formatActionDetail(plan, action);
    if (detail) {
      lines.push({
        actionId: action.id,
        kind: "detail",
        text: isIncluded ? detail : `# [skip] ${detail.slice(2)}`,
      });
    }
  }

  lines.push({ kind: "blank", text: "" });
  lines.push({
    kind: "summary",
    text: `Plan: ${includedActions.length} to change, 0 to add, 0 to destroy.${
      skippedCount > 0 ? ` (${skippedCount} skipped for export)` : ""
    }`,
  });

  return lines;
}
