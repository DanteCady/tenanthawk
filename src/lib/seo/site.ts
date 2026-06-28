import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/guides/site-url";
import { COMPANY_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/brand";

export const SITE_NAME = "Tenant Hawk";

export const DEFAULT_TITLE =
  "Tenant Hawk | Microsoft 365 & Azure tenant health scanner";

export const DEFAULT_DESCRIPTION =
  "Tenant Hawk scans Microsoft 365, Entra ID, and Azure for security gaps, wasted license spend, expiring secrets, and hygiene drift. One health score, prioritized fixes, and recoverable dollars — built for M365 admins, MSPs, and IT leaders.";

export const OG_IMAGE_ALT =
  "Tenant Hawk — Microsoft 365 and Azure tenant health scanner for admins and MSPs";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
  type: "image/png" as const,
};

/** Keywords aligned with how admins search for tenant health tools. */
export const TARGET_KEYWORDS = [
  "Microsoft 365 tenant health",
  "M365 security assessment",
  "Entra ID security audit",
  "Azure tenant health check",
  "Microsoft 365 license waste",
  "unused M365 licenses",
  "M365 admin tools",
  "MSP Microsoft 365 monitoring",
  "Microsoft Secure Score alternative",
  "Conditional Access audit",
  "expiring app registration secrets",
  "Microsoft 365 compliance checklist",
  "tenant hygiene",
  "Microsoft 365 cost optimization",
  "read-only M365 scan",
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
