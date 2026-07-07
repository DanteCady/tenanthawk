import "server-only";
import { db } from "@/db";
import { readActiveConnectionCookie } from "@/lib/connection/active";
import { getDefaultConnectionId } from "@/lib/connection/preferences";
import { enrichConnectionProfile } from "@/lib/connect/enrichConnection";
import { resolveWorkspaceDataUserId } from "@/lib/enterprise/workspace";
import { isLiveConfigured } from "@/lib/scan/graph";

async function dataUserId(userId: string): Promise<string> {
  return resolveWorkspaceDataUserId(userId);
}

async function maybeEnrichConnection(
  conn: Awaited<ReturnType<typeof getConnections>>[number],
) {
  if (
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

export async function getConnectionById(userId: string, connectionId: string) {
  const ownerId = await dataUserId(userId);
  const conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("id", "=", connectionId)
    .where("user_id", "=", ownerId)
    .executeTakeFirst();
  if (!conn) return undefined;
  return maybeEnrichConnection(conn);
}

async function resolveDefaultConnectionId(userId: string): Promise<string | undefined> {
  const connections = await getConnections(userId);
  if (connections.length === 0) return undefined;
  if (connections.length === 1) return connections[0].id;

  const storedDefault = await getDefaultConnectionId(userId);
  if (storedDefault && connections.some((c) => c.id === storedDefault)) {
    return storedDefault;
  }

  const ranked = await Promise.all(
    connections.map(async (conn) => ({
      id: conn.id,
      createdAt: conn.created_at,
      latestScan: await getLatestScan(conn.id),
    })),
  );

  ranked.sort((a, b) => {
    const aTime = a.latestScan?.started_at
      ? new Date(a.latestScan.started_at).getTime()
      : 0;
    const bTime = b.latestScan?.started_at
      ? new Date(b.latestScan.started_at).getTime()
      : 0;
    if (aTime !== bTime) return bTime - aTime;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return ranked[0]?.id;
}

export async function getActiveConnection(
  userId: string,
  preferredId?: string | null,
) {
  const owned = new Set((await getConnections(userId)).map((c) => c.id));

  if (preferredId && owned.has(preferredId)) {
    return getConnectionById(userId, preferredId);
  }

  const cookieId = await readActiveConnectionCookie();
  if (cookieId && owned.has(cookieId)) {
    return getConnectionById(userId, cookieId);
  }

  const fallbackId = await resolveDefaultConnectionId(userId);
  if (!fallbackId) return undefined;
  return getConnectionById(userId, fallbackId);
}

/** @deprecated Use getActiveConnection - kept for gradual migration. */
export async function getPrimaryConnection(userId: string) {
  return getActiveConnection(userId);
}

export async function getConnections(userId: string) {
  const ownerId = await dataUserId(userId);
  return db
    .selectFrom("connection")
    .selectAll()
    .where("user_id", "=", ownerId)
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
