import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types";

// Single shared pg Pool - reused by both Kysely (app tables) and Better Auth.
const globalForDb = globalThis as unknown as { __thPool?: Pool };

export const pool =
  globalForDb.__thPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__thPool = pool;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});
