import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "kysely";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import type { Plan } from "@/lib/entitlements";

export const runtime = "nodejs";

// DEV ONLY: simulate plan changes without Stripe so the unlock/gating UX can be
// tested locally. Disabled in production and once real Stripe keys are set.
function devAllowed() {
  return process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;
}

function normalizeDevPlan(raw: string | undefined): Plan {
  if (raw === "pro" || raw === "msp") return raw;
  return "free";
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
  const { plan: rawPlan } = (await req.json().catch(() => ({}))) as { plan?: string };
  const plan = normalizeDevPlan(rawPlan);

  await db.deleteFrom("subscription").where("referenceId", "=", userId).execute();

  if (plan === "pro" || plan === "msp") {
    await sql`
      INSERT INTO subscription (id, plan, "referenceId", status, "stripeCustomerId", "stripeSubscriptionId")
      VALUES (${randomUUID()}, ${plan}, ${userId}, 'active', ${`dev_customer_${plan}`}, ${`dev_sub_${plan}`})
    `.execute(db);
  }

  return NextResponse.json({ ok: true, plan });
}
