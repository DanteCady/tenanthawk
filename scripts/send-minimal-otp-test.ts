/**
 * Send a minimal OTP-style email (no localhost links) for deliverability testing.
 * Usage: pnpm exec tsx scripts/send-minimal-otp-test.ts [recipient]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import nodemailer from "nodemailer";

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

  const to = process.argv[2] ?? "dcady@precipicetechnology.com";
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM ?? "Tenant Hawk <alerts@tenanthawk.io>";

  if (!host || !user || !pass) {
    console.error("Missing SMTP_HOST, SMTP_USER, or SMTP_PASS in .env");
    process.exit(1);
  }

  const otp = "000000";
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user: user.trim(), pass: pass.trim() },
    authMethod: "LOGIN",
  });

  console.log(`Sending minimal OTP test to ${to} via ${host}...`);
  const info = await transport.sendMail({
    from,
    to,
    subject: `${otp} is your Tenant Hawk verification code`,
    text: [
      "Tenant Hawk — verify your email",
      "",
      `Your verification code: ${otp}`,
      "",
      "Enter this code on the verification screen to continue onboarding.",
    ].join("\n"),
    html: `<p>Your verification code: <strong style="font-size:24px;letter-spacing:0.2em">${otp}</strong></p>`,
  });

  console.log("Sent:", info.messageId);
  console.log("Response:", info.response);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
