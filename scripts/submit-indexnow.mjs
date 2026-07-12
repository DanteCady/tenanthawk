/**
 * Submit sitemap URLs to IndexNow (Bing + other engines).
 *
 * Usage:
 *   INDEXNOW_BASE_URL=https://tenanthawk.io pnpm indexnow
 *
 * Requires the key file live at /{INDEXNOW_KEY}.txt (see public/).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_KEY = "19eea2cd5d486976a45c5152fb6f546a";
const KEY = (process.env.INDEXNOW_KEY || DEFAULT_KEY).trim();
const BASE = (process.env.INDEXNOW_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://tenanthawk.io")
  .trim()
  .replace(/\/$/, "");

function loadKeyFromPublic() {
  const path = join(root, "public", `${KEY}.txt`);
  if (!existsSync(path)) {
    throw new Error(`Missing IndexNow key file: public/${KEY}.txt`);
  }
  const contents = readFileSync(path, "utf8").trim();
  if (contents !== KEY) {
    throw new Error(`Key file contents do not match INDEXNOW_KEY (${KEY})`);
  }
}

async function fetchSitemapUrls(base) {
  const sitemapUrl = `${base}/sitemap.xml`;
  const res = await fetch(sitemapUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${sitemapUrl}: HTTP ${res.status}`);
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  return [...new Set(urls)];
}

async function submit(urls) {
  const host = new URL(BASE).host;
  const keyLocation = `${BASE}/${KEY}.txt`;
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation,
      urlList: urls,
    }),
  });
  const body = await res.text().catch(() => "");
  return { status: res.status, body, keyLocation, host };
}

loadKeyFromPublic();

const keyCheck = await fetch(`${BASE}/${KEY}.txt`);
const keyBody = (await keyCheck.text()).trim();
if (!keyCheck.ok || keyBody !== KEY) {
  console.error(
    `Key file not reachable at ${BASE}/${KEY}.txt (HTTP ${keyCheck.status}). Deploy first.`,
  );
  process.exit(1);
}
console.log(`Key verified at ${BASE}/${KEY}.txt`);

const urls = await fetchSitemapUrls(BASE);
console.log(`Submitting ${urls.length} URLs for ${new URL(BASE).host}…`);

const result = await submit(urls);
console.log(`IndexNow HTTP ${result.status}${result.body ? `: ${result.body}` : ""}`);
if (result.status !== 200 && result.status !== 202) {
  process.exit(1);
}
console.log("Done.");
