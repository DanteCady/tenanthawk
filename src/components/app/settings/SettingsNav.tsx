"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type SettingsNavItem = {
  id: string;
  label: string;
  href: string;
  route?: boolean;
  visible?: boolean;
};

export function SettingsNav({ items }: { items: SettingsNavItem[] }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const visibleItems = items.filter((item) => item.visible !== false);
  const defaultSectionId = visibleItems.find((item) => !item.route)?.id ?? "";

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash.replace("#", ""));
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  function isActive(item: SettingsNavItem) {
    if (item.route) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    if (pathname !== "/dashboard/settings") return false;
    const section = hash || defaultSectionId;
    return item.id === section;
  }

  return (
    <nav
      className="settings-tabs -mx-4 border-b border-[var(--th-border)] px-4 sm:-mx-6 sm:px-6"
      aria-label="Settings sections"
    >
      <div className="flex gap-1 overflow-x-auto">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`settings-tab shrink-0 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item) ? "settings-tab-active" : "settings-tab-idle"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
