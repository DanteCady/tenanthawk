import "server-only";
import { db } from "@/db";

export type Plan = "free" | "pro";

export async function getPlan(userId: string): Promise<Plan> {
  const subs = await db
    .selectFrom("subscription")
    .select(["plan", "status"])
    .where("referenceId", "=", userId)
    .execute();

  const active = subs.find(
    (s) => (s.status === "active" || s.status === "trialing") && s.plan,
  );
  return active ? "pro" : "free";
}

export async function isPro(userId: string): Promise<boolean> {
  return (await getPlan(userId)) === "pro";
}

/** Throws UNAUTHORIZED / PRO_REQUIRED for API routes. */
export async function requirePro(userId: string): Promise<void> {
  if (!(await isPro(userId))) {
    throw new Error("PRO_REQUIRED");
  }
}
