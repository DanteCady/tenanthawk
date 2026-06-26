import "server-only";
import { db } from "@/db";

/** Load a finding only if it belongs to the user's tenant connection. */
export async function getFindingForUser(findingId: string, userId: string) {
  const finding = await db
    .selectFrom("finding")
    .selectAll()
    .where("id", "=", findingId)
    .executeTakeFirst();

  if (!finding) return null;

  const scan = await db
    .selectFrom("scan")
    .select(["connection_id"])
    .where("id", "=", finding.scan_id)
    .executeTakeFirst();

  if (!scan) return null;

  const conn = await db
    .selectFrom("connection")
    .select(["user_id"])
    .where("id", "=", scan.connection_id)
    .executeTakeFirst();

  if (!conn || conn.user_id !== userId) return null;

  return finding;
}
