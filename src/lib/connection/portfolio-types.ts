export interface ClientPortfolioRow {
  id: string;
  label: string;
  mode: "live" | "demo";
  score: number | null;
  grade: string | null;
  openHigh: number;
  recoverableUsd: number;
  lastScanAt: Date | null;
  stale: boolean;
  healthStatus: string | null;
}
