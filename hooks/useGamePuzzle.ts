"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTodayString } from "@/lib/gameUtils";
import {
  buildLocalDailyPuzzle,
  getPuzzleByDate,
  getTodaysPuzzle,
} from "@/lib/puzzleService";
import type { DailyPuzzle } from "@/types";

export function useGamePuzzle(game: string) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const puzzleDate = dateParam ?? getTodayString();
  const isArchive = Boolean(dateParam && dateParam !== getTodayString());

  const [loading, setLoading] = useState(true);
  const [dailyPuzzle, setDailyPuzzle] = useState<DailyPuzzle | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = dateParam
          ? await getPuzzleByDate(game, dateParam)
          : await getTodaysPuzzle(game);
        if (!cancelled) {
          setDailyPuzzle(
            result ?? buildLocalDailyPuzzle(game, puzzleDate)
          );
        }
      } catch {
        if (!cancelled) {
          setDailyPuzzle(buildLocalDailyPuzzle(game, puzzleDate));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [game, dateParam, puzzleDate]);

  return {
    loading,
    dailyPuzzle,
    puzzleDate,
    isArchive,
    puzzleData: dailyPuzzle?.puzzle_data,
  };
}
