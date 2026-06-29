import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import {
  clearActiveConnectionCookie,
  readActiveConnectionCookie,
  setActiveConnectionCookie,
} from "@/lib/connection/active";
import { getConnectionById, getConnections } from "@/lib/queries";
import { invalidateConnectionHealth } from "@/lib/connect/health";

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

  await setActiveConnectionCookie(connectionId);
  return NextResponse.json({ ok: true, connectionId });
}
