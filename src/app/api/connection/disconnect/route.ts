import { NextResponse } from "next/server";
import { db } from "@/db";
import { invalidateConnectionHealth } from "@/lib/connect/health";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const session = await requireSession();

  const connections = await db
    .selectFrom("connection")
    .select(["id"])
    .where("user_id", "=", session.user.id)
    .execute();

  for (const conn of connections) {
    invalidateConnectionHealth(conn.id);
  }

  await db
    .deleteFrom("connection")
    .where("user_id", "=", session.user.id)
    .execute();

  return NextResponse.json({ ok: true });
}
