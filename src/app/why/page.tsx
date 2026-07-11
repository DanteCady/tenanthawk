import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhyTenantHawk } from "@/components/WhyTenantHawk";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";
import { WHY_FAQ } from "@/lib/seo/why-faq";

export const metadata = buildPageMetadata({
  title: "Why Tenant Hawk — Read-Only M365 Health Scans for IT Teams & MSPs",
  description:
    "Compare Tenant Hawk to Microsoft Secure Score, M365 Admin Center, and Defender. One tenant health score, license waste ranked by dollars, expiring secrets, and read-only scans in minutes — no agents required.",
  path: "/why",
});

export default function WhyPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(WHY_FAQ)} />
      <div className="marketing-v2 min-h-screen">
        <Navbar />
        <main className="flex-1">
          <WhyTenantHawk />
        </main>
        <Footer />
      </div>
    </>
  );
}
