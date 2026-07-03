import ExcelJS from "exceljs";
import { CATEGORY_META, CATEGORY_ORDER } from "@/components/app/categories";
import { REPORT_FOOTER_LINE } from "@/lib/brand";
import { reportCustomerRows } from "@/lib/export/report-customer";
import {
  entityItemsLabel,
  formatAffectedItems,
  formatExportImpact,
  formatReportDate,
} from "@/lib/export/report-format";
import {
  CATEGORY_SHEET_NAMES,
  EXPORT_COLORS,
  GRADE_TEXT,
  SEVERITY_FILL,
  SEVERITY_TEXT,
} from "@/lib/export/styling";
import type { ExportFinding, ExportMeta } from "@/lib/export/types";
import type { Category, Severity } from "@/db/types";
import { grade } from "@/lib/scan/score";
import type { ScanSummary } from "@/lib/summary";

function applyHeaderRow(row: ExcelJS.Row, colCount: number) {
  row.height = 22;
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXPORT_COLORS.navy },
    };
    cell.font = { bold: true, color: { argb: EXPORT_COLORS.white }, size: 10 };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: EXPORT_COLORS.line } },
    };
  }
}

function styleSeverityCell(cell: ExcelJS.Cell, severity: Severity) {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: SEVERITY_FILL[severity] },
  };
  cell.font = { bold: true, color: { argb: SEVERITY_TEXT[severity] }, size: 10 };
  cell.alignment = { vertical: "top", wrapText: true };
}

function styleSectionTitle(cell: ExcelJS.Cell, text: string) {
  cell.value = text;
  cell.font = { bold: true, size: 12, color: { argb: EXPORT_COLORS.navy } };
}

function styleLabelCell(cell: ExcelJS.Cell) {
  cell.font = { bold: true, size: 10, color: { argb: EXPORT_COLORS.muted } };
  cell.alignment = { vertical: "top" };
}

function styleValueCell(cell: ExcelJS.Cell) {
  cell.font = { size: 10, color: { argb: EXPORT_COLORS.navy } };
  cell.alignment = { vertical: "top", wrapText: true };
}

function addOverviewSheet(
  workbook: ExcelJS.Workbook,
  meta: ExportMeta,
  findings: ExportFinding[],
  summary: ScanSummary,
) {
  const sheet = workbook.addWorksheet("Overview", {
    views: [{ showGridLines: false }],
  });

  sheet.columns = [
    { width: 22 },
    { width: 28 },
    { width: 18 },
    { width: 14 },
    { width: 16 },
    { width: 36 },
  ];

  sheet.mergeCells("A1:F1");
  const title = sheet.getCell("A1");
  title.value = "Tenant Hawk - Tenant Health Report";
  title.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: EXPORT_COLORS.navy },
  };
  title.font = { bold: true, size: 16, color: { argb: EXPORT_COLORS.white } };
  title.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 34;

  sheet.mergeCells("A2:F2");
  const subtitle = sheet.getCell("A2");
  subtitle.value = `Generated ${formatReportDate(new Date())}`;
  subtitle.font = { size: 10, color: { argb: EXPORT_COLORS.slate } };
  sheet.getRow(2).height = 18;

  let r = 4;
  styleSectionTitle(sheet.getCell(`A${r}`), "Customer details");
  r += 1;

  const customerRows = meta.customer
    ? reportCustomerRows(meta.customer)
    : [
        { label: "Organization", value: meta.tenant },
        { label: "Scanned", value: formatReportDate(meta.scannedAt) },
      ];

  for (const { label, value } of customerRows) {
    styleLabelCell(sheet.getCell(`A${r}`));
    sheet.getCell(`A${r}`).value = label;
    styleValueCell(sheet.getCell(`B${r}`));
    sheet.getCell(`B${r}`).value = value;
    sheet.mergeCells(`B${r}:F${r}`);
    r += 1;
  }

  r += 1;
  styleSectionTitle(sheet.getCell(`A${r}`), "Health summary");
  r += 1;

  const overallGrade = meta.score != null ? grade(meta.score) : "-";
  const healthRows: Array<[string, string | number]> = [
    ["Overall health score", meta.score ?? "-"],
    ["Overall grade", overallGrade],
    ["Open findings", summary.total],
    ["High severity findings", summary.high],
  ];
  if (summary.usd > 0) {
    healthRows.push(["Recoverable spend (monthly)", `$${summary.usd.toLocaleString()}`]);
  }

  for (const [label, value] of healthRows) {
    styleLabelCell(sheet.getCell(`A${r}`));
    sheet.getCell(`A${r}`).value = label;
    const valueCell = sheet.getCell(`B${r}`);
    styleValueCell(valueCell);
    valueCell.value = value;
    if (label === "Overall grade" && typeof value === "string" && GRADE_TEXT[value]) {
      valueCell.font = { bold: true, size: 12, color: { argb: GRADE_TEXT[value] } };
    }
    sheet.mergeCells(`B${r}:F${r}`);
    r += 1;
  }

  r += 1;
  styleSectionTitle(sheet.getCell(`A${r}`), "Category grades");
  r += 1;

  const catHeader = sheet.getRow(r);
  catHeader.values = ["Category", "Score", "Grade", "Open findings", "High severity"];
  applyHeaderRow(catHeader, 5);
  r += 1;

  for (const cat of summary.categories) {
    const row = sheet.getRow(r);
    row.values = [
      CATEGORY_META[cat.category].label,
      cat.score,
      cat.grade,
      cat.count,
      cat.high,
    ];
    row.getCell(3).font = {
      bold: true,
      color: { argb: GRADE_TEXT[cat.grade] ?? EXPORT_COLORS.slate },
    };
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      if (col <= 5) {
        cell.alignment = { vertical: "middle" };
        cell.border = {
          bottom: { style: "thin", color: { argb: EXPORT_COLORS.line } },
        };
        if (r % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFCFCFD" },
          };
        }
      }
    });
    r += 1;
  }

  r += 1;
  styleSectionTitle(sheet.getCell(`A${r}`), "Findings summary");
  r += 1;

  const findHeader = sheet.getRow(r);
  findHeader.values = ["Severity", "Category", "Finding", "Impact"];
  applyHeaderRow(findHeader, 4);
  sheet.mergeCells(`D${r}:F${r}`);
  r += 1;

  for (const f of findings) {
    const row = sheet.getRow(r);
    row.values = [
      f.severity.toUpperCase(),
      CATEGORY_META[f.category].label,
      f.title,
      formatExportImpact(f),
    ];
    styleSeverityCell(row.getCell(1), f.severity);
    row.getCell(2).alignment = { vertical: "top", wrapText: true };
    row.getCell(3).alignment = { vertical: "top", wrapText: true };
    row.getCell(4).alignment = { vertical: "top", wrapText: true };
    sheet.mergeCells(`D${r}:F${r}`);
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      if (col >= 2 && col <= 4) {
        cell.border = {
          bottom: { style: "thin", color: { argb: EXPORT_COLORS.line } },
        };
      }
    });
    row.height = Math.max(18, Math.min(48, 18 + Math.floor(f.title.length / 60) * 12));
    r += 1;
  }

  r += 1;
  sheet.mergeCells(`A${r}:F${r}`);
  const footer = sheet.getCell(`A${r}`);
  footer.value = REPORT_FOOTER_LINE;
  footer.font = { size: 9, italic: true, color: { argb: EXPORT_COLORS.muted } };
  footer.alignment = { wrapText: true };
}

function addCategorySheet(
  workbook: ExcelJS.Workbook,
  category: Category,
  findings: ExportFinding[],
) {
  const meta = CATEGORY_META[category];
  const sheet = workbook.addWorksheet(CATEGORY_SHEET_NAMES[category], {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  sheet.columns = [
    { width: 12 },
    { width: 34 },
    { width: 42 },
    { width: 14 },
    { width: 44 },
    { width: 36 },
    { width: 22 },
  ];

  sheet.mergeCells("A1:G1");
  const title = sheet.getCell("A1");
  title.value = `${meta.label} - detailed findings`;
  title.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: EXPORT_COLORS.navy },
  };
  title.font = { bold: true, size: 14, color: { argb: EXPORT_COLORS.white } };
  title.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 28;

  sheet.mergeCells("A2:G2");
  const desc = sheet.getCell("A2");
  desc.value = meta.description;
  desc.font = { size: 10, color: { argb: EXPORT_COLORS.slate } };
  desc.alignment = { wrapText: true, vertical: "top" };
  sheet.getRow(2).height = 36;

  const header = sheet.getRow(4);
  header.values = [
    "Severity",
    "Finding",
    "Description",
    "Impact",
    "Remediation",
    "Affected items",
    "Check ID",
  ];
  applyHeaderRow(header, 7);

  const categoryFindings = findings.filter((f) => f.category === category);
  let rowNum = 5;

  if (categoryFindings.length === 0) {
    const row = sheet.getRow(rowNum);
    sheet.mergeCells(`A${rowNum}:G${rowNum}`);
    row.getCell(1).value = "No open findings in this category.";
    row.getCell(1).font = { italic: true, color: { argb: EXPORT_COLORS.muted } };
    return;
  }

  for (const f of categoryFindings) {
    const affectedLabel = entityItemsLabel(f.checkId);
    const affected = formatAffectedItems(f.impactEntities, f.impactCount);
    const row = sheet.getRow(rowNum);
    row.values = [
      f.severity.toUpperCase(),
      f.title,
      f.description,
      formatExportImpact(f),
      f.remediation || f.description,
      affected ? `${affectedLabel}: ${affected}` : "",
      f.checkId,
    ];

    styleSeverityCell(row.getCell(1), f.severity);
    for (let c = 2; c <= 7; c++) {
      const cell = row.getCell(c);
      cell.alignment = { vertical: "top", wrapText: true };
      cell.font = { size: 10, color: { argb: EXPORT_COLORS.navy } };
      cell.border = {
        bottom: { style: "thin", color: { argb: EXPORT_COLORS.line } },
      };
      if (rowNum % 2 === 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFCFCFD" },
        };
      }
    }

    const textLen = f.description.length + (f.remediation?.length ?? 0) + affected.length;
    row.height = Math.max(20, Math.min(120, 20 + Math.floor(textLen / 80) * 12));
    rowNum += 1;
  }
}

/** Detailed multi-sheet workbook with overview + one sheet per category. */
export async function buildFindingsXlsx(
  meta: ExportMeta,
  findings: ExportFinding[],
  summary: ScanSummary,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Tenant Hawk";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  addOverviewSheet(workbook, meta, findings, summary);
  for (const category of CATEGORY_ORDER) {
    addCategorySheet(workbook, category, findings);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
