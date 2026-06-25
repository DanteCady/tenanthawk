import "server-only";
import { randomUUID } from "crypto";
import { db } from "@/db";
import type { WebhookPlatform } from "@/db/types";
import { parseWebhookUrl } from "@/lib/webhooks/validate";
import { resolveWebhookPlatform } from "@/lib/webhooks/platform";

export interface UserWebhook {
  id: string;
  label: string;
  url: string;
  platform: WebhookPlatform;
  createdAt: Date;
}

async function migrateLegacyWebhook(userId: string): Promise<void> {
  const pref = await db
    .selectFrom("alert_preferences")
    .select(["webhook_url", "webhook_platform"])
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!pref?.webhook_url) return;

  const existing = await db
    .selectFrom("alert_webhook")
    .select("id")
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existing) return;

  const url = parseWebhookUrl(pref.webhook_url);
  if (!url) return;

  await db
    .insertInto("alert_webhook")
    .values({
      id: randomUUID(),
      user_id: userId,
      label: "Default",
      url,
      platform: pref.webhook_platform ?? resolveWebhookPlatform(url, "auto"),
      created_at: new Date().toISOString(),
    })
    .execute();

  await db
    .updateTable("alert_preferences")
    .set({ webhook_url: null, webhook_platform: null })
    .where("user_id", "=", userId)
    .execute();
}

export async function getUserWebhooks(userId: string): Promise<UserWebhook[]> {
  await migrateLegacyWebhook(userId);

  const rows = await db
    .selectFrom("alert_webhook")
    .selectAll()
    .where("user_id", "=", userId)
    .orderBy("created_at", "asc")
    .execute();

  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    url: r.url,
    platform: r.platform,
    createdAt: r.created_at,
  }));
}

export async function addUserWebhook(
  userId: string,
  opts: { label: string; url: string; platformOverride?: WebhookPlatform | "auto" },
): Promise<UserWebhook> {
  const url = parseWebhookUrl(opts.url);
  if (!url) throw new Error("INVALID_URL");

  const platform = resolveWebhookPlatform(url, opts.platformOverride ?? "auto");
  const id = randomUUID();
  const label = opts.label.trim() || platformLabelShort(platform);

  await db
    .insertInto("alert_webhook")
    .values({
      id,
      user_id: userId,
      label,
      url,
      platform,
      created_at: new Date().toISOString(),
    })
    .execute();

  return { id, label, url, platform, createdAt: new Date() };
}

export async function deleteUserWebhook(
  userId: string,
  webhookId: string,
): Promise<boolean> {
  const result = await db
    .deleteFrom("alert_webhook")
    .where("id", "=", webhookId)
    .where("user_id", "=", userId)
    .executeTakeFirst();

  return Number(result.numDeletedRows) > 0;
}

function platformLabelShort(platform: WebhookPlatform): string {
  switch (platform) {
    case "slack":
      return "Slack";
    case "teams":
      return "Teams";
    case "discord":
      return "Discord";
    default:
      return "Webhook";
  }
}
