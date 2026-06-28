import { NextResponse } from "next/server";
import { db } from "@/db";
import { getSession } from "@/lib/session";
import { requirePro } from "@/lib/entitlements";
import { getFindingForUser } from "@/lib/remediation/access";
import { enrichRemediation } from "@/lib/remediation/enrich";
import type { RemediationEnriched } from "@/lib/remediation/types";

export const runtime = "nodejs";

function parseEnriched(raw: unknown): RemediationEnriched | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as RemediationEnriched;
  if (!Array.isArray(o.steps) || !Array.isArray(o.links)) return null;
  return o;
}

/** Generate or return cached AI remediation for a finding (Pro only). */
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
  const finding = await getFindingForUser(id, session.user.id);
  if (!finding) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 });
  }

  const cached = parseEnriched(finding.remediation_enriched);
  if (cached) {
    return NextResponse.json({ enriched: cached, cached: true });
  }

  const enriched = await enrichRemediation({
    checkId: finding.check_id,
    category: finding.category,
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    entityRef: finding.entity_ref,
    templateRemediation: finding.remediation,
  });

  await db
    .updateTable("finding")
    .set({ remediation_enriched: JSON.stringify(enriched) })
    .where("id", "=", finding.id)
    .execute();

  return NextResponse.json({ enriched, cached: false });
}
