"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

function ensureInit() {
  if (initialized || !key || typeof window === "undefined") return;
  posthog.init(key, {
    api_host: host,
    // Manual pageviews below — the app router doesn't reload the page.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
    person_profiles: "identified_only",
    respect_dnt: true,
  });
  initialized = true;
}

/** Pageview tracking for marketing + app. No-op without NEXT_PUBLIC_POSTHOG_KEY. */
export function AnalyticsClient() {
  const pathname = usePathname();

  useEffect(() => {
    ensureInit();
    if (!initialized) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname]);

  return null;
}
