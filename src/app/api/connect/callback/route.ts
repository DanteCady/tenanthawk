import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { runScan } from "@/lib/scan/runScan";
import { getEnterpriseClientLimit } from "@/lib/billing/enterprise-limits";
import { enrichConnectionProfile } from "@/lib/connect/enrichConnection";
import { invalidateConnectionHealth } from "@/lib/connect/health";
import {
  activeConnectionCookieOptions,
  ACTIVE_CONNECTION_COOKIE,
} from "@/lib/connection/constants";
import { appRedirectUrl } from "@/lib/platform/urls";

export const runtime = "nodejs";

const CONNECT_RETURN_COOKIE = "th_connect_return";

// Microsoft redirects here after admin consent with admin_consent + tenant.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(appRedirectUrl("/login", req));
  }

  const { searchParams } = new URL(req.url);
  const adminConsent = searchParams.get("admin_consent");
  const tenant = searchParams.get("tenant");
  const state = searchParams.get("state");
  const expectedState = req.cookies.get("th_connect_state")?.value;
  const returnTo = req.cookies.get(CONNECT_RETURN_COOKIE)?.value;

  const fail = (reason: string) => {
    const url = appRedirectUrl("/onboarding", req);
    if (returnTo === "clients") url.searchParams.set("mode", "add-client");
    url.searchParams.set("connect", reason);
    const res = NextResponse.redirect(url);
    res.cookies.delete("th_connect_state");
    res.cookies.delete(CONNECT_RETURN_COOKIE);
    return res;
  };

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
    if (returnTo === "clients") {
      const limit = await getEnterpriseClientLimit(userId, session.user.email);
      if (!limit.canAdd) {
        return fail(limit.atCap ? "client_cap" : "enterprise_required");
      }
    }

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
  } else if (conn.status !== "active") {
    await db
      .updateTable("connection")
      .set({ status: "active" })
      .where("id", "=", conn.id)
      .execute();
  }

  await enrichConnectionProfile(conn.id, tenant);
  invalidateConnectionHealth(conn.id);

  try {
    await runScan(conn.id);
  } catch (err) {
    console.error("[connect/callback] initial scan failed", err);
    return fail("scan_failed");
  }

  const redirectPath =
    returnTo === "clients"
      ? `/dashboard/clients?connection=${conn.id}`
      : "/onboarding";

  const res = NextResponse.redirect(appRedirectUrl(redirectPath, req));
  res.cookies.delete("th_connect_state");
  res.cookies.delete(CONNECT_RETURN_COOKIE);
  res.cookies.set(ACTIVE_CONNECTION_COOKIE, conn.id, activeConnectionCookieOptions());
  return res;
}
