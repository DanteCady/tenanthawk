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
