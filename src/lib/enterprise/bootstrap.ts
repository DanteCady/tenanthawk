import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getOwnedEnterpriseOrganization,
  type EnterpriseOrgRow,
} from "@/lib/enterprise/workspace";
import { isEnterpriseSlugAvailable } from "@/lib/enterprise/slug-allocate";
import { validateEnterpriseSlug } from "@/lib/enterprise/slug";

export async function createEnterpriseOrganization(
  userId: string,
  _email: string,
  name: string,
  slug: string,
): Promise<{ org: EnterpriseOrgRow | null; error?: string }> {
  const validated = validateEnterpriseSlug(slug);

  if (!validated.ok) {
    return { org: null, error: validated.error };
  }

  if (!(await isEnterpriseSlugAvailable(validated.slug))) {
    return { org: null, error: "This slug is already taken." };
  }

  const existing = await getOwnedEnterpriseOrganization(userId);
  if (existing) {
    return { org: existing };
  }

  const result = await auth.api.createOrganization({
    body: {
      name: name.trim() || "Enterprise workspace",
      slug: validated.slug,
    },
    headers: await headers(),
  });

  if (result && "id" in result && result.slug) {
    return {
      org: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        logo: result.logo ?? null,
        metadata: result.metadata ? JSON.stringify(result.metadata) : null,
        createdAt: result.createdAt,
      },
    };
  }

  return { org: null, error: "Could not create workspace. Try a different slug." };
}

/** Returns the user's org if it exists - does not auto-create. */
export async function getEnterpriseOrganizationForUser(
  userId: string,
): Promise<EnterpriseOrgRow | null> {
  return getOwnedEnterpriseOrganization(userId);
}
