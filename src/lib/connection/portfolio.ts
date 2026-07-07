import "server-only";
import { getConnectionHealth } from "@/lib/connect/health";
import { connectionLabel } from "@/lib/connection/label";
import { grade } from "@/lib/scan/score";
import { summarize } from "@/lib/summary";
import { getConnections, getFindings, getLatestScan } from "@/lib/queries";
import { reportConcealmentFromCoverageNotes } from "@/lib/scan/report-settings.shared";

import type { ClientPortfolioRow } from "@/lib/connection/portfolio-types";

export type { ClientPortfolioRow } from "@/lib/connection/portfolio-types";

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

export async function getClientPortfolio(userId: string): Promise<ClientPortfolioRow[]> {
  const connections = await getConnections(userId);
  const now = Date.now();

  const rows = await Promise.all(
    connections.map(async (conn) => {
      const scan = await getLatestScan(conn.id);
      const findings = scan ? await getFindings(scan.id) : [];
      const summary = scan ? summarize(findings, scan.category_scores) : null;
      const health = await getConnectionHealth(conn);
      const lastScanAt = scan?.started_at ? new Date(scan.started_at) : null;
      const reportConcealment = reportConcealmentFromCoverageNotes(scan?.coverage_notes);

      return {
        id: conn.id,
        label: connectionLabel(conn),
        mode: conn.mode,
        score: scan?.score ?? null,
        grade: scan?.score != null ? grade(scan.score) : null,
        openHigh: summary?.high ?? 0,
        recoverableUsd: summary?.usd ?? 0,
        lastScanAt,
        stale: !lastScanAt || now - lastScanAt.getTime() > STALE_MS,
        healthStatus: health.status,
        reportNamesConcealed:
          reportConcealment.state === "concealed"
            ? true
            : reportConcealment.state === "visible"
              ? false
              : null,
      };
    }),
  );

  return rows.sort((a, b) => {
    const scoreA = a.score ?? 101;
    const scoreB = b.score ?? 101;
    if (scoreA !== scoreB) return scoreA - scoreB;
    if (a.openHigh !== b.openHigh) return b.openHigh - a.openHigh;
    return b.recoverableUsd - a.recoverableUsd;
  });
}
