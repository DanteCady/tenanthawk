import type { ColumnType } from "kysely";

export type Category = "security" | "cost" | "reliability" | "hygiene";
export type Severity = "low" | "medium" | "high";
export type ScanStatus = "running" | "complete" | "failed";

export type CategoryScores = Record<Category, number>;
export type FindingImpact = { usd?: number; count?: number } | null;

// Nullable column with optional insert / nullable update.
type Nullable<T> = ColumnType<T | null, T | null | undefined, T | null>;
// jsonb column: returns parsed T on select, accepts a JSON string on write.
type Json<T> = ColumnType<T, string | null | undefined, string | null>;
// timestamptz with a DB default.
type CreatedAt = ColumnType<Date, string | undefined, never>;
// nullable timestamptz written as an ISO string.
type TimestampNullable = ColumnType<Date | null, string | null | undefined, string | null>;

export interface ConnectionTable {
  id: string;
  user_id: string;
  provider: ColumnType<string, string | undefined, string>;
  tenant_id: Nullable<string>;
  tenant_domain: Nullable<string>;
  display_name: Nullable<string>;
  mode: ColumnType<"live" | "demo", "live" | "demo" | undefined, "live" | "demo">;
  status: ColumnType<
    "active" | "pending" | "error",
    "active" | "pending" | "error" | undefined,
    "active" | "pending" | "error"
  >;
  created_at: CreatedAt;
}

export interface ScanTable {
  id: string;
  connection_id: string;
  status: ColumnType<ScanStatus, ScanStatus | undefined, ScanStatus>;
  score: Nullable<number>;
  category_scores: Json<CategoryScores | null>;
  started_at: CreatedAt;
  completed_at: TimestampNullable;
  error: Nullable<string>;
}

export interface FindingTable {
  id: string;
  scan_id: string;
  category: Category;
  check_id: string;
  severity: Severity;
  title: string;
  description: string;
  impact: Json<FindingImpact>;
  remediation: ColumnType<string, string | undefined, string>;
  entity_ref: Nullable<string>;
}

// Read-only view of the Better Auth Stripe plugin's `subscription` table
// (camelCase columns created by the plugin).
export interface SubscriptionTable {
  id: string;
  plan: string | null;
  referenceId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string | null;
  periodEnd: ColumnType<Date | null, string | null, string | null>;
}

export interface Database {
  connection: ConnectionTable;
  scan: ScanTable;
  finding: FindingTable;
  subscription: SubscriptionTable;
}
