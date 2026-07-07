import { randomUUID } from "crypto";
import { db } from "@/db";
import { enrichConnectionProfile } from "@/lib/connect/enrichConnection";
import { invalidateConnectionHealth } from "@/lib/connect/health";
import { fireMarketingWebhook } from "@/lib/marketing/webhook";
import { parseLicensePricing } from "@/lib/licenses/pricing-overrides";
import { captureJournal } from "@/lib/journal/capture";
import { checks } from "./checks";
import { offeredCheckDefinitions } from "./checks/registry";
import { getDemoFindings } from "./demo";
import { getAppToken, isLiveConfigured } from "./graph";
import { buildScanPrefetch } from "./prefetch";
import { fetchReportSettings, resolveReportConcealmentForScan } from "./report-settings";
import { scoreFindings } from "./score";
import type { FindingDraft, ScanCheckRunResult, ScanMode } from "./types";

const SCORE_VERSION = 2;

async function runChecksParallel(
  ctx: {
    tenantId: string;
    token: string;
    licensePricing?: ReturnType<typeof parseLicensePricing>;
    prefetch?: Awaited<ReturnType<typeof buildScanPrefetch>>;
    scanMode: ScanMode;
  },
): Promise<{ drafts: FindingDraft[]; checkRuns: ScanCheckRunResult[] }> {
  const drafts: FindingDraft[] = [];
  const checkRuns: ScanCheckRunResult[] = [];

  await Promise.all(
    checks.map(async (check) => {
      try {
        const findings = await check.run(ctx);
        drafts.push(...findings);
        checkRuns.push({ id: check.id, status: "ok" });
      } catch (err) {
        console.error(`[scan] check failed: ${check.id}`, err);
        checkRuns.push({
          id: check.id,
          status: "error",
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }),
  );

  return { drafts, checkRuns };
}

/** Run a scan for a connection, persist scan + findings, return the scan id. */
export async function runScan(
  connectionId: string,
  options?: { source?: "manual" | "scheduled"; scanMode?: ScanMode },
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

  const scanMode: ScanMode = options?.scanMode ?? "standard";

  const scanId = randomUUID();
  await db
    .insertInto("scan")
    .values({
      id: scanId,
      connection_id: connectionId,
      status: "running",
      source: options?.source ?? "manual",
      scan_mode: scanMode,
      score_version: SCORE_VERSION,
    })
    .execute();

  try {
    let drafts: FindingDraft[];
    let checkRuns: ScanCheckRunResult[] = [];
    let graphToken: string | null = null;
    let reportConcealment: ReturnType<typeof resolveReportConcealmentForScan> = {
      reportDisplayConcealedNames: null,
      reportSettingsReadable: false,
    };

    if (conn.mode === "demo" || !isLiveConfigured() || !conn.tenant_id) {
      drafts = getDemoFindings();
      checkRuns = checks.map((c) => ({ id: c.id, status: "ok" as const }));
    } else {
      const token = await getAppToken(conn.tenant_id);
      graphToken = token;
      const licensePricing = parseLicensePricing(conn.license_pricing);
      const [prefetch, graphReportSettings] = await Promise.all([
        buildScanPrefetch(token),
        fetchReportSettings(token),
      ]);
      reportConcealment = resolveReportConcealmentForScan(prefetch, graphReportSettings);
      const result = await runChecksParallel({
        tenantId: conn.tenant_id,
        token,
        licensePricing,
        prefetch,
        scanMode,
      });
      drafts = result.drafts;
      checkRuns = result.checkRuns;
    }

    const coverageNotes = {
      sectors: [...new Set(offeredCheckDefinitions().map((d) => d.sector))],
      offeredChecks: offeredCheckDefinitions().length,
      scanMode,
      reportDisplayConcealedNames: reportConcealment.reportDisplayConcealedNames,
      reportSettingsReadable: reportConcealment.reportSettingsReadable,
    };

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
        checks_run: JSON.stringify(checkRuns),
        coverage_notes: JSON.stringify(coverageNotes),
      })
      .where("id", "=", scanId)
      .execute();

    // Journal capture rides along with every scan. It must never fail the
    // scan itself, and it runs on all plans - history can't be backfilled,
    // so a user who upgrades later still has their timeline.
    try {
      await captureJournal({
        connectionId,
        mode: graphToken ? "live" : "demo",
        token: graphToken ?? undefined,
      });
    } catch (err) {
      console.error("[scan] journal capture failed", err);
    }

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
