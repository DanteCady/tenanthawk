import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

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
      <div className="light-aura pointer-events-none absolute inset-0 -z-10" />
      <Link href="/" className="mb-8">
        <Logo tone="light" />
      </Link>
      <div className="surface-card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-slate-500">
        Read-only access · no tenant credentials stored · cancel anytime.
      </p>
    </main>
  );
}
