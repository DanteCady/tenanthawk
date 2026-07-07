import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CATEGORY_META, CATEGORY_ORDER } from "@/components/app/categories";
import type { Severity } from "@/db/types";
import type { ExportFinding, ExportMeta } from "@/lib/export/types";
import { HAWK_MARK_PNG_BASE64 } from "@/lib/export/brand-mark";
import { CATEGORY_ICON_PNG } from "@/lib/export/category-icons";
import {
  formatFindingImpact,
} from "@/lib/export/report-format";
import { formatLicenseEntityRef } from "@/lib/licenses/sku-display";
import { REPORT_FOOTER } from "@/lib/brand";
import {
  normalizeCategoryScores,
  radarAxisEnd,
  radarCategoryLabels,
  radarLabelPosition,
  RADAR_GRID_LEVELS,
  radarVertex,
} from "@/lib/export/category-radar";
import { reportCustomerRows } from "@/lib/export/report-customer";
import { grade } from "@/lib/scan/score";

const PAGE = { w: 612, h: 792 };
const MARGIN = 48;
const CONTENT_W = PAGE.w - MARGIN * 2;

const rgb = (r: number, g: number, b: number): [number, number, number] => [r, g, b];

const BRAND = {
  blue: rgb(37, 99, 235),
  navy: rgb(15, 23, 42),
  hawk: rgb(245, 158, 11),
  slate: rgb(71, 85, 105),
  muted: rgb(148, 163, 184),
  line: rgb(226, 232, 240),
  panel: rgb(248, 250, 252),
  white: rgb(255, 255, 255),
};

const SEVERITY_COLORS: Record<
  Severity,
  { fill: [number, number, number]; text: [number, number, number] }
> = {
  high: { fill: rgb(254, 226, 226), text: rgb(185, 28, 28) },
  medium: { fill: rgb(254, 243, 199), text: rgb(180, 83, 9) },
  low: { fill: rgb(241, 245, 249), text: rgb(71, 85, 105) },
};

const GRADE_COLORS: Record<string, [number, number, number]> = {
  A: rgb(22, 163, 74),
  B: rgb(37, 99, 235),
  C: rgb(217, 119, 6),
  D: rgb(234, 88, 12),
  F: rgb(220, 38, 38),
};

type Doc = jsPDF & { lastAutoTable?: { finalY: number } };

type PdfSection = {
  title: string;
  page: number;
};

const PDF_SECTIONS = [
  "Customer details",
  "Health score summary",
  "Category analysis",
  "Findings summary",
  "Remediation details",
] as const;

/** jsPDF Helvetica cannot render Unicode arrows - they break into spaced glyphs. */
export function sanitizePdfText(text: string): string {
  return text
    .replace(/\u2192/g, " > ")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function formatImpact(f: ExportFinding): string {
  const val = formatFindingImpact({
    impact: {
      usd: f.impactUsd ?? undefined,
      count: f.impactCount ?? undefined,
    },
    entityRef: f.entityRef,
  });
  if (val === "-") return "-";
  return sanitizePdfText(val);
}

const LINE = 12;
const LINE_SM = 11;
const CARD_PAD = 12;
const BADGE_H = 18;
/** Space from badge bottom to first title baseline (accounts for ascenders). */
const BADGE_TITLE_GAP = 16;
const TITLE_LINE = 13;

function measureLines(doc: Doc, text: string, maxWidth: number, fontSize: number): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
}

function markSection(doc: Doc, sections: PdfSection[], title: string) {
  sections.push({ title, page: doc.getNumberOfPages() });
}

function drawSectionHeader(doc: Doc, index: number, title: string, y: number): number {
  doc.setFillColor(...BRAND.blue);
  doc.rect(MARGIN, y, 4, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND.navy);
  doc.text(`${index}. ${title}`, MARGIN + 12, y + 15);

  y += 30;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE.w - MARGIN, y);
  return y + 16;
}

function drawSubsectionTitle(doc: Doc, title: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.slate);
  doc.text(title, MARGIN, y);
  return y + 14;
}

function drawTableOfContents(doc: Doc, sections: PdfSection[], pageOffset: number) {
  doc.setPage(2);

  let y = MARGIN + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.navy);
  doc.text("Table of contents", MARGIN, y);
  y += 10;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.75);
  doc.line(MARGIN, y, PAGE.w - MARGIN, y);
  y += 28;

  sections.forEach((section, index) => {
    const targetPage = section.page + pageOffset;
    const label = `${index + 1}. ${section.title}`;
    const pageLabel = String(targetPage);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.navy);
    const labelW = doc.getTextWidth(label);
    doc.text(label, MARGIN, y);

    doc.setFont("helvetica", "bold");
    const pageW = doc.getTextWidth(pageLabel);
    doc.setTextColor(...BRAND.blue);
    doc.text(pageLabel, PAGE.w - MARGIN, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.muted);
    const dotsStart = MARGIN + labelW + 10;
    const dotsEnd = PAGE.w - MARGIN - pageW - 8;
    const dotW = doc.getTextWidth(".");
    for (let x = dotsStart; x < dotsEnd; x += dotW * 1.4) {
      doc.text(".", x, y);
    }

    doc.link(MARGIN, y - 11, CONTENT_W, 16, { pageNumber: targetPage });
    y += 24;
  });
}

function drawFooter(doc: Doc, page: number, total: number) {
  const y = PAGE.h - 28;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y - 8, PAGE.w - MARGIN, y - 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(
    sanitizePdfText(REPORT_FOOTER.replace(/·/g, "|")),
    MARGIN,
    y,
  );
  doc.text(`Page ${page} of ${total}`, PAGE.w - MARGIN, y, { align: "right" });
}

function drawHeader(doc: Doc): number {
  const headerH = 96;
  doc.setFillColor(...BRAND.navy);
  doc.rect(0, 0, PAGE.w, headerH, "F");

  doc.setFillColor(...BRAND.blue);
  doc.rect(0, headerH - 4, PAGE.w, 4, "F");

  doc.addImage(
    `data:image/png;base64,${HAWK_MARK_PNG_BASE64}`,
    "PNG",
    MARGIN,
    18,
    40,
    40,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...BRAND.white);
  doc.text("Tenant ", MARGIN + 52, 38);
  const tenantW = doc.getTextWidth("Tenant ");
  doc.setTextColor(...BRAND.hawk);
  doc.text("Hawk", MARGIN + 52 + tenantW, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225);
  doc.text("Tenant Health Report", MARGIN + 52, 56);

  return headerH + 20;
}

function drawCustomerDetails(doc: Doc, meta: ExportMeta, y: number): number {
  if (!meta.customer) return y;

  const rows = reportCustomerRows(meta.customer);

  const colW = CONTENT_W / 2 - CARD_PAD - 4;
  const rowsPerCol = Math.ceil(rows.length / 2);
  const panelH = CARD_PAD + rowsPerCol * 30 + CARD_PAD;

  doc.setFillColor(...BRAND.white);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.75);
  doc.roundedRect(MARGIN, y, CONTENT_W, panelH, 8, 8, "FD");

  rows.forEach((row, i) => {
    const col = i % 2;
    const rowIdx = Math.floor(i / 2);
    const x = MARGIN + CARD_PAD + col * (colW + CARD_PAD + 8);
    const rowY = y + CARD_PAD + rowIdx * 30;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BRAND.muted);
    doc.text(row.label.toUpperCase(), x, rowY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.navy);
    const valueLines = measureLines(doc, sanitizePdfText(row.value), colW, 9);
    doc.text(valueLines.slice(0, 2), x, rowY + 20);
  });

  return y + panelH + 16;
}

function drawScoreSummary(doc: Doc, meta: ExportMeta, y: number): number {
  const letter = meta.score != null ? grade(meta.score) : "-";
  const gradeColor = GRADE_COLORS[letter] ?? GRADE_COLORS.F;
  const textX = MARGIN + 92;
  const textW = CONTENT_W - 92 - CARD_PAD;

  let statsLine = "";
  const summary = meta.summary;
  if (summary) {
    const parts = [
      `${summary.total} open issue${summary.total === 1 ? "" : "s"}`,
      `${summary.high} high severity`,
    ];
    if (summary.usd > 0) {
      parts.push(`$${summary.usd.toLocaleString()}/mo recoverable`);
    }
    statsLine = parts.join("  ·  ");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const statsLines = statsLine ? measureLines(doc, statsLine, textW, 9) : [];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const helpLines = measureLines(
    doc,
    "Scores reflect open findings at scan time. Fewer and less severe issues raise your grade.",
    textW,
    8,
  );

  const rightH = 24 + statsLines.length * LINE_SM + 8 + helpLines.length * LINE_SM;
  const panelH = Math.max(96, 28 + rightH + CARD_PAD);

  doc.setFillColor(...BRAND.panel);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.75);
  doc.roundedRect(MARGIN, y, CONTENT_W, panelH, 8, 8, "FD");

  const scoreCy = y + panelH / 2;
  doc.setFillColor(...BRAND.white);
  doc.circle(MARGIN + 46, scoreCy, 30, "F");
  doc.setDrawColor(...gradeColor);
  doc.setLineWidth(2);
  doc.circle(MARGIN + 46, scoreCy, 30, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...BRAND.navy);
  doc.text(meta.score != null ? String(meta.score) : "-", MARGIN + 46, scoreCy - 2, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.setTextColor(...gradeColor);
  doc.text(letter, MARGIN + 46, scoreCy + 14, { align: "center" });

  let textY = y + 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.muted);
  doc.text("HEALTH SCORE", textX, textY);
  textY += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.navy);
  doc.text("Overall tenant health", textX, textY);
  textY += LINE;

  if (statsLines.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.slate);
    doc.text(statsLines, textX, textY);
    textY += statsLines.length * LINE_SM;
  }

  textY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(helpLines, textX, textY);

  return y + panelH + 16;
}

function drawCategoryLegend(doc: Doc, y: number): number {
  y = drawSubsectionTitle(doc, "What the categories mean", y);

  const iconSize = 18;
  const iconGap = 6;
  const textIndent = iconSize + iconGap;
  const colW = CONTENT_W / 2 - CARD_PAD - 8;
  const descW = colW - textIndent;
  const colGap = 16;

  const cells = CATEGORY_ORDER.map((cat) => {
    const meta = CATEGORY_META[cat];
    const descLines = measureLines(
      doc,
      sanitizePdfText(meta.description),
      descW,
      7.5,
    );
    return {
      cat,
      label: sanitizePdfText(meta.label),
      descLines,
      cellH: 14 + descLines.length * LINE_SM,
    };
  });

  const row1H = Math.max(cells[0].cellH, cells[1].cellH);
  const row2H = Math.max(cells[2].cellH, cells[3].cellH);
  const panelH = CARD_PAD + row1H + 10 + row2H + CARD_PAD;

  doc.setFillColor(...BRAND.panel);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, panelH, 6, 6, "FD");

  const drawCell = (cell: (typeof cells)[number], col: number, rowTop: number) => {
    const x = MARGIN + CARD_PAD + col * (colW + colGap);
    doc.addImage(
      `data:image/png;base64,${CATEGORY_ICON_PNG[cell.cat]}`,
      "PNG",
      x,
      rowTop + 1,
      iconSize,
      iconSize,
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.navy);
    doc.text(cell.label, x + textIndent, rowTop + 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND.slate);
    doc.text(cell.descLines, x + textIndent, rowTop + 22);
  };

  const top = y + CARD_PAD;
  drawCell(cells[0], 0, top);
  drawCell(cells[1], 1, top);
  drawCell(cells[2], 0, top + row1H + 10);
  drawCell(cells[3], 1, top + row1H + 10);

  return y + panelH + 14;
}

function drawPdfRadarChart(
  doc: Doc,
  scores: ReturnType<typeof normalizeCategoryScores>,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
) {
  const cx = boxX + boxW / 2;
  const cy = boxY + boxH / 2 + 4;
  const maxR = Math.min(boxW, boxH) / 2 - 34;

  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.5);
  for (const level of RADAR_GRID_LEVELS) {
    const ringR = (level / 100) * maxR;
    const ringPts = CATEGORY_ORDER.map((_, i) => radarAxisEnd(i, cx, cy, ringR));
    for (let i = 0; i < ringPts.length; i++) {
      const a = ringPts[i];
      const b = ringPts[(i + 1) % ringPts.length];
      doc.line(a.x, a.y, b.x, b.y);
    }
  }

  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const end = radarAxisEnd(i, cx, cy, maxR);
    doc.line(cx, cy, end.x, end.y);
  }

  const dataPts = CATEGORY_ORDER.map((cat, i) =>
    radarVertex(i, scores[cat], cx, cy, maxR),
  );

  doc.setFillColor(219, 234, 254);
  for (let i = 0; i < dataPts.length; i++) {
    const p1 = dataPts[i];
    const p2 = dataPts[(i + 1) % dataPts.length];
    doc.triangle(cx, cy, p1.x, p1.y, p2.x, p2.y, "F");
  }

  doc.setDrawColor(...BRAND.blue);
  doc.setLineWidth(1.5);
  for (let i = 0; i < dataPts.length; i++) {
    const p1 = dataPts[i];
    const p2 = dataPts[(i + 1) % dataPts.length];
    doc.line(p1.x, p1.y, p2.x, p2.y);
  }

  doc.setFillColor(...BRAND.blue);
  for (const p of dataPts) {
    doc.circle(p.x, p.y, 2.5, "F");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND.slate);
  for (let idx = 0; idx < radarCategoryLabels().length; idx++) {
    const { label } = radarCategoryLabels()[idx];
    const { x, y, anchor } = radarLabelPosition(idx, cx, cy, maxR, 12);
    doc.text(sanitizePdfText(label), x, y, {
      align: anchor === "start" ? "left" : anchor === "end" ? "right" : "center",
    });
  }
}

function drawCategoryGrades(doc: Doc, meta: ExportMeta, y: number): number {
  const scores = normalizeCategoryScores(meta.categoryScores);
  const sectionTop = y;

  y = drawSubsectionTitle(doc, "Category grades", y);

  const leftW = CONTENT_W * 0.52;
  const rightW = CONTENT_W - leftW - 14;
  const sectionH = 196;
  const listTop = y;

  doc.setFillColor(...BRAND.white);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.75);
  doc.roundedRect(MARGIN, listTop, leftW, sectionH, 8, 8, "FD");

  const rowH = sectionH / CATEGORY_ORDER.length;
  CATEGORY_ORDER.forEach((cat, index) => {
    const rowTop = listTop + index * rowH;
    if (index > 0) {
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.5);
      doc.line(MARGIN + 10, rowTop, MARGIN + leftW - 10, rowTop);
    }

    doc.addImage(
      `data:image/png;base64,${CATEGORY_ICON_PNG[cat]}`,
      "PNG",
      MARGIN + 12,
      rowTop + (rowH - 16) / 2,
      16,
      16,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.navy);
    doc.text(sanitizePdfText(CATEGORY_META[cat].label), MARGIN + 34, rowTop + rowH / 2 + 3);

    const s = scores[cat];
    const letter = grade(s);
    const color = GRADE_COLORS[letter] ?? GRADE_COLORS.F;
    doc.setTextColor(...color);
    doc.text(`${s} (${letter})`, MARGIN + leftW - 12, rowTop + rowH / 2 + 3, {
      align: "right",
    });
  });

  const radarX = MARGIN + leftW + 14;
  doc.setFillColor(...BRAND.panel);
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.75);
  doc.roundedRect(radarX, listTop, rightW, sectionH, 8, 8, "FD");
  drawPdfRadarChart(doc, scores, radarX + 8, listTop + 8, rightW - 16, sectionH - 16);

  return sectionTop + sectionH + 20;
}

function wrapPdfTableCell(doc: Doc, text: string, maxWidth: number, fontSize = 8): string {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const innerW = Math.max(1, maxWidth - 6);
  return doc.splitTextToSize(sanitizePdfText(text), innerW).join("\n");
}

const FINDINGS_TABLE_COL = {
  severity: 44,
  category: 54,
  impact: 72,
} as const;

function findingsFindingColWidth(): number {
  return (
    CONTENT_W -
    FINDINGS_TABLE_COL.severity -
    FINDINGS_TABLE_COL.category -
    FINDINGS_TABLE_COL.impact
  );
}

function drawFindingsTable(doc: Doc, findings: ExportFinding[], y: number): number {
  const findingColW = findingsFindingColWidth();

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_W,
    head: [["Severity", "Category", "Finding", "Impact"]],
    body: findings.map((f) => [
      f.severity.toUpperCase(),
      CATEGORY_META[f.category].label,
      wrapPdfTableCell(doc, f.title, findingColW),
      wrapPdfTableCell(doc, formatImpact(f), FINDINGS_TABLE_COL.impact),
    ]),
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      lineColor: BRAND.line,
      lineWidth: 0.5,
      textColor: BRAND.navy,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: BRAND.navy,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    columnStyles: {
      0: { cellWidth: FINDINGS_TABLE_COL.severity, overflow: "linebreak" },
      1: { cellWidth: FINDINGS_TABLE_COL.category, overflow: "linebreak" },
      2: { cellWidth: findingColW, overflow: "linebreak" },
      3: {
        cellWidth: FINDINGS_TABLE_COL.impact,
        halign: "right",
        overflow: "linebreak",
      },
    },
    alternateRowStyles: { fillColor: [252, 252, 253] },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const sev = String(data.cell.raw).toLowerCase() as Severity;
        const colors = SEVERITY_COLORS[sev];
        if (colors) {
          data.cell.styles.fillColor = [...colors.fill];
          data.cell.styles.textColor = [...colors.text];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
  });

  return (doc.lastAutoTable?.finalY ?? y) + 24;
}

function drawRemediationSection(doc: Doc, findings: ExportFinding[], startY: number): number {
  let y = startY;
  const pageBottom = PAGE.h - 56;
  const innerW = CONTENT_W - CARD_PAD * 2;

  for (const f of findings.slice(0, 30)) {
    const fix = sanitizePdfText(f.remediation || f.description);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    const titleLines = measureLines(doc, sanitizePdfText(f.title), innerW, 9.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const detailLines = measureLines(doc, fix, innerW, 8.5);

    doc.setFontSize(8);
    const entityLines =
      f.impactEntities && f.impactEntities.length > 0
        ? measureLines(
            doc,
            `Affected: ${f.impactEntities.map(sanitizePdfText).join(", ")}`,
            innerW,
            8,
          )
        : f.entityRef
          ? measureLines(
              doc,
              `Affected: ${sanitizePdfText(formatLicenseEntityRef(f.entityRef))}`,
              innerW,
              8,
            )
          : [];

    const badgeH = BADGE_H;
    const blockH =
      CARD_PAD +
      badgeH +
      BADGE_TITLE_GAP +
      titleLines.length * TITLE_LINE +
      10 +
      detailLines.length * LINE +
      (entityLines.length > 0 ? 8 + entityLines.length * LINE_SM : 0) +
      CARD_PAD;

    if (y + blockH > pageBottom) {
      doc.addPage();
      y = MARGIN;
    }

    const blockTop = y;
    doc.setFillColor(...BRAND.panel);
    doc.setDrawColor(...BRAND.line);
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, blockTop, CONTENT_W, blockH, 6, 6, "FD");

    let cursorY = blockTop + CARD_PAD;
    const sev = SEVERITY_COLORS[f.severity];
    doc.setFillColor(...sev.fill);
    doc.roundedRect(MARGIN + CARD_PAD, cursorY, 52, badgeH, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...sev.text);
    doc.text(f.severity.toUpperCase(), MARGIN + CARD_PAD + 26, cursorY + 12, {
      align: "center",
    });

    cursorY += badgeH + BADGE_TITLE_GAP;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND.navy);
    doc.text(titleLines, MARGIN + CARD_PAD, cursorY);
    cursorY += titleLines.length * TITLE_LINE + 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND.slate);
    doc.text(detailLines, MARGIN + CARD_PAD, cursorY);
    cursorY += detailLines.length * LINE;

    if (entityLines.length > 0) {
      cursorY += 8;
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.muted);
      doc.text(entityLines, MARGIN + CARD_PAD, cursorY);
    }

    y += blockH + 10;
  }

  return y;
}

export function buildFindingsPdf(
  meta: ExportMeta,
  findings: ExportFinding[],
): Uint8Array {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" }) as Doc;
  const sections: PdfSection[] = [];

  drawHeader(doc);

  doc.addPage();
  let y = MARGIN;

  markSection(doc, sections, PDF_SECTIONS[0]);
  y = drawSectionHeader(doc, 1, PDF_SECTIONS[0], y);
  y = drawCustomerDetails(doc, meta, y);

  markSection(doc, sections, PDF_SECTIONS[1]);
  y = drawSectionHeader(doc, 2, PDF_SECTIONS[1], y);
  y = drawScoreSummary(doc, meta, y);

  markSection(doc, sections, PDF_SECTIONS[2]);
  y = drawSectionHeader(doc, 3, PDF_SECTIONS[2], y);
  y = drawCategoryLegend(doc, y);
  y = drawCategoryGrades(doc, meta, y);

  markSection(doc, sections, PDF_SECTIONS[3]);
  y = drawSectionHeader(doc, 4, PDF_SECTIONS[3], y);
  y = drawFindingsTable(doc, findings, y);

  markSection(doc, sections, PDF_SECTIONS[4]);
  y = drawSectionHeader(doc, 5, PDF_SECTIONS[4], y);
  drawRemediationSection(doc, findings, y);

  const tocPageCount = 1;
  doc.insertPage(2);
  drawTableOfContents(doc, sections, tocPageCount);

  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    drawFooter(doc, page, total);
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
