import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { setDefaultConnectionId } from "@/lib/connection/preferences";
import { setActiveConnectionCookie } from "@/lib/connection/active";
import { getConnectionById } from "@/lib/queries";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { connectionId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const connectionId = body.connectionId;
  if (typeof connectionId !== "string" || !connectionId.trim()) {
    return NextResponse.json({ error: "connectionId required" }, { status: 400 });
  }

  const conn = await getConnectionById(session.user.id, connectionId);
  if (!conn) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  try {
    await setDefaultConnectionId(session.user.id, connectionId);
  } catch {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  await setActiveConnectionCookie(connectionId);

  return NextResponse.json({ ok: true, connectionId });
}
