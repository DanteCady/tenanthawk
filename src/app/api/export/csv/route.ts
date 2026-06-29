import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getActiveConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { buildOverviewCsv } from "@/lib/export/csv";
import { buildExportPayload, exportFilenameSlug } from "@/lib/export/payload";

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

  const findings = await getFindings(scan.id);
  const { meta, findings: exportFindings, summary, tenant } = buildExportPayload(
    conn,
    scan,
    findings,
  );

  const csv = buildOverviewCsv(meta, exportFindings, summary);
  const slug = exportFilenameSlug(tenant);
  const date = new Date(scan.started_at).toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tenanthawk-${slug}-${date}-summary.csv"`,
    },
  });
}
