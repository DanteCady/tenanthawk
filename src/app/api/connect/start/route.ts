import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

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
    // Live connect not configured — send back to onboarding to use demo.
    return NextResponse.redirect(
      new URL("/onboarding?connect=unconfigured", req.url),
    );
  }

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
  return res;
}
