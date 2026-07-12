import { getSiteUrl } from "@/lib/guides/site-url";

/** Public IndexNow ownership key — also hosted at `/{key}.txt`. */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() || "19eea2cd5d486976a45c5152fb6f546a";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export function indexNowKeyLocation(baseUrl = getSiteUrl()): string {
  return `${baseUrl.replace(/\/$/, "")}/${INDEXNOW_KEY}.txt`;
}

/**
 * Notify IndexNow (Bing and other engines) that URLs changed.
 * Returns HTTP status; 200/202 = accepted.
 */
export async function submitIndexNowUrls(
  urls: string[],
  options?: { host?: string; baseUrl?: string },
): Promise<{ ok: boolean; status: number; body: string }> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { ok: false, status: 0, body: "no urls" };
  }

  const baseUrl = (options?.baseUrl ?? getSiteUrl()).replace(/\/$/, "");
  const host =
    options?.host ??
    (() => {
      try {
        return new URL(baseUrl).host;
      } catch {
        return "tenanthawk.io";
      }
    })();

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
      urlList: unique,
    }),
  });

  const body = await res.text().catch(() => "");
  return { ok: res.status === 200 || res.status === 202, status: res.status, body };
}
