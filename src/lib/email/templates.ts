import type { ScanDrift } from "@/lib/scan/drift";
import { grade } from "@/lib/scan/score";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function dashboardUrl() {
  return `${APP_URL}/dashboard`;
}

function settingsUrl() {
  return `${APP_URL}/dashboard/settings`;
}

export function driftAlertEmail(opts: {
  tenantName: string;
  score: number | null;
  scoreDelta: number | null;
  drift: ScanDrift;
}): { subject: string; html: string; text: string } {
  const { tenantName, score, scoreDelta, drift } = opts;
  const scoreStr = score != null ? `${score} (${grade(score)})` : "—";
  const deltaStr =
    scoreDelta != null && scoreDelta !== 0
      ? ` (${scoreDelta > 0 ? "+" : ""}${scoreDelta} since last scan)`
      : "";

  const lines: string[] = [];
  if (drift.newHighCount > 0) {
    lines.push(`${drift.newHighCount} new high-severity finding(s)`);
  }
  if (drift.newCount > drift.newHighCount) {
    lines.push(`${drift.newCount - drift.newHighCount} other new finding(s)`);
  }
  if (drift.resolvedCount > 0) {
    lines.push(`${drift.resolvedCount} resolved`);
  }
  if (drift.changedCount > 0) {
    lines.push(`${drift.changedCount} severity change(s)`);
  }
  if (scoreDelta != null && scoreDelta <= -5) {
    lines.push(`Health score dropped by ${Math.abs(scoreDelta)} points`);
  }

  const summary = lines.length > 0 ? lines.join(" · ") : "Tenant health changed";
  const subject = `Tenant Hawk: ${summary} — ${tenantName}`;

  const detailItems = [
    ...drift.newHighTitles.map((t) => `<li><strong>New (high):</strong> ${escapeHtml(t)}</li>`),
    ...drift.newTitles
      .filter((t) => !drift.newHighTitles.includes(t))
      .map((t) => `<li><strong>New:</strong> ${escapeHtml(t)}</li>`),
    ...drift.resolvedTitles.map(
      (t) => `<li><strong>Resolved:</strong> ${escapeHtml(t)}</li>`,
    ),
  ]
    .slice(0, 8)
    .join("");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #0f172a;">
      <p style="color: #2563eb; font-weight: 600; margin: 0;">Tenant Hawk</p>
      <h1 style="font-size: 20px; margin: 8px 0;">Tenant health alert</h1>
      <p style="color: #475569; margin: 0 0 16px;">${escapeHtml(tenantName)}</p>
      <p style="font-size: 24px; font-weight: 700; margin: 0;">Score: ${scoreStr}${deltaStr}</p>
      <p style="color: #475569; margin: 12px 0;">${escapeHtml(summary)}</p>
      ${detailItems ? `<ul style="padding-left: 20px; color: #334155;">${detailItems}</ul>` : ""}
      <p style="margin: 24px 0;">
        <a href="${dashboardUrl()}" style="background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">View dashboard</a>
      </p>
      <p style="font-size: 12px; color: #94a3b8;">
        <a href="${settingsUrl()}" style="color: #64748b;">Manage alert preferences</a>
      </p>
    </div>
  `.trim();

  const text = [
    `Tenant Hawk — health alert for ${tenantName}`,
    `Score: ${scoreStr}${deltaStr}`,
    summary,
    ...drift.newHighTitles.map((t) => `  New (high): ${t}`),
    ...drift.resolvedTitles.map((t) => `  Resolved: ${t}`),
    "",
    `View dashboard: ${dashboardUrl()}`,
    `Alert preferences: ${settingsUrl()}`,
  ].join("\n");

  return { subject, html, text };
}

export function weeklyDigestEmail(opts: {
  tenantName: string;
  score: number | null;
  scoreDelta: number | null;
  drift: ScanDrift;
  openIssues: number;
  highIssues: number;
}): { subject: string; html: string; text: string } {
  const { tenantName, score, scoreDelta, drift, openIssues, highIssues } = opts;
  const scoreStr = score != null ? `${score} (${grade(score)})` : "—";
  const deltaStr =
    scoreDelta != null && scoreDelta !== 0
      ? ` (${scoreDelta > 0 ? "+" : ""}${scoreDelta} vs last week)`
      : "";

  const changed =
    drift.newCount > 0 || drift.resolvedCount > 0 || drift.changedCount > 0;

  const subject = changed
    ? `Tenant Hawk weekly: ${drift.newCount} new, ${drift.resolvedCount} resolved — ${tenantName}`
    : `Tenant Hawk weekly: all clear — ${tenantName}`;

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 520px; color: #0f172a;">
      <p style="color: #2563eb; font-weight: 600; margin: 0;">Tenant Hawk</p>
      <h1 style="font-size: 20px; margin: 8px 0;">Weekly tenant digest</h1>
      <p style="color: #475569; margin: 0 0 16px;">${escapeHtml(tenantName)}</p>
      <p style="font-size: 24px; font-weight: 700; margin: 0;">Score: ${scoreStr}${deltaStr}</p>
      <p style="color: #475569; margin: 12px 0;">
        ${openIssues} open issues · ${highIssues} high severity
      </p>
      ${
        changed
          ? `<p style="margin: 12px 0;">Since your last weekly digest: <strong>${drift.newCount} new</strong>, <strong>${drift.resolvedCount} resolved</strong>${drift.changedCount > 0 ? `, <strong>${drift.changedCount} severity changes</strong>` : ""}.</p>`
          : `<p style="margin: 12px 0;">No meaningful drift this week — your tenant looks stable.</p>`
      }
      <p style="margin: 24px 0;">
        <a href="${dashboardUrl()}" style="background: #2563eb; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-weight: 600;">View dashboard</a>
      </p>
      <p style="font-size: 12px; color: #94a3b8;">
        <a href="${settingsUrl()}" style="color: #64748b;">Manage alert preferences</a>
      </p>
    </div>
  `.trim();

  const text = [
    `Tenant Hawk — weekly digest for ${tenantName}`,
    `Score: ${scoreStr}${deltaStr}`,
    `${openIssues} open issues, ${highIssues} high severity`,
    changed
      ? `Since last digest: ${drift.newCount} new, ${drift.resolvedCount} resolved`
      : "No meaningful drift this week",
    "",
    `View dashboard: ${dashboardUrl()}`,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
