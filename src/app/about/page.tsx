import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { COMPANY_LEGAL_NAME, PRODUCT_ATTRIBUTION, SUPPORT_EMAIL } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "About Tenant Hawk",
  description:
    "Tenant Hawk is a read-only Microsoft 365 tenant health scanner built for IT admins, consultants, and MSPs who need one score, dollar-ranked findings, and prioritized fixes.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="marketing-page min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About Tenant Hawk</h1>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-slate-600">
          <p>
            Tenant Hawk helps Microsoft 365 admins, consultants, and MSPs understand tenant health
            without spreadsheets or manual checklists. One read-only Graph scan produces a health
            score, license waste ranked in dollars, expiring secrets and certs, and a prioritized
            fix list.
          </p>
          <p>
            We built it because M365 hygiene work is rarely hard — it is hard to see what matters
            first. Secure Score, the admin center, and Defender each show part of the picture.
            Tenant Hawk rolls the operational gaps into one operator-friendly report.
          </p>
          <p>{PRODUCT_ATTRIBUTION}</p>
          <p>
            Questions or MSP demos? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-blue-700 hover:underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/signup" className="btn-primary px-6 py-3">
            Run a free scan
          </Link>
          <Link
            href="/why"
            className="inline-flex items-center rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-slate-400"
          >
            Why Tenant Hawk
          </Link>
        </div>
        <p className="mt-12 text-sm text-slate-500">{COMPANY_LEGAL_NAME}</p>
      </main>
      <Footer />
    </div>
  );
}
