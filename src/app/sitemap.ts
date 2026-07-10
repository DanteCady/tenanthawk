import type { MetadataRoute } from "next";
import { CONTENT_CATEGORIES } from "@/lib/content/categories";
import { COMPARISON_PAGES } from "@/lib/content/comparisons/data";
import { getAllGlossarySlugs } from "@/lib/content/glossary/loader";
import { getAllGuides, getGuidesByCategory, parseContentDate } from "@/lib/content/loader";
import { getSiteUrl } from "@/lib/guides/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const guides = getAllGuides();
  const siteUpdated = guides.reduce(
    (latest, g) => {
      const d = parseContentDate(g.meta.updatedAt || g.meta.publishedAt);
      return d > latest ? d : latest;
    },
    parseContentDate(undefined),
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: siteUpdated, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/learn`, lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/glossary`, lastModified: siteUpdated, changeFrequency: "weekly", priority: 0.88 },
    { url: `${base}/compare`, lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.85 },
    {
      url: `${base}/tools/license-savings-calculator`,
      lastModified: siteUpdated,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    { url: `${base}/why`, lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/features`, lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.88 },
    {
      url: `${base}/features/journal`,
      lastModified: siteUpdated,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/features/expiry-monitoring`,
      lastModified: siteUpdated,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/features/license-waste`,
      lastModified: siteUpdated,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${base}/features/security-assessment`,
      lastModified: siteUpdated,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    { url: `${base}/msp`, lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/pricing`, lastModified: siteUpdated, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/about`, lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.45 },
    { url: `${base}/privacy`, lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: siteUpdated, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CONTENT_CATEGORIES.filter(
    (c) => c !== "overview",
  ).map((category) => {
    const inCategory = getGuidesByCategory(category);
    const lastModified = inCategory.reduce(
      (latest, g) => {
        const d = parseContentDate(g.meta.updatedAt || g.meta.publishedAt);
        return d > latest ? d : latest;
      },
      siteUpdated,
    );
    return {
      url: `${base}/learn/${category}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    };
  });

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${base}/learn/guides/${guide.meta.slug}`,
    lastModified: parseContentDate(guide.meta.updatedAt || guide.meta.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const glossaryRoutes: MetadataRoute.Sitemap = getAllGlossarySlugs().map((slug) => ({
    url: `${base}/glossary/${slug}`,
    lastModified: siteUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const compareRoutes: MetadataRoute.Sitemap = COMPARISON_PAGES.map((page) => ({
    url: `${base}/compare/${page.slug}`,
    lastModified: siteUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...categoryRoutes, ...guideRoutes, ...glossaryRoutes, ...compareRoutes];
}
