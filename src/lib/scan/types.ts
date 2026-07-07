import type { Category, Severity, FindingImpact } from "@/db/types";
import type { LicensePricingOverrides } from "@/lib/licenses/pricing-overrides";
import type { ScanPrefetch } from "./prefetch";

export type { Category, Severity } from "@/db/types";

export type ScanMode = "standard" | "deep";

export interface ScanCheckRunResult {
  id: string;
  status: "ok" | "skipped" | "error";
  reason?: string;
}

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
  prefetch?: ScanPrefetch;
  scanMode?: ScanMode;
  deepPrefetch?: import("./deep-prefetch").DeepScanPrefetch;
  /** Populated for composite checks that derive from other scan findings. */
  priorFindings?: FindingDraft[];
}

export interface Check {
  id: string;
  category: Category;
  run(ctx: ScanContext): Promise<FindingDraft[]>;
}
