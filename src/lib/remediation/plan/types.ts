import type { LicensePricingOverrides } from "@/lib/licenses/pricing-overrides";

export const REMEDIATION_PLAN_VERSION = "1.0";

export type RemediationRisk = "low" | "medium" | "high";

export interface RemediationAction {
  id: string;
  target: string;
  verb: string;
  detail?: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  risk: RemediationRisk;
  reversible: boolean;
}

export interface RemediationPlan {
  findingId: string;
  checkId: string;
  mode: "whatIf";
  generatedAt: string;
  dataSource: "live";
  tenantId: string;
  tenantLabel: string;
  planVersion: string;
  actions: RemediationAction[];
  summary: {
    actionCount: number;
    estimatedUsdSaved?: number;
    truncated?: boolean;
    totalActionCount?: number;
  };
}

export interface PlanHandlerContext {
  token: string;
  tenantId: string;
  licensePricing?: LicensePricingOverrides | null;
  finding: {
    id: string;
    check_id: string;
    entity_ref: string | null;
  };
}

export interface PlanHandlerResult {
  actions: RemediationAction[];
  estimatedUsdSaved?: number;
}

export interface PlanHandler {
  checkId: string;
  planActions(ctx: PlanHandlerContext): Promise<PlanHandlerResult>;
}

/** Max actions returned from API; UI may show fewer with truncation note. */
export const PLAN_ACTION_CAP = 500;
