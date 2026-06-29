/** URLs for the main customer app (apex), separate from platform admin host. */
export function buildApexAppUrl(path = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://localhost:3000";
  const normalized = base.replace(/\/$/, "");
  return path.startsWith("/") ? `${normalized}${path}` : `${normalized}/${path}`;
}
