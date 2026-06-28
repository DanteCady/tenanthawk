import { PRODUCT_ATTRIBUTION } from "@/lib/brand";

/** Brand palette aligned with the Tenant Hawk logo. */
export const EMAIL_BRAND = {
  navy: "#0F172A",
  hawk: "#F59E0B",
  hawkDark: "#D97706",
  slate: "#475569",
  muted: "#94A3B8",
  line: "#E2E8F0",
  panel: "#F8FAFC",
  white: "#FFFFFF",
} as const;

const APP_URL = (() => {
  const configured =
    process.env.EMAIL_APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://tenanthawk.io";
  // localhost links trigger M365 phishing filters — use production URL in email bodies
  if (/localhost|127\.0\.0\.1/.test(configured)) {
    return process.env.EMAIL_APP_URL ?? "https://tenanthawk.io";
  }
  return configured;
})();

export function emailDashboardUrl() {
  return `${APP_URL}/dashboard`;
}

export function emailSettingsUrl() {
  return `${APP_URL}/dashboard/settings`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function renderEmailLayout(opts: {
  preheader?: string;
  title: string;
  tenantName?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  /** OTP / transactional mail: omit footer links (better M365 deliverability). */
  minimalFooter?: boolean;
}): string {
  const preheader = opts.preheader
    ? `<span style="display:none;max-height:0;overflow:hidden;color:transparent;">${escapeHtml(opts.preheader)}</span>`
    : "";

  const tenantLine = opts.tenantName
    ? `<p style="margin:0 0 20px;font-size:14px;color:${EMAIL_BRAND.slate};">${escapeHtml(opts.tenantName)}</p>`
    : "";

  const cta = opts.cta
    ? `<p style="margin:28px 0 0;">
        <a href="${opts.cta.href}" style="display:inline-block;background:${EMAIL_BRAND.hawk};color:${EMAIL_BRAND.navy};padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">${escapeHtml(opts.cta.label)}</a>
      </p>`
    : "";

  const footer = opts.minimalFooter
    ? `<p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.muted};border-top:1px solid ${EMAIL_BRAND.line};padding-top:16px;">
                Read-only Microsoft 365 scan · ${escapeHtml(PRODUCT_ATTRIBUTION)}
              </p>`
    : `<p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.muted};border-top:1px solid ${EMAIL_BRAND.line};padding-top:16px;">
                <a href="${emailSettingsUrl()}" style="color:${EMAIL_BRAND.slate};">Manage alert preferences</a>
                · Read-only Microsoft 365 scan · ${escapeHtml(PRODUCT_ATTRIBUTION)}
              </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.panel};font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_BRAND.panel};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${EMAIL_BRAND.white};border:1px solid ${EMAIL_BRAND.line};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${EMAIL_BRAND.navy};padding:20px 28px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:${EMAIL_BRAND.white};letter-spacing:-0.02em;">
                Tenant <span style="color:${EMAIL_BRAND.hawk};">Hawk</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3;color:${EMAIL_BRAND.navy};">${escapeHtml(opts.title)}</h1>
              ${tenantLine}
              ${opts.bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function renderStatBlock(label: string, value: string, detail?: string): string {
  return `<div style="margin:0 0 16px;padding:16px;background:${EMAIL_BRAND.panel};border-radius:12px;border:1px solid ${EMAIL_BRAND.line};">
    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:${EMAIL_BRAND.muted};">${escapeHtml(label)}</p>
    <p style="margin:0;font-size:24px;font-weight:700;color:${EMAIL_BRAND.navy};">${escapeHtml(value)}</p>
    ${detail ? `<p style="margin:8px 0 0;font-size:13px;color:${EMAIL_BRAND.slate};">${escapeHtml(detail)}</p>` : ""}
  </div>`;
}

export function renderBulletList(items: string[]): string {
  if (items.length === 0) return "";
  const lis = items
    .slice(0, 8)
    .map(
      (item) =>
        `<li style="margin:0 0 8px;color:${EMAIL_BRAND.slate};font-size:14px;line-height:1.5;">${escapeHtml(item)}</li>`,
    )
    .join("");
  return `<ul style="margin:16px 0 0;padding-left:20px;">${lis}</ul>`;
}
