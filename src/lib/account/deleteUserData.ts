import "server-only";
import Stripe from "stripe";
import { db } from "@/db";

/** Remove all Tenant Hawk app data owned by a user. */
export async function deleteUserData(userId: string): Promise<void> {
  await db.deleteFrom("connection").where("user_id", "=", userId).execute();
  await db.deleteFrom("alert_preferences").where("user_id", "=", userId).execute();
  await db.deleteFrom("alert_webhook").where("user_id", "=", userId).execute();
}

/** Cancel an active Stripe subscription before the auth user row is removed. */
export async function cancelStripeSubscription(userId: string): Promise<void> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_placeholder") return;

  const sub = await db
    .selectFrom("subscription")
    .select(["stripeSubscriptionId"])
    .where("referenceId", "=", userId)
    .where("status", "in", ["active", "trialing"])
    .executeTakeFirst();

  if (!sub?.stripeSubscriptionId) return;

  try {
    const stripe = new Stripe(key);
    await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
  } catch (err) {
    console.error("[account/delete] Stripe subscription cancel failed", err);
  }
}
