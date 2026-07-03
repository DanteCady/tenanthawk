import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { enforceRateLimit } from "@/lib/rate-limit-http";
import { RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

const CONNECT_RETURN_COOKIE = "th_connect_return";

// Kicks off the Microsoft admin-consent flow for our multi-tenant,
// read-only, app-only Entra app.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const clientId = process.env.MS_CLIENT_ID;
  const redirectUri = process.env.MS_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    // Live connect not configured - send back to onboarding to use demo.
    return NextResponse.redirect(
      new URL("/onboarding?connect=unconfigured", req.url),
    );
  }

  const plan = await getPlan(session.user.id);
  const limited = enforceRateLimit(
    session.user.id,
    "connect-start",
    plan,
    RATE_LIMITS.connectStart,
  );
  if (limited) {
    return NextResponse.redirect(
      new URL("/onboarding?connect=rate_limit", req.url),
    );
  }

  const returnTo = req.nextUrl.searchParams.get("return");
  const state = crypto.randomUUID();
  const consentUrl =
    `https://login.microsoftonline.com/common/adminconsent` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  const res = NextResponse.redirect(consentUrl);
  res.cookies.set("th_connect_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  if (returnTo === "clients") {
    res.cookies.set(CONNECT_RETURN_COOKIE, "clients", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }
  return res;
}
