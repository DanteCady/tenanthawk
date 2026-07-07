import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  clearActiveConnectionCookie,
  readActiveConnectionCookie,
  setActiveConnectionCookie,
} from "@/lib/connection/active";
import { getDefaultConnectionId } from "@/lib/connection/preferences";
import { getConnectionById, getConnections } from "@/lib/queries";
import { invalidateConnectionHealth } from "@/lib/connect/health";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await requireSession();
  let connectionId: string | undefined;

  try {
    const body = (await req.json()) as { connectionId?: string };
    connectionId = body.connectionId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!connectionId) {
    return NextResponse.json({ error: "connectionId required" }, { status: 400 });
  }

  const conn = await getConnectionById(session.user.id, connectionId);
  if (!conn) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  invalidateConnectionHealth(connectionId);

  await db.deleteFrom("connection").where("id", "=", connectionId).execute();

  const activeId = await readActiveConnectionCookie();
  if (activeId === connectionId) {
    await clearActiveConnectionCookie();
    const remaining = await getConnections(session.user.id);
    if (remaining.length > 0) {
      const defaultId = await getDefaultConnectionId(session.user.id);
      const nextId =
        defaultId && remaining.some((c) => c.id === defaultId)
          ? defaultId
          : remaining[0].id;
      await setActiveConnectionCookie(nextId);
    }
  }

  return NextResponse.json({ ok: true });
}
