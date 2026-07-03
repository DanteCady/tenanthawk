/** Shared cookie name - safe to import from Edge middleware. */
export const ACTIVE_CONNECTION_COOKIE = "th_active_connection";

export const ACTIVE_CONNECTION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function activeConnectionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACTIVE_CONNECTION_COOKIE_MAX_AGE,
  };
}
