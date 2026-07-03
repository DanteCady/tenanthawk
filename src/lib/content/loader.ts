import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { ContentCategory, ContentMeta, LoadedContent } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content/guides");

function parseMeta(data: Record<string, unknown>, slug: string): ContentMeta {
  return {
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    slug: String(data.slug ?? slug),
    type: (data.type as ContentMeta["type"]) ?? "guide",
    category: (data.category as ContentCategory) ?? "overview",
    checkIds: Array.isArray(data.checkIds) ? data.checkIds.map(String) : [],
    relatedSlugs: Array.isArray(data.relatedSlugs) ? data.relatedSlugs.map(String) : [],
    readTime: String(data.readTime ?? ""),
    publishedAt: String(data.publishedAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
    quickAnswer: String(data.quickAnswer ?? data.description ?? ""),
    faq: Array.isArray(data.faq)
      ? data.faq.map((item) => {
          const row = item as { q?: string; a?: string };
          return { q: String(row.q ?? ""), a: String(row.a ?? "") };
        })
      : [],
    sources: Array.isArray(data.sources)
      ? data.sources.map((item) => {
          const row = item as { title?: string; url?: string; publisher?: string };
          return {
            title: String(row.title ?? ""),
            url: String(row.url ?? ""),
            publisher: row.publisher ? String(row.publisher) : undefined,
          };
        })
      : [],
    targetKeyword: data.targetKeyword ? String(data.targetKeyword) : undefined,
    redditSource: data.redditSource ? String(data.redditSource) : undefined,
  };
}

export function extractHeadings(markdown: string) {
  const headings: LoadedContent["headings"] = [];
  const re = /^## (.+)$/gm;
  const slugger = new GithubSlugger();
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const title = match[1].trim();
    headings.push({ id: slugger.slug(title), title });
  }
  return headings;
}

function loadRaw(slug: string): LoadedContent | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const body = content.trim();
  return {
    meta: parseMeta(data, slug),
    body,
    headings: extractHeadings(body),
  };
}

export function getAllGuideSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""))
    .sort();
}

export function getGuideBySlug(slug: string): LoadedContent | null {
  return loadRaw(slug);
}

export function getAllGuides(): LoadedContent[] {
  return getAllGuideSlugs()
    .map((slug) => getGuideBySlug(slug))
    .filter((g): g is LoadedContent => g !== null);
}

export function getGuidesByCategory(category: ContentCategory): LoadedContent[] {
  return getAllGuides().filter((g) => g.meta.category === category);
}

export const GUIDE_BY_SLUG: Record<string, LoadedContent> = Object.fromEntries(
  getAllGuideSlugs()
    .map((slug) => {
      const guide = getGuideBySlug(slug);
      return guide ? [slug, guide] : null;
    })
    .filter(Boolean) as [string, LoadedContent][],
);
