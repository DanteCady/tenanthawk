import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Canonical host is apex; www duplicates dilute SEO signals. */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  if (!host) return NextResponse.next();

  const hostname = host.split(":")[0]?.toLowerCase();
  if (hostname !== "www.tenanthawk.io") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = "tenanthawk.io";
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
