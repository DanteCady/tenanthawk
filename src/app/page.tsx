import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseHostContext } from "@/lib/platform/admin";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ProblemSection } from "@/components/ProblemSection";
import { Categories } from "@/components/Categories";
import { HowItWorks } from "@/components/HowItWorks";
import { MspConsoleSection } from "@/components/MspConsoleSection";
import { Pricing } from "@/components/Pricing";
import { WaitlistSection } from "@/components/WaitlistSection";
import { Footer } from "@/components/Footer";
import { buildPageMetadata, HOMEPAGE_KEYWORDS } from "@/lib/seo/site";
import {
  organizationSchema,
  softwareApplicationSchema,
  webSiteSchema,
} from "@/lib/seo/schemas";

export const metadata = buildPageMetadata({
  title: "M365 tenant cleanup tool & health overview",
  description:
    "Clean up Microsoft 365 in minutes — find inactive users, unused licenses, security misconfigurations, and expiring secrets. One read-only scan, one health score, and a prioritized fix list for admins and MSPs.",
  path: "/",
  keywords: HOMEPAGE_KEYWORDS,
});

export default async function Home() {
  const ctx = parseHostContext((await headers()).get("host"));
  if (ctx.kind === "platform-admin") {
    redirect("/admin");
  }

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
          <MspConsoleSection />
          <Pricing />
          <WaitlistSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
