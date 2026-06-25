import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { getUserWebhooks, addUserWebhook, deleteUserWebhook } from "@/lib/alerts/webhooks";
import {
  WEBHOOK_PLATFORM_OPTIONS,
  type WebhookPlatformOverride,
} from "@/lib/webhooks/platform";
import type { WebhookPlatform } from "@/db/types";

export const runtime = "nodejs";

const PLATFORM_OVERRIDES = new Set(
  WEBHOOK_PLATFORM_OPTIONS.map((o) => o.value),
);

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhooks = await getUserWebhooks(session.user.id);
  return NextResponse.json({ webhooks, isPro: await isPro(session.user.id) });
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
    label?: unknown;
    url?: unknown;
    platformOverride?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.url !== "string") {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const platformOverride =
    typeof body.platformOverride === "string" &&
    PLATFORM_OVERRIDES.has(body.platformOverride as WebhookPlatformOverride)
      ? (body.platformOverride as WebhookPlatformOverride)
      : "auto";

  try {
    const webhook = await addUserWebhook(session.user.id, {
      label: typeof body.label === "string" ? body.label : "",
      url: body.url,
      platformOverride:
        platformOverride === "auto" ? "auto" : (platformOverride as WebhookPlatform),
    });
    return NextResponse.json({ ok: true, webhook });
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook URL. Use an HTTPS Slack, Teams, or Discord incoming webhook." },
      { status: 400 },
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const deleted = await deleteUserWebhook(session.user.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
