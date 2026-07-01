#!/usr/bin/env node
/**
 * Capture a native 2× hero dashboard PNG from a live Tenant Hawk session.
 *
 * Usage:
 *   pnpm capture:hero:install   # once — downloads Chromium
 *   pnpm capture:hero           # prod demo user (default)
 *   HERO_CAPTURE_BASE_URL=http://localhost:3000 pnpm capture:hero
 *
 * Env:
 *   HERO_CAPTURE_BASE_URL         default https://tenanthawk.io
 *   HERO_CAPTURE_EMAIL            default demo@tenanthawk.app
 *   HERO_CAPTURE_PASSWORD         default TenantHawk!Demo1
 *   HERO_CAPTURE_VIEWPORT_WIDTH   CSS capture width (default 1280 — xl layout)
 *   HERO_CAPTURE_VIEWPORT_HEIGHT  CSS viewport height (default 960)
 *   HERO_CAPTURE_CSS_HEIGHT       exported hero height in CSS px (default 880)
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "marketing");

/** Display width in the hero frame (max-w-5xl). */
const CSS_WIDTH = 1024;
/** Display height — tall enough for KPIs, categories, compliance, and CTA banners. */
const CSS_HEIGHT = Number(process.env.HERO_CAPTURE_CSS_HEIGHT ?? "880");
const DPR = 2;
const OUT_W = CSS_WIDTH * DPR;
const OUT_H = CSS_HEIGHT * DPR;

const BASE_URL = (process.env.HERO_CAPTURE_BASE_URL ?? "https://tenanthawk.io").replace(
  /\/$/,
  "",
);
const EMAIL = process.env.HERO_CAPTURE_EMAIL ?? "demo@tenanthawk.app";
const PASSWORD = process.env.HERO_CAPTURE_PASSWORD ?? "TenantHawk!Demo1";
const VIEWPORT_WIDTH = Number(process.env.HERO_CAPTURE_VIEWPORT_WIDTH ?? "1280");
const VIEWPORT_HEIGHT = Number(process.env.HERO_CAPTURE_VIEWPORT_HEIGHT ?? "1100");

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    console.error(
      "Playwright is not installed. Run:\n\n  pnpm capture:hero:install\n",
    );
    process.exit(1);
  }
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/dashboard"), {
    timeout: 60_000,
  });
}

async function exportPngs(buffer) {
  const meta = await sharp(buffer).metadata();
  console.log(`Captured ${meta.width}×${meta.height}px`);

  const scaledH = Math.round((meta.height * OUT_W) / meta.width);

  if (scaledH < OUT_H) {
    console.warn(
      `Warning: scaled height ${scaledH}px < target ${OUT_H}px. ` +
        `Increase HERO_CAPTURE_VIEWPORT_HEIGHT (currently ${VIEWPORT_HEIGHT}).`,
    );
  }

  const cropH = Math.min(scaledH, OUT_H);

  const hiRes = await sharp(buffer)
    .resize(OUT_W, scaledH, { kernel: sharp.kernel.lanczos3 })
    .extract({ left: 0, top: 0, width: OUT_W, height: cropH })
    .png({ compressionLevel: 6, effort: 10 })
    .toBuffer();

  await mkdir(OUT_DIR, { recursive: true });

  const hiResPath = path.join(OUT_DIR, "hero-dashboard@2x.png");
  const loResPath = path.join(OUT_DIR, "hero-dashboard.png");

  await sharp(hiRes).toFile(hiResPath);
  await sharp(hiRes)
    .resize(CSS_WIDTH, Math.round(cropH / DPR), { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 6, effort: 10 })
    .toFile(loResPath);

  console.log(`Wrote ${hiResPath}`);
  console.log(`Wrote ${loResPath}`);
  console.log(
    `Hero display size: ${CSS_WIDTH}×${Math.round(cropH / DPR)} CSS px (${OUT_W}×${cropH} asset)`,
  );
}

async function main() {
  const { chromium } = await loadPlaywright();

  console.log(
    `Capturing ${BASE_URL}/dashboard at ${VIEWPORT_WIDTH}×${VIEWPORT_HEIGHT} @${DPR}x…`,
  );

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: DPR,
    });
    const page = await context.newPage();

    await login(page);
    await page.getByRole("heading", { name: "Client overview" }).waitFor({
      timeout: 30_000,
    });
    await page.waitForTimeout(750);

    const buffer = await page.screenshot({ type: "png", animations: "disabled" });
    await exportPngs(buffer);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
