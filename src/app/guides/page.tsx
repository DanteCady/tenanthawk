import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuideCard } from "@/components/guides/GuideCard";
import { GuideCta } from "@/components/guides/GuideCta";
import { GUIDES } from "@/lib/guides/content";

export const metadata: Metadata = {
  title: "Guides — Microsoft 365 tenant health & security",
  description:
    "Evergreen guides for M365 admins and MSPs: tenant health checklists, security misconfigurations, license waste, expiring secrets, hygiene, and audit prep.",
  openGraph: {
    title: "Tenant Hawk Guides — M365 tenant health resources",
    description:
      "Practical guides for Microsoft 365 tenant security, cost optimization, reliability, and hygiene.",
    type: "website",
  },
};

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
              M365 tenant health guides
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Practical checklists for admins and MSPs — security, cost, reliability,
              and hygiene. No fluff, no dated blog posts. Run the same checks
              automatically with a{" "}
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
