import "server-only";
import { db } from "@/db";
import { getAlertPreferences } from "@/lib/alerts/preferences";
import { shouldSendInstantAlert, shouldSendExpiryAlert } from "@/lib/alerts/evaluate";
import { getUserWebhooks } from "@/lib/alerts/webhooks";
import { findingStatusKey } from "@/lib/findings/key";
import { sendEmail } from "@/lib/email/send";
import { driftAlertEmail, weeklyDigestEmail } from "@/lib/email/templates";
import { sendWebhook } from "@/lib/webhooks/send";
import { getFindings, getPreviousScan } from "@/lib/queries";
import { summarize } from "@/lib/summary";
import { diffScans } from "@/lib/scan/drift";
import { runScan } from "@/lib/scan/runScan";
import { connectionLabel } from "@/lib/connection/label";

function toDriftKeys(
  findings: Awaited<ReturnType<typeof getFindings>>,
) {
  return findings.map((f) => ({
    check_id: f.check_id,
    entity_ref: f.entity_ref,
    title: f.title,
    severity: f.severity,
  }));
}

function tenantLabel(conn: {
  tenant_domain: string | null;
  display_name: string | null;
  mode: "live" | "demo";
}) {
  return connectionLabel(conn);
}

async function getUserEmail(userId: string) {
  return db
    .selectFrom("user")
    .select(["email", "name"])
    .where("id", "=", userId)
    .executeTakeFirst();
}

export async function getPaidActiveConnections() {
  return db
    .selectFrom("connection")
    .innerJoin("subscription", "subscription.referenceId", "connection.user_id")
    .selectAll("connection")
    .where("connection.status", "=", "active")
    .where("subscription.plan", "in", ["pro", "msp"])
    .where((eb) =>
      eb.or([
        eb("subscription.status", "=", "active"),
        eb("subscription.status", "=", "trialing"),
      ]),
    )
    .execute();
}

export async function runScheduledScans(): Promise<{
  scanned: number;
  alerted: number;
}> {
  const conns = await getPaidActiveConnections();
  let scanned = 0;
  let alerted = 0;

  for (const conn of conns) {
    try {
      const prevScan = await db
        .selectFrom("scan")
        .selectAll()
        .where("connection_id", "=", conn.id)
        .where("status", "=", "complete")
        .orderBy("started_at", "desc")
        .executeTakeFirst();

      const scanId = await runScan(conn.id, { source: "scheduled" });
      scanned++;

      if (!prevScan) continue;

      const prefs = await getAlertPreferences(conn.user_id);
      if (prefs.instantAlerts === "off") continue;

      const currScan = await db
        .selectFrom("scan")
        .selectAll()
        .where("id", "=", scanId)
        .executeTakeFirstOrThrow();

      const [prevFindings, currFindings] = await Promise.all([
        getFindings(prevScan.id),
        getFindings(scanId),
      ]);

      const drift = diffScans(toDriftKeys(prevFindings), toDriftKeys(currFindings));
      const scoreDelta =
        currScan.score != null && prevScan.score != null
          ? currScan.score - prevScan.score
          : null;

      if (
        !shouldSendInstantAlert(prefs.instantAlerts, drift, scoreDelta) &&
        !shouldSendExpiryAlert(
          prefs.expiryAlerts,
          prevFindings,
          currFindings,
          (f) => findingStatusKey(f.check_id, f.entity_ref ?? null),
        )
      ) {
        continue;
      }

      const mail = driftAlertEmail({
        tenantName: tenantLabel(conn),
        score: currScan.score,
        scoreDelta,
        drift,
      });

      const user = await getUserEmail(conn.user_id);

      let delivered = false;
      if (user?.email) {
        delivered = await sendEmail({ to: user.email, ...mail });
      }
      const webhooks = await getUserWebhooks(conn.user_id);
      for (const hook of webhooks) {
        const webhookOk = await sendWebhook({
          url: hook.url,
          platform: hook.platform,
          title: mail.subject,
          text: mail.text,
        });
        if (webhookOk) delivered = true;
      }
      if (delivered) alerted++;
    } catch (err) {
      console.error(`[cron] scheduled scan failed for ${conn.id}`, err);
    }
  }

  return { scanned, alerted };
}

export async function sendWeeklyDigests(): Promise<{ sent: number }> {
  const conns = await getPaidActiveConnections();
  let sent = 0;

  for (const conn of conns) {
    try {
      const prefs = await getAlertPreferences(conn.user_id);
      if (!prefs.weeklyDigest) continue;

      const latestScan = await db
        .selectFrom("scan")
        .selectAll()
        .where("connection_id", "=", conn.id)
        .where("status", "=", "complete")
        .orderBy("started_at", "desc")
        .executeTakeFirst();

      if (!latestScan) continue;

      const weekAgo = new Date();
      weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

      const baselineScan = await db
        .selectFrom("scan")
        .selectAll()
        .where("connection_id", "=", conn.id)
        .where("status", "=", "complete")
        .where("started_at", "<=", weekAgo)
        .orderBy("started_at", "desc")
        .executeTakeFirst();

      const findings = await getFindings(latestScan.id);
      const summary = summarize(findings, latestScan.category_scores);

      let drift = diffScans([], toDriftKeys(findings));
      let scoreDelta: number | null = null;

      if (baselineScan && baselineScan.id !== latestScan.id) {
        const baselineFindings = await getFindings(baselineScan.id);
        drift = diffScans(
          toDriftKeys(baselineFindings),
          toDriftKeys(findings),
        );
        scoreDelta =
          latestScan.score != null && baselineScan.score != null
            ? latestScan.score - baselineScan.score
            : null;
      } else {
        const prev = await getPreviousScan(conn.id, latestScan.id);
        if (prev) {
          const prevFindings = await getFindings(prev.id);
          drift = diffScans(toDriftKeys(prevFindings), toDriftKeys(findings));
          scoreDelta =
            latestScan.score != null && prev.score != null
              ? latestScan.score - prev.score
              : null;
        }
      }

      const mail = weeklyDigestEmail({
        tenantName: tenantLabel(conn),
        score: latestScan.score,
        scoreDelta,
        drift,
        openIssues: summary.total,
        highIssues: summary.high,
      });

      const user = await getUserEmail(conn.user_id);

      let delivered = false;
      if (user?.email) {
        delivered = await sendEmail({ to: user.email, ...mail });
      }
      const webhooks = await getUserWebhooks(conn.user_id);
      for (const hook of webhooks) {
        const webhookOk = await sendWebhook({
          url: hook.url,
          platform: hook.platform,
          title: mail.subject,
          text: mail.text,
        });
        if (webhookOk) delivered = true;
      }
      if (delivered) sent++;
    } catch (err) {
      console.error(`[cron] weekly digest failed for ${conn.id}`, err);
    }
  }

  return { sent };
}
