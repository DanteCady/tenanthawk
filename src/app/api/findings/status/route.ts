import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { getActiveConnection, getLatestScan, getFindings } from "@/lib/queries";
import { setFindingStatus } from "@/lib/findings/status";
import { acceptedStatusNote } from "@/lib/findings/reconcile";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const conn = await getActiveConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No connection" }, { status: 404 });
  }

  let body: {
    checkId?: unknown;
    entityRef?: unknown;
    action?: unknown;
    snoozeDays?: unknown;
    note?: unknown;
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
  const note = typeof body.note === "string" ? body.note : undefined;

  if (!checkId) {
    return NextResponse.json({ error: "checkId required" }, { status: 400 });
  }

  if (action === "resolve") {
    await setFindingStatus({
      connectionId: conn.id,
      checkId,
      entityRef,
      status: "resolved",
      note,
    });
    return NextResponse.json({ ok: true, status: "resolved" });
  }

  if (action === "accept") {
    const scan = await getLatestScan(conn.id);
    const findings = scan ? await getFindings(scan.id) : [];
    const match = findings.find(
      (finding) =>
        finding.check_id === checkId &&
        (finding.entity_ref ?? "") === (entityRef ?? ""),
    );

    await setFindingStatus({
      connectionId: conn.id,
      checkId,
      entityRef,
      status: "accepted",
      note:
        note ??
        (match
          ? acceptedStatusNote({
              category: match.category,
              checkId: match.check_id,
              severity: match.severity,
              title: match.title,
              description: match.description,
              remediation: match.remediation,
              impact: match.impact ?? undefined,
              entityRef: match.entity_ref,
            })
          : undefined),
    });
    return NextResponse.json({ ok: true, status: "accepted" });
  }

  if (action === "flag") {
    await setFindingStatus({
      connectionId: conn.id,
      checkId,
      entityRef,
      status: "flagged",
      note,
    });
    return NextResponse.json({ ok: true, status: "flagged" });
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
      note,
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
