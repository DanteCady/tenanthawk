import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentCta } from "@/components/content/ContentCta";
import {
  CONTENT_CATEGORIES,
  CONTENT_CATEGORY_DESCRIPTION,
  CONTENT_CATEGORY_LABEL,
} from "@/lib/content/categories";
import { getAllGuides } from "@/lib/content/loader";

export const metadata = buildPageMetadata({
  title: "M365 cleanup & tenant health guides for admins",
  description:
    "Free guides for Microsoft 365 cleanup: inactive users, unused licenses, tenant hygiene, security misconfigurations, expiring secrets, and audit prep. Then automate the checks with a free Tenant Hawk scan.",
  path: "/learn",
});

export default function LearnIndexPage() {
  const guides = getAllGuides();

  return (
    <div className="learn-page min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Learn
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              M365 cleanup &amp; tenant health guides
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Practical guides for cleaning up Microsoft 365: inactive users,
              license waste, security drift, and tenant hygiene. Run the same
              checks automatically with a{" "}
              <Link href="/signup" className="font-medium text-blue-700 hover:underline">
                free Tenant Hawk scan
              </Link>
              .
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_CATEGORIES.filter((c) => c !== "overview").map((category) => (
              <Link
                key={category}
                href={`/learn/${category}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition-colors hover:border-slate-300 hover:bg-white"
              >
                <h2 className="font-semibold text-slate-900">
                  {CONTENT_CATEGORY_LABEL[category]}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {CONTENT_CATEGORY_DESCRIPTION[category]}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <ContentCard key={guide.meta.slug} meta={guide.meta} />
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl">
            <ContentCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
