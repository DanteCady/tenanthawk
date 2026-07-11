"use client";

import { ToastContainer } from "@/components/ui/ToastContainer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ToastContainer />
      <AnalyticsClient />
    </ThemeProvider>
  );
}
