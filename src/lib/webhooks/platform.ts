export type WebhookPlatform = "slack" | "teams" | "discord" | "generic";

export type WebhookPlatformOverride = WebhookPlatform | "auto";

export const WEBHOOK_PLATFORM_OPTIONS: {
  value: WebhookPlatformOverride;
  label: string;
}[] = [
  { value: "auto", label: "Auto-detect from URL" },
  { value: "slack", label: "Slack" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "discord", label: "Discord" },
  { value: "generic", label: "Generic (Power Automate, etc.)" },
];

/** Detect chat platform from webhook URL hostname. */
export function detectWebhookPlatform(url: string): WebhookPlatform | null {
  try {
    const { hostname } = new URL(url.trim());
    const host = hostname.toLowerCase();

    if (host === "hooks.slack.com" || host.endsWith(".hooks.slack.com")) {
      return "slack";
    }
    if (
      host.includes("webhook.office.com") ||
      host === "outlook.office.com"
    ) {
      return "teams";
    }
    if (host === "discord.com" || host === "discordapp.com") {
      return "discord";
    }
    if (host.endsWith(".logic.azure.com")) {
      return "generic";
    }

    return null;
  } catch {
    return null;
  }
}

export function resolveWebhookPlatform(
  url: string,
  override?: WebhookPlatformOverride | null,
): WebhookPlatform {
  if (override && override !== "auto") return override;
  return detectWebhookPlatform(url) ?? "generic";
}

export function platformLabel(platform: WebhookPlatform): string {
  switch (platform) {
    case "slack":
      return "Slack";
    case "teams":
      return "Microsoft Teams";
    case "discord":
      return "Discord";
    default:
      return "Generic";
  }
}

export function platformBadgeClass(platform: WebhookPlatform): string {
  switch (platform) {
    case "slack":
      return "bg-purple-50 text-purple-700";
    case "teams":
      return "bg-indigo-50 text-indigo-700";
    case "discord":
      return "bg-violet-50 text-violet-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}
