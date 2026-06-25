import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { parseWebhookUrl } from "@/lib/webhooks/validate";
import { sendTestWebhook } from "@/lib/webhooks/send";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  let body: { webhookUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.webhookUrl !== "string") {
    return NextResponse.json({ error: "webhookUrl required" }, { status: 400 });
  }

  const webhookUrl = parseWebhookUrl(body.webhookUrl);
  if (!webhookUrl) {
    return NextResponse.json(
      {
        error:
          "Invalid webhook URL. Use an HTTPS Slack or Microsoft Teams incoming webhook.",
      },
      { status: 400 },
    );
  }

  const ok = await sendTestWebhook(webhookUrl);
  if (!ok) {
    return NextResponse.json(
      { error: "Webhook delivery failed. Check the URL and try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
