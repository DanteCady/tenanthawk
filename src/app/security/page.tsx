import Link from "next/link";
import { ArrowRight, Eye, KeyRound, ShieldCheck, Trash2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SUPPORT_EMAIL } from "@/lib/brand";
import { graphPermissionRows } from "@/lib/marketing/graph-permissions";
import { SCAN_CHECK_COUNT } from "@/lib/scan/catalog";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Security & data handling — exact Graph permissions, retention, revocation",
  description:
    "Every Microsoft Graph permission Tenant Hawk requests, why each is needed, what data is stored, how long it is kept, and how to revoke access — verifiable on your own admin consent screen.",
  path: "/security",
});

const ACCESS_FACTS = [
  {
    icon: ShieldCheck,
    title: "Application permissions, admin consent, read-only",
    body: "Access is granted through Microsoft's standard admin-consent flow — the same one you use for any multi-tenant app. Every scope we request is a read-only (.Read) permission. There is no write permission in the manifest, so Tenant Hawk cannot change users, licenses, policies, or settings even if it wanted to.",
  },
  {
    icon: KeyRound,
    title: "No credentials touch our systems",
    body: "Consent happens on login.microsoftonline.com, so no one ever types a Microsoft password into Tenant Hawk. Scans authenticate with short-lived app-only tokens acquired from Microsoft at runtime via the client-credentials flow. No access tokens, refresh tokens, or secrets for your tenant are written to our database.",
  },
  {
    icon: Eye,
    title: "Findings, not content",
    body: "Scan results store what you see in the dashboard: check outcomes, severity, affected object names, and license counts. We do not store email bodies, files, or Teams message content — the checks that touch those surfaces read timestamps and settings only, as documented per permission below.",
  },
  {
    icon: Trash2,
    title: "Deletion is real deletion",
    body: "Disconnecting a tenant deletes its connection row, and every scan, finding, and configuration snapshot cascades with it at the database level. Deleting your account removes everything.",
  },
] as const;

const REVOCATION_STEPS = [
  {
    title: "In Tenant Hawk",
    body: "Settings → Connections → Disconnect. This deletes the connection and all scan history for that tenant from our database immediately.",
  },
  {
    title: "In Microsoft Entra",
    body: "Entra ID → Enterprise applications → Tenant Hawk → Delete. This revokes consent on Microsoft's side; our tokens stop working within minutes and no future scan can run.",
  },
  {
    title: "Both work independently",
    body: "You don't need our cooperation to lock us out — revoking in Entra cuts access even if you never touch Tenant Hawk again. We recommend doing both so stored results are deleted too.",
  },
] as const;

export default function SecurityPage() {
  const rows = graphPermissionRows();

  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl flex-1 px-6 py-24">
        <p className="mk-eyebrow">
          Security &amp; data handling
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          What Tenant Hawk can see, what it stores, and how you shut it off
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-mk-soft">
          You are being asked to consent an app into your tenant, so this page skips the
          marketing. Everything below is verifiable: the permission list matches what
          Microsoft shows you on the admin consent screen, and after connecting you can
          audit it any time under{" "}
          <span className="font-medium text-mk-ink2">
            Entra ID → Enterprise applications → Tenant Hawk → Permissions
          </span>
          .
        </p>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">The access model</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {ACCESS_FACTS.map((fact) => (
              <div
                key={fact.title}
                className="rounded-2xl border border-mk-line bg-mk-panel p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mk-amber-wash text-mk-amber">
                  <fact.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 text-lg font-bold">{fact.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mk-soft">{fact.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Every permission we request, and why
          </h2>
          <p className="mt-3 leading-relaxed text-mk-soft">
            {rows.length} Microsoft Graph application permissions power all{" "}
            {SCAN_CHECK_COUNT} checks. This table is generated from the same registry the
            scan engine runs on, so it cannot drift from what the app actually uses. If a
            future check needs a new scope, it will appear here — and on your consent
            screen — before it ships.
          </p>
          <div className="mt-8 space-y-6">
            {rows.map((row) => (
              <div key={row.permission} className="rounded-2xl border border-mk-line p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <code className="text-sm font-semibold text-mk-ink">
                    {row.permission}
                  </code>
                  <span className="text-xs font-medium text-mk-faint">
                    {row.checkLabels.length}{" "}
                    {row.checkLabels.length === 1 ? "check" : "checks"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-mk-soft">
                  <span className="font-medium text-mk-ink2">Grants:</span> {row.grants}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-mk-soft">
                  <span className="font-medium text-mk-ink2">We use it for:</span>{" "}
                  {row.usedFor}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-mk-faint">
                  Powers: {row.checkLabels.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">What we store, and for how long</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-mk-soft">
            <p>
              A scan produces findings — check outcomes with severity, the display names of
              affected objects (a user, group, site, or app name), and aggregate numbers
              like seat counts and estimated monthly waste. That is what we retain, because
              it is what renders your dashboard, trends, and reports.
            </p>
            <p>
              We keep scan history while the tenant stays connected so you can track your
              score over time. Disconnect the tenant and that history is deleted — not
              archived, deleted, enforced by cascading foreign keys in our schema. Account
              deletion removes your user record and everything attached to it.
            </p>
            <p>
              Tenant Hawk runs on Amazon Web Services. All traffic is encrypted in transit
              with TLS. Payments are handled by Stripe; we never see card numbers. The full
              subprocessor list is in the <Link href="/privacy" className="font-medium text-mk-amber-deep hover:underline">privacy policy</Link>.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Revoking access</h2>
          <p className="mt-3 leading-relaxed text-mk-soft">
            Two independent kill switches, in either order:
          </p>
          <ol className="mt-6 space-y-4">
            {REVOCATION_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mk-tint text-sm font-bold text-mk-ink2">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-mk-ink">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mk-soft">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 rounded-2xl border border-mk-amber-line bg-mk-amber-wash/60 p-8">
          <h2 className="text-xl font-bold tracking-tight">Don&apos;t take our word for it</h2>
          <p className="mt-3 text-sm leading-relaxed text-mk-soft">
            The admin consent screen Microsoft shows you lists every permission above —
            compare them before you approve. After connecting, the app appears under
            Enterprise applications in your Entra portal with the same read-only scopes,
            and your audit log records exactly what it reads. If your security review needs
            more than this page, email{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-medium text-mk-amber-deep hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            and a human will answer the questionnaire.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/features/coverage"
              className="group inline-flex items-center gap-2 rounded-xl bg-mk-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mk-ink2"
            >
              See all {SCAN_CHECK_COUNT} checks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center rounded-xl border border-mk-line2 bg-white px-4 py-2.5 text-sm font-semibold text-mk-ink2 transition-colors hover:border-mk-faint"
            >
              Privacy policy
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-xl border border-mk-line2 bg-white px-4 py-2.5 text-sm font-semibold text-mk-ink2 transition-colors hover:border-mk-faint"
            >
              Who runs Tenant Hawk
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
