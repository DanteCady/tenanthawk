import "server-only";
import { getFindingStatuses, isFindingHidden } from "@/lib/findings/status";
import { findingStatusKey } from "@/lib/findings/key";

interface FindingRow {
  check_id: string;
  entity_ref: string | null;
}

export async function filterActiveExportFindings<T extends FindingRow>(
  connectionId: string,
  findings: T[],
  isPro: boolean,
): Promise<T[]> {
  if (!isPro) return findings;

  const statuses = await getFindingStatuses(connectionId);
  return findings.filter((finding) => {
    const tracking = statuses.get(findingStatusKey(finding.check_id, finding.entity_ref));
    return !isFindingHidden(tracking);
  });
}
