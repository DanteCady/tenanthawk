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
