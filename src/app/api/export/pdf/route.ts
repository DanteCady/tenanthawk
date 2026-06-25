import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getPrimaryConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { buildFindingsPdf } from "@/lib/export/pdf";

export const runtime = "nodejs";

export async function GET() {
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

  const scan = await getLatestScan(conn.id);
  if (!scan) {
    return NextResponse.json({ error: "No scan" }, { status: 404 });
  }

  const findings = await getFindings(scan.id);
  const tenant =
    conn.tenant_domain ?? conn.display_name ?? (conn.mode === "demo" ? "Contoso (demo)" : "Tenant");

  const pdf = buildFindingsPdf(
    {
      tenant,
      scannedAt: new Date(scan.started_at).toISOString(),
      score: scan.score,
      mode: conn.mode,
    },
    findings.map((f) => ({
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description,
      remediation: f.remediation,
      entityRef: f.entity_ref,
      impactUsd: f.impact?.usd ?? null,
      checkId: f.check_id,
    })),
  );

  const slug = tenant.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "tenant";
  const date = new Date(scan.started_at).toISOString().slice(0, 10);

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tenanthawk-${slug}-${date}.pdf"`,
    },
  });
}
