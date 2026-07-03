import { getSiteUrl } from "@/lib/guides/site-url";
import { COMPANY_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/brand";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "./site";
import type { FaqItem } from "./why-faq";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: COMPANY_LEGAL_NAME,
    url: getSiteUrl(),
    email: SUPPORT_EMAIL,
    description: DEFAULT_DESCRIPTION,
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier with manual tenant scans",
      },
      {
        "@type": "Offer",
        price: "49",
        priceCurrency: "USD",
        description: "Pro - daily scans, drift alerts, compliance mapping, and exports",
      },
    ],
    featureList: [
      "M365 tenant cleanup overview - inactive users, licenses, and hygiene in one scan",
      "Read-only Microsoft 365 and Entra ID tenant scan",
      "Unified health score across security, cost, reliability, and hygiene",
      "License waste detection with estimated recoverable spend",
      "Inactive and orphaned account detection",
      "Expiring secrets, certificates, and domain monitoring",
      "Prioritized remediation roadmap with Microsoft doc links",
      "CIS and NIST compliance mapping (Pro)",
    ],
    audience: {
      "@type": "Audience",
      audienceType: "Microsoft 365 administrators, MSPs, and IT security leaders",
    },
  };
}

export function faqPageSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function articleSchema({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
}: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  const url = `${getSiteUrl()}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
    mainEntityOfPage: url,
    url,
  };
}

export function breadcrumbListSchema(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${getSiteUrl()}${item.path}`,
    })),
  };
}
