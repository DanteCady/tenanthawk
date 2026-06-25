import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { runScan } from "@/lib/scan/runScan";

export const runtime = "nodejs";

// Microsoft redirects here after admin consent with admin_consent + tenant.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const adminConsent = searchParams.get("admin_consent");
  const tenant = searchParams.get("tenant");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get("th_connect_state")?.value;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/onboarding?connect=${reason}`, req.url));

  if (!state || !expectedState || state !== expectedState) return fail("state");
  if (adminConsent !== "True" || !tenant) return fail("denied");

  const userId = session.user.id;

  let conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("user_id", "=", userId)
    .where("tenant_id", "=", tenant)
    .executeTakeFirst();

  if (!conn) {
    const id = randomUUID();
    await db
      .insertInto("connection")
      .values({
        id,
        user_id: userId,
        provider: "microsoft",
        tenant_id: tenant,
        tenant_domain: null,
        display_name: "Microsoft 365",
        mode: "live",
        status: "active",
      })
      .execute();
    conn = await db
      .selectFrom("connection")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  }

  try {
    await runScan(conn.id);
  } catch (err) {
    console.error("[connect/callback] initial scan failed", err);
  }

  const res = NextResponse.redirect(
    new URL("/onboarding?step=results", req.url),
  );
  res.cookies.delete("th_connect_state");
  return res;
}
