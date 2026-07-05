import "server-only";
import { db } from "@/db";
import type { ConfigChangeType, ConfigFieldDiff } from "@/db/types";
import { TRACKED_OBJECT_LABELS, type TrackedObjectType } from "./types";

export interface JournalEntryDTO {
  id: string;
  objectType: string;
  objectTypeLabel: string;
  objectId: string;
  displayName: string | null;
  changeType: ConfigChangeType;
  diff: ConfigFieldDiff[];
  actor: string | null;
  detectedAt: string;
}

function labelFor(objectType: string): string {
  return TRACKED_OBJECT_LABELS[objectType as TrackedObjectType] ?? objectType;
}

/** Most recent journal entries for a connection, newest first. */
export async function getJournalEntries(
  connectionId: string,
  limit = 100,
): Promise<JournalEntryDTO[]> {
  const rows = await db
    .selectFrom("config_change")
    .select([
      "id",
      "object_type",
      "object_id",
      "display_name",
      "change_type",
      "diff",
      "actor",
      "detected_at",
    ])
    .where("connection_id", "=", connectionId)
    .orderBy("detected_at", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .execute();

  return rows.map((r) => ({
    id: r.id,
    objectType: r.object_type,
    objectTypeLabel: labelFor(r.object_type),
    objectId: r.object_id,
    displayName: r.display_name,
    changeType: r.change_type,
    diff: r.diff ?? [],
    actor: r.actor,
    detectedAt: r.detected_at.toISOString(),
  }));
}

/** Count of journal entries in the last N days (for the overview teaser). */
export async function getJournalActivityCount(
  connectionId: string,
  days = 7,
): Promise<number> {
  const since = new Date(Date.now() - days * 86_400_000);
  const row = await db
    .selectFrom("config_change")
    .select(({ fn }) => fn.countAll<string>().as("n"))
    .where("connection_id", "=", connectionId)
    .where("detected_at", ">", since)
    .executeTakeFirst();
  return Number(row?.n ?? 0);
}
