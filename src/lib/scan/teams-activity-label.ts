import type { TeamsActivityRow } from "./prefetch";
import {
  abbreviateReportToken,
  isNullReportId,
  isObfuscatedReportToken,
} from "./sharepoint-site-label";

const TEAM_TYPE_LABELS: Record<string, string> = {
  Public: "Public team",
  Private: "Private team",
  Shared: "Shared team",
};

export function teamsTeamTypeLabel(teamType: string | undefined): string {
  const t = teamType?.trim();
  if (!t) return "Microsoft Team";
  return TEAM_TYPE_LABELS[t] ?? `${t} team`;
}

/** Human-readable label for a Teams activity report row. */
export function teamsActivityLabel(row: TeamsActivityRow): string {
  if (row.displayName && !isObfuscatedReportToken(row.displayName)) {
    return row.displayName;
  }

  if (row.reportTeamKey && isObfuscatedReportToken(row.reportTeamKey)) {
    return `${teamsTeamTypeLabel(row.teamType)} (${abbreviateReportToken(row.reportTeamKey)})`;
  }

  return row.displayName || row.reportTeamKey || "Unknown Team";
}

/** Format a stored entity string for display (handles legacy raw hex rows). */
export function formatTeamsEntityLabel(entity: string): string {
  const value = entity.trim();
  if (!value) return "Unknown Team";

  if (isObfuscatedReportToken(value)) {
    return `Microsoft Team (${abbreviateReportToken(value)})`;
  }

  return value;
}

export function dedupeTeamsActivity(rows: TeamsActivityRow[]): TeamsActivityRow[] {
  const byKey = new Map<string, TeamsActivityRow>();

  for (const row of rows) {
    const key = [row.reportTeamKey, row.teamType ?? ""].join("|").toLowerCase();
    if (!byKey.has(key)) byKey.set(key, row);
  }

  return [...byKey.values()];
}

export function parseTeamsActivityRow(row: Record<string, unknown>): TeamsActivityRow | null {
  const teamId = String(row["Team Id"] ?? row.teamId ?? "").trim();
  const teamNameRaw = String(row["Team Name"] ?? row.teamName ?? "").trim();
  const teamType = String(row["Team Type"] ?? row.teamType ?? "").trim();

  if (!teamId && !teamNameRaw) return null;

  const obfuscated = isNullReportId(teamId) && isObfuscatedReportToken(teamNameRaw);
  const reportTeamKey = obfuscated ? teamNameRaw : teamId || teamNameRaw;
  const displayName = obfuscated ? "" : teamNameRaw;

  const lastActivity =
    String(row["Last Activity Date"] ?? row.lastActivityDate ?? "").trim() || null;

  const parseCount = (v: unknown) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? n : 0;
  };

  const isDeleted = String(row["Is Deleted"] ?? row.isDeleted ?? "")
    .trim()
    .toLowerCase();

  return {
    teamId: teamId || reportTeamKey,
    reportTeamKey,
    displayName,
    teamType,
    lastActivityDate: lastActivity,
    activeChannels: parseCount(row["Active Channels"] ?? row.activeChannels),
    guests: parseCount(row.Guests ?? row.guests),
    isDeleted: isDeleted === "true" || isDeleted === "yes",
  };
}
