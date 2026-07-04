import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  ACTIVE_CONNECTION_COOKIE,
  activeConnectionCookieOptions,
} from "@/lib/connection/constants";
import { appRedirectUrl } from "@/lib/platform/urls";

// Optimistic cookie check for fast redirects. Real authorization is enforced
// in server components / route handlers via requireSession().
export function proxy(req: NextRequest) {
  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    const url = appRedirectUrl("/login", req);
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const connectionId = req.nextUrl.searchParams.get("connection");
  if (connectionId && req.nextUrl.pathname.startsWith("/dashboard")) {
    const response = NextResponse.next();
    response.cookies.set(
      ACTIVE_CONNECTION_COOKIE,
      connectionId,
      activeConnectionCookieOptions(),
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
