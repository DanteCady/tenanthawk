import { randomUUID } from "crypto";
import { db } from "@/db";
import type { ConfigChangeType } from "@/db/types";
import { fetchActorsByObjectId } from "./attribution";
import { demoActorForTick, getDemoTrackedObjects } from "./demo";
import { contentHash, diffObjects } from "./diff";
import { fetchTrackedObjects } from "./sources";
import type { JournalChangeDraft, SourceResult, TrackedObject } from "./types";

interface CaptureInput {
  connectionId: string;
  mode: "live" | "demo";
  token?: string;
}

interface CaptureSummary {
  baseline: boolean;
  changes: number;
}

interface SnapshotRow {
  id: string;
  object_type: string;
  object_id: string;
  content_hash: string;
  payload: unknown;
  captured_at: Date;
}

function snapKey(objectType: string, objectId: string): string {
  return `${objectType}:${objectId}`;
}

/** Number of completed scans for a connection - drives the demo mutation script. */
async function completedScanTick(connectionId: string): Promise<number> {
  const row = await db
    .selectFrom("scan")
    .select(({ fn }) => fn.countAll<string>().as("n"))
    .where("connection_id", "=", connectionId)
    .where("status", "=", "complete")
    .executeTakeFirst();
  return Math.max(0, Number(row?.n ?? 0) - 1);
}

/**
 * Capture the journal for one connection: fetch tracked config objects,
 * diff against stored snapshots, record changes, and update snapshots.
 *
 * First capture writes a silent baseline (no change entries) - the timeline
 * only ever shows real deltas. Runs for every plan so history accrues before
 * a user upgrades; the UI is where Pro gating happens.
 */
export async function captureJournal(input: CaptureInput): Promise<CaptureSummary> {
  let sources: SourceResult[];
  let demoActor: string | null = null;

  if (input.mode === "demo" || !input.token) {
    const tick = await completedScanTick(input.connectionId);
    sources = getDemoTrackedObjects(tick);
    demoActor = demoActorForTick(tick);
  } else {
    sources = await fetchTrackedObjects(input.token);
  }

  const okSources = sources.filter((s) => s.ok);
  if (okSources.length === 0) return { baseline: false, changes: 0 };

  const snapshots = (await db
    .selectFrom("config_snapshot")
    .select(["id", "object_type", "object_id", "content_hash", "payload", "captured_at"])
    .where("connection_id", "=", input.connectionId)
    .execute()) as SnapshotRow[];

  const snapMap = new Map(snapshots.map((s) => [snapKey(s.object_type, s.object_id), s]));
  const isBaseline = snapshots.length === 0;

  const drafts: JournalChangeDraft[] = [];
  const upserts: TrackedObject[] = [];
  const deletedSnapshotIds: string[] = [];

  for (const source of okSources) {
    const fetchedKeys = new Set<string>();

    for (const obj of source.objects) {
      const key = snapKey(obj.objectType, obj.objectId);
      fetchedKeys.add(key);
      const prev = snapMap.get(key);
      const hash = contentHash(obj.payload);

      if (!prev) {
        upserts.push(obj);
        if (!isBaseline) {
          drafts.push({
            objectType: obj.objectType,
            objectId: obj.objectId,
            displayName: obj.displayName,
            changeType: "created",
            diff: null,
            beforePayload: null,
            afterPayload: obj.payload,
            actor: null,
            actorSource: null,
          });
        }
      } else if (prev.content_hash !== hash) {
        upserts.push(obj);
        drafts.push({
          objectType: obj.objectType,
          objectId: obj.objectId,
          displayName: obj.displayName,
          changeType: "modified",
          diff: diffObjects(prev.payload as Record<string, unknown>, obj.payload),
          beforePayload: prev.payload as Record<string, unknown>,
          afterPayload: obj.payload,
          actor: null,
          actorSource: null,
        });
      }
    }

    // Deletions are only trusted within families that fetched successfully.
    for (const [key, snap] of snapMap) {
      if (snap.object_type !== source.objectType || fetchedKeys.has(key)) continue;
      deletedSnapshotIds.push(snap.id);
      drafts.push({
        objectType: source.objectType,
        objectId: snap.object_id,
        displayName:
          ((snap.payload as Record<string, unknown>)?.displayName as string | undefined) ?? null,
        changeType: "deleted",
        diff: null,
        beforePayload: snap.payload as Record<string, unknown>,
        afterPayload: null,
        actor: null,
        actorSource: null,
      });
    }
  }

  // Attribution - demo uses the scripted actor; live asks the audit log.
  if (drafts.length > 0) {
    if (demoActor) {
      for (const d of drafts) {
        d.actor = demoActor;
        d.actorSource = "demo";
      }
    } else if (input.token) {
      const oldest = snapshots.reduce<Date | null>(
        (min, s) => (min === null || s.captured_at < min ? s.captured_at : min),
        null,
      );
      const since = oldest ?? new Date(Date.now() - 24 * 3600_000);
      const actors = await fetchActorsByObjectId(input.token, since);
      for (const d of drafts) {
        const actor = actors.get(d.objectId);
        if (actor) {
          d.actor = actor;
          d.actorSource = "audit_log";
        }
      }
    }
  }

  const now = new Date().toISOString();

  if (drafts.length > 0) {
    await db
      .insertInto("config_change")
      .values(
        drafts.map((d) => ({
          id: randomUUID(),
          connection_id: input.connectionId,
          object_type: d.objectType,
          object_id: d.objectId,
          display_name: d.displayName,
          change_type: d.changeType as ConfigChangeType,
          diff: d.diff ? JSON.stringify(d.diff) : null,
          before_payload: d.beforePayload ? JSON.stringify(d.beforePayload) : null,
          after_payload: d.afterPayload ? JSON.stringify(d.afterPayload) : null,
          actor: d.actor,
          actor_source: d.actorSource,
        })),
      )
      .execute();
  }

  for (const obj of upserts) {
    await db
      .insertInto("config_snapshot")
      .values({
        id: randomUUID(),
        connection_id: input.connectionId,
        object_type: obj.objectType,
        object_id: obj.objectId,
        display_name: obj.displayName,
        payload: JSON.stringify(obj.payload),
        content_hash: contentHash(obj.payload),
        captured_at: now,
      })
      .onConflict((oc) =>
        oc.columns(["connection_id", "object_type", "object_id"]).doUpdateSet({
          display_name: obj.displayName,
          payload: JSON.stringify(obj.payload),
          content_hash: contentHash(obj.payload),
          captured_at: now,
        }),
      )
      .execute();
  }

  if (deletedSnapshotIds.length > 0) {
    await db
      .deleteFrom("config_snapshot")
      .where("id", "in", deletedSnapshotIds)
      .execute();
  }

  return { baseline: isBaseline, changes: drafts.length };
}
