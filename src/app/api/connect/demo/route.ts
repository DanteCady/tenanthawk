import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { enforceRateLimit } from "@/lib/rate-limit-http";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { runScan } from "@/lib/scan/runScan";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const plan = await getPlan(userId);
  const limited = enforceRateLimit(userId, "connect-demo", plan, RATE_LIMITS.connectDemo);
  if (limited) return limited;

  let conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("user_id", "=", userId)
    .where("mode", "=", "demo")
    .executeTakeFirst();

  if (!conn) {
    const id = randomUUID();
    await db
      .insertInto("connection")
      .values({
        id,
        user_id: userId,
        provider: "microsoft",
        tenant_id: null,
        tenant_domain: "contoso.onmicrosoft.com",
        display_name: "Contoso (demo)",
        mode: "demo",
        status: "active",
      })
      .execute();
    conn = await db
      .selectFrom("connection")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  }

  const scanId = await runScan(conn.id);
  return NextResponse.json({ ok: true, connectionId: conn.id, scanId });
}
