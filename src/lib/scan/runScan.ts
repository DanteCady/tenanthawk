import { randomUUID } from "crypto";
import { db } from "@/db";
import { enrichConnectionProfile } from "@/lib/connect/enrichConnection";
import { invalidateConnectionHealth } from "@/lib/connect/health";
import { fireMarketingWebhook } from "@/lib/marketing/webhook";
import { captureServerEvent } from "@/lib/analytics/server";
import { parseLicensePricing } from "@/lib/licenses/pricing-overrides";
import { captureJournal } from "@/lib/journal/capture";
import { checks } from "./checks";
import { offeredCheckDefinitions } from "./checks/registry";
import { buildDeepScanPrefetch } from "./deep-prefetch";
import { getDemoFindings } from "./demo";
import { shouldRunCheck, skipReasonForCheck } from "./check-tier";
import { reconcileAcceptedFindingsOnScan } from "@/lib/findings/reconcile";
import { getAppToken, isLiveConfigured } from "./graph";
import { buildScanPrefetch } from "./prefetch";
import { fetchReportSettings, resolveReportConcealmentForScan } from "./report-settings";
import { scoreFindings } from "./score";
import type { FindingDraft, ScanCheckRunResult, ScanContext, ScanMode } from "./types";

const SCORE_VERSION = 2;

const COMPOSITE_CHECK_IDS = new Set(["copilot.readiness-blockers"]);

async function runCheck(
  check: (typeof checks)[number],
  ctx: ScanContext,
): Promise<{ findings: FindingDraft[]; run: ScanCheckRunResult }> {
  const scanMode = ctx.scanMode ?? "standard";
  const skipReason = skipReasonForCheck(check.id, scanMode);
  if (skipReason) {
    return {
      findings: [],
      run: { id: check.id, status: "skipped", reason: skipReason },
    };
  }

  try {
    const findings = await check.run(ctx);
    return { findings, run: { id: check.id, status: "ok" } };
  } catch (err) {
    console.error(`[scan] check failed: ${check.id}`, err);
    return {
      findings: [],
      run: {
        id: check.id,
        status: "error",
        reason: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

async function runChecksParallel(
  ctx: ScanContext,
): Promise<{ drafts: FindingDraft[]; checkRuns: ScanCheckRunResult[] }> {
  const primaryChecks = checks.filter((check) => !COMPOSITE_CHECK_IDS.has(check.id));
  const compositeChecks = checks.filter((check) => COMPOSITE_CHECK_IDS.has(check.id));

  const drafts: FindingDraft[] = [];
  const checkRuns: ScanCheckRunResult[] = [];

  const primaryResults = await Promise.all(primaryChecks.map((check) => runCheck(check, ctx)));
  for (const result of primaryResults) {
    drafts.push(...result.findings);
    checkRuns.push(result.run);
  }

  for (const check of compositeChecks) {
    const result = await runCheck(check, { ...ctx, priorFindings: drafts });
    drafts.push(...result.findings);
    checkRuns.push(result.run);
  }

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
      drafts = getDemoFindings(scanMode);
      checkRuns = checks.map((check) => ({
        id: check.id,
        status: shouldRunCheck(check.id, scanMode) ? ("ok" as const) : ("skipped" as const),
        ...(shouldRunCheck(check.id, scanMode)
          ? {}
          : { reason: "Requires deep scan" }),
      }));
    } else {
      const token = await getAppToken(conn.tenant_id);
      graphToken = token;
      const licensePricing = parseLicensePricing(conn.license_pricing);
      const [prefetch, graphReportSettings] = await Promise.all([
        buildScanPrefetch(token),
        fetchReportSettings(token),
      ]);
      const deepPrefetch =
        scanMode === "deep"
          ? await buildDeepScanPrefetch(token, prefetch)
          : undefined;
      reportConcealment = resolveReportConcealmentForScan(prefetch, graphReportSettings);
      const result = await runChecksParallel({
        tenantId: conn.tenant_id,
        token,
        licensePricing,
        prefetch,
        deepPrefetch,
        scanMode,
      });
      drafts = result.drafts;
      checkRuns = result.checkRuns;
    }

    await reconcileAcceptedFindingsOnScan(connectionId, drafts);

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

    captureServerEvent(conn.user_id, "scan_completed", {
      connection_id: connectionId,
      scan_id: scanId,
      score: overall,
      source: options?.source ?? "manual",
      mode: graphToken ? "live" : "demo",
      finding_count: drafts.length,
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
