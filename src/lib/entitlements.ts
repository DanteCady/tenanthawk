import "server-only";
import { db } from "@/db";

export type Plan = "free" | "pro" | "msp";

function normalizePlan(raw: string | null | undefined): Plan {
  if (raw === "pro" || raw === "msp") return raw;
  return "free";
}

export function hasProFeatures(plan: Plan): boolean {
  return plan === "pro" || plan === "msp";
}

export async function getPlan(userId: string): Promise<Plan> {
  const subs = await db
    .selectFrom("subscription")
    .select(["plan", "status"])
    .where("referenceId", "=", userId)
    .execute();

  const active = subs.find(
    (s) => (s.status === "active" || s.status === "trialing") && s.plan,
  );
  return normalizePlan(active?.plan);
}

export async function isPro(userId: string): Promise<boolean> {
  return hasProFeatures(await getPlan(userId));
}

export async function isMsp(userId: string): Promise<boolean> {
  return (await getPlan(userId)) === "msp";
}

/** Throws UNAUTHORIZED / PRO_REQUIRED for API routes. */
export async function requirePro(userId: string): Promise<void> {
  if (!(await isPro(userId))) {
    throw new Error("PRO_REQUIRED");
  }
}
