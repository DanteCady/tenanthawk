import "server-only";
import { pool } from "@/db";
import { isMsp } from "@/lib/entitlements";
import { isEmailMspAllowlisted } from "@/lib/entitlements/msp-console";

export type EnterpriseOrgRow = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: string | null;
  createdAt: Date;
};

export type OrgMembership = {
  organizationId: string;
  role: string;
  slug: string;
  name: string;
};

async function queryOrgBySlug(slug: string): Promise<EnterpriseOrgRow | null> {
  const { rows } = await pool.query<EnterpriseOrgRow>(
    `SELECT id, name, slug, logo, metadata, "createdAt"
     FROM organization
     WHERE slug = $1
     LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

async function queryOrgById(id: string): Promise<EnterpriseOrgRow | null> {
  const { rows } = await pool.query<EnterpriseOrgRow>(
    `SELECT id, name, slug, logo, metadata, "createdAt"
     FROM organization
     WHERE id = $1
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getOrganizationBySlug(
  slug: string,
): Promise<EnterpriseOrgRow | null> {
  return queryOrgBySlug(slug.toLowerCase());
}

export async function getUserMemberships(userId: string): Promise<OrgMembership[]> {
  const { rows } = await pool.query<OrgMembership>(
    `SELECT m."organizationId" AS "organizationId", m.role, o.slug, o.name
     FROM member m
     INNER JOIN organization o ON o.id = m."organizationId"
     WHERE m."userId" = $1
     ORDER BY o."createdAt" ASC`,
    [userId],
  );
  return rows;
}

export async function getOrganizationOwnerUserId(
  organizationId: string,
): Promise<string | null> {
  const { rows } = await pool.query<{ userId: string }>(
    `SELECT "userId" FROM member WHERE "organizationId" = $1 AND role = 'owner' LIMIT 1`,
    [organizationId],
  );
  return rows[0]?.userId ?? null;
}

/** Org the user owns (Enterprise MSP workspace). */
export async function getOwnedEnterpriseOrganization(
  userId: string,
): Promise<EnterpriseOrgRow | null> {
  const { rows } = await pool.query<EnterpriseOrgRow>(
    `SELECT o.id, o.name, o.slug, o.logo, o.metadata, o."createdAt"
     FROM organization o
     INNER JOIN member m ON m."organizationId" = o.id
     WHERE m."userId" = $1 AND m.role = 'owner'
     ORDER BY o."createdAt" ASC
     LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

/** User id that owns scan data — org owner when user is invited staff. */
export async function resolveWorkspaceDataUserId(userId: string): Promise<string> {
  const memberships = await getUserMemberships(userId);
  const nonOwner = memberships.find((m) => m.role !== "owner");
  if (!nonOwner) return userId;

  const ownerId = await getOrganizationOwnerUserId(nonOwner.organizationId);
  return ownerId ?? userId;
}

export async function userHasEnterpriseEntitlement(
  userId: string,
  email: string,
): Promise<boolean> {
  if (await isMsp(userId)) return true;
  if (isEmailMspAllowlisted(email)) return true;

  for (const membership of await getUserMemberships(userId)) {
    const ownerId = await getOrganizationOwnerUserId(membership.organizationId);
    if (!ownerId) continue;
    if (await isMsp(ownerId)) return true;
    const { rows } = await pool.query<{ email: string }>(
      `SELECT email FROM "user" WHERE id = $1`,
      [ownerId],
    );
    const ownerEmail = rows[0]?.email;
    if (ownerEmail && isEmailMspAllowlisted(ownerEmail)) return true;
  }

  return false;
}

export async function isOrgAdminOrOwner(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { rows } = await pool.query<{ role: string }>(
    `SELECT role FROM member WHERE "organizationId" = $1 AND "userId" = $2 LIMIT 1`,
    [organizationId, userId],
  );
  const role = rows[0]?.role;
  return role === "owner" || role === "admin";
}

export { queryOrgById };
