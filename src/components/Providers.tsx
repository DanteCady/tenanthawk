"use client";

import { ToastContainer } from "@/components/ui/ToastContainer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ToastContainer />
    </ThemeProvider>
  );
}
