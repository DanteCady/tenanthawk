"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeLogo } from "./theme/ThemeLogo";

const links = [
  { href: "/why", label: "Why Tenant Hawk" },
  { href: "/#categories", label: "What it scans" },
  { href: "/#how", label: "How it works" },
  { href: "/#msp", label: "For MSPs" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/guides", label: "Guides" },
] as const;

const linkClass =
  "block rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 py-4 transition-all duration-300 ${
          scrolled
            ? "mt-2 rounded-2xl border border-[var(--th-border)] bg-[var(--th-surface)]/80 shadow-sm backdrop-blur-xl md:max-w-5xl"
            : "border border-transparent"
        }`}
      >
        <Link href="/" aria-label="Tenant Hawk home">
          <ThemeLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) =>
            l.href.includes("#") ? (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                {l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="btn-primary hidden rounded-full px-4 py-2 text-sm shadow-none hover:shadow-md md:inline-flex"
          >
            Start free scan
          </a>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
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
              className="fixed inset-0 top-16 z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <motion.nav
              id="mobile-nav"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-4 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--th-border)] bg-[var(--th-surface)] shadow-lg md:hidden"
              aria-label="Mobile"
            >
              <ul className="px-2 py-2">
                {links.map((l) => (
                  <li key={l.href}>
                    {l.href.includes("#") ? (
                      <a href={l.href} className={linkClass} onClick={closeMenu}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={linkClass} onClick={closeMenu}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="space-y-2 border-t border-[var(--th-border)] px-4 py-3">
                <a
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  onClick={closeMenu}
                >
                  Sign in
                </a>
                <a
                  href="/signup"
                  className="btn-primary block rounded-full px-4 py-2.5 text-center text-sm shadow-none"
                  onClick={closeMenu}
                >
                  Start free scan
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
