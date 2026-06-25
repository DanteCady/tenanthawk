import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { getAlertPreferences } from "@/lib/alerts/preferences";
import { parseWebhookUrl } from "@/lib/webhooks/validate";
import { sendTestWebhook } from "@/lib/webhooks/send";
import { sendTestEmail } from "@/lib/email/send";
import {
  resolveWebhookPlatform,
  WEBHOOK_PLATFORM_OPTIONS,
  type WebhookPlatformOverride,
} from "@/lib/webhooks/platform";

export const runtime = "nodejs";

const PLATFORM_OVERRIDES = new Set(
  WEBHOOK_PLATFORM_OPTIONS.map((o) => o.value),
);

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  let body: { webhookUrl?: unknown; webhookPlatformOverride?: unknown } = {};
  try {
    const raw = await req.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const webhookRaw =
    typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : "";

  const platformOverride =
    typeof body.webhookPlatformOverride === "string" &&
    PLATFORM_OVERRIDES.has(body.webhookPlatformOverride as WebhookPlatformOverride)
      ? (body.webhookPlatformOverride as WebhookPlatformOverride)
      : "auto";

  if (webhookRaw) {
    const parsed = parseWebhookUrl(webhookRaw);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Invalid webhook URL. Use an HTTPS Slack, Microsoft Teams, or Discord incoming webhook.",
        },
        { status: 400 },
      );
    }
  }

  const prefs = await getAlertPreferences(session.user.id);
  const webhookTarget =
    (webhookRaw ? parseWebhookUrl(webhookRaw) : null) ?? prefs.webhookUrl;

  const webhookPlatform = webhookTarget
    ? resolveWebhookPlatform(webhookTarget, platformOverride)
    : null;

  const emailOk = session.user.email
    ? await sendTestEmail(session.user.email)
    : false;

  let webhookOk: boolean | null = null;
  if (webhookTarget) {
    webhookOk = await sendTestWebhook(webhookTarget, webhookPlatform);
  }

  const failures: string[] = [];
  if (!emailOk) failures.push("email");
  if (webhookOk === false) failures.push("webhook");

  if (failures.length > 0 && !emailOk && webhookOk !== true) {
    return NextResponse.json(
      {
        error:
          failures.length === 1 && failures[0] === "webhook"
            ? "Webhook delivery failed. Check the URL and try again."
            : "Test alert could not be delivered. Check your email and webhook settings.",
        email: emailOk,
        webhook: webhookOk,
      },
      { status: 502 },
    );
  }

  if (webhookOk === false) {
    return NextResponse.json(
      {
        error: "Email sent, but webhook delivery failed. Check the URL.",
        email: emailOk,
        webhook: false,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    email: emailOk,
    webhook: webhookOk,
    webhookPlatform,
  });
}
