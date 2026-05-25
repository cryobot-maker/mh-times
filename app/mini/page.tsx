"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { MiniGrid } from "@/components/mini/MiniGrid";
import { MiniHiddenInput } from "@/components/mini/MiniHiddenInput";
import { MiniCluesPanel } from "@/components/mini/MiniCluesPanel";
import { MiniStatsModal } from "@/components/mini/MiniModals";
import { PuzzleLoadingSkeleton } from "@/components/PuzzleLoadingSkeleton";
import { SpellingBeeConfetti } from "@/components/spelling-bee/SpellingBeeConfetti";
import { formatDisplayDate } from "@/lib/miniCrosswordLogic";
import { useMiniStore } from "@/lib/stores/miniStore";
import { useGamePuzzle } from "@/hooks/useGamePuzzle";

function MiniContent() {
  const { loading, puzzleDate, puzzleData } = useGamePuzzle("mini");

  const {
    initialized,
    init,
    parsed,
    entries,
    focusRow,
    focusCol,
    direction,
    activeTab,
    completionFlash,
    confetti,
    showStats,
    stats,
    gameStatus,
    elapsedSeconds,
    selectCell,
    selectClue,
    setActiveTab,
    typeLetter,
    backspace,
    moveArrow,
    tickTimer,
    setShowStats,
    getTimerDisplay,
  } = useMiniStore();

  const [timerDisplay, setTimerDisplay] = useState("00:00");
  const [keyboardFocusToken, setKeyboardFocusToken] = useState(0);

  const handleSelectCell = useCallback(
    (row: number, col: number) => {
      selectCell(row, col);
      setKeyboardFocusToken((t) => t + 1);
    },
    [selectCell]
  );

  useEffect(() => {
    if (loading) return;
    init(puzzleDate, puzzleData);
  }, [init, puzzleDate, puzzleData, loading]);

  useEffect(() => {
    setTimerDisplay(getTimerDisplay());
  }, [elapsedSeconds, getTimerDisplay]);

  useEffect(() => {
    const id = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(id);
  }, [tickTimer]);

  useEffect(() => {
    const id = setInterval(() => setTimerDisplay(getTimerDisplay()), 1000);
    return () => clearInterval(id);
  }, [getTimerDisplay]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (gameStatus === "won") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveArrow(0, 1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveArrow(0, -1);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveArrow(1, 0);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveArrow(-1, 0);
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        typeLetter(e.key);
      }
    },
    [gameStatus, backspace, moveArrow, typeLetter]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (loading || !initialized || !parsed) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar />
        <PuzzleLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <SpellingBeeConfetti active={confetti} />
      <MiniStatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        solveTimeSeconds={elapsedSeconds}
      />

      <main className="mx-auto max-w-[600px] px-4 pb-12 pt-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-[#121212] md:text-[28px]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              The Mini
            </h1>
            <p className="mt-1 text-xs text-[#6b6b6b]">
              {formatDisplayDate(puzzleDate)}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="font-mono text-sm text-[#6b6b6b]">
              {timerDisplay}
            </span>
            <button
              type="button"
              onClick={() => setShowStats(true)}
              aria-label="Statistics"
              className="text-[#6b6b6b] hover:text-[#121212]"
            >
              <BarChart2 size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <MiniHiddenInput
          focusToken={keyboardFocusToken}
          onInput={(ch) => typeLetter(ch)}
          onBackspace={backspace}
        />

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="w-full shrink-0 md:w-[280px]">
            <MiniGrid
              parsed={parsed}
              entries={entries}
              focusRow={focusRow}
              focusCol={focusCol}
              direction={direction}
              completionFlash={completionFlash}
              onSelectCell={handleSelectCell}
            />
          </div>

          <div className="flex min-h-[180px] w-full flex-1 flex-col md:min-h-[320px]">
            <MiniCluesPanel
              acrossWords={parsed.acrossWords}
              downWords={parsed.downWords}
              activeTab={activeTab}
              direction={direction}
              focusRow={focusRow}
              focusCol={focusCol}
              onTabChange={setActiveTab}
              onSelectClue={selectClue}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MiniPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-[#6b6b6b]">Loading...</p>
        </div>
      }
    >
      <MiniContent />
    </Suspense>
  );
}
