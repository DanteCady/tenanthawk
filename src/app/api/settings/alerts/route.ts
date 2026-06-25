import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getAlertPreferences,
  upsertAlertPreferences,
} from "@/lib/alerts/preferences";
import { parseWebhookUrl } from "@/lib/webhooks/validate";
import {
  WEBHOOK_PLATFORM_OPTIONS,
  type WebhookPlatformOverride,
} from "@/lib/webhooks/platform";
import type { InstantAlertMode } from "@/db/types";

export const runtime = "nodejs";

const MODES: InstantAlertMode[] = ["high", "any", "off"];
const PLATFORM_OVERRIDES = new Set(
  WEBHOOK_PLATFORM_OPTIONS.map((o) => o.value),
);

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getAlertPreferences(session.user.id);
  return NextResponse.json({ ...prefs, isPro: await isPro(session.user.id) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  let body: {
    instantAlerts?: unknown;
    weeklyDigest?: unknown;
    webhookUrl?: unknown;
    webhookPlatformOverride?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const instantAlerts = body.instantAlerts;
  const weeklyDigest = body.weeklyDigest;
  const webhookRaw = body.webhookUrl;
  const platformOverride = body.webhookPlatformOverride;

  if (typeof instantAlerts !== "string" || !MODES.includes(instantAlerts as InstantAlertMode)) {
    return NextResponse.json({ error: "Invalid instantAlerts" }, { status: 400 });
  }

  if (typeof weeklyDigest !== "boolean") {
    return NextResponse.json({ error: "Invalid weeklyDigest" }, { status: 400 });
  }

  if (webhookRaw != null && typeof webhookRaw !== "string") {
    return NextResponse.json({ error: "Invalid webhookUrl" }, { status: 400 });
  }

  if (
    platformOverride != null &&
    (typeof platformOverride !== "string" ||
      !PLATFORM_OVERRIDES.has(platformOverride as WebhookPlatformOverride))
  ) {
    return NextResponse.json({ error: "Invalid webhookPlatformOverride" }, { status: 400 });
  }

  const webhookUrl =
    typeof webhookRaw === "string" ? parseWebhookUrl(webhookRaw) : null;

  if (typeof webhookRaw === "string" && webhookRaw.trim() && !webhookUrl) {
    return NextResponse.json(
      {
        error:
          "Invalid webhook URL. Use an HTTPS Slack, Microsoft Teams, or Discord incoming webhook.",
      },
      { status: 400 },
    );
  }

  await upsertAlertPreferences(session.user.id, {
    instantAlerts: instantAlerts as InstantAlertMode,
    weeklyDigest,
    webhookUrl,
    webhookPlatformOverride:
      typeof platformOverride === "string"
        ? (platformOverride as WebhookPlatformOverride)
        : "auto",
  });

  const saved = await getAlertPreferences(session.user.id);
  return NextResponse.json({ ok: true, webhookPlatform: saved.webhookPlatform });
}
