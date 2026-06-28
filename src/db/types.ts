import type { ColumnType } from "kysely";

import type { RemediationEnriched } from "@/lib/remediation/types";

export type Category = "security" | "cost" | "reliability" | "hygiene";
export type Severity = "low" | "medium" | "high";
export type ScanStatus = "running" | "complete" | "failed";

export type CategoryScores = Record<Category, number>;
export type FindingImpact = {
  usd?: number;
  count?: number;
  expiresAt?: string;
  daysUntil?: number;
  entities?: string[];
} | null;

export type FindingTrackingStatus = "resolved" | "snoozed";

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

export type ScanSource = "manual" | "scheduled";

export interface ScanTable {
  id: string;
  connection_id: string;
  status: ColumnType<ScanStatus, ScanStatus | undefined, ScanStatus>;
  score: Nullable<number>;
  category_scores: Json<CategoryScores | null>;
  started_at: CreatedAt;
  completed_at: TimestampNullable;
  error: Nullable<string>;
  source: ColumnType<ScanSource, ScanSource | undefined, ScanSource>;
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
  remediation_enriched: Json<RemediationEnriched | null>;
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

import type { WebhookPlatform } from "@/lib/webhooks/platform";

export type InstantAlertMode = "high" | "any" | "off";

export type { WebhookPlatform };

export interface FindingStatusTable {
  id: string;
  connection_id: string;
  check_id: string;
  entity_ref: ColumnType<string, string | undefined, string>;
  status: FindingTrackingStatus;
  snoozed_until: TimestampNullable;
  note: Nullable<string>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface AlertWebhookTable {
  id: string;
  user_id: string;
  label: ColumnType<string, string | undefined, string>;
  url: string;
  platform: WebhookPlatform;
  created_at: CreatedAt;
}
export interface AlertPreferencesTable {
  user_id: string;
  instant_alerts: ColumnType<
    InstantAlertMode,
    InstantAlertMode | undefined,
    InstantAlertMode
  >;
  weekly_digest: ColumnType<boolean, boolean | undefined, boolean>;
  expiry_alerts: ColumnType<boolean, boolean | undefined, boolean>;
  webhook_url: Nullable<string>;
  webhook_platform: Nullable<WebhookPlatform>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

// Read-only view of Better Auth's `user` table.
export interface UserTable {
  id: string;
  name: string;
  email: string;
}

export interface Database {
  connection: ConnectionTable;
  scan: ScanTable;
  finding: FindingTable;
  finding_status: FindingStatusTable;
  subscription: SubscriptionTable;
  alert_preferences: AlertPreferencesTable;
  alert_webhook: AlertWebhookTable;
  user: UserTable;
}
