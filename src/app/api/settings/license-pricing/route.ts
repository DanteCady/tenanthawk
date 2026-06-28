import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  COMMON_LICENSE_PRICING_FIELDS,
  parseLicensePricing,
  sanitizeLicensePricingInput,
  type LicensePricingOverrides,
} from "@/lib/licenses/pricing-overrides";
import { microsoftListPriceForSku } from "@/lib/licenses/sku-pricing";
import { getPrimaryConnection } from "@/lib/queries";

export const runtime = "nodejs";

function listPrices() {
  return Object.fromEntries(
    COMMON_LICENSE_PRICING_FIELDS.map(({ code }) => [
      code,
      microsoftListPriceForSku(code),
    ]),
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No connection" }, { status: 404 });
  }

  const overrides = parseLicensePricing(conn.license_pricing);

  return NextResponse.json({
    overrides,
    listPrices: listPrices(),
    isPro: await isPro(session.user.id),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No connection" }, { status: 404 });
  }

  let body: { defaultUsd?: unknown; skus?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input: LicensePricingOverrides = {};

  if (body.defaultUsd !== undefined && body.defaultUsd !== null && body.defaultUsd !== "") {
    const parsed = Number(body.defaultUsd);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
      return NextResponse.json({ error: "Invalid defaultUsd" }, { status: 400 });
    }
    input.defaultUsd = Math.round(parsed * 100) / 100;
  }

  if (body.skus && typeof body.skus === "object" && body.skus !== null) {
    const skus: Record<string, number> = {};
    for (const [key, value] of Object.entries(body.skus as Record<string, unknown>)) {
      if (value === "" || value == null) continue;
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
        return NextResponse.json({ error: `Invalid rate for ${key}` }, { status: 400 });
      }
      skus[key.trim().toUpperCase()] = Math.round(parsed * 100) / 100;
    }
    if (Object.keys(skus).length > 0) input.skus = skus;
  }

  const overrides = sanitizeLicensePricingInput(input);

  await db
    .updateTable("connection")
    .set({
      license_pricing: overrides ? JSON.stringify(overrides) : null,
    })
    .where("id", "=", conn.id)
    .where("user_id", "=", session.user.id)
    .execute();

  return NextResponse.json({ ok: true, overrides });
}
