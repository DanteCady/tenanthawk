import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { getPrimaryConnection } from "@/lib/queries";
import { setFindingStatus } from "@/lib/findings/status";

export const runtime = "nodejs";

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

  let body: {
    checkId?: unknown;
    entityRef?: unknown;
    action?: unknown;
    snoozeDays?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const checkId = typeof body.checkId === "string" ? body.checkId : "";
  const action = body.action;
  const entityRef =
    typeof body.entityRef === "string"
      ? body.entityRef
      : body.entityRef === null
        ? null
        : null;

  if (!checkId) {
    return NextResponse.json({ error: "checkId required" }, { status: 400 });
  }

  if (action === "resolve") {
    await setFindingStatus({
      connectionId: conn.id,
      checkId,
      entityRef,
      status: "resolved",
    });
    return NextResponse.json({ ok: true, status: "resolved" });
  }

  if (action === "snooze") {
    const days = typeof body.snoozeDays === "number" ? body.snoozeDays : 7;
    const snoozeDays = [7, 14, 30].includes(days) ? days : 7;
    await setFindingStatus({
      connectionId: conn.id,
      checkId,
      entityRef,
      status: "snoozed",
      snoozeDays,
    });
    return NextResponse.json({ ok: true, status: "snoozed", snoozeDays });
  }

  if (action === "reopen") {
    await setFindingStatus({
      connectionId: conn.id,
      checkId,
      entityRef,
      status: "open",
    });
    return NextResponse.json({ ok: true, status: "open" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
