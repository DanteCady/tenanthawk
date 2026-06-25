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

CREATE INDEX IF NOT EXISTS finding_scan_id_idx ON finding (scan_id);

-- Pro monitoring: per-user alert preferences (defaults applied in app when row missing).
CREATE TABLE IF NOT EXISTS alert_preferences (
  user_id         text PRIMARY KEY,
  instant_alerts  text NOT NULL DEFAULT 'high',
  weekly_digest   boolean NOT NULL DEFAULT true,
  webhook_url     text,
  webhook_platform text,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Distinguish manual rescans from scheduled cron scans.
ALTER TABLE scan ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

-- Slack / Teams webhook (added after initial alert_preferences table).
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS webhook_url text;
ALTER TABLE alert_preferences ADD COLUMN IF NOT EXISTS webhook_platform text;
