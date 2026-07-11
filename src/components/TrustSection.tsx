import Link from "next/link";
import { Reveal } from "./Reveal";

const securityPoints = [
  {
    title: "Read-only by design",
    desc: "Tenant Hawk connects through read-only Microsoft Graph scopes — every permission we request is published, with why. It cannot change a single setting in your tenant.",
  },
  {
    title: "No credentials stored",
    desc: "Access uses admin consent, not passwords. Revoke the enterprise app in Entra at any time and access ends — no cooperation from us required.",
  },
  {
    title: "Your data, minimized",
    desc: "Scans store findings and metadata — not mailbox content, files, or messages. Disconnect a tenant and its scan history is deleted with it.",
  },
];

export function TrustSection() {
  return (
    <section id="security" className="scroll-mt-16 border-t border-mk-line bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-18">
        <div className="grid items-start gap-10 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <Reveal>
            <p className="mk-eyebrow mb-4">Security posture</p>
            <h3 className="text-[26px] font-[640] leading-[1.25] tracking-[-0.02em]">
              Built to never touch your tenant.
            </h3>
            <Link
              href="/security"
              className="mt-4 inline-block border-b-[1.5px] border-mk-amber pb-0.5 text-[14.5px] font-[550] text-mk-ink transition-colors hover:text-[#b36a00]"
            >
              Every permission, documented →
            </Link>
          </Reveal>

          <div className="grid gap-9 sm:grid-cols-3">
            {securityPoints.map((sp, i) => (
              <Reveal key={sp.title} delay={0.05 + i * 0.05}>
                <div className="mb-[7px] text-[15px] font-semibold">{sp.title}</div>
                <div className="text-[13.5px] leading-[1.6] text-mk-muted">{sp.desc}</div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-12 border-t border-mk-linesoft pt-8" delay={0.2}>
          <p className="text-sm leading-relaxed text-mk-muted">
            Tenant Hawk is built and run by{" "}
            <Link
              href="/about"
              className="font-semibold text-mk-ink2 underline decoration-mk-amber-line underline-offset-4 transition-colors hover:text-mk-ink"
            >
              Dante Cady
            </Link>
            , an engineer who got tired of running these checks by hand — not an anonymous
            dashboard. The people answering support wrote the scanner.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
