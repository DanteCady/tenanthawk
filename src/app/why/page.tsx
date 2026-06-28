import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhyTenantHawk } from "@/components/WhyTenantHawk";

export const metadata: Metadata = {
  title: "Why Tenant Hawk | vs Microsoft native tools",
  description:
    "How Tenant Hawk differs from M365 Admin Center, Secure Score, and Defender: one health score, prioritized fixes, license waste, and read-only tenant scans in minutes.",
  openGraph: {
    title: "Why Tenant Hawk",
    description:
      "Microsoft gives you dashboards. Tenant Hawk gives you one score and a prioritized fix list.",
    type: "website",
  },
};

export default function WhyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-1">
        <WhyTenantHawk />
      </main>
      <Footer />
    </div>
  );
}
