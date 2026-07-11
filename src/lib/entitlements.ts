import "server-only";
import { db } from "@/db";
import { isTrialActive, trialDaysLeft, trialEndsAt } from "./billing/trial";

/** "trial" = full Pro features during the new-account window, unpaid. */
export type Plan = "free" | "trial" | "pro" | "msp";

function normalizePlan(raw: string | null | undefined): Plan {
  if (raw === "pro" || raw === "msp") return raw;
  return "free";
}

/** Internal IT - single-organization paid plan (per tenant). */
export function isProPlan(plan: Plan): boolean {
  return plan === "pro";
}

/** MSPs & consultants - multi-tenant paid plan. Not an add-on to Pro. */
export function isEnterprisePlan(plan: Plan): boolean {
  return plan === "msp";
}

/** Unlocks paid scan features (trial, Pro, or Enterprise). Internal gating only. */
export function hasProFeatures(plan: Plan): boolean {
  return plan === "trial" || plan === "pro" || plan === "msp";
}

/** Unpaid plans - where upgrade CTAs and billing prompts should show. */
export function isUnpaidPlan(plan: Plan): boolean {
  return plan === "free" || plan === "trial";
}

async function getUserCreatedAt(userId: string): Promise<Date | null> {
  const user = await db
    .selectFrom("user")
    .select(["createdAt"])
    .where("id", "=", userId)
    .executeTakeFirst();
  return user?.createdAt ? new Date(user.createdAt) : null;
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
  if (active) return normalizePlan(active.plan);

  const createdAt = await getUserCreatedAt(userId);
  if (createdAt && isTrialActive(createdAt)) return "trial";
  return "free";
}

export type TrialStatus = {
  active: boolean;
  daysLeft: number;
  endsAt: Date | null;
};

/** Trial countdown for banners/emails. Inactive for paid or expired accounts. */
export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  const plan = await getPlan(userId);
  if (plan !== "trial") return { active: false, daysLeft: 0, endsAt: null };
  const createdAt = await getUserCreatedAt(userId);
  if (!createdAt) return { active: false, daysLeft: 0, endsAt: null };
  return {
    active: true,
    daysLeft: trialDaysLeft(createdAt),
    endsAt: trialEndsAt(createdAt),
  };
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
