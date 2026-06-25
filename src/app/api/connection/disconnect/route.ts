import { NextResponse } from "next/server";
import { db } from "@/db";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST() {
  const session = await requireSession();

  await db
    .deleteFrom("connection")
    .where("user_id", "=", session.user.id)
    .execute();

  return NextResponse.json({ ok: true });
}
