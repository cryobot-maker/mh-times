"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { ArchiveCalendar } from "@/components/archive/ArchiveCalendar";
import { ArchiveRecentList } from "@/components/archive/ArchiveRecentList";
import {
  ARCHIVE_GAMES,
  getWeekGamesPlayedCount,
  isValidArchiveGame,
  parseDateString,
  type ArchiveGameSlug,
} from "@/lib/archiveUtils";
import { getTodayString } from "@/lib/gameUtils";
import { cn } from "@/lib/utils";

function ArchiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = getTodayString();
  const { year: todayY, month: todayM } = parseDateString(today);

  const gameParam = searchParams.get("game");
  const dateParam = searchParams.get("date");

  const [selectedGame, setSelectedGame] = useState<ArchiveGameSlug>(
    isValidArchiveGame(gameParam) ? gameParam : "wordle"
  );
  const [year, setYear] = useState(todayY);
  const [month, setMonth] = useState(todayM);
  const [weekCount, setWeekCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeGame =
    ARCHIVE_GAMES.find((g) => g.slug === selectedGame) ?? ARCHIVE_GAMES[0];

  useEffect(() => {
    if (isValidArchiveGame(gameParam)) {
      setSelectedGame(gameParam);
    }
  }, [gameParam]);

  useEffect(() => {
    if (dateParam) {
      const { year: y, month: m } = parseDateString(dateParam);
      setYear(y);
      setMonth(m);
    }
  }, [dateParam]);

  const refreshStats = useCallback(() => {
    setWeekCount(getWeekGamesPlayedCount());
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    refreshStats();
    const onStorage = () => refreshStats();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshStats);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshStats);
    };
  }, [refreshStats, selectedGame]);

  const handleGameChange = (slug: ArchiveGameSlug) => {
    setSelectedGame(slug);
    const params = new URLSearchParams(searchParams.toString());
    params.set("game", slug);
    router.replace(`/archive?${params.toString()}`, { scroll: false });
    refreshStats();
  };

  const handleSelectDate = (dateStr: string) => {
    router.push(`${activeGame.path}?date=${dateStr}`);
  };

  const handleMonthChange = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="mx-auto max-w-[800px] px-4 pb-12 pt-6">
        <h1
          className="mb-2 text-2xl font-bold text-[#121212] md:text-[28px]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Archive
        </h1>
        <p className="mb-6 text-sm text-[#6b6b6b]">
          {weekCount === 1
            ? "1 game played this week"
            : `${weekCount} games played this week`}
        </p>

        <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:px-0">
          {ARCHIVE_GAMES.map((game) => (
            <button
              key={game.slug}
              type="button"
              onClick={() => handleGameChange(game.slug)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors",
                selectedGame === game.slug
                  ? "bg-[#121212] text-white"
                  : "border border-[#e2e2e2] text-[#121212] hover:bg-[#f4f3ee]"
              )}
            >
              {game.label}
            </button>
          ))}
        </div>

        <ArchiveCalendar
          game={selectedGame}
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
          onSelectDate={handleSelectDate}
          refreshKey={refreshKey}
        />

        <div className="mt-10">
          <ArchiveRecentList game={activeGame} refreshKey={refreshKey} />
        </div>
      </main>
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-[#6b6b6b]">Loading...</p>
        </div>
      }
    >
      <ArchiveContent />
    </Suspense>
  );
}
