import type { WebhookPlatform } from "@/lib/webhooks/platform";
import { detectWebhookPlatform } from "@/lib/webhooks/platform";

/** Validate Slack / Teams / Discord incoming webhook URLs (HTTPS, known hosts). */
export function parseWebhookUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (!isAllowedHost(url.hostname)) return null;
  if (isPrivateOrLocalHost(url.hostname)) return null;

  return url.toString();
}

function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  const allowed = [
    "hooks.slack.com",
    "hooks.slackusercontent.com",
    "webhook.office.com",
    "outlook.office.com",
    "discord.com",
    "discordapp.com",
  ];

  if (allowed.includes(lower)) return true;
  if (lower.endsWith(".webhook.office.com")) return true;
  if (lower.endsWith(".logic.azure.com")) return true;

  return false;
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".localhost")) return true;

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(lower)) {
    const [a, b] = lower.split(".").map(Number);
    if (a === 127 || a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 0) return true;
  }

  return false;
}

/** @deprecated Use detectWebhookPlatform from ./platform */
export function detectWebhookKind(url: string): WebhookPlatform {
  return detectWebhookPlatform(url) ?? "generic";
}
