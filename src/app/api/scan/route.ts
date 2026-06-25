import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPrimaryConnection } from "@/lib/queries";
import { runScan } from "@/lib/scan/runScan";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No connection" }, { status: 404 });
  }

  const scanId = await runScan(conn.id);
  return NextResponse.json({ ok: true, scanId });
}
