import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ProblemSection } from "@/components/ProblemSection";
import { Categories } from "@/components/Categories";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { WaitlistSection } from "@/components/WaitlistSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
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
  );
}
