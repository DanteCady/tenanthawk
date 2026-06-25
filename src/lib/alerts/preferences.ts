import "server-only";
import { db } from "@/db";
import type { InstantAlertMode } from "@/db/types";

export interface AlertPreferences {
  instantAlerts: InstantAlertMode;
  weeklyDigest: boolean;
}

const DEFAULTS: AlertPreferences = {
  instantAlerts: "high",
  weeklyDigest: true,
};

export async function getAlertPreferences(userId: string): Promise<AlertPreferences> {
  const row = await db
    .selectFrom("alert_preferences")
    .select(["instant_alerts", "weekly_digest"])
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (!row) return DEFAULTS;

  return {
    instantAlerts: row.instant_alerts,
    weeklyDigest: row.weekly_digest,
  };
}

export async function upsertAlertPreferences(
  userId: string,
  prefs: AlertPreferences,
): Promise<void> {
  await db
    .insertInto("alert_preferences")
    .values({
      user_id: userId,
      instant_alerts: prefs.instantAlerts,
      weekly_digest: prefs.weeklyDigest,
      updated_at: new Date().toISOString(),
    })
    .onConflict((oc) =>
      oc.column("user_id").doUpdateSet({
        instant_alerts: prefs.instantAlerts,
        weekly_digest: prefs.weeklyDigest,
        updated_at: new Date().toISOString(),
      }),
    )
    .execute();
}
