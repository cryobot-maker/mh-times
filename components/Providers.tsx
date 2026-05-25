"use client";

import { Toast } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toast />
    </ThemeProvider>
  );
}
