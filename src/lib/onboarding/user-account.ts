import "server-only";
import { pool } from "@/db";
import type { AccountType } from "./account-type";

export async function getUserAccountType(
  userId: string,
): Promise<AccountType | null> {
  const result = await pool.query<{ accountType: string | null }>(
    `SELECT "accountType" FROM "user" WHERE id = $1 LIMIT 1`,
    [userId],
  );
  const raw = result.rows[0]?.accountType;
  if (raw === "individual" || raw === "msp") return raw;
  return null;
}
