export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.EMAIL_APP_URL ??
    "https://tenanthawk.io";
  if (url.includes("localhost")) {
    return "https://tenanthawk.io";
  }
  return url.replace(/\/$/, "");
}
