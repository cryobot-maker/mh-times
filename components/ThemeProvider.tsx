"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/stores/settingsStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useSettingsStore((s) => s.darkMode);
  const hydrate = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return <>{children}</>;
}
