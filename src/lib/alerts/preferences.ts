import "server-only";
import { db } from "@/db";
import type { InstantAlertMode } from "@/db/types";
import { parseWebhookUrl } from "@/lib/webhooks/validate";
import {
  resolveWebhookPlatform,
  type WebhookPlatformOverride,
} from "@/lib/webhooks/platform";

export interface AlertPreferences {
  instantAlerts: InstantAlertMode;
  weeklyDigest: boolean;
  webhookUrl: string | null;
  webhookPlatform: ReturnType<typeof resolveWebhookPlatform> | null;
}

const DEFAULTS: AlertPreferences = {
  instantAlerts: "high",
  weeklyDigest: true,
  webhookUrl: null,
  webhookPlatform: null,
};

export async function getAlertPreferences(userId: string): Promise<AlertPreferences> {
  const row = await db
    .selectFrom("alert_preferences")
    .select(["instant_alerts", "weekly_digest", "webhook_url", "webhook_platform"])
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!row) return DEFAULTS;

  return {
    instantAlerts: row.instant_alerts,
    weeklyDigest: row.weekly_digest,
    webhookUrl: row.webhook_url,
    webhookPlatform: row.webhook_platform,
  };
}

export async function upsertAlertPreferences(
  userId: string,
  prefs: {
    instantAlerts: InstantAlertMode;
    weeklyDigest: boolean;
    webhookUrl: string | null;
    webhookPlatformOverride?: WebhookPlatformOverride;
  },
): Promise<void> {
  const webhookUrl = parseWebhookUrl(prefs.webhookUrl);
  const webhookPlatform = webhookUrl
    ? resolveWebhookPlatform(webhookUrl, prefs.webhookPlatformOverride ?? "auto")
    : null;

  await db
    .insertInto("alert_preferences")
    .values({
      user_id: userId,
      instant_alerts: prefs.instantAlerts,
      weekly_digest: prefs.weeklyDigest,
      webhook_url: webhookUrl,
      webhook_platform: webhookPlatform,
      updated_at: new Date().toISOString(),
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        instant_alerts: prefs.instantAlerts,
        weekly_digest: prefs.weeklyDigest,
        webhook_url: webhookUrl,
        webhook_platform: webhookPlatform,
        updated_at: new Date().toISOString(),
      }),
    )
    .execute();
}
