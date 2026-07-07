import {
  isNullReportId,
  isObfuscatedReportToken,
} from "./sharepoint-site-label";

const GB = 1024 ** 3;
const MB = 1024 ** 2;

export interface MailboxUsageRow {
  reportMailboxKey: string;
  userPrincipalName: string;
  displayName: string;
  lastActivityDate: string | null;
  storageUsedBytes: number;
  itemCount: number;
  hasArchive: boolean;
  isDeleted: boolean;
  isObfuscated: boolean;
}

export type MailboxLabelContext = "inactive" | "storage" | "default";

function formatStorageSize(bytes: number): string {
  if (bytes >= GB) {
    const gb = bytes / GB;
    return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1)} GB`;
  }
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`;
  if (bytes > 0) return "<1 MB";
  return "0 GB";
}

function formatItemCount(count: number): string {
  if (count >= 10_000) return `${Math.round(count / 1000)}k items`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k items`;
  return `${count} items`;
}

function formatActivityClause(lastActivityDate: string | null): string {
  if (!lastActivityDate) return "no activity on record";
  return `last active ${lastActivityDate}`;
}

function obfuscatedMailboxLabel(
  row: MailboxUsageRow,
  context: MailboxLabelContext,
): string {
  const storage = formatStorageSize(row.storageUsedBytes);
  const items = formatItemCount(row.itemCount);
  const activity = formatActivityClause(row.lastActivityDate);
  const archive = row.hasArchive ? " · archive enabled" : "";

  if (context === "inactive") {
    return `Inactive mailbox · ${storage} · ${activity}`;
  }
  if (context === "storage") {
    return `Mailbox · ${storage} · ${items}${archive}`;
  }
  return `Mailbox · ${storage} · ${activity}`;
}

export function parseMailboxUsageRow(row: Record<string, unknown>): MailboxUsageRow | null {
  const upn = String(row["User Principal Name"] ?? row.userPrincipalName ?? "").trim();
  const display = String(row["Display Name"] ?? row.displayName ?? "").trim();
  if (!upn && !display) return null;

  const isDeleted = String(row["Is Deleted"] ?? row.isDeleted ?? "")
    .trim()
    .toLowerCase();
  const lastActivity =
    String(row["Last Activity Date"] ?? row.lastActivityDate ?? "").trim() || null;

  const storageRaw = String(row["Storage Used (Byte)"] ?? row.storageUsedInBytes ?? "0");
  const storage = parseInt(storageRaw, 10);

  const obfuscated =
    isObfuscatedReportToken(upn) ||
    isObfuscatedReportToken(display) ||
    isNullReportId(upn);

  const reportMailboxKey = obfuscated
    ? display || upn
    : upn || display;

  return {
    reportMailboxKey,
    userPrincipalName: obfuscated ? "" : upn,
    displayName: obfuscated ? "" : display,
    lastActivityDate: lastActivity,
    storageUsedBytes: Number.isFinite(storage) ? storage : 0,
    itemCount: parseInt(String(row["Item Count"] ?? row.itemCount ?? "0"), 10) || 0,
    hasArchive: String(row["Has Archive"] ?? row.hasArchive ?? "")
      .trim()
      .toLowerCase() === "true",
    isDeleted: isDeleted === "true" || isDeleted === "yes",
    isObfuscated: obfuscated,
  };
}

export function dedupeMailboxRows(rows: MailboxUsageRow[]): MailboxUsageRow[] {
  const byKey = new Map<string, MailboxUsageRow>();
  for (const row of rows) {
    const key = row.reportMailboxKey.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, row);
  }
  return [...byKey.values()];
}

export function mailboxUsageLabel(
  row: MailboxUsageRow,
  context: MailboxLabelContext = "default",
): string {
  if (!row.isObfuscated) {
    return row.displayName || row.userPrincipalName || "Unknown mailbox";
  }
  return obfuscatedMailboxLabel(row, context);
}

const LEGACY_OBFUSCATED_MAILBOX = /^Mailbox \([0-9A-F]{6,12}…\)$/i;

export function formatMailboxEntityLabel(entity: string): string {
  const value = entity.trim();
  if (!value) return "Unknown mailbox";
  if (value.includes("@")) return value;
  if (LEGACY_OBFUSCATED_MAILBOX.test(value) || isObfuscatedReportToken(value)) {
    return "Mailbox (identity hidden in usage report)";
  }
  return value;
}

export function isReportObfuscated(rows: MailboxUsageRow[]): boolean {
  return rows.length > 0 && rows.every((r) => r.isObfuscated);
}
