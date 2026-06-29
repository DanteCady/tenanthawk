import { getReservedSlugs } from "./config";

const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])?$/;

export type SlugValidationResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase();
}

export function slugBaseFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function validateEnterpriseSlug(input: string): SlugValidationResult {
  const slug = normalizeSlug(input);
  if (!slug) {
    return { ok: false, error: "Workspace slug is required." };
  }
  if (slug.length < 3) {
    return { ok: false, error: "Slug must be at least 3 characters." };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      error: "Use lowercase letters, numbers, and hyphens (not at the start or end).",
    };
  }
  if (getReservedSlugs().has(slug)) {
    return { ok: false, error: "This slug is reserved." };
  }
  return { ok: true, slug };
}
