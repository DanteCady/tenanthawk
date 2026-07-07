import {
  checkSector,
  SECTOR_LABELS,
  type ScanSector,
} from "@/lib/scan/checks/registry";
import type { ExportFinding } from "./types";

const SECTOR_ORDER: ScanSector[] = [
  "identity",
  "cost",
  "teams",
  "sharepoint",
  "exchange",
  "devices",
  "apps",
  "copilot",
];

export function groupExportFindingsBySector(
  findings: ExportFinding[],
): Array<{ sector: ScanSector; label: string; findings: ExportFinding[] }> {
  const bySector = new Map<ScanSector, ExportFinding[]>();

  for (const finding of findings) {
    const sector = checkSector(finding.checkId);
    if (!sector) continue;
    const list = bySector.get(sector) ?? [];
    list.push(finding);
    bySector.set(sector, list);
  }

  return SECTOR_ORDER.filter((sector) => bySector.has(sector)).map((sector) => ({
    sector,
    label: SECTOR_LABELS[sector],
    findings: bySector.get(sector) ?? [],
  }));
}
