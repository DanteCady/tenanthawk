import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuideCard } from "@/components/guides/GuideCard";
import { GuideCta } from "@/components/guides/GuideCta";
import { GUIDES } from "@/lib/guides/content";

export const metadata = buildPageMetadata({
  title: "M365 cleanup & tenant health guides for admins",
  description:
    "Free guides for Microsoft 365 cleanup: inactive users, unused licenses, tenant hygiene, security misconfigurations, expiring secrets, and audit prep — then automate the checks with a free Tenant Hawk scan.",
  path: "/guides",
});

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Resources
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              M365 cleanup &amp; tenant health guides
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Practical guides for cleaning up Microsoft 365 — inactive users,
              license waste, security drift, and tenant hygiene. No fluff. Run
              the same checks automatically with a{" "}
              <Link href="/signup" className="font-medium text-blue-700 hover:underline">
                free Tenant Hawk scan
              </Link>
              .
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GUIDES.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl">
            <GuideCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
