import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/guides/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/onboarding/", "/api/", "/login", "/check-email", "/verify-email"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
