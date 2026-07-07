import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getActiveConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { buildFindingsPdf } from "@/lib/export/pdf";
import { buildExportPayload, exportFilenameSlug } from "@/lib/export/payload";
import { filterActiveExportFindings } from "@/lib/export/active-findings";

export const runtime = "nodejs";

export async function GET() {
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

  const scan = await getLatestScan(conn.id);
  if (!scan) {
    return NextResponse.json({ error: "No scan" }, { status: 404 });
  }

  const findings = await filterActiveExportFindings(
    conn.id,
    await getFindings(scan.id),
    true,
  );
  const { meta, findings: exportFindings, tenant } = buildExportPayload(
    conn,
    scan,
    findings,
  );

  const pdf = buildFindingsPdf(meta, exportFindings);
  const slug = exportFilenameSlug(tenant);
  const date = new Date(scan.started_at).toISOString().slice(0, 10);

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tenanthawk-${slug}-${date}.pdf"`,
    },
  });
}
