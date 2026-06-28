/**
 * Debug OTP email delivery through the same path as signup.
 * Usage: node scripts/debug-otp-email.mjs [email]
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

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

loadEnv();

const email = process.argv[2] ?? "dcady@precipicetechnology.com";
const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

console.log("SMTP config:");
console.log("  HOST:", process.env.SMTP_HOST ?? "(missing)");
console.log("  USER:", process.env.SMTP_USER ?? "(missing)");
console.log("  PASS:", process.env.SMTP_PASS ? "(set)" : "(missing)");
console.log("  FROM:", process.env.EMAIL_FROM ?? "(default)");
console.log("");

const res = await fetch(`${base}/api/auth/email-otp/send-verification-otp`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: base,
  },
  body: JSON.stringify({ email, type: "email-verification" }),
});

const body = await res.text();
console.log(`POST /api/auth/email-otp/send-verification-otp → ${res.status}`);
console.log(body);

if (!res.ok) process.exit(1);

console.log("\nCheck dev server terminal for [email] logs.");
console.log(`If SMTP accepted, check inbox + junk/quarantine for ${email}`);
