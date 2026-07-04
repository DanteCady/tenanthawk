"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import type { Plan } from "@/lib/entitlements";
import { PlanBadge } from "@/components/app/PlanBadge";
import { getVisibleNavGroups } from "./nav-config";
import { NavLinks } from "./NavLinks";

export function MobileNavDrawer({
  open,
  onClose,
  isPro,
  showClients,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  isPro: boolean;
  showClients: boolean;
  plan: Plan;
}) {
  const groups = getVisibleNavGroups(showClients);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="app-mobile-drawer absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col shadow-xl">
        <div className="flex h-14 items-center justify-between border-b border-[var(--th-sidebar-border)] px-4">
          <Link href="/dashboard" onClick={onClose} aria-label="Dashboard home">
            <ThemeLogo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="nav-link rounded-lg p-2"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <NavLinks groups={groups} isPro={isPro} collapsed={false} onNavigate={onClose} />
        </nav>
        <div className="border-t border-[var(--th-sidebar-border)] p-4">
          <PlanBadge plan={plan} />
        </div>
      </aside>
    </div>
  );
}
