import { NextRequest, NextResponse } from "next/server";
import { sendWeeklyDigests } from "@/lib/cron/monitoring";

export const runtime = "nodejs";

function authorizeCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Weekly digest for Pro users with weekly_digest enabled.
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sent } = await sendWeeklyDigests();
  return NextResponse.json({ ok: true, sent });
}
