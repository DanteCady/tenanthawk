import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/guides/site-url";
import { COMPANY_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/brand";

export const SITE_NAME = "Tenant Hawk";

export const DEFAULT_TITLE =
  "Tenant Hawk | M365 tenant health score & license waste scanner";

/** Keep ~120–155 chars — Bing flags under 25 or over ~160. */
export const DEFAULT_DESCRIPTION =
  "One read-only M365 scan. One health score. Dollar impact on every finding, plus a prioritized fix list for admins and MSPs.";

export const OG_IMAGE_ALT =
  "Tenant Hawk - M365 tenant health score and license waste scanner for admins and MSPs";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
  type: "image/png" as const,
};

/**
 * Keywords aligned with how admins actually search - cleanup, overview,
 * hygiene, and audit terms from Reddit, Spiceworks, and competitor content.
 */
export const TARGET_KEYWORDS = [
  // Cleanup & overview (high-volume, problem-aware searches)
  "M365 clean up",
  "M365 cleanup",
  "M365 clean up tool",
  "clean Microsoft 365 tenant",
  "Microsoft 365 tenant cleanup",
  "M365 tenant cleanup tool",
  "M365 overview",
  "Microsoft 365 tenant overview",
  "M365 tenant audit",
  "Microsoft 365 health check",
  // Inactive users & license reclamation
  "inactive users M365 cleanup",
  "clean up inactive users Microsoft 365",
  "unused M365 licenses",
  "reclaim M365 licenses",
  "Microsoft 365 license waste",
  "orphaned accounts Microsoft 365",
  // Security & hygiene
  "Microsoft 365 tenant health",
  "M365 security assessment",
  "M365 tenant hygiene",
  "tenant hygiene Microsoft 365",
  "Entra ID security audit",
  "Conditional Access audit",
  "Microsoft Secure Score alternative",
  // MSP & tooling
  "M365 admin tools",
  "MSP Microsoft 365 monitoring",
  "read-only M365 scan",
  "Microsoft 365 compliance checklist",
  "Azure tenant health check",
  "expiring app registration secrets",
  "Microsoft 365 cost optimization",
];

/** Homepage-specific keywords - broader cleanup + overview intent. */
export const HOMEPAGE_KEYWORDS = [
  "M365 clean up tool",
  "M365 cleanup tool",
  "clean M365 tenant",
  "Microsoft 365 cleanup",
  "M365 tenant overview",
  "M365 health overview",
  "Microsoft 365 tenant health scanner",
  "M365 audit tool",
  ...TARGET_KEYWORDS,
];

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export const rootMetadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: TARGET_KEYWORDS,
  authors: [{ name: COMPANY_LEGAL_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: COMPANY_LEGAL_NAME,
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: getSiteUrl(),
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  other: {
    "contact:email": SUPPORT_EMAIL,
  },
};

export function buildPageMetadata({
  title,
  description,
  path = "",
  type = "website",
  keywords,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  const url = `${getSiteUrl()}${normalizedPath || ""}`;

  return {
    title,
    description,
    keywords: keywords ?? TARGET_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
