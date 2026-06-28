import "server-only";
import { randomBytes } from "crypto";
import { db } from "@/db";

const DEFAULT_TTL_DAYS = 30;

export function generateShareToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function listReportShares(userId: string) {
  return db
    .selectFrom("report_share")
    .selectAll()
    .where("user_id", "=", userId)
    .where("revoked_at", "is", null)
    .orderBy("created_at", "desc")
    .execute();
}

export async function createReportShare(opts: {
  userId: string;
  connectionId: string;
  label?: string;
  expiresInDays?: number | null;
}) {
  const id = crypto.randomUUID();
  const token = generateShareToken();
  const expiresInDays = opts.expiresInDays ?? DEFAULT_TTL_DAYS;
  const expiresAt =
    expiresInDays == null
      ? null
      : new Date(Date.now() + expiresInDays * 86_400_000).toISOString();

  await db
    .insertInto("report_share")
    .values({
      id,
      user_id: opts.userId,
      connection_id: opts.connectionId,
      token,
      label: opts.label ?? null,
      expires_at: expiresAt,
    })
    .execute();

  return db
    .selectFrom("report_share")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}

export async function revokeReportShare(userId: string, shareId: string) {
  const row = await db
    .selectFrom("report_share")
    .select(["id"])
    .where("id", "=", shareId)
    .where("user_id", "=", userId)
    .where("revoked_at", "is", null)
    .executeTakeFirst();

  if (!row) return false;

  await db
    .updateTable("report_share")
    .set({ revoked_at: new Date().toISOString() })
    .where("id", "=", shareId)
    .execute();

  return true;
}

export async function getActiveShareByToken(token: string) {
  const share = await db
    .selectFrom("report_share")
    .selectAll()
    .where("token", "=", token)
    .where("revoked_at", "is", null)
    .executeTakeFirst();

  if (!share) return null;
  if (share.expires_at && new Date(share.expires_at) < new Date()) return null;

  return share;
}

export function shareUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/shared/${token}`;
}
