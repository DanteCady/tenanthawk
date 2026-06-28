import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { SUPPORT_EMAIL } from "@/lib/brand";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="app-shell relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="theme-aura pointer-events-none absolute inset-0 -z-10" />
      <Link href="/" className="mb-8">
        <ThemeLogo />
      </Link>
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-slate-500">
        Read-only access · no tenant credentials stored · cancel anytime.
      </p>
      <p className="mt-3 text-center text-xs text-slate-500">
        <Link href="/privacy" className="hover:text-slate-700">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="hover:text-slate-700">
          Terms
        </Link>
        {" · "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-slate-700">
          Support
        </a>
      </p>
    </main>
  );
}
