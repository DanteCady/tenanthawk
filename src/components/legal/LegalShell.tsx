import Link from "next/link";
import { Logo } from "@/components/Logo";
import { COMPANY_LEGAL_NAME, LEGAL_EMAIL, SUPPORT_EMAIL, copyrightLine } from "@/lib/brand";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" aria-label="Tenant Hawk home">
            <Logo tone="light" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated {updated}</p>
        <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-slate-700">
          {children}
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{copyrightLine()}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-800">
              Terms
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-slate-800">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export function LegalContact() {
  return (
    <p>
      Questions? Contact us at{" "}
      <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium text-blue-700 hover:underline">
        {LEGAL_EMAIL}
      </a>{" "}
      or{" "}
      <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-blue-700 hover:underline">
        {SUPPORT_EMAIL}
      </a>
      .
    </p>
  );
}
