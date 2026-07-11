import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LEGAL_EMAIL, SUPPORT_EMAIL } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Contact Tenant Hawk",
  description:
    "Reach Tenant Hawk support for product help, billing questions, MSP enterprise demos, and security inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h1>
        <p className="mt-4 text-lg text-mk-soft">
          We respond to most messages within one business day.
        </p>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-mk-ink">Product &amp; support</h2>
            <p className="mt-2 text-mk-soft">
              Scans, billing, MSP console, and account help.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-2 inline-block font-medium text-mk-amber-deep hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-mk-ink">Legal &amp; privacy</h2>
            <p className="mt-2 text-mk-soft">Terms, privacy, and data handling questions.</p>
            <a
              href={`mailto:${LEGAL_EMAIL}`}
              className="mt-2 inline-block font-medium text-mk-amber-deep hover:underline"
            >
              {LEGAL_EMAIL}
            </a>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-mk-ink">MSP &amp; enterprise</h2>
            <p className="mt-2 text-mk-soft">
              Multi-tenant console, SSO, volume pricing, and client scorecards.
            </p>
            <Link href="/msp" className="mt-2 inline-block font-medium text-mk-amber-deep hover:underline">
              See MSP features
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
