import type { ScanDrift } from "@/lib/scan/drift";
import { grade } from "@/lib/scan/score";
import {
  emailDashboardUrl,
  emailSettingsUrl,
  escapeHtml,
  renderBulletList,
  renderEmailLayout,
  renderStatBlock,
  type EmailTemplate,
} from "@/lib/email/layout";

function formatScore(score: number | null, delta: number | null, deltaLabel: string) {
  const scoreStr = score != null ? `${score} (${grade(score)})` : "-";
  const deltaStr =
    delta != null && delta !== 0
      ? `${delta > 0 ? "+" : ""}${delta} ${deltaLabel}`
      : "";
  return { scoreStr, deltaStr, detail: deltaStr ? `${scoreStr} · ${deltaStr}` : scoreStr };
}

function driftSummaryLines(drift: ScanDrift, scoreDelta: number | null): string[] {
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
  return lines;
}

function driftDetailBullets(drift: ScanDrift): string[] {
  return [
    ...drift.newHighTitles.map((t) => `New (high): ${t}`),
    ...drift.newTitles
      .filter((t) => !drift.newHighTitles.includes(t))
      .map((t) => `New: ${t}`),
    ...drift.resolvedTitles.map((t) => `Resolved: ${t}`),
  ];
}

export function driftAlertEmail(opts: {
  tenantName: string;
  score: number | null;
  scoreDelta: number | null;
  drift: ScanDrift;
}): EmailTemplate {
  const { tenantName, score, scoreDelta, drift } = opts;
  const { scoreStr, detail } = formatScore(score, scoreDelta, "since last scan");
  const summaryLines = driftSummaryLines(drift, scoreDelta);
  const summary = summaryLines.length > 0 ? summaryLines.join(" · ") : "Tenant health changed";
  const subject = `Tenant Hawk: ${summary} - ${tenantName}`;
  const bullets = driftDetailBullets(drift);

  const bodyHtml = [
    renderStatBlock("Health score", scoreStr, detail),
    `<p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">${escapeHtml(summary)}</p>`,
    renderBulletList(bullets),
  ].join("");

  const html = renderEmailLayout({
    preheader: summary,
    title: "Tenant health alert",
    tenantName,
    bodyHtml,
    cta: { label: "View dashboard", href: emailDashboardUrl() },
  });

  const text = [
    `Tenant Hawk - health alert for ${tenantName}`,
    `Score: ${scoreStr}`,
    summary,
    ...bullets.map((b) => `  • ${b}`),
    "",
    `View dashboard: ${emailDashboardUrl()}`,
    `Alert preferences: ${emailSettingsUrl()}`,
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
}): EmailTemplate {
  const { tenantName, score, scoreDelta, drift, openIssues, highIssues } = opts;
  const { scoreStr, detail } = formatScore(score, scoreDelta, "vs last week");
  const changed =
    drift.newCount > 0 || drift.resolvedCount > 0 || drift.changedCount > 0;

  const subject = changed
    ? `Tenant Hawk weekly: ${drift.newCount} new, ${drift.resolvedCount} resolved - ${tenantName}`
    : `Tenant Hawk weekly: all clear - ${tenantName}`;

  const driftCopy = changed
    ? `Since your last weekly digest: ${drift.newCount} new, ${drift.resolvedCount} resolved${drift.changedCount > 0 ? `, ${drift.changedCount} severity changes` : ""}.`
    : "No meaningful drift this week - your tenant looks stable.";

  const bodyHtml = [
    renderStatBlock("Health score", scoreStr, detail),
    `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#475569;"><strong>${openIssues}</strong> open issues · <strong>${highIssues}</strong> high severity</p>`,
    `<p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">${escapeHtml(driftCopy)}</p>`,
  ].join("");

  const html = renderEmailLayout({
    preheader: `${openIssues} open issues · ${highIssues} high severity`,
    title: "Weekly tenant digest",
    tenantName,
    bodyHtml,
    cta: { label: "View dashboard", href: emailDashboardUrl() },
  });

  const text = [
    `Tenant Hawk - weekly digest for ${tenantName}`,
    `Score: ${scoreStr}`,
    `${openIssues} open issues, ${highIssues} high severity`,
    driftCopy,
    "",
    `View dashboard: ${emailDashboardUrl()}`,
    `Alert preferences: ${emailSettingsUrl()}`,
  ].join("\n");

  return { subject, html, text };
}

export function verificationOtpEmail(opts: { otp: string }): EmailTemplate {
  const subject = `${opts.otp} is your Tenant Hawk verification code`;
  const bodyHtml = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
    Enter this code on the verification screen to continue onboarding:
  </p>
  <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:0.25em;color:#0F172A;text-align:center;">
    ${escapeHtml(opts.otp)}
  </p>
  <p style="margin:0;font-size:14px;line-height:1.6;color:#94A3B8;text-align:center;">
    This code expires in 10 minutes.
  </p>`;

  const html = renderEmailLayout({
    preheader: `Your verification code is ${opts.otp}`,
    title: "Verify your email",
    bodyHtml,
    minimalFooter: true,
  });

  const text = [
    "Tenant Hawk - verify your email",
    "",
    `Your verification code: ${opts.otp}`,
    "",
    "Enter this code on the verification screen to continue onboarding.",
    "This code expires in 10 minutes.",
    "",
    "If you didn't create a Tenant Hawk account, you can ignore this message.",
  ].join("\n");

  return { subject, html, text };
}

export function verificationEmail(opts: {
  name: string;
  url: string;
}): EmailTemplate {
  const subject = "Verify your Tenant Hawk email";
  const bodyHtml = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
    Hi ${escapeHtml(opts.name || "there")},
  </p>
  <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
    Thanks for signing up. Confirm your email to connect your Microsoft tenant and run your first health scan.
  </p>`;

  const html = renderEmailLayout({
    preheader: "Confirm your email to continue onboarding",
    title: "Verify your email",
    bodyHtml,
    cta: { label: "Verify email address", href: opts.url },
  });

  const text = [
    "Tenant Hawk - verify your email",
    "",
    `Hi ${opts.name || "there"},`,
    "",
    "Thanks for signing up. Confirm your email to connect your Microsoft tenant and run your first health scan.",
    "",
    `Verify email: ${opts.url}`,
    "",
    "If you didn't create a Tenant Hawk account, you can ignore this message.",
  ].join("\n");

  return { subject, html, text };
}

export function testAlertEmail(): EmailTemplate {
  const subject = "Tenant Hawk - test alert";
  const bodyHtml = `<p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
    This is a test alert from Tenant Hawk. If you received this, email delivery is working.
    You'll receive tenant health notifications at this address based on your alert preferences.
  </p>`;

  const html = renderEmailLayout({
    preheader: "Test alert - email delivery is working",
    title: "Test alert",
    bodyHtml,
    cta: { label: "Open dashboard", href: emailDashboardUrl() },
  });

  const text = [
    "Tenant Hawk - test alert",
    "",
    "This is a test alert from Tenant Hawk. If you received this, email delivery is working.",
    "You'll receive tenant health notifications at this address based on your alert preferences.",
    "",
    `Dashboard: ${emailDashboardUrl()}`,
    `Alert preferences: ${emailSettingsUrl()}`,
  ].join("\n");

  return { subject, html, text };
}
