import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getActiveConnection } from "@/lib/queries";
import { getPlan, isPro } from "@/lib/entitlements";
import { enforceRateLimit } from "@/lib/rate-limit-http";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { runScan } from "@/lib/scan/runScan";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conn = await getActiveConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No connection" }, { status: 404 });
  }

  const plan = await getPlan(session.user.id);
  const limited = enforceRateLimit(session.user.id, "scan", plan, RATE_LIMITS.scan);
  if (limited) return limited;

  let scanMode: "standard" | "deep" = "standard";
  try {
    const body = (await req.json()) as { scanMode?: unknown };
    if (body.scanMode === "deep") scanMode = "deep";
  } catch {
    // Empty body defaults to standard scan.
  }

  if (scanMode === "deep" && !(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required for deep scan" }, { status: 403 });
  }

  const scanId = await runScan(conn.id, { scanMode });
  return NextResponse.json({ ok: true, scanId, scanMode });
}
