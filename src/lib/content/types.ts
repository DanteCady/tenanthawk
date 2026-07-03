import type { Category } from "@/db/types";

export type ContentCategory = "overview" | "identity" | "governance" | Category;

export type ContentType = "guide" | "checklist" | "compare";

export type FaqItem = { q: string; a: string };

export type SourceReference = {
  title: string;
  url: string;
  publisher?: string;
};

export type ContentMeta = {
  title: string;
  description: string;
  slug: string;
  type: ContentType;
  category: ContentCategory;
  checkIds: string[];
  relatedSlugs: string[];
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  quickAnswer: string;
  faq: FaqItem[];
  sources: SourceReference[];
  targetKeyword?: string;
  redditSource?: string;
};

export type ContentHeading = {
  id: string;
  title: string;
};

export type LoadedContent = {
  meta: ContentMeta;
  body: string;
  headings: ContentHeading[];
};
