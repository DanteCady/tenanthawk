import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhyTenantHawk } from "@/components/WhyTenantHawk";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";
import { WHY_FAQ } from "@/lib/seo/why-faq";

export const metadata = buildPageMetadata({
  title: "Why Tenant Hawk vs Secure Score, Admin Center & Defender",
  description:
    "Compare Tenant Hawk to Microsoft Secure Score, M365 Admin Center, and Defender. One tenant health score, license waste ranked by dollars, expiring secrets, and read-only scans in minutes.",
  path: "/why",
});

export default function WhyPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(WHY_FAQ)} />
      <div className="marketing-page min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="flex-1">
          <WhyTenantHawk />
        </main>
        <Footer />
      </div>
    </>
  );
}
