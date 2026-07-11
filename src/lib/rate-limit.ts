import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** In-memory sliding window limiter (per server instance). */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { ok: true; remaining: number } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count };
}

export function rateLimitKey(userId: string, action: string): string {
  return `${action}:${userId}`;
}

/** Trial accounts get pro-level limits — they have the pro feature set. */
export type PlanTier = "free" | "trial" | "pro" | "msp";

export const RATE_LIMITS = {
  /** Manual re-scan from dashboard */
  scan: { free: 3, pro: 30, windowMs: 60 * 60 * 1000 },
  /** Microsoft admin-consent redirect */
  connectStart: { free: 5, pro: 10, windowMs: 60 * 60 * 1000 },
  /** Demo tenant scan */
  connectDemo: { free: 5, pro: 15, windowMs: 60 * 60 * 1000 },
  /** On-demand connection health refresh */
  connectionHealth: { free: 10, pro: 60, windowMs: 60 * 60 * 1000 },
} as const;

export function limitForPlan(
  spec: { free: number; pro: number; windowMs: number },
  plan: PlanTier,
): { max: number; windowMs: number } {
  return { max: plan === "free" ? spec.free : spec.pro, windowMs: spec.windowMs };
}
