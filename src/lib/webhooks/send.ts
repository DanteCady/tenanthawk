import "server-only";
import { detectWebhookKind } from "@/lib/webhooks/validate";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function dashboardUrl() {
  return `${APP_URL}/dashboard`;
}

function buildPayload(
  kind: ReturnType<typeof detectWebhookKind>,
  title: string,
  text: string,
): unknown {
  const link = dashboardUrl();

  if (kind === "slack") {
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

  if (kind === "teams") {
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

export async function sendWebhook(opts: {
  url: string;
  title: string;
  text: string;
}): Promise<boolean> {
  const kind = detectWebhookKind(opts.url);
  const body = buildPayload(kind, opts.title, opts.text);

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
      console.error("[webhook] delivery failed", res.status, errText.slice(0, 200));
      return false;
    }

    return true;
  } catch (err) {
    console.error("[webhook] delivery error", err);
    return false;
  }
}

export async function sendTestWebhook(url: string): Promise<boolean> {
  return sendWebhook({
    url,
    title: "Tenant Hawk — test alert",
    text: [
      "Your Slack or Teams webhook is connected.",
      "You'll receive tenant health alerts here using the same rules as email.",
      "",
      `Dashboard: ${dashboardUrl()}`,
    ].join("\n"),
  });
}
