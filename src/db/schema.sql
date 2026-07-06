-- Tenant Hawk app tables (Better Auth tables are managed by @better-auth/cli migrate).
-- Apply: docker compose exec -T db psql -U postgres -d tenanthawk < src/db/schema.sql

CREATE TABLE IF NOT EXISTS connection (
  id            text PRIMARY KEY,
  user_id       text NOT NULL,
  provider      text NOT NULL DEFAULT 'microsoft',
  tenant_id     text,
  tenant_domain text,
  display_name  text,
  mode          text NOT NULL DEFAULT 'demo',
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connection_user_id_idx ON connection (user_id);

CREATE TABLE IF NOT EXISTS scan (
  id              text PRIMARY KEY,
  connection_id   text NOT NULL REFERENCES connection(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'running',
  score           integer,
  category_scores jsonb,
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  error           text
);

CREATE INDEX IF NOT EXISTS scan_connection_id_idx ON scan (connection_id);

CREATE TABLE IF NOT EXISTS finding (
  id          text PRIMARY KEY,
  scan_id     text NOT NULL REFERENCES scan(id) ON DELETE CASCADE,
  category    text NOT NULL,
  check_id    text NOT NULL,
  severity    text NOT NULL,
  title       text NOT NULL,
  description text NOT NULL,
  impact      jsonb,
  remediation text NOT NULL DEFAULT '',
  entity_ref  text
);

ALTER TABLE finding ADD COLUMN IF NOT EXISTS remediation_enriched jsonb;

CREATE INDEX IF NOT EXISTS finding_scan_id_idx ON finding (scan_id);

-- Per-connection remediation state (survives rescans).
CREATE TABLE IF NOT EXISTS finding_status (
  id              text PRIMARY KEY,
  connection_id   text NOT NULL REFERENCES connection(id) ON DELETE CASCADE,
  check_id        text NOT NULL,
  entity_ref      text NOT NULL DEFAULT '',
  status          text NOT NULL,
  snoozed_until   timestamptz,
  note            text,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, check_id, entity_ref)
);

CREATE INDEX IF NOT EXISTS finding_status_connection_id_idx ON finding_status (connection_id);

-- Multiple chat webhooks per user (Slack, Teams, Discord).
CREATE TABLE IF NOT EXISTS alert_webhook (
  id          text PRIMARY KEY,
  user_id     text NOT NULL,
  label       text NOT NULL DEFAULT 'Webhook',
  url         text NOT NULL,
  platform    text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alert_webhook_user_id_idx ON alert_webhook (user_id);

-- Pro monitoring: per-user alert preferences (defaults applied in app when row missing).
CREATE TABLE IF NOT EXISTS alert_preferences (
  user_id         text PRIMARY KEY,
  instant_alerts  text NOT NULL DEFAULT 'high',
  weekly_digest   boolean NOT NULL DEFAULT true,
  expiry_alerts   boolean NOT NULL DEFAULT true,
  webhook_url     text,
  webhook_platform text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Distinguish manual rescans from scheduled cron scans.
ALTER TABLE scan ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

-- Scan engine metadata (coverage expansion).
ALTER TABLE scan ADD COLUMN IF NOT EXISTS scan_mode text NOT NULL DEFAULT 'standard';
ALTER TABLE scan ADD COLUMN IF NOT EXISTS score_version integer NOT NULL DEFAULT 2;
ALTER TABLE scan ADD COLUMN IF NOT EXISTS checks_run jsonb;
ALTER TABLE scan ADD COLUMN IF NOT EXISTS coverage_notes jsonb;

-- Slack / Teams webhook (added after initial alert_preferences table).
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS webhook_url text;
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS webhook_platform text;
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS expiry_alerts boolean NOT NULL DEFAULT true;

-- Pro: shareable read-only report links (tokenized, revocable).
CREATE TABLE IF NOT EXISTS report_share (
  id              text PRIMARY KEY,
  user_id         text NOT NULL,
  connection_id   text NOT NULL REFERENCES connection(id) ON DELETE CASCADE,
  token           text NOT NULL UNIQUE,
  label           text,
  expires_at      timestamptz,
  revoked_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS report_share_token_idx ON report_share (token);
CREATE INDEX IF NOT EXISTS report_share_user_id_idx ON report_share (user_id);

-- Pro: per-tenant contracted license rates for recoverable spend estimates.
ALTER TABLE connection ADD COLUMN IF NOT EXISTS license_pricing jsonb;

-- Journal (Flight Recorder): current config state per tracked object.
-- One row per (connection, object_type, object_id); payload is the latest raw Graph object.
CREATE TABLE IF NOT EXISTS config_snapshot (
  id            text PRIMARY KEY,
  connection_id text NOT NULL REFERENCES connection(id) ON DELETE CASCADE,
  object_type   text NOT NULL,
  object_id     text NOT NULL,
  display_name  text,
  payload       jsonb NOT NULL,
  content_hash  text NOT NULL,
  captured_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connection_id, object_type, object_id)
);

CREATE INDEX IF NOT EXISTS config_snapshot_connection_idx
  ON config_snapshot (connection_id, object_type);

-- Journal: immutable change entries (the timeline). Full before/after payloads
-- are kept so a future "restore" can rebuild any prior state.
CREATE TABLE IF NOT EXISTS config_change (
  id             text PRIMARY KEY,
  connection_id  text NOT NULL REFERENCES connection(id) ON DELETE CASCADE,
  object_type    text NOT NULL,
  object_id      text NOT NULL,
  display_name   text,
  change_type    text NOT NULL, -- created | modified | deleted
  diff           jsonb,         -- [{ path, before, after }] for modified
  before_payload jsonb,
  after_payload  jsonb,
  actor          text,          -- UPN/app from Entra audit log when resolvable
  actor_source   text,          -- 'audit_log' | 'demo'
  detected_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS config_change_connection_idx
  ON config_change (connection_id, detected_at DESC);
