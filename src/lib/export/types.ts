import type { Category, Severity } from "@/db/types";
import type { ReportCustomer } from "@/lib/export/report-customer";

export interface ExportFinding {
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  remediation: string;
  entityRef: string | null;
  impactUsd: number | null;
  impactCount?: number | null;
  impactEntities?: string[];
  checkId: string;
}

export interface ExportMeta {
  tenant: string;
  customer?: ReportCustomer;
  scannedAt: string;
  score: number | null;
  mode: string;
  categoryScores?: {
    security: number;
    cost: number;
    reliability: number;
    hygiene: number;
  } | null;
  summary?: {
    total: number;
    high: number;
    usd: number;
  };
}
