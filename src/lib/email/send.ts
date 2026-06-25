import "server-only";
import { Resend } from "resend";

const FROM =
  process.env.EMAIL_FROM ?? "Tenant Hawk <onboarding@resend.dev>";

let resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const client = getResend();

  if (!client) {
    console.log("[email] (no RESEND_API_KEY — logging only)");
    console.log(`  To: ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log(`  ${opts.text}`);
    return true;
  }

  const { error } = await client.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });

  if (error) {
    console.error("[email] send failed", error);
    return false;
  }

  return true;
}

export async function sendTestEmail(to: string): Promise<boolean> {
  const subject = "Tenant Hawk — test alert";
  const text = [
    "This is a test alert from Tenant Hawk.",
    "You'll receive tenant health notifications at this address using your alert preferences.",
    "",
    `Dashboard: ${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`,
  ].join("\n");

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; color: #0f172a;">
      <p style="color: #2563eb; font-weight: 600;">Tenant Hawk</p>
      <h1 style="font-size: 18px;">Test alert</h1>
      <p style="color: #475569;">This is a test alert from Tenant Hawk. You'll receive tenant health notifications at this address using your alert preferences.</p>
    </div>
  `.trim();

  return sendEmail({ to, subject, html, text });
}
