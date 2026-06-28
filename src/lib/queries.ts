import "server-only";
import { db } from "@/db";
import { enrichConnectionProfile } from "@/lib/connect/enrichConnection";
import { isLiveConfigured } from "@/lib/scan/graph";

export async function getPrimaryConnection(userId: string) {
  const conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "desc")
    .executeTakeFirst();

  if (
    conn &&
    conn.mode === "live" &&
    conn.tenant_id &&
    !conn.tenant_domain &&
    isLiveConfigured()
  ) {
    await enrichConnectionProfile(conn.id, conn.tenant_id);
    return db
      .selectFrom("connection")
      .selectAll()
      .where("id", "=", conn.id)
      .executeTakeFirst();
  }

  return conn;
}

export async function getConnections(userId: string) {
  return db
    .selectFrom("connection")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "desc")
    .execute();
}

export async function getLatestScan(connectionId: string) {
  return db
    .selectFrom("scan")
    .selectAll()
    .where("connection_id", "=", connectionId)
    .where("status", "=", "complete")
    .orderBy("started_at", "desc")
    .executeTakeFirst();
}

export async function getFindings(scanId: string) {
  return db
    .selectFrom("finding")
    .selectAll()
    .where("scan_id", "=", scanId)
    .execute();
}

export async function getScanTrend(connectionId: string, limit = 12) {
  const rows = await db
    .selectFrom("scan")
    .select(["id", "score", "started_at"])
    .where("connection_id", "=", connectionId)
    .where("status", "=", "complete")
    .orderBy("started_at", "desc")
    .limit(limit)
    .execute();
  return rows.reverse();
}

export async function getScanHistory(connectionId: string, limit = 12) {
  return db
    .selectFrom("scan")
    .select(["id", "score", "started_at", "category_scores"])
    .where("connection_id", "=", connectionId)
    .where("status", "=", "complete")
    .orderBy("started_at", "desc")
    .limit(limit)
    .execute();
}

export async function getPreviousScan(connectionId: string, currentScanId: string) {
  const current = await db
    .selectFrom("scan")
    .select(["started_at"])
    .where("id", "=", currentScanId)
    .executeTakeFirst();
  if (!current) return undefined;

  return db
    .selectFrom("scan")
    .selectAll()
    .where("connection_id", "=", connectionId)
    .where("status", "=", "complete")
    .where("started_at", "<", current.started_at)
    .orderBy("started_at", "desc")
    .executeTakeFirst();
}

export async function getLastScheduledScan(connectionId: string) {
  return db
    .selectFrom("scan")
    .selectAll()
    .where("connection_id", "=", connectionId)
    .where("status", "=", "complete")
    .where("source", "=", "scheduled")
    .orderBy("started_at", "desc")
    .executeTakeFirst();
}
