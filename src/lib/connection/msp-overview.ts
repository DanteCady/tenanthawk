import "server-only";
import type { ClientPortfolioRow } from "@/lib/connection/portfolio-types";
import { getClientPortfolio } from "@/lib/connection/portfolio";

export interface MspOverviewSnapshot {
  clientCount: number;
  avgScore: number | null;
  totalOpenHigh: number;
  totalRecoverableUsd: number;
  staleCount: number;
  unhealthyCount: number;
  attentionClients: ClientPortfolioRow[];
  portfolio: ClientPortfolioRow[];
}

export async function getMspOverview(userId: string): Promise<MspOverviewSnapshot> {
  const portfolio = await getClientPortfolio(userId);
  const scored = portfolio.filter((c) => c.score != null);
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, c) => sum + (c.score ?? 0), 0) / scored.length)
      : null;

  const attentionClients = portfolio.filter(
    (c) =>
      c.stale ||
      (c.score != null && c.score < 70) ||
      c.openHigh > 0 ||
      c.healthStatus === "app_removed" ||
      c.healthStatus === "consent_revoked",
  );

  return {
    clientCount: portfolio.length,
    avgScore,
    totalOpenHigh: portfolio.reduce((sum, c) => sum + c.openHigh, 0),
    totalRecoverableUsd: portfolio.reduce((sum, c) => sum + c.recoverableUsd, 0),
    staleCount: portfolio.filter((c) => c.stale).length,
    unhealthyCount: portfolio.filter(
      (c) => c.healthStatus === "app_removed" || c.healthStatus === "consent_revoked",
    ).length,
    attentionClients: attentionClients.slice(0, 5),
    portfolio,
  };
}
