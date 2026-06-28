"use client";

import { ToastContainer } from "@/components/ui/ToastContainer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
