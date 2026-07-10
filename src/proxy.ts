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
  const host = req.headers.get("host");
  const hostname = host?.split(":")[0]?.toLowerCase();
  if (hostname === "www.tenanthawk.io") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    url.host = "tenanthawk.io";
    return NextResponse.redirect(url, 301);
  }

  const pathname = req.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    const url = appRedirectUrl("/login", req);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const connectionId = req.nextUrl.searchParams.get("connection");
  if (connectionId && pathname.startsWith("/dashboard")) {
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
