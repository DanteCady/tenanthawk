import type { ContentCategory } from "@/lib/content/types";

export type GlossaryCategory = Exclude<ContentCategory, "overview">;

export type GlossaryTerm = {
  slug: string;
  term: string;
  category: GlossaryCategory;
  /** Short definition for SEO and AI citation (target 200–400 characters). */
  definition: string;
  /** Optional deeper context (plain text, paragraph breaks with \\n\\n). */
  body?: string;
  relatedGuideSlug?: string;
  checkId?: string;
  relatedTermSlugs?: string[];
};
