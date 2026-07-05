import "server-only";
import { connectionLabel } from "@/lib/connection/label";
import { parseLicensePricing } from "@/lib/licenses/pricing-overrides";
import { getPlanHandler } from "./registry";
import {
  PLAN_ACTION_CAP,
  REMEDIATION_PLAN_VERSION,
  type RemediationPlan,
} from "./types";

export interface BuildPlanInput {
  finding: {
    id: string;
    check_id: string;
    entity_ref: string | null;
  };
  connection: {
    tenant_id: string | null;
    tenant_domain?: string | null;
    display_name?: string | null;
    mode?: string | null;
    license_pricing?: unknown;
  };
  token: string;
}

export async function buildRemediationPlan(input: BuildPlanInput): Promise<RemediationPlan> {
  const handler = getPlanHandler(input.finding.check_id);
  if (!handler) {
    throw new Error("UNSUPPORTED_CHECK");
  }

  const tenantId = input.connection.tenant_id;
  if (!tenantId) {
    throw new Error("NO_TENANT");
  }

  const licensePricing = parseLicensePricing(input.connection.license_pricing);
  const result = await handler.planActions({
    token: input.token,
    tenantId,
    licensePricing,
    finding: {
      id: input.finding.id,
      check_id: input.finding.check_id,
      entity_ref: input.finding.entity_ref,
    },
  });

  const totalActionCount = result.actions.length;
  const truncated = totalActionCount > PLAN_ACTION_CAP;
  const actions = truncated
    ? result.actions.slice(0, PLAN_ACTION_CAP)
    : result.actions;

  return {
    findingId: input.finding.id,
    checkId: input.finding.check_id,
    mode: "whatIf",
    generatedAt: new Date().toISOString(),
    dataSource: "live",
    tenantId,
    tenantLabel: connectionLabel(input.connection),
    planVersion: REMEDIATION_PLAN_VERSION,
    actions,
    summary: {
      actionCount: actions.length,
      estimatedUsdSaved: result.estimatedUsdSaved,
      truncated,
      totalActionCount: truncated ? totalActionCount : undefined,
    },
  };
}
