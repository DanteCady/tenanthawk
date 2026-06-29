import "server-only";
import { pool } from "@/db";
import { validateEnterpriseSlug, slugBaseFromName } from "./slug";

export async function isEnterpriseSlugAvailable(slug: string): Promise<boolean> {
  const validated = validateEnterpriseSlug(slug);
  if (!validated.ok) return false;

  const existing = await pool.query<{ id: string }>(
    `SELECT id FROM organization WHERE slug = $1 LIMIT 1`,
    [validated.slug],
  );
  return existing.rowCount === 0;
}

/** Pick a globally unique, non-reserved slug (adds numeric suffix if needed). */
export async function allocateEnterpriseSlug(
  name: string,
  userId: string,
): Promise<string> {
  let base = slugBaseFromName(name);
  const first = validateEnterpriseSlug(base);
  if (!first.ok) {
    base = `msp-${userId.slice(0, 8).toLowerCase()}`;
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const validated = validateEnterpriseSlug(candidate);
    if (!validated.ok) continue;
    if (await isEnterpriseSlugAvailable(validated.slug)) {
      return validated.slug;
    }
  }

  return `msp-${userId.slice(0, 8).toLowerCase()}`;
}
