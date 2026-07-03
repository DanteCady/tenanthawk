import type { MetadataRoute } from "next";
import { CONTENT_CATEGORIES } from "@/lib/content/categories";
import { getAllGuideSlugs } from "@/lib/content/loader";
import { getSiteUrl } from "@/lib/guides/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/why`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CONTENT_CATEGORIES.filter(
    (c) => c !== "overview",
  ).map((category) => ({
    url: `${base}/learn/${category}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const guideRoutes: MetadataRoute.Sitemap = getAllGuideSlugs().map((slug) => ({
    url: `${base}/learn/guides/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...guideRoutes];
}
