// Seed a full-access (Pro) demo user with a completed scan.
// Requires the dev server running (pnpm dev). Run: pnpm seed
//
// Uses the app's own HTTP endpoints so passwords are hashed by Better Auth and
// the Pro entitlement is set the same way the app reads it.

import pg from "pg";

const BASE = process.env.APP_URL || "http://localhost:3000";
const DATABASE_URL = process.env.DATABASE_URL;
const USER = {
  name: "Demo Admin",
  email: process.env.SEED_EMAIL || "demo@tenanthawk.app",
  password: process.env.SEED_PASSWORD || "TenantHawk!Demo1",
};

function makeJar() {
  const m = new Map();
  return {
    absorb(res) {
      const cookies = res.headers.getSetCookie?.() ?? [];
      for (const c of cookies) {
        const [pair] = c.split(";");
        const idx = pair.indexOf("=");
        if (idx > 0) m.set(pair.slice(0, idx).trim(), pair.slice(idx + 1));
      }
    },
    header() {
      return [...m].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    get size() {
      return m.size;
    },
  };
}

async function post(path, body, jar) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE,
      ...(jar.size ? { Cookie: jar.header() } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  jar.absorb(res);
  return res;
}

async function verifyEmailInDb(email) {
  if (!DATABASE_URL) {
    console.error("✗ No session and DATABASE_URL unset — can't verify seed user email.");
    return false;
  }
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const res = await pool.query(
      `UPDATE "user" SET "emailVerified" = true WHERE email = $1`,
      [email.toLowerCase()],
    );
    return res.rowCount > 0;
  } finally {
    await pool.end();
  }
}

async function main() {
  // sanity: server up?
  try {
    await fetch(BASE);
  } catch {
    console.error(`✗ Can't reach ${BASE}. Start the dev server first (pnpm dev).`);
    process.exit(1);
  }

  const jar = makeJar();

  let res = await post("/api/auth/sign-up/email", USER, jar);
  if (res.ok) {
    console.log("✓ Created user");
  } else {
    // already exists — sign in to get a session
    const signin = await post(
      "/api/auth/sign-in/email",
      { email: USER.email, password: USER.password },
      jar,
    );
    if (!signin.ok) {
      console.error("✗ Sign-up and sign-in both failed:", await signin.text());
      process.exit(1);
    }
    console.log("✓ User already existed — signed in");
  }

  if (!jar.size) {
    const verified = await verifyEmailInDb(USER.email);
    if (!verified) {
      console.error("✗ No session cookie obtained.");
      process.exit(1);
    }
    console.log("✓ Marked email verified (dev seed)");
    const signin = await post(
      "/api/auth/sign-in/email",
      { email: USER.email, password: USER.password },
      jar,
    );
    if (!signin.ok || !jar.size) {
      console.error("✗ Sign-in after email verification failed:", await signin.text());
      process.exit(1);
    }
  }

  const demo = await post("/api/connect/demo", undefined, jar);
  console.log(demo.ok ? "✓ Demo tenant connected + scanned" : "✗ Demo scan failed");

  const plan = await post("/api/dev/plan", { plan: "pro" }, jar);
  if (plan.ok) {
    console.log("✓ Granted Pro (full access)");
  } else {
    console.log(
      "• Could not grant Pro via dev endpoint (Stripe likely configured) — upgrade via Billing instead.",
    );
  }

  console.log("\n────────────────────────────────");
  console.log("  Test user ready — full access");
  console.log(`  URL:      ${BASE}/login`);
  console.log(`  Email:    ${USER.email}`);
  console.log(`  Password: ${USER.password}`);
  console.log("────────────────────────────────\n");
}

main();
