import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { testAlertEmail } from "@/lib/email/templates";

const FROM = process.env.EMAIL_FROM ?? "Tenant Hawk <alerts@tenanthawk.app>";

let transporter: Transporter | null = null;

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS,
  );
}

function getTransporter(): Transporter | null {
  if (!isSmtpConfigured()) return null;

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    const secure =
      process.env.SMTP_SECURE === "true" ||
      (process.env.SMTP_SECURE !== "false" && port === 465);

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
      authMethod: "LOGIN",
    });
  }

  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.log("[email] (SMTP not configured — logging only)");
    console.log(`  From: ${FROM}`);
    console.log(`  To: ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log(`  ${opts.text}`);
    return true;
  }

  try {
    const info = await transport.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    console.log(
      `[email] sent to=${opts.to} subject="${opts.subject}" id=${info.messageId} response=${info.response}`,
    );
    return true;
  } catch (err) {
    console.error(`[email] SMTP send failed to=${opts.to}`, err);
    return false;
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  const mail = testAlertEmail();
  return sendEmail({ to, ...mail });
}
