import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideSection, GuideShell } from "@/components/guides/GuideShell";
import { GUIDES, GUIDE_BY_SLUG } from "@/lib/guides/content";
import { getSiteUrl } from "@/lib/guides/site-url";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) return {};

  const url = `${getSiteUrl()}/guides/${guide.slug}`;

  return {
    title: `${guide.title} — Tenant Hawk`,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url,
    },
    alternates: { canonical: url },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    author: { "@type": "Organization", name: "Tenant Hawk" },
    publisher: { "@type": "Organization", name: "Tenant Hawk" },
    mainEntityOfPage: `${getSiteUrl()}/guides/${guide.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideShell guide={guide}>
        {guide.sections.map((section) => (
          <GuideSection key={section.title} title={section.title}>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc space-y-2 pl-5">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </GuideSection>
        ))}
      </GuideShell>
    </>
  );
}
