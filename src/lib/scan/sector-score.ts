import type { Severity } from "@/db/types";
import { grade } from "./score";
import { CHECK_DEFINITION_BY_ID, SECTOR_LABELS, type ScanSector } from "./checks/registry";
import type { FindingDraft } from "./types";

const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3 };
const PENALTY: Record<Severity, number> = { high: 18, medium: 7, low: 3 };

export interface SectorScore {
  sector: ScanSector;
  label: string;
  score: number;
  letter: string;
  findingCount: number;
  highCount: number;
}

function isScoredFinding(checkId: string): boolean {
  const def = CHECK_DEFINITION_BY_ID.get(checkId);
  if (!def) return true;
  return def.scoreImpact === "full";
}

export function scoreFindingsBySector(findings: FindingDraft[]): SectorScore[] {
  const bySector = new Map<ScanSector, FindingDraft[]>();

  for (const finding of findings) {
    if (!isScoredFinding(finding.checkId)) continue;
    const sector = CHECK_DEFINITION_BY_ID.get(finding.checkId)?.sector;
    if (!sector) continue;
    const list = bySector.get(sector) ?? [];
    list.push(finding);
    bySector.set(sector, list);
  }

  return [...bySector.entries()]
    .map(([sector, sectorFindings]) => {
      let score = 100;
      let highCount = 0;
      for (const finding of sectorFindings) {
        score = Math.max(0, score - PENALTY[finding.severity]);
        if (finding.severity === "high") highCount += 1;
      }
      return {
        sector,
        label: SECTOR_LABELS[sector],
        score,
        letter: grade(score),
        findingCount: sectorFindings.length,
        highCount,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function countFindingsBySector(
  findings: Array<{ checkId: string }>,
): Array<{ sector: ScanSector; label: string; count: number }> {
  const counts = new Map<ScanSector, number>();
  for (const finding of findings) {
    const sector = CHECK_DEFINITION_BY_ID.get(finding.checkId)?.sector;
    if (!sector) continue;
    counts.set(sector, (counts.get(sector) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([sector, count]) => ({
      sector,
      label: SECTOR_LABELS[sector],
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
