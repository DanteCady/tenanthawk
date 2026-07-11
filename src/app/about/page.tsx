import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { COMPANY_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo/site";

// Founder facts — edit here, not in the JSX below.
const FOUNDER = {
  name: "Dante Cady",
  role: "Founder & engineer",
  linkedin: "https://www.linkedin.com/in/dantecady",
};

export const metadata = buildPageMetadata({
  title: "About Tenant Hawk — who builds and runs it",
  description:
    "Tenant Hawk is a read-only Microsoft 365 tenant health scanner built by Dante Cady at Precipice Technology LLC. Who we are, why it exists, and how to reach a human.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl flex-1 px-6 py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About Tenant Hawk</h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-mk-soft">
          <p>
            I&apos;m {FOUNDER.name}, a software engineer, and Tenant Hawk exists because I got
            tired of running the same Microsoft 365 health checks by hand: export disabled
            users, cross-reference sign-in activity, hunt down app secrets about to expire,
            tally the licenses nobody was using. Every tenant, every month, the same admin
            center export dance.
          </p>
          <p>
            The checks themselves were never the hard part — knowing what to look at first
            was. Secure Score, the admin center, and Defender each show a slice; none of
            them puts a dollar figure on a disabled account still holding an E5 license or
            tells you which app secret expires during your vacation. So I built a read-only
            scanner that runs those checks the way an operator actually would, including
            the gotchas: inactivity is judged on non-interactive sign-ins too, because
            mobile users look dead on last interactive sign-in while Teams and Outlook are
            still syncing in the background. Tenant Hawk will show you the finding — we
            still think you should get manager sign-off before reclaiming anything.
          </p>
          <p>
            Tenant Hawk is a product of {COMPANY_LEGAL_NAME}, built and run by a small team
            — me plus a collaborator — not a growth-stage startup with a support queue.
            That cuts both ways: you get answers from the people who wrote the code, and we
            keep the product deliberately narrow. It scans and reports; it never changes
            your tenant. Modern tooling, including AI-assisted development, helps us move
            fast; every check is designed, reviewed, and tested against real tenants by us,
            and the{" "}
            <Link href="/security" className="font-medium text-mk-amber-deep hover:underline">
              full permission model
            </Link>{" "}
            is published so you can verify the read-only claim yourself.
          </p>
          <p>
            Want to talk to a human — security questionnaire, MSP demo, or just to check we
            exist? Email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-mk-amber-deep hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            or find me on{" "}
            <a
              href={FOUNDER.linkedin}
              rel="me noopener noreferrer"
              target="_blank"
              className="font-medium text-mk-amber-deep hover:underline"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/signup" className="mk-btn px-6 py-3">
            Run a free scan
          </Link>
          <Link
            href="/security"
            className="mk-btn-ghost px-6 py-3"
          >
            Security &amp; data handling
          </Link>
        </div>

        <p className="mt-12 text-sm text-mk-muted">
          {COMPANY_LEGAL_NAME} · {FOUNDER.name}, {FOUNDER.role}
        </p>
      </main>
      <Footer />
    </div>
  );
}
