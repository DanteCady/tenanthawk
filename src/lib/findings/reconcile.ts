import "server-only";
import { db } from "@/db";
import type { FindingTrackingStatus, Severity } from "@/db/types";
import type { FindingDraft } from "@/lib/scan/types";
import { findingEntityRef } from "@/lib/findings/key";

const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3 };

function findingSignature(finding: FindingDraft): string {
  const count = finding.impact?.count ?? 0;
  return `${finding.severity}:${count}:${finding.title}`;
}

/**
 * Re-open accepted findings when scan evidence regresses (severity or impact changes).
 */
export async function reconcileAcceptedFindingsOnScan(
  connectionId: string,
  drafts: FindingDraft[],
): Promise<void> {
  const accepted = await db
    .selectFrom("finding_status")
    .select(["check_id", "entity_ref", "status", "note"])
    .where("connection_id", "=", connectionId)
    .where("status", "=", "accepted")
    .execute();

  if (accepted.length === 0) return;

  const draftByKey = new Map(
    drafts.map((draft) => [
      `${draft.checkId}::${findingEntityRef(draft.entityRef)}`,
      draft,
    ]),
  );

  for (const row of accepted) {
    const key = `${row.check_id}::${row.entity_ref}`;
    const draft = draftByKey.get(key);
    if (!draft) continue;

    const previousSeverity = parseAcceptedSeverity(row.note);
    const previousCount = parseAcceptedCount(row.note);
    const regressed =
      SEVERITY_RANK[draft.severity] > SEVERITY_RANK[previousSeverity] ||
      (draft.impact?.count ?? 0) > previousCount;

    if (regressed) {
      await db
        .deleteFrom("finding_status")
        .where("connection_id", "=", connectionId)
        .where("check_id", "=", row.check_id)
        .where("entity_ref", "=", row.entity_ref)
        .execute();
    }
  }
}

export function acceptedStatusNote(finding: FindingDraft): string {
  return `accepted:${findingSignature(finding)}`;
}

function parseAcceptedSeverity(note: string | null): Severity {
  const match = note?.match(/^accepted:(\w+):/);
  const severity = match?.[1];
  if (severity === "high" || severity === "medium" || severity === "low") return severity;
  return "low";
}

function parseAcceptedCount(note: string | null): number {
  const match = note?.match(/^accepted:\w+:(\d+):/);
  return match ? parseInt(match[1], 10) : 0;
}

export function isTrackedStatus(status: FindingTrackingStatus | "open"): boolean {
  return status === "resolved" || status === "snoozed" || status === "accepted";
}
