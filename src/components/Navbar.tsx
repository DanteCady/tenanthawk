"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThemeLogo } from "./theme/ThemeLogo";

const links = [
  { href: "/why", label: "Why Tenant Hawk", hash: false },
  { href: "#categories", label: "What it scans", hash: true },
  { href: "#how", label: "How it works", hash: true },
  { href: "#pricing", label: "Pricing", hash: true },
  { href: "/guides", label: "Guides", hash: false },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.hash ? (
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
            className="btn-primary rounded-full px-4 py-2 text-sm shadow-none hover:shadow-md"
          >
            Start free scan
          </a>
        </div>
      </div>
    </motion.header>
  );
}
