import "server-only";
import { NextResponse } from "next/server";
import {
  checkRateLimit,
  limitForPlan,
  rateLimitKey,
  type PlanTier,
} from "./rate-limit";

export function enforceRateLimit(
  userId: string,
  action: string,
  plan: PlanTier,
  spec: { free: number; pro: number; windowMs: number },
): NextResponse | null {
  const { max, windowMs } = limitForPlan(spec, plan);
  const result = checkRateLimit(rateLimitKey(userId, action), max, windowMs);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: `Rate limit exceeded. Try again in ${result.retryAfterSec}s.`,
        retryAfterSec: result.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSec) },
      },
    );
  }

  return null;
}
