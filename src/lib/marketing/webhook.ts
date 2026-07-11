import { db } from "@/db";
import type { FindingDraft, Severity } from "@/lib/scan/types";
import { connectionLabel } from "@/lib/connection/label";
import { isTrialActive, TRIAL_DAYS, trialDaysLeft } from "@/lib/billing/trial";

async function postMarketingWebhook(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.MARKETING_WEBHOOK_URL;
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-th-signature": process.env.MARKETING_WEBHOOK_SECRET ?? "",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fires when an account is created — the day-0 trigger for the trial email
 * sequence. Same gating and never-throws contract as the scan webhook.
 */
export async function fireSignupWebhook(input: {
  email: string;
  name?: string | null;
  accountType?: string | null;
}): Promise<void> {
  if (!process.env.MARKETING_WEBHOOK_URL) return;
  try {
    await postMarketingWebhook({
      event: "user.signedup",
      user: { email: input.email, name: input.name ?? null },
      accountType: input.accountType ?? "individual",
      trialDaysLeft: TRIAL_DAYS,
    });
  } catch (err) {
    console.warn(`[marketing-webhook] signup skipped: ${String(err)}`);
  }
}

/**
 * Fires a marketing-lifecycle webhook (e.g. to n8n) when a scan completes.
 *
 * Fully gated on MARKETING_WEBHOOK_URL: a no-op unless configured. Never throws
 * and never blocks a scan - all errors are swallowed and logged. This is the
 * *marketing* layer; transactional/security emails stay in src/lib/email.
 */
export async function fireMarketingWebhook(input: {
  scanId: string;
  conn: {
    user_id: string;
    tenant_domain?: string | null;
    display_name?: string | null;
    mode?: string | null;
  };
  drafts: FindingDraft[];
  score: number;
  source: "manual" | "scheduled";
}): Promise<void> {
  const url = process.env.MARKETING_WEBHOOK_URL;
  if (!url) return;

  try {
    const { scanId, conn, drafts, score, source } = input;

    const [user, subscription, connectionCount] = await Promise.all([
      db
        .selectFrom("user")
        .select(["email", "name", "createdAt"])
        .where("id", "=", conn.user_id)
        .executeTakeFirst(),
      db
        .selectFrom("subscription")
        .select(["plan", "status"])
        .where("referenceId", "=", conn.user_id)
        .executeTakeFirst(),
      db
        .selectFrom("connection")
        .select((eb) => eb.fn.countAll<number>().as("count"))
        .where("user_id", "=", conn.user_id)
        .executeTakeFirst(),
    ]);

    if (!user?.email) return;

    const isPaid =
      (subscription?.plan === "pro" || subscription?.plan === "msp") &&
      (subscription.status === "active" || subscription.status === "trialing");

    const severityRank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
    const sorted = [...drafts].sort(
      (a, b) => severityRank[a.severity] - severityRank[b.severity],
    );

    const licenseWasteMonthly = drafts.reduce(
      (sum, d) => sum + (d.category === "cost" ? d.impact?.usd ?? 0 : 0),
      0,
    );

    const expiringSoonCount = drafts.filter(
      (d) => typeof d.impact?.daysUntil === "number" && d.impact.daysUntil <= 30,
    ).length;

    const tenantName = connectionLabel(conn);

    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    const onTrial = !isPaid && createdAt !== null && isTrialActive(createdAt);

    const payload = {
      event: "scan.completed",
      source,
      plan:
        subscription?.plan === "msp"
          ? "enterprise"
          : isPaid
            ? "pro"
            : onTrial
              ? "trial"
              : "free",
      trialDaysLeft: onTrial && createdAt ? trialDaysLeft(createdAt) : 0,
      isLikelyMsp: Number(connectionCount?.count ?? 0) > 1,
      user: { email: user.email, name: user.name ?? null },
      tenant: { name: tenantName },
      scan: {
        id: scanId,
        score,
        severityHighCount: drafts.filter((d) => d.severity === "high").length,
        topFinding: sorted[0]?.title ?? null,
        licenseWasteMonthly: Math.round(licenseWasteMonthly),
        expiringSoonCount,
      },
    };

    await postMarketingWebhook(payload);
  } catch (err) {
    console.warn(`[marketing-webhook] skipped: ${String(err)}`);
  }
}
