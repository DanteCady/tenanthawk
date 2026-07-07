import type { CategoryScores } from "@/db/types";
import { connectionLabel } from "@/lib/connection/label";
import { buildReportCustomer } from "@/lib/export/report-customer";
import type { ExportFinding, ExportMeta } from "@/lib/export/types";
import { summarize } from "@/lib/summary";
import { scoreFindingsBySector } from "@/lib/scan/sector-score";

interface ConnectionLike {
  tenant_domain: string | null;
  display_name: string | null;
  tenant_id: string | null;
  mode: string;
  provider: string;
}

interface ScanLike {
  started_at: Date | string;
  score: number | null;
  category_scores: CategoryScores | null;
  scan_mode?: "standard" | "deep" | null;
}

interface FindingLike {
  category: ExportFinding["category"];
  severity: ExportFinding["severity"];
  title: string;
  description: string;
  remediation: string;
  entity_ref: string | null;
  impact: {
    usd?: number;
    count?: number;
    entities?: string[];
  } | null;
  check_id: string;
}

export function exportTenantLabel(conn: ConnectionLike): string {
  return connectionLabel(conn);
}

export function exportFilenameSlug(tenant: string): string {
  return tenant.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "tenant";
}

export function buildExportPayload(
  conn: ConnectionLike,
  scan: ScanLike,
  findings: FindingLike[],
) {
  const tenant = exportTenantLabel(conn);
  const summary = summarize(findings, scan.category_scores);
  const sectorScores = scoreFindingsBySector(
    findings.map((finding) => ({
      category: finding.category,
      checkId: finding.check_id,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      remediation: finding.remediation,
      impact: finding.impact ?? undefined,
      entityRef: finding.entity_ref,
    })),
  );

  const meta: ExportMeta = {
    tenant,
    customer: buildReportCustomer({
      tenant,
      displayName: conn.display_name,
      tenantDomain: conn.tenant_domain,
      tenantId: conn.tenant_id,
      mode: conn.mode,
      scannedAt: scan.started_at,
      provider: conn.provider,
    }),
    scannedAt: new Date(scan.started_at).toISOString(),
    score: scan.score,
    mode: conn.mode,
    scanMode: scan.scan_mode ?? "standard",
    categoryScores: scan.category_scores,
    sectorScores: sectorScores.map((sector) => ({
      sector: sector.sector,
      label: sector.label,
      score: sector.score,
      letter: sector.letter,
      findingCount: sector.findingCount,
    })),
    summary: {
      total: summary.total,
      high: summary.high,
      usd: summary.usd,
    },
  };

  const exportFindings: ExportFinding[] = findings.map((f) => ({
    category: f.category,
    severity: f.severity,
    title: f.title,
    description: f.description,
    remediation: f.remediation,
    entityRef: f.entity_ref,
    impactUsd: f.impact?.usd ?? null,
    impactCount: f.impact?.count ?? null,
    impactEntities: f.impact?.entities,
    checkId: f.check_id,
  }));

  return { meta, findings: exportFindings, summary, tenant };
}
