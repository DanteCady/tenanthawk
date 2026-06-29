import { randomUUID } from "crypto";
import { db } from "@/db";
import { enrichConnectionProfile } from "@/lib/connect/enrichConnection";
import { invalidateConnectionHealth } from "@/lib/connect/health";
import { fireMarketingWebhook } from "@/lib/marketing/webhook";
import { parseLicensePricing } from "@/lib/licenses/pricing-overrides";
import { checks } from "./checks";
import { getDemoFindings } from "./demo";
import { getAppToken, isLiveConfigured } from "./graph";
import { scoreFindings } from "./score";
import type { FindingDraft } from "./types";

/** Run a scan for a connection, persist scan + findings, return the scan id. */
export async function runScan(
  connectionId: string,
  options?: { source?: "manual" | "scheduled" },
): Promise<string> {
  const conn = await db
    .selectFrom("connection")
    .selectAll()
    .where("id", "=", connectionId)
    .executeTakeFirst();

  if (!conn) throw new Error("Connection not found");

  if (
    conn.mode === "live" &&
    conn.tenant_id &&
    !conn.tenant_domain &&
    isLiveConfigured()
  ) {
    await enrichConnectionProfile(conn.id, conn.tenant_id);
  }

  invalidateConnectionHealth(connectionId);

  const scanId = randomUUID();
  await db
    .insertInto("scan")
    .values({
      id: scanId,
      connection_id: connectionId,
      status: "running",
      source: options?.source ?? "manual",
    })
    .execute();

  try {
    let drafts: FindingDraft[];

    if (conn.mode === "demo" || !isLiveConfigured() || !conn.tenant_id) {
      drafts = getDemoFindings();
    } else {
      const token = await getAppToken(conn.tenant_id);
      const licensePricing = parseLicensePricing(conn.license_pricing);
      const ctx = { tenantId: conn.tenant_id, token, licensePricing };
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

    await fireMarketingWebhook({
      scanId,
      conn,
      drafts,
      score: overall,
      source: options?.source ?? "manual",
    });

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
