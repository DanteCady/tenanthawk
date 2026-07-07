import {
  abbreviateReportToken,
  isNullReportId,
  isObfuscatedReportToken,
} from "./sharepoint-site-label";

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

export function mailboxUsageLabel(row: MailboxUsageRow): string {
  if (!row.isObfuscated) {
    return row.displayName || row.userPrincipalName || "Unknown mailbox";
  }
  return `Mailbox (${abbreviateReportToken(row.reportMailboxKey)})`;
}

export function formatMailboxEntityLabel(entity: string): string {
  const value = entity.trim();
  if (!value) return "Unknown mailbox";
  if (value.includes("@")) return value;
  if (isObfuscatedReportToken(value)) {
    return `Mailbox (${abbreviateReportToken(value)})`;
  }
  return value;
}

export function isReportObfuscated(rows: MailboxUsageRow[]): boolean {
  return rows.length > 0 && rows.every((r) => r.isObfuscated);
}
