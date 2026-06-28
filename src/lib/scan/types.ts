import type { Category, Severity, FindingImpact } from "@/db/types";
import type { LicensePricingOverrides } from "@/lib/licenses/pricing-overrides";

export type { Category, Severity } from "@/db/types";

export interface FindingDraft {
  category: Category;
  checkId: string;
  severity: Severity;
  title: string;
  description: string;
  impact?: FindingImpact;
  remediation: string;
  entityRef?: string | null;
}

export interface ScanContext {
  tenantId: string;
  token: string;
  licensePricing?: LicensePricingOverrides | null;
}

export interface Check {
  id: string;
  category: Category;
  run(ctx: ScanContext): Promise<FindingDraft[]>;
}
