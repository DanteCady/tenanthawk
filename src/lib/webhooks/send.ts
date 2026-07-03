import "server-only";
import type { WebhookPlatform } from "@/lib/webhooks/platform";
import { detectWebhookPlatform } from "@/lib/webhooks/platform";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BRAND_COLOR = 0x2563eb;

function dashboardUrl() {
  return `${APP_URL}/dashboard`;
}

function buildPayload(
  platform: WebhookPlatform,
  title: string,
  text: string,
): unknown {
  const link = dashboardUrl();

  if (platform === "slack") {
    return {
      text: title,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: title, emoji: true },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: slackMrkdwn(text) },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View dashboard", emoji: true },
              url: link,
            },
          ],
        },
      ],
    };
  }

  if (platform === "teams") {
    return {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: title,
      themeColor: "2563EB",
      title,
      text: teamsText(text),
      potentialAction: [
        {
          "@type": "OpenUri",
          name: "View dashboard",
          targets: [{ os: "default", uri: link }],
        },
      ],
    };
  }

  if (platform === "discord") {
    return {
      embeds: [
        {
          title,
          description: discordDescription(text),
          color: BRAND_COLOR,
          footer: { text: "Tenant Hawk" },
          url: link,
        },
      ],
    };
  }

  return {
    title,
    text,
    dashboardUrl: link,
    source: "tenant-hawk",
  };
}

function slackMrkdwn(text: string): string {
  return text
    .split("\n")
    .map((line) => line.replace(/^(https?:\/\/\S+)/, "<$1>"))
    .join("\n");
}

function teamsText(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const urlMatch = line.match(/(https?:\/\/\S+)/);
      if (urlMatch && line.trim() === urlMatch[0]) {
        return `[View dashboard](${urlMatch[0]})`;
      }
      return line;
    })
    .join("  \n");
}

function discordDescription(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      const urlMatch = line.match(/(https?:\/\/\S+)/);
      if (urlMatch && line.trim() === urlMatch[0]) {
        return `[View dashboard](${urlMatch[0]})`;
      }
      return line;
    })
    .join("\n")
    .slice(0, 4096);
}

function effectivePlatform(
  url: string,
  platform?: WebhookPlatform | null,
): WebhookPlatform {
  return platform ?? detectWebhookPlatform(url) ?? "generic";
}

export async function sendWebhook(opts: {
  url: string;
  title: string;
  text: string;
  platform?: WebhookPlatform | null;
}): Promise<boolean> {
  const platform = effectivePlatform(opts.url, opts.platform);
  const body = buildPayload(platform, opts.title, opts.text);

  try {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
      redirect: "error",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        `[webhook:${platform}] delivery failed`,
        res.status,
        errText.slice(0, 200),
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[webhook:${platform}] delivery error`, err);
    return false;
  }
}

export async function sendTestWebhook(
  url: string,
  platform?: WebhookPlatform | null,
): Promise<boolean> {
  const p = effectivePlatform(url, platform);
  const platformName =
    p === "slack"
      ? "Slack"
      : p === "teams"
        ? "Microsoft Teams"
        : p === "discord"
          ? "Discord"
          : "your webhook";

  return sendWebhook({
    url,
    platform: p,
    title: "Tenant Hawk - test alert",
    text: [
      `Your ${platformName} webhook is connected.`,
      "You'll receive tenant health alerts here using the same rules as email.",
      "",
      `Dashboard: ${dashboardUrl()}`,
    ].join("\n"),
  });
}
