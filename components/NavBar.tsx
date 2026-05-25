"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ChevronLeft, Settings } from "lucide-react";
import { SettingsModal } from "@/components/SettingsModal";
import { useSettingsStore } from "@/lib/stores/settingsStore";
import { cn } from "@/lib/utils";

const GAME_PATHS = [
  "/wordle",
  "/connections",
  "/strands",
  "/spelling-bee",
  "/mini",
  "/letter-boxed",
  "/sudoku",
  "/tiles",
];

export function NavBar() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hydrate = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isGamePage = GAME_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const showHardMode = pathname === "/wordle" || pathname.startsWith("/wordle/");

  const iconClass =
    "text-[#6b6b6b] transition-colors hover:text-[#121212]";

  return (
    <>
      <header className="fixed top-0 z-[100] w-full border-b border-[#e2e2e2] bg-white">
        <nav className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-4 lg:px-12">
          <div className="flex w-10 shrink-0 items-center justify-start">
            {isGamePage && (
              <Link
                href="/"
                aria-label="Back to games"
                className={iconClass}
              >
                <ChevronLeft size={22} strokeWidth={1.75} />
              </Link>
            )}
          </div>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-[#121212]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            NYT Games
          </Link>

          <div className="flex w-20 shrink-0 items-center justify-end gap-4">
            <Link
              href="/archive"
              aria-label="Archive"
              className={iconClass}
            >
              <Archive size={22} strokeWidth={1.75} />
            </Link>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className={cn(iconClass, "flex items-center")}
            >
              <Settings size={22} strokeWidth={1.75} />
            </button>
          </div>
        </nav>
      </header>
      <div className="h-12 shrink-0" aria-hidden />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        showHardMode={showHardMode}
      />
    </>
  );
}
