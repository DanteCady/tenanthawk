import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { enforceRateLimit } from "@/lib/rate-limit-http";
import { RATE_LIMITS } from "@/lib/rate-limit";
import {
  getConnectionHealth,
  invalidateConnectionHealth,
} from "@/lib/connect/health";
import { getPrimaryConnection } from "@/lib/queries";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No connection" }, { status: 404 });
  }

  const refresh = new URL(req.url).searchParams.get("refresh") === "1";
  if (refresh) {
    const plan = await getPlan(session.user.id);
    const limited = enforceRateLimit(
      session.user.id,
      "connection-health",
      plan,
      RATE_LIMITS.connectionHealth,
    );
    if (limited) return limited;

    invalidateConnectionHealth(conn.id);
  }

  const health = await getConnectionHealth(conn);
  return NextResponse.json(health);
}
