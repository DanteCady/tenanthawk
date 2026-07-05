import type { GlossaryCategory, GlossaryTerm } from "./types";
import { GLOSSARY_BY_SLUG, GLOSSARY_TERMS } from "./terms";

export { GLOSSARY_CATEGORY_LABEL, GLOSSARY_CATEGORIES } from "./terms";

export function getAllGlossarySlugs(): string[] {
  return GLOSSARY_TERMS.map((t) => t.slug);
}

export function getGlossaryTerm(slug: string): GlossaryTerm | null {
  return GLOSSARY_BY_SLUG[slug] ?? null;
}

export function getAllGlossaryTerms(): GlossaryTerm[] {
  return GLOSSARY_TERMS;
}

export function getGlossaryTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return GLOSSARY_TERMS.filter((t) => t.category === category);
}

export function getRelatedGlossaryTerms(term: GlossaryTerm): GlossaryTerm[] {
  if (!term.relatedTermSlugs?.length) return [];
  return term.relatedTermSlugs
    .map((slug) => GLOSSARY_BY_SLUG[slug])
    .filter((t): t is GlossaryTerm => t !== undefined);
}
