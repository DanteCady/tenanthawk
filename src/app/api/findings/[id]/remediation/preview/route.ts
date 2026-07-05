import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { requirePro } from "@/lib/entitlements";
import { getFindingWithConnection } from "@/lib/remediation/access";
import { getPlanHandler } from "@/lib/remediation/plan/registry";
import { buildRemediationPlan } from "@/lib/remediation/plan/run";
import { probeAppToken } from "@/lib/scan/graph";

export const runtime = "nodejs";

/** Build a live Graph remediation preview plan (Pro only, live connection). */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await requirePro(session.user.id);
  } catch {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const row = await getFindingWithConnection(id, session.user.id);
  if (!row) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 });
  }

  const { finding, connection } = row;

  if (connection.mode === "demo") {
    return NextResponse.json(
      {
        error: "demo_connection",
        message: "Connect a live tenant to preview remediation.",
      },
      { status: 403 },
    );
  }

  if (!getPlanHandler(finding.check_id)) {
    return NextResponse.json(
      { error: "unsupported_check", supported: false },
      { status: 409 },
    );
  }

  if (!connection.tenant_id) {
    return NextResponse.json(
      { error: "no_tenant", message: "Live tenant connection required." },
      { status: 403 },
    );
  }

  const tokenResult = await probeAppToken(connection.tenant_id);
  if (!tokenResult.ok) {
    return NextResponse.json(
      {
        error: "graph_auth_failed",
        message: tokenResult.error.errorDescription,
      },
      { status: 502 },
    );
  }

  try {
    const plan = await buildRemediationPlan({
      finding: {
        id: finding.id,
        check_id: finding.check_id,
        entity_ref: finding.entity_ref,
      },
      connection,
      token: tokenResult.token,
    });

    return NextResponse.json({ plan });
  } catch (err) {
    if (err instanceof Error && err.message === "UNSUPPORTED_CHECK") {
      return NextResponse.json(
        { error: "unsupported_check", supported: false },
        { status: 409 },
      );
    }
    console.error("[remediation/preview]", err);
    return NextResponse.json(
      { error: "plan_failed", message: "Could not build remediation preview." },
      { status: 500 },
    );
  }
}
