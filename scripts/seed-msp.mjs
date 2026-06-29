// Seed an MSP-style demo user: Pro plan + 3 demo client tenants with scans.
// Run: pnpm seed:msp  (or node --experimental-strip-types --env-file=.env scripts/seed-msp.mjs)

import { randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";
import { getDemoFindings } from "../src/lib/scan/demo.ts";
import { scoreFindings } from "../src/lib/scan/score.ts";

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

const DATABASE_URL = process.env.DATABASE_URL;

const USER = {
  name: "MSP Demo Admin",
  email: (process.env.SEED_MSP_EMAIL || "msp@tenanthawk.app").toLowerCase(),
  password: process.env.SEED_MSP_PASSWORD || "TenantHawk!MSP1",
};

const CLIENTS = [
  {
    display_name: "Contoso Holdings",
    tenant_domain: "contoso.onmicrosoft.com",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    targetScore: 72,
  },
  {
    display_name: "Fabrikam Legal",
    tenant_domain: "fabrikam.onmicrosoft.com",
    tenant_id: "22222222-2222-2222-2222-222222222222",
    targetScore: 58,
  },
  {
    display_name: "Northwind Traders",
    tenant_domain: "northwind.onmicrosoft.com",
    tenant_id: "33333333-3333-3333-3333-333333333333",
    targetScore: 84,
  },
];

async function ensureUser(pool) {
  const existing = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [
    USER.email,
  ]);
  if (existing.rows[0]) {
    console.log("• MSP user already exists");
    return existing.rows[0].id;
  }

  const userId = randomUUID();
  const accountId = randomUUID();
  const now = new Date();
  const hashed = await hashPassword(USER.password);

  await pool.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, true, $4, $4)`,
    [userId, USER.name, USER.email, now],
  );

  await pool.query(
    `INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     VALUES ($1, $2, 'credential', $3, $4, $5, $5)`,
    [accountId, userId, userId, hashed, now],
  );

  console.log("✓ Created MSP user");
  return userId;
}

async function ensurePro(pool, userId) {
  await pool.query(`DELETE FROM subscription WHERE "referenceId" = $1`, [userId]);
  await pool.query(
    `INSERT INTO subscription (id, plan, "referenceId", status, "stripeCustomerId", "stripeSubscriptionId")
     VALUES ($1, 'pro', $2, 'active', 'dev_customer_msp', 'dev_sub_msp')`,
    [randomUUID(), userId],
  );
  console.log("✓ Granted Pro (full access)");
}

async function ensureConnection(pool, userId, client) {
  const existing = await pool.query(
    `SELECT id FROM connection WHERE user_id = $1 AND tenant_id = $2`,
    [userId, client.tenant_id],
  );
  if (existing.rows[0]) {
    console.log(`• Client exists: ${client.display_name}`);
    return existing.rows[0].id;
  }

  const id = randomUUID();
  await pool.query(
    `INSERT INTO connection (id, user_id, provider, tenant_id, tenant_domain, display_name, mode, status)
     VALUES ($1, $2, 'microsoft', $3, $4, $5, 'demo', 'active')`,
    [id, userId, client.tenant_id, client.tenant_domain, client.display_name],
  );
  console.log(`✓ Added client: ${client.display_name}`);
  return id;
}

async function hasCompleteScan(pool, connectionId) {
  const res = await pool.query(
    `SELECT id FROM scan WHERE connection_id = $1 AND status = 'complete' LIMIT 1`,
    [connectionId],
  );
  return res.rowCount > 0;
}

async function seedScan(pool, connectionId, targetScore) {
  const drafts = getDemoFindings();
  const { categoryScores } = scoreFindings(drafts);
  const scanId = randomUUID();
  const now = new Date();

  await pool.query(
    `INSERT INTO scan (id, connection_id, status, score, category_scores, started_at, completed_at, source)
     VALUES ($1, $2, 'complete', $3, $4, $5, $5, 'manual')`,
    [scanId, connectionId, targetScore, JSON.stringify(categoryScores), now],
  );

  for (const d of drafts) {
    await pool.query(
      `INSERT INTO finding (id, scan_id, category, check_id, severity, title, description, impact, remediation, entity_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        randomUUID(),
        scanId,
        d.category,
        d.checkId,
        d.severity,
        d.title,
        d.description,
        d.impact ? JSON.stringify(d.impact) : null,
        d.remediation,
        d.entityRef ?? null,
      ],
    );
  }
}

async function main() {
  if (!DATABASE_URL) {
    console.error("✗ DATABASE_URL is required.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  try {
    const userId = await ensureUser(pool);
    await ensurePro(pool, userId);

    for (const client of CLIENTS) {
      const connectionId = await ensureConnection(pool, userId, client);
      const scanned = await hasCompleteScan(pool, connectionId);
      if (scanned) {
        await pool.query(
          `UPDATE scan SET score = $2
           WHERE id = (
             SELECT id FROM scan
             WHERE connection_id = $1 AND status = 'complete'
             ORDER BY started_at DESC LIMIT 1
           )`,
          [connectionId, client.targetScore],
        );
        console.log(`• Scan exists: ${client.display_name} (score ${client.targetScore})`);
      } else {
        await seedScan(pool, connectionId, client.targetScore);
        console.log(`✓ Scanned: ${client.display_name} (score ${client.targetScore})`);
      }
    }

    const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("\n────────────────────────────────");
    console.log("  MSP test user ready");
    console.log(`  URL:       ${base}/login`);
    console.log(`  Email:     ${USER.email}`);
    console.log(`  Password:  ${USER.password}`);
    console.log(`  Clients:   ${CLIENTS.length} demo tenants`);
    console.log(`  Workspaces: ${base}/dashboard/workspaces`);
    console.log("────────────────────────────────\n");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
