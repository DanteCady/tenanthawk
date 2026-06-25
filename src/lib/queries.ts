import "server-only";
import { db } from "@/db";

export async function getPrimaryConnection(userId: string) {
  return db
    .selectFrom("connection")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "desc")
    .executeTakeFirst();
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
