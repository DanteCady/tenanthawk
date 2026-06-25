import "server-only";
import { randomUUID } from "crypto";
import { db } from "@/db";
import type { FindingTrackingStatus } from "@/db/types";
import { findingEntityRef } from "@/lib/findings/key";

export interface FindingTracking {
  checkId: string;
  entityRef: string;
  status: FindingTrackingStatus;
  snoozedUntil: Date | null;
  note: string | null;
  updatedAt: Date;
}

export async function getFindingStatuses(
  connectionId: string,
): Promise<Map<string, FindingTracking>> {
  const rows = await db
    .selectFrom("finding_status")
    .selectAll()
    .where("connection_id", "=", connectionId)
    .execute();

  const map = new Map<string, FindingTracking>();
  for (const row of rows) {
    const key = `${row.check_id}::${row.entity_ref}`;
    map.set(key, {
      checkId: row.check_id,
      entityRef: row.entity_ref,
      status: row.status,
      snoozedUntil: row.snoozed_until,
      note: row.note,
      updatedAt: row.updated_at,
    });
  }
  return map;
}

export function isFindingHidden(tracking: FindingTracking | undefined): boolean {
  if (!tracking) return false;
  if (tracking.status === "resolved") return true;
  if (
    tracking.status === "snoozed" &&
    tracking.snoozedUntil &&
    tracking.snoozedUntil > new Date()
  ) {
    return true;
  }
  return false;
}

export async function setFindingStatus(opts: {
  connectionId: string;
  checkId: string;
  entityRef: string | null;
  status: FindingTrackingStatus | "open";
  snoozeDays?: number;
  note?: string;
}): Promise<void> {
  const entityRef = findingEntityRef(opts.entityRef);

  if (opts.status === "open") {
    await db
      .deleteFrom("finding_status")
      .where("connection_id", "=", opts.connectionId)
      .where("check_id", "=", opts.checkId)
      .where("entity_ref", "=", entityRef)
      .execute();
    return;
  }

  const snoozedUntil =
    opts.status === "snoozed"
      ? new Date(Date.now() + (opts.snoozeDays ?? 7) * 86_400_000)
      : null;

  await db
    .insertInto("finding_status")
    .values({
      id: randomUUID(),
      connection_id: opts.connectionId,
      check_id: opts.checkId,
      entity_ref: entityRef,
      status: opts.status,
      snoozed_until: snoozedUntil?.toISOString() ?? null,
      note: opts.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .onConflict((oc) =>
      oc.columns(["connection_id", "check_id", "entity_ref"]).doUpdateSet({
        status: opts.status as FindingTrackingStatus,
        snoozed_until: snoozedUntil?.toISOString() ?? null,
        note: opts.note ?? null,
        updated_at: new Date().toISOString(),
      }),
    )
    .execute();
}
