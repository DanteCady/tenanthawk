"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronRight } from "lucide-react";

export function ClientContextBar({
  connectionId,
  label,
  show,
}: {
  connectionId: string;
  label: string;
  show: boolean;
}) {
  const pathname = usePathname();

  if (!show) return null;

  if (
    pathname === "/dashboard" ||
    pathname === "/dashboard/clients" ||
    pathname.startsWith("/dashboard/client")
  ) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)] px-4 py-2.5 text-sm">
      <Building2 className="h-4 w-4 shrink-0 text-[var(--th-brand-text)]" aria-hidden />
      <span className="text-[var(--th-text-muted)]">Client</span>
      <Link
        href={`/dashboard/client?connection=${connectionId}`}
        className="font-semibold text-[var(--th-text)] hover:text-[var(--th-brand-text)]"
      >
        {label}
      </Link>
      <ChevronRight className="h-4 w-4 text-[var(--th-text-faint)]" aria-hidden />
      <Link
        href="/dashboard/clients"
        className="font-medium text-[var(--th-brand-text)] hover:text-[var(--th-brand-text-soft)]"
      >
        Switch client
      </Link>
    </div>
  );
}
