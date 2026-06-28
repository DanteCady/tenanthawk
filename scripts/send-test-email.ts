/**
 * Send a branded test alert. Usage:
 *   pnpm exec tsx scripts/send-test-email.ts [recipient@email.com]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";
import { testAlertEmail } from "../src/lib/email/templates";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main() {
  loadEnv();

  const to = process.argv[2] ?? "dantecady@gmail.com";
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? "Tenant Hawk <alerts@tenanthawk.io>";

  if (!host || !user || !pass) {
    console.error("Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in .env");
    process.exit(1);
  }

  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  const mail = testAlertEmail();
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: user.trim(), pass: pass.trim() },
    authMethod: "LOGIN",
  });

  console.log(`Sending test alert to ${to} via ${host}...`);
  const info = await transport.sendMail({
    from,
    to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });

  console.log("Sent:", info.messageId);
  console.log("Response:", info.response);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
