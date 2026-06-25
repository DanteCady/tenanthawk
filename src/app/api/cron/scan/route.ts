import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { runScan } from "@/lib/scan/runScan";

export const runtime = "nodejs";

// Daily re-scan of active live connections. Wire to a Vercel cron.
// Protected by CRON_SECRET when set.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const conns = await db
    .selectFrom("connection")
    .selectAll()
    .where("status", "=", "active")
    .where("mode", "=", "live")
    .execute();

  let scanned = 0;
  for (const c of conns) {
    try {
      await runScan(c.id);
      scanned++;
    } catch (err) {
      console.error(`[cron] scan failed for ${c.id}`, err);
    }
  }

  return NextResponse.json({ ok: true, scanned });
}
