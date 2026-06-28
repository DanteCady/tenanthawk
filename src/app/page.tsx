import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ProblemSection } from "@/components/ProblemSection";
import { Categories } from "@/components/Categories";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { WaitlistSection } from "@/components/WaitlistSection";
import { Footer } from "@/components/Footer";
import { buildPageMetadata } from "@/lib/seo/site";
import {
  organizationSchema,
  softwareApplicationSchema,
  webSiteSchema,
} from "@/lib/seo/schemas";

export const metadata = buildPageMetadata({
  title: "Microsoft 365 & Azure tenant health scanner",
  description:
    "Find security misconfigurations, wasted M365 licenses, and expiring secrets in minutes. Tenant Hawk gives admins and MSPs one health score and a prioritized fix list — read-only, no agents.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          organizationSchema(),
          webSiteSchema(),
          softwareApplicationSchema(),
        ]}
      />
      <div className="min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Stats />
          <ProblemSection />
          <Categories />
          <HowItWorks />
          <Pricing />
          <WaitlistSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
