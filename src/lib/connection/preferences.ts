import "server-only";
import { db } from "@/db";
import { resolveWorkspaceDataUserId } from "@/lib/enterprise/workspace";

async function preferencesUserId(userId: string): Promise<string> {
  return resolveWorkspaceDataUserId(userId);
}

export async function getDefaultConnectionId(
  userId: string,
): Promise<string | undefined> {
  const ownerId = await preferencesUserId(userId);
  const row = await db
    .selectFrom("user_preferences")
    .select("default_connection_id")
    .where("user_id", "=", ownerId)
    .executeTakeFirst();

  const connectionId = row?.default_connection_id;
  if (!connectionId) return undefined;

  const conn = await db
    .selectFrom("connection")
    .select("id")
    .where("id", "=", connectionId)
    .where("user_id", "=", ownerId)
    .executeTakeFirst();

  return conn?.id;
}

export async function setDefaultConnectionId(
  userId: string,
  connectionId: string,
): Promise<void> {
  const ownerId = await preferencesUserId(userId);
  const conn = await db
    .selectFrom("connection")
    .select("id")
    .where("id", "=", connectionId)
    .where("user_id", "=", ownerId)
    .executeTakeFirst();

  if (!conn) {
    throw new Error("Connection not found");
  }

  await db
    .insertInto("user_preferences")
    .values({
      user_id: ownerId,
      default_connection_id: connectionId,
      updated_at: new Date().toISOString(),
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        default_connection_id: connectionId,
        updated_at: new Date().toISOString(),
      }),
    )
    .execute();
}
