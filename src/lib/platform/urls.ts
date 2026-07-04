import type { NextRequest } from "next/server";

const INVALID_REDIRECT_HOSTS = new Set(["0.0.0.0", "[::]", "127.0.0.1", "localhost"]);

function configuredAppOrigin(): string | null {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.EMAIL_APP_URL?.trim();
  return base ? base.replace(/\/$/, "") : null;
}

function originFromRequest(req: NextRequest): string | null {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host")?.trim();
  if (!host) return null;

  const hostname = host.split(":")[0];
  if (INVALID_REDIRECT_HOSTS.has(hostname)) return null;

  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (hostname === "localhost" ? "http" : "https");
  return `${proto}://${host}`;
}

/** URLs for the main customer app (apex), separate from platform admin host. */
export function buildApexAppUrl(path = "/"): string {
  const base = configuredAppOrigin() ?? "http://localhost:3000";
  const normalized = base.replace(/\/$/, "");
  return path.startsWith("/") ? `${normalized}${path}` : `${normalized}/${path}`;
}

/** Absolute URL for server-side redirects (OAuth callbacks, middleware). */
export function appRedirectUrl(path: string, req?: NextRequest): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = configuredAppOrigin() ?? (req ? originFromRequest(req) : null);
  if (origin) return new URL(normalizedPath, `${origin}/`);

  if (req) {
    const fromRequest = new URL(normalizedPath, req.url);
    if (!INVALID_REDIRECT_HOSTS.has(fromRequest.hostname)) return fromRequest;
  }

  return new URL(normalizedPath, "http://localhost:3000");
}
