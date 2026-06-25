import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { getUserWebhooks } from "@/lib/alerts/webhooks";
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

  let body: {
    webhookUrl?: unknown;
    webhookPlatformOverride?: unknown;
    testWebhookId?: unknown;
  } = {};
  try {
    const raw = await req.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const platformOverride =
    typeof body.webhookPlatformOverride === "string" &&
    PLATFORM_OVERRIDES.has(body.webhookPlatformOverride as WebhookPlatformOverride)
      ? (body.webhookPlatformOverride as WebhookPlatformOverride)
      : "auto";

  const emailOk = session.user.email
    ? await sendTestEmail(session.user.email)
    : false;

  let webhookOk: boolean | null = null;
  let webhookPlatform = null;

  const savedWebhooks = await getUserWebhooks(session.user.id);
  const testWebhookId =
    typeof body.testWebhookId === "string" ? body.testWebhookId : null;

  const webhookRaw =
    typeof body.webhookUrl === "string" ? body.webhookUrl.trim() : "";

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
    webhookPlatform = resolveWebhookPlatform(parsed, platformOverride);
    webhookOk = await sendTestWebhook(parsed, webhookPlatform);
  } else if (testWebhookId) {
    const hook = savedWebhooks.find((w) => w.id === testWebhookId);
    if (!hook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }
    webhookPlatform = hook.platform;
    webhookOk = await sendTestWebhook(hook.url, hook.platform);
  } else if (savedWebhooks.length > 0) {
    for (const hook of savedWebhooks) {
      const ok = await sendTestWebhook(hook.url, hook.platform);
      if (ok) {
        webhookOk = true;
        webhookPlatform = hook.platform;
      } else if (webhookOk === null) {
        webhookOk = false;
      }
    }
  }

  if (!emailOk && webhookOk !== true) {
    return NextResponse.json(
      {
        error:
          webhookOk === false
            ? "Webhook delivery failed. Check the URL and try again."
            : "Test alert could not be delivered.",
        email: emailOk,
        webhook: webhookOk,
      },
      { status: 502 },
    );
  }

  if (webhookOk === false) {
    return NextResponse.json(
      {
        error: "Email sent, but webhook delivery failed.",
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
    webhooksSent: webhookOk ? savedWebhooks.length || (webhookRaw ? 1 : 0) : 0,
  });
}
