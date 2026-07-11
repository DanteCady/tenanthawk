import "server-only";
import { PostHog } from "posthog-node";

/**
 * Server-side funnel events (signup → tenant connected → scan completed →
 * upgraded). No-op unless NEXT_PUBLIC_POSTHOG_KEY is set; never throws and
 * never blocks the calling flow.
 */

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!key) return null;
  if (!client) {
    // Low event volume on a long-lived PM2 process — flush promptly so
    // events aren't lost on restarts.
    client = new PostHog(key, { host, flushAt: 1, flushInterval: 5000 });
  }
  return client;
}

export type FunnelEvent =
  | "signup_completed"
  | "tenant_connected"
  | "scan_completed"
  | "plan_upgraded";

export function captureServerEvent(
  userId: string,
  event: FunnelEvent,
  properties?: Record<string, string | number | boolean | null>,
): void {
  try {
    getClient()?.capture({ distinctId: userId, event, properties });
  } catch (err) {
    console.warn(`[analytics] capture skipped: ${String(err)}`);
  }
}

/** Attach person properties (email, plan) so funnels are readable. */
export function identifyServerUser(
  userId: string,
  properties: Record<string, string | number | boolean | null>,
): void {
  try {
    getClient()?.identify({ distinctId: userId, properties });
  } catch (err) {
    console.warn(`[analytics] identify skipped: ${String(err)}`);
  }
}
