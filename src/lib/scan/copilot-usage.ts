import { isObfuscatedReportToken } from "./sharepoint-site-label";

const M365_APP_ACTIVITY_FIELDS = [
  "Microsoft Teams Copilot Last Activity Date",
  "Word Copilot Last Activity Date",
  "Excel Copilot Last Activity Date",
  "PowerPoint Copilot Last Activity Date",
  "Outlook Copilot Last Activity Date",
  "OneNote Copilot Last Activity Date",
  "Loop Copilot Last Activity Date",
  "microsoftTeamsCopilotLastActivityDate",
  "wordCopilotLastActivityDate",
  "excelCopilotLastActivityDate",
  "powerPointCopilotLastActivityDate",
  "outlookCopilotLastActivityDate",
  "oneNoteCopilotLastActivityDate",
  "loopCopilotLastActivityDate",
] as const;

export interface CopilotUsageRow {
  userPrincipalName: string;
  displayName: string;
  lastActivityDate: string | null;
  hasAnyActivity: boolean;
  hasChatActivity: boolean;
  hasM365AppActivity: boolean;
  isObfuscated: boolean;
}

function fieldValue(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = String(row[key] ?? "").trim();
    if (value) return value;
  }
  return "";
}

function hasActivity(value: string): boolean {
  return Boolean(value && value.toLowerCase() !== "null");
}

export function parseCopilotUsageRow(row: Record<string, unknown>): CopilotUsageRow | null {
  const upn = fieldValue(row, "User Principal Name", "userPrincipalName");
  const display = fieldValue(row, "Display Name", "displayName");
  if (!upn && !display) return null;

  const lastActivity = fieldValue(row, "Last Activity Date", "lastActivityDate") || null;
  const chatActivity =
    fieldValue(row, "Copilot Chat Last Activity Date", "copilotChatLastActivityDate");

  const m365Activity = M365_APP_ACTIVITY_FIELDS.some((field) =>
    hasActivity(String(row[field] ?? "")),
  );

  const obfuscated =
    isObfuscatedReportToken(upn) || isObfuscatedReportToken(display);

  const hasChat = hasActivity(chatActivity);
  const hasAny = hasActivity(lastActivity ?? "") || hasChat || m365Activity;

  return {
    userPrincipalName: obfuscated ? "" : upn,
    displayName: obfuscated ? "" : display,
    lastActivityDate: lastActivity,
    hasAnyActivity: hasAny,
    hasChatActivity: hasChat,
    hasM365AppActivity: m365Activity,
    isObfuscated: obfuscated,
  };
}

export function copilotUsageLabel(row: CopilotUsageRow): string {
  return row.displayName || row.userPrincipalName || "Unknown user";
}

export function isCopilotUsageObfuscated(rows: CopilotUsageRow[]): boolean {
  return rows.length > 0 && rows.every((row) => row.isObfuscated);
}
