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
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/50 px-4 py-2.5 text-sm">
      <Building2 className="h-4 w-4 shrink-0 text-blue-700" aria-hidden />
      <span className="text-slate-600">Client</span>
      <Link
        href={`/dashboard/client?connection=${connectionId}`}
        className="font-semibold text-slate-900 hover:text-blue-700"
      >
        {label}
      </Link>
      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
      <Link
        href="/dashboard/clients"
        className="font-medium text-blue-700 hover:text-blue-800"
      >
        Switch client
      </Link>
    </div>
  );
}
