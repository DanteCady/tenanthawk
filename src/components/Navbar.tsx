"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { HawkMark } from "@/components/Logo";

const links = [
  { href: "/why", label: "Why Tenant Hawk" },
  { href: "/#scans", label: "What it scans" },
  { href: "/#how", label: "How it works" },
  { href: "/msp", label: "For MSPs" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/learn", label: "Learn" },
] as const;

const desktopLinkClass =
  "whitespace-nowrap text-[14.5px] font-medium text-mk-soft transition-colors hover:text-mk-ink";
const mobileLinkClass =
  "block rounded-lg px-3 py-2.5 text-base font-medium text-mk-soft transition-colors hover:bg-mk-tint hover:text-mk-ink";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-mk-line bg-[rgba(250,249,247,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6 sm:px-8">
        <Link
          href="/"
          aria-label="Tenant Hawk home"
          className="flex shrink-0 items-center gap-2.5"
        >
          <HawkMark className="h-[30px] w-[30px]" />
          <span className="text-[17px] font-[650] tracking-[-0.01em] text-mk-ink">
            Tenant Hawk
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) =>
            l.href.includes("#") ? (
              <a key={l.href} href={l.href} className={desktopLinkClass}>
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className={desktopLinkClass}>
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-5">
          <a
            href="/login"
            className="hidden whitespace-nowrap text-[14.5px] font-medium text-mk-soft transition-colors hover:text-mk-ink sm:inline-flex"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="mk-btn hidden whitespace-nowrap rounded-lg px-[18px] py-[9px] text-[14.5px] md:inline-flex"
          >
            Run a free scan
          </a>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-mk-ink2 transition-colors hover:bg-mk-tint md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-mk-ink/20 backdrop-blur-[1px] md:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <motion.nav
              id="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-4 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-mk-line2 bg-white shadow-lg md:hidden"
              aria-label="Mobile"
            >
              <ul className="px-2 py-2">
                {links.map((l) => (
                  <li key={l.href}>
                    {l.href.includes("#") ? (
                      <a href={l.href} className={mobileLinkClass} onClick={closeMenu}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={mobileLinkClass} onClick={closeMenu}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-mk-line px-4 py-3">
                <a
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-center text-sm font-medium text-mk-soft transition-colors hover:bg-mk-tint"
                  onClick={closeMenu}
                >
                  Sign in
                </a>
                <a
                  href="/signup"
                  className="mk-btn block px-4 py-2.5 text-center text-sm"
                  onClick={closeMenu}
                >
                  Run a free scan
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
