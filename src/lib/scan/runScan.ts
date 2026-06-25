import { randomUUID } from "crypto";
import { db } from "@/db";
import { checks } from "./checks";
import { getDemoFindings } from "./demo";
import { getAppToken, isLiveConfigured } from "./graph";
import { scoreFindings } from "./score";
import type { FindingDraft } from "./types";

/** Run a scan for a connection, persist scan + findings, return the scan id. */
export async function runScan(connectionId: string): Promise<string> {
  const conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("id", "=", connectionId)
    .executeTakeFirst();

  if (!conn) throw new Error("Connection not found");

  const scanId = randomUUID();
  await db
    .insertInto("scan")
    .values({ id: scanId, connection_id: connectionId, status: "running" })
    .execute();

  try {
    let drafts: FindingDraft[];

    if (conn.mode === "demo" || !isLiveConfigured() || !conn.tenant_id) {
      drafts = getDemoFindings();
    } else {
      const token = await getAppToken(conn.tenant_id);
      const ctx = { tenantId: conn.tenant_id, token };
      drafts = [];
      for (const check of checks) {
        try {
          drafts.push(...(await check.run(ctx)));
        } catch (err) {
          console.error(`[scan] check failed: ${check.id}`, err);
        }
      }
    }

    const { overall, categoryScores } = scoreFindings(drafts);

    if (drafts.length > 0) {
      await db
        .insertInto("finding")
        .values(
          drafts.map((d) => ({
            id: randomUUID(),
            scan_id: scanId,
            category: d.category,
            check_id: d.checkId,
            severity: d.severity,
            title: d.title,
            description: d.description,
            impact: d.impact ? JSON.stringify(d.impact) : null,
            remediation: d.remediation,
            entity_ref: d.entityRef ?? null,
          })),
        )
        .execute();
    }

    await db
      .updateTable("scan")
      .set({
        status: "complete",
        score: overall,
        category_scores: JSON.stringify(categoryScores),
        completed_at: new Date().toISOString(),
      })
      .where("id", "=", scanId)
      .execute();

    return scanId;
  } catch (err) {
    await db
      .updateTable("scan")
      .set({
        status: "failed",
        error: String(err),
        completed_at: new Date().toISOString(),
      })
      .where("id", "=", scanId)
      .execute();
    throw err;
  }
}
