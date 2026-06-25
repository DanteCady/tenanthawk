import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "kysely";
import { db } from "@/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

// DEV ONLY: simulate plan changes without Stripe so the unlock/gating UX can be
// tested locally. Disabled in production and once real Stripe keys are set.
function devAllowed() {
  return process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;
}

export async function POST(req: NextRequest) {
  if (!devAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { plan } = (await req.json().catch(() => ({}))) as { plan?: string };

  await db.deleteFrom("subscription").where("referenceId", "=", userId).execute();

  if (plan === "pro") {
    await sql`
      INSERT INTO subscription (id, plan, "referenceId", status, "stripeCustomerId", "stripeSubscriptionId")
      VALUES (${randomUUID()}, 'pro', ${userId}, 'active', 'dev_customer', 'dev_sub')
    `.execute(db);
  }

  return NextResponse.json({ ok: true, plan: plan === "pro" ? "pro" : "free" });
}
