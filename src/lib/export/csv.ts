import { CATEGORY_META } from "@/components/app/categories";
import { REPORT_FOOTER_LINE } from "@/lib/brand";
import { reportCustomerRows } from "@/lib/export/report-customer";
import {
  formatExportImpact,
  formatReportDate,
} from "@/lib/export/report-format";
import type { ExportFinding, ExportMeta } from "@/lib/export/types";
import { grade } from "@/lib/scan/score";
import type { ScanSummary } from "@/lib/summary";

function escapeCsv(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function row(cells: Array<string | number | null | undefined>): string {
  return cells.map(escapeCsv).join(",");
}

function blank(): string {
  return "";
}

/** High-level overview CSV aligned with the PDF executive summary. */
export function buildOverviewCsv(
  meta: ExportMeta,
  findings: ExportFinding[],
  summary: ScanSummary,
): string {
  const lines: string[] = [];

  lines.push(row(["Tenant Hawk - Tenant Health Report"]));
  lines.push(row(["Generated", formatReportDate(new Date())]));
  lines.push(blank());

  lines.push(row(["CUSTOMER DETAILS"]));
  if (meta.customer) {
    for (const { label, value } of reportCustomerRows(meta.customer)) {
      lines.push(row([label, value]));
    }
  } else {
    lines.push(row(["Organization", meta.tenant]));
    lines.push(row(["Scanned", formatReportDate(meta.scannedAt)]));
    lines.push(row(["Scan type", meta.mode === "demo" ? "Demo tenant scan" : "Live Microsoft 365 scan"]));
  }
  lines.push(blank());

  lines.push(row(["HEALTH SUMMARY"]));
  const overallGrade = meta.score != null ? grade(meta.score) : "-";
  lines.push(row(["Overall health score", meta.score ?? "-"]));
  lines.push(row(["Overall grade", overallGrade]));
  lines.push(row(["Open findings", summary.total]));
  lines.push(row(["High severity findings", summary.high]));
  if (summary.usd > 0) {
    lines.push(row(["Recoverable spend (monthly)", `$${summary.usd.toLocaleString()}`]));
  }
  lines.push(blank());

  lines.push(row(["CATEGORY GRADES"]));
  lines.push(row(["Category", "Score", "Grade", "Open findings", "High severity"]));
  for (const cat of summary.categories) {
    lines.push(
      row([
        CATEGORY_META[cat.category].label,
        cat.score,
        cat.grade,
        cat.count,
        cat.high,
      ]),
    );
  }
  lines.push(blank());

  lines.push(row(["FINDINGS SUMMARY"]));
  lines.push(row(["Severity", "Category", "Finding", "Impact"]));
  for (const f of findings) {
    lines.push(
      row([
        f.severity.toUpperCase(),
        CATEGORY_META[f.category].label,
        f.title,
        formatExportImpact(f),
      ]),
    );
  }
  lines.push(blank());

  lines.push(row(["NOTES"]));
  lines.push(
    row([
      "This CSV contains executive summary data only. Export the Excel workbook for detailed findings by category, including remediation steps and affected items.",
    ]),
  );
  lines.push(row([REPORT_FOOTER_LINE]));

  return `\uFEFF${lines.join("\n")}`;
}
