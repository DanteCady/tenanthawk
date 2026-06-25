import type { Category, Severity } from "@/db/types";

export interface ExportFinding {
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  remediation: string;
  entityRef: string | null;
  impactUsd: number | null;
  checkId: string;
}

export interface ExportMeta {
  tenant: string;
  scannedAt: string;
  score: number | null;
  mode: string;
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildFindingsCsv(meta: ExportMeta, findings: ExportFinding[]): string {
  const lines: string[] = [
    `# Tenant Hawk report`,
    `# Tenant: ${meta.tenant}`,
    `# Scanned: ${meta.scannedAt}`,
    `# Health score: ${meta.score ?? "—"}`,
    `# Mode: ${meta.mode}`,
    "",
    [
      "category",
      "severity",
      "title",
      "description",
      "remediation",
      "impact_usd_monthly",
      "entity_ref",
      "check_id",
    ].join(","),
  ];

  for (const f of findings) {
    lines.push(
      [
        f.category,
        f.severity,
        f.title,
        f.description,
        f.remediation,
        f.impactUsd != null ? String(f.impactUsd) : "",
        f.entityRef ?? "",
        f.checkId,
      ]
        .map(escapeCsv)
        .join(","),
    );
  }

  return lines.join("\n");
}
